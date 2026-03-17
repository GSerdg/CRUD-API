#!/usr/bin/env node
/**
 * start-multi.js
 * Minimal master + workers and a simple round-robin TCP proxy in front.
 *
 * Usage: node scripts/start-multi.js
 * Reads PORT from env (default 4000) and spawns N workers (cpuCount - 1).
 */

const cluster = require('cluster');
const http = require('http');
const os = require('os');

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

if (cluster.isMaster) {
  const cpus = os.cpus().length;
  const workersCount = Math.max(1, cpus - 1);

  // spawn workers on PORT+1 .. PORT+workersCount
  for (let i = 1; i <= workersCount; i++) {
    const workerPort = PORT + i;
    cluster.fork({ WORKER_PORT: workerPort, WORKER_ID: i });
  }

  // simple round-robin proxy server that listens on PORT and forwards requests
  const workerAddrs = [];
  for (let i = 1; i <= workersCount; i++) {
    workerAddrs.push({ host: '127.0.0.1', port: PORT + i });
  }

  let idx = 0;
  const server = http.createServer((req, res) => {
    if (workerAddrs.length === 0) {
      res.statusCode = 503;
      res.end('No workers available');
      return;
    }

    const target = workerAddrs[idx % workerAddrs.length];
    idx += 1;

    const options = {
      hostname: target.host,
      port: target.port,
      path: req.url,
      method: req.method,
      headers: req.headers
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
      res.statusCode = 500;
      res.end('Proxy error: ' + String(err));
    });

    req.pipe(proxyReq, { end: true });
  });

  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Load balancer listening on http://127.0.0.1:${PORT}/api`);
    workerAddrs.forEach((w) => {
      // eslint-disable-next-line no-console
      console.log(`Worker target: http://${w.host}:${w.port}`);
    });
  });

  cluster.on('exit', (worker, code, signal) => {
    // eslint-disable-next-line no-console
    console.warn(`Worker ${worker.process.pid} died. code=${code} signal=${signal}`);
  });
} else {
  // worker: spawn the actual app instance on WORKER_PORT
  const { spawn } = require('child_process');
  const env = { ...process.env };
  // if WORKER_PORT variable not set, compute from WORKER_ID
  if (!env.WORKER_PORT) {
    const id = Number(process.env.WORKER_ID) || 1;
    env.WORKER_PORT = String(PORT + id);
  }

  // run the TypeScript app using ts-node-dev in development or the built bundle in production
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    // in production run the bundled file
    const child = spawn('node', ['dist/index.js'], { env, stdio: 'inherit' });
    child.on('exit', (code) => process.exit(code));
  } else {
    // development: run ts-node directly
    // use ts-node to start src/index.ts so worker binds to its WORKER_PORT
    const child = spawn('node', ['-r', 'ts-node/register', 'src/index.ts'], { env, stdio: 'inherit' });
    child.on('exit', (code) => process.exit(code));
  }
}
