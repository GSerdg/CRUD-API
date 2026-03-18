import { Product } from '../types/product.js';

export const db = {
  _products: [] as Product[],
  async getAll() {
    return this._products;
  },
  async getById(id: string) {
    return this._products.find(product => product.id === id);
  },
  async add(product: Product) {
    this._products.push(product);
    return product;
  },
  async changeById(id: string, body: Partial<Product>) {
    const product = await this.getById(id);

    if (!product) return;

    Object.assign(product, body);

    return product;
  },
  async deleteById(id: string) {
    const index = this._products.findIndex(item => item.id === id);

    if (index === -1) return;

    const product = this._products.splice(index, 1);

    return product[0];
  },
};
