import { FastifyReply, FastifyRequest } from 'fastify';
import { db } from '../db/storage.js';
import { validate as uuidValidate } from 'uuid';
import { Product } from '../types/product.js';
import { randomUUID } from 'node:crypto';

export const getAllProductsHandler = async (_request: FastifyRequest, reply: FastifyReply) => {
  const allProducts = await db.getAll();

  return reply.code(200).send(allProducts);
};

export const getProductByIdHandler = async (
  request: FastifyRequest<{ Params: { productId: string } }>,
  reply: FastifyReply
) => {
  const { productId } = request.params as { productId: string };

  if (!uuidValidate(productId)) {
    return reply.code(400).send({ message: 'Invalid productId (not a UUID)' });
  }

  const product = await db.getById(productId);

  if (!product) {
    return reply.code(404).send({ message: `Product width id: ${productId} not found` });
  }

  return reply.code(200).send(product);
};

export const createProductHandler = async (
  request: FastifyRequest<{ Body: Omit<Product, 'id'> }>,
  reply: FastifyReply
) => {
  const { name, description, price, category, inStock } = request.body;

  if (typeof price !== 'number' || price < 0) {
    reply.code(400).send({ message: 'Price must be a positive number' });
  }

  const product = await db.add({
    id: randomUUID(),
    name,
    description,
    price,
    category,
    inStock,
  });

  return reply.code(201).send(product);
};
