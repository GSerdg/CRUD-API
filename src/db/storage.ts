import { randomUUID } from 'node:crypto';
import { IpcRequestType, IpcResponse, Product, ProductTypeRequest } from '../types/product.type.js';
import cluster from 'node:cluster';

export const db = {
  _products: [] as Product[],
  async getAll() {
    if (process.env.MULTI_MODE === 'true' && cluster.isWorker) {
      return sendToPrimary({ type: ProductTypeRequest.GET_ALL });
    }

    return this._products;
  },
  async getById(id: string) {
    if (process.env.MULTI_MODE === 'true' && cluster.isWorker) {
      return sendToPrimary({ type: ProductTypeRequest.GET_BY_ID, id });
    }

    return this._products.find(product => product.id === id);
  },
  async create(body: Product) {
    if (process.env.MULTI_MODE === 'true' && cluster.isWorker) {
      return sendToPrimary({ type: ProductTypeRequest.CREATE, body });
    }

    this._products.push(body);
    return body;
  },
  async updateById(id: string, body: Partial<Product>) {
    if (process.env.MULTI_MODE === 'true' && cluster.isWorker) {
      return sendToPrimary({ type: ProductTypeRequest.UPDATE, id, body });
    }

    const product = await this.getById(id);

    if (!product) return;

    Object.assign(product, body);

    return product;
  },
  async deleteById(id: string) {
    if (process.env.MULTI_MODE === 'true' && cluster.isWorker) {
      return sendToPrimary({ type: ProductTypeRequest.DELETE, id });
    }

    const index = this._products.findIndex(item => item.id === id);

    if (index === -1) return;

    const product = this._products.splice(index, 1);

    return product[0];
  },
};

function sendToPrimary(message: IpcRequestType): Promise<Product | Product[]> {
  return new Promise((resolve, reject) => {
    if (typeof process.send !== 'function') {
      return reject(new Error('process.send is not defined (not a worker process)'));
    }

    const requestId = randomUUID();

    const handler = (msg: IpcResponse) => {
      if (msg.requestId === requestId) {
        process.off('message', handler);

        resolve(msg.payload);
      }
    };

    process.on('message', handler);
    process.send({ ...message, requestId });
  });
}
