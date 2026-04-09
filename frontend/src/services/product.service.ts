import api from './api';
import type { Product, PaginatedResponse } from '../types';

export const productService = {
  async getProducts(params?: Record<string, string>): Promise<PaginatedResponse<Product>> {
    const { data } = await api.get('/products', { params });
    return data;
  },

  async getProductBySlug(slug: string): Promise<Product> {
    const { data } = await api.get<Product>(`/products/slug/${slug}`);
    return data;
  },

  async getProductById(id: number): Promise<Product> {
    const { data } = await api.get<Product>(`/products/${id}`);
    return data;
  },

  async getAllProducts(params?: Record<string, string>): Promise<PaginatedResponse<Product>> {
    const { data } = await api.get('/products/admin', { params });
    return data;
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    const { data } = await api.post<Product>('/products', product);
    return data;
  },

  async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    const { data } = await api.put<Product>(`/products/${id}`, product);
    return data;
  },

  async deleteProduct(id: number): Promise<void> {
    await api.delete(`/products/${id}`);
  },
};
