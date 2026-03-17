import { FastifyInstance } from 'fastify';
import {
  createProductHandler,
  getAllProductsHandler,
  getProductByIdHandler,
} from '../controllers/productController.js';

const productSchema = {
  body: {
    type: 'object',
    required: ['name', 'description', 'price', 'category', 'inStock'],
    properties: {
      name: { type: 'string' },
      description: { type: 'string' },
      price: { type: 'number', minimum: 0.01 },
      category: { type: 'string' },
      inStock: { type: 'boolean' },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        category: { type: 'string' },
        inStock: { type: 'boolean' },
      },
    },
  },
};

export const productRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/api/products', getAllProductsHandler);
  fastify.get('/api/products/:productId', getProductByIdHandler);
  fastify.post('/api/products', { schema: productSchema }, createProductHandler);
};
