import { Product } from '../types/product.js';

const products: Product[] = [];

export const db = {
  getAll: async () => products,
  getById: async (id: string) => products.find(product => product.id === id),
  add: async (product: Product) => {
    products.push(product);
    return product;
  },
};
