import Fastify from 'fastify';
import { productRoutes } from './routes/productRoutes.js';

export const buildServer = async () => {
  const fastify = Fastify({ logger: true });

  await productRoutes(fastify);

  fastify.setNotFoundHandler((_request, reply) => {
    reply.status(404).send({ message: 'Resource not found' });
  });

  fastify.setErrorHandler((error, _request, reply) => {
    console.error('Server error:', error);

    reply.status(500).send({ message: 'Internal server error' });
  });

  return fastify;
};
