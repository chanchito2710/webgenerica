import api from './api';
import type { CartItem } from '../types';

interface LocalCartItem {
  productId: number;
  variantId?: number;
  quantity: number;
}

export const cartService = {
  async getCart(): Promise<CartItem[]> {
    const { data } = await api.get<CartItem[]>('/cart');
    return data;
  },

  async addToCart(productId: number, quantity: number = 1, variantId?: number): Promise<CartItem> {
    const { data } = await api.post<CartItem>('/cart', { productId, quantity, variantId });
    return data;
  },

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    const { data } = await api.put<CartItem>(`/cart/${id}`, { quantity });
    return data;
  },

  async removeFromCart(id: number): Promise<void> {
    await api.delete(`/cart/${id}`);
  },

  async clearCart(): Promise<void> {
    await api.delete('/cart/clear');
  },

  async resolveGuestCart(items: LocalCartItem[]): Promise<CartItem[]> {
    const { data } = await api.post<CartItem[]>('/cart/resolve', { items });
    return data;
  },
};
