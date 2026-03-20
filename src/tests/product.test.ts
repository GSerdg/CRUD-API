import { beforeAll, describe, expect, it } from 'vitest';
import { buildServer } from '../app.js';
import type { FastifyInstance } from 'fastify';
import { errorCodes } from 'fastify';
import { randomUUID } from 'node:crypto';
import { getNotFoundMessage } from '../utils/getMessage.js';

const body = {
  name: 'Test Product',
  description: 'Testing with Vitest',
  price: 100,
  category: 'Test category',
  inStock: true,
};

describe('Product API', () => {
  let app: FastifyInstance;
  let lastProductId: string;
  const validationCode = errorCodes.FST_ERR_VALIDATION().code;

  beforeAll(async () => {
    app = await buildServer();
    await app.ready();
  });

  it('should return status code 404 if url is wrong', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/wrong',
    });

    const payload = JSON.parse(response.payload);

    expect(response.statusCode).toBe(404);
    expect(payload.message).toBeDefined();
  });

  it('GET /api/products - should get all products', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/products',
    });

    const payload = JSON.parse(response.payload);

    expect(payload).toHaveLength(0);
    expect(response.statusCode).toBe(200);
  });

  it('POST /api/products - should add product', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/products',
      payload: body,
    });

    const payload = JSON.parse(response.payload);
    lastProductId = payload.id;

    expect(response.statusCode).toBe(201);
    expect(payload).toMatchObject(body);
    expect(payload.id).toBeDefined();
  });

  it('POST /api/products - should send code:400 if the body does not contain required fields', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/products',
      payload: {
        description: 'Testing with Vitest',
        price: 100,
        category: 'Test category',
        inStock: true,
      },
    });

    const payload = JSON.parse(response.payload);
    const validationCode = errorCodes.FST_ERR_VALIDATION().code;

    expect(response.statusCode).toBe(400);
    expect(payload.errorCode).toBe(validationCode);
    expect(payload.message).toMatch(/\S+/);
  });

  it('POST /api/products - should send code:400 if the price field is not a positive number', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/products',
      payload: { ...body, price: -1 },
    });

    const payload = JSON.parse(response.payload);

    expect(response.statusCode).toBe(400);
    expect(payload.errorCode).toBe(validationCode);
    expect(payload.message).toMatch(/\S+/);
  });

  it('GET /api/products/{productId} - should get product', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/products/${lastProductId}`,
    });

    const payload = JSON.parse(response.payload);

    expect(response.statusCode).toBe(200);
    expect(payload).toStrictEqual({ ...body, id: lastProductId });
  });

  it('GET /api/products/{productId} - should send code:400 if the id field is not in the correct format uuid', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/products/incorrectId',
    });

    const payload = JSON.parse(response.payload);

    expect(response.statusCode).toBe(400);
    expect(payload.errorCode).toBe(validationCode);
    expect(payload.message).toMatch(/\S+/);
  });

  it('GET /api/products/{productId} - should send code:404 if record with id === productId does not exist', async () => {
    const id = randomUUID();
    const response = await app.inject({
      method: 'GET',
      url: `/api/products/${id}`,
    });

    const payload = JSON.parse(response.payload);

    expect(response.statusCode).toBe(404);
    expect(payload.message).toBe(getNotFoundMessage(id));
  });

  it('PUT /api/products/{productId} - should update product', async () => {
    const changeFields = { name: 'Changed name' };
    const response = await app.inject({
      method: 'PUT',
      url: `/api/products/${lastProductId}`,
      payload: changeFields,
    });

    const payload = JSON.parse(response.payload);

    expect(response.statusCode).toBe(200);
    expect(payload).toMatchObject(changeFields);

    const checkResponse = await app.inject({
      method: 'GET',
      url: `/api/products/${lastProductId}`,
    });

    const checkPayload = JSON.parse(checkResponse.payload);
    expect(checkResponse.statusCode).toBe(200);
    expect(checkPayload).toMatchObject(changeFields);
  });

  it('PUT /api/products/{productId} - should send code:400 if the id field is not in the correct format uuid', async () => {
    const changeFields = { name: 'Changed name' };
    const response = await app.inject({
      method: 'PUT',
      url: '/api/products/incorrectId',
      payload: changeFields,
    });

    const payload = JSON.parse(response.payload);

    expect(response.statusCode).toBe(400);
    expect(payload.errorCode).toBe(validationCode);
    expect(payload.message).toMatch(/\S+/);
  });

  it('PUT /api/products/{productId} - should send code:404 if record with id === productId does not exist', async () => {
    const id = randomUUID();
    const changeFields = { name: 'Changed name' };

    const response = await app.inject({
      method: 'PUT',
      url: `/api/products/${id}`,
      payload: changeFields,
    });

    const payload = JSON.parse(response.payload);

    expect(response.statusCode).toBe(404);
    expect(payload.message).toBe(getNotFoundMessage(id));
  });

  it('DELETE /api/products/{productId} - should delete product', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/products/${lastProductId}`,
    });

    expect(response.statusCode).toBe(204);

    const checkResponse = await app.inject({
      method: 'GET',
      url: `/api/products/${lastProductId}`,
    });

    expect(checkResponse.statusCode).toBe(404);
  });

  it('DELETE /api/products/{productId} - should send code:400 if the id field is not in the correct format uuid', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/api/products/incorrectId',
    });

    const payload = JSON.parse(response.payload);

    expect(response.statusCode).toBe(400);
    expect(payload.errorCode).toBe(validationCode);
    expect(payload.message).toMatch(/\S+/);
  });

  it('DELETE /api/products/{productId} - should send code:404 if record with id === productId does not exist', async () => {
    const id = randomUUID();

    const response = await app.inject({
      method: 'DELETE',
      url: `/api/products/${id}`,
    });

    const payload = JSON.parse(response.payload);

    expect(response.statusCode).toBe(404);
    expect(payload.message).toBe(getNotFoundMessage(id));
  });
});
