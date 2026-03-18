import Fastify from 'fastify';
import type { FastifyError } from 'fastify';
import { productRoutes } from './routes/productRoutes.js';

export const buildServer = async () => {
  const fastify = Fastify({ logger: true });

  await productRoutes(fastify);

  fastify.setNotFoundHandler((_request, reply) => {
    reply.status(404).send({ message: 'Resource not found' });
  });

  fastify.setErrorHandler((error: FastifyError, request, reply) => {
    const statusCode = error.statusCode ?? 500;

    request.log.error(error);

    if (statusCode !== 500) {
      const response = {
        status: 'error',
        statusCode,
        errorCode: error.code,
        message: error.message,
        errors: error.validation ?? undefined,
      };

      return reply.status(statusCode).send(response);
    }

    reply.status(500).send({ message: 'Internal server error' });
  });

  return fastify;
};
