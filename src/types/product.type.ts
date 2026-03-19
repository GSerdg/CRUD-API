export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
};

export enum ProductTypeRequest {
  GET_ALL = 'GET_ALL',
  GET_BY_ID = 'GET_BY_ID',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export type IpcRequestType = {
  type: ProductTypeRequest;
  id?: string;
  body?: Partial<Product>;
  requestId?: string;
};

export type IpcResponse = {
  requestId: string;
  payload: Product;
};
