import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';

export default async function buildServer(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });

  // Minimal skeleton route(s). Full CRUD implementation is intentionally omitted per instructions.
  app.get('/api/health', async () => ({ status: 'ok' }));

  // Placeholder - product routes should be implemented in src/routes/products.ts
  app.get('/api', async () => ({ message: 'API root (skeleton)'}));

  // Generic 404 handler for unknown routes
  app.setNotFoundHandler((_request, reply) => {
    reply.status(404).send({ message: 'Resource not found' });
  });

  // Generic error handler
  app.setErrorHandler((error, _request, reply) => {
    // Log server errors
    // eslint-disable-next-line no-console
    console.error('Server error:', error);
    reply.status(500).send({ message: 'Internal server error' });
  });

  return app;
}
