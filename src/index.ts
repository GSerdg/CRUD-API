import 'dotenv/config';
import { buildServer } from './app.js';
import { runCluster } from './cluster.js';
import cluster from 'cluster';

const PORT = Number(process.env.PORT) || 4000;

async function main(port: number) {
  const app = await buildServer();

  try {
    await app.listen({ port, host: '0.0.0.0' });

    if (process.env.MULTI_MODE === 'true') {
      // eslint-disable-next-line no-console
      console.log(`[Worker ${process.pid}] running on port ${port}`);
    } else {
      console.log(`Server is running on http://localhost:${PORT}`);
    }
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

if (process.env.MULTI_MODE === 'true' && cluster.isPrimary) {
  runCluster(PORT);
} else {
  // Если это воркер, он получит свой PORT из env, переданного в cluster.fork()
  const targetPort = Number(process.env.PORT) || PORT;
  main(targetPort);
}
