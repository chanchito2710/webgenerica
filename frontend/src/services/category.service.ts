import api from './api';
import type { Category } from '../types';

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const { data } = await api.get<Category[]>('/categories');
    return data;
  },

  async getAllCategories(): Promise<Category[]> {
    const { data } = await api.get<Category[]>('/categories/all');
    return data;
  },

  async createCategory(category: Partial<Category>): Promise<Category> {
    const { data } = await api.post<Category>('/categories', category);
    return data;
  },

  async updateCategory(id: number, category: Partial<Category>): Promise<Category> {
    const { data } = await api.put<Category>(`/categories/${id}`, category);
    return data;
  },

  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
