import cluster from 'node:cluster';
import http from 'node:http';
import { availableParallelism } from 'node:os';
import { IpcRequestType, Product, ProductTypeRequest } from './types/product.type.js';
import { db } from './db/storage.js';

export const runCluster = (port: number) => {
  const numWorkers = availableParallelism() - 1;
  const workersPorts = Array.from({ length: numWorkers }, (_, i) => port + (i + 1));
  let current = 0;

  workersPorts.forEach(workerPort => cluster.fork({ PORT: workerPort }));

  cluster.on('message', async (worker, msg: IpcRequestType) => {
    let result: Product | Product[] | undefined;

    switch (msg.type) {
      case ProductTypeRequest.GET_ALL:
        result = await db.getAll();
        break;
      case ProductTypeRequest.GET_BY_ID:
        result = await db.getById(msg.id!);
        break;
      case ProductTypeRequest.CREATE:
        result = await db.create(msg.body as Product);
        break;
      case ProductTypeRequest.UPDATE:
        result = await db.updateById(msg.id!, msg.body!);
        break;
      case ProductTypeRequest.DELETE:
        result = await db.deleteById(msg.id!);
        break;
      default:
        break;
    }

    worker.send({ requestId: msg.requestId, payload: result });
  });

  http
    .createServer((req, res) => {
      const targetPort = workersPorts[current];
      current = (current + 1) % workersPorts.length;

      const proxy = http.request(
        {
          hostname: 'localhost',
          port: targetPort,
          path: req.url,
          method: req.method,
          headers: req.headers,
        },
        targetRes => {
          console.log(
            `[Load Balancer] Worker on ${targetPort} responded with ${targetRes.statusCode}`
          );
          res.writeHead(targetRes.statusCode!, targetRes.headers);
          targetRes.pipe(res);
        }
      );

      req.pipe(proxy);
      proxy.on('error', () => {
        res.writeHead(502);
        res.end('Bad Gateway');
      });
    })
    .listen(port, () => {
      console.log(`[Primary] Load Balancer: http://localhost:${port}`);
    });
};
