import type { FastifyInstance, FastifySchema } from 'fastify';
import {
  createProductHandler,
  deleteProductByIdHandler,
  getAllProductsHandler,
  getProductByIdHandler,
  putProductByIdHandler,
} from '../controllers/productController.js';

const params = {
  type: 'object',
  properties: {
    productId: { type: 'string', format: 'uuid' },
  },
};
const body = {
  type: 'object',
  required: ['name', 'description', 'price', 'category', 'inStock'],
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    price: { type: 'number', minimum: 0.01 },
    category: { type: 'string' },
    inStock: { type: 'boolean' },
  },
};
const changeBody = {
  type: 'object',
  required: [],
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    price: { type: 'number', minimum: 0.01 },
    category: { type: 'string' },
    inStock: { type: 'boolean' },
  },
};
const response = {
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
};

const addProductSchema: FastifySchema = {
  body,
  response,
};
const productParamsSchema: FastifySchema = {
  params,
  response,
};
const changeProductSchema: FastifySchema = {
  params,
  body: changeBody,
  response,
};

export const productRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/api/products', getAllProductsHandler);
  fastify.get('/api/products/:productId', { schema: productParamsSchema }, getProductByIdHandler);
  fastify.post('/api/products', { schema: addProductSchema }, createProductHandler);
  fastify.put('/api/products/:productId', { schema: changeProductSchema }, putProductByIdHandler);
  fastify.delete(
    '/api/products/:productId',
    { schema: productParamsSchema },
    deleteProductByIdHandler
  );
};
