import api from './api';
import type { Order, PaginatedResponse } from '../types';

interface GuestOrderPayload {
  items: Array<{ productId: number; variantId?: number; quantity: number }>;
  shippingAddress: Record<string, string>;
  shippingOptionId: string;
  paymentMethod: string;
}

export const orderService = {
  async createOrder(shippingAddress: Record<string, string>, paymentMethod: string, shippingOptionId?: string): Promise<Order> {
    const { data } = await api.post<Order>('/orders', { shippingAddress, paymentMethod, shippingOptionId });
    return data;
  },

  async createGuestOrder(payload: GuestOrderPayload): Promise<Order> {
    const { data } = await api.post<Order>('/orders/guest', payload);
    return data;
  },

  async getMyOrders(): Promise<Order[]> {
    const { data } = await api.get<Order[]>('/orders/my');
    return data;
  },

  async getOrderById(id: number): Promise<Order> {
    const { data } = await api.get<Order>(`/orders/${id}`);
    return data;
  },

  async getAllOrders(params?: Record<string, string>): Promise<PaginatedResponse<Order>> {
    const { data } = await api.get('/orders/admin', { params });
    return data;
  },

  async updateOrderStatus(id: number, status: string, paymentStatus?: string): Promise<Order> {
    const { data } = await api.put<Order>(`/orders/${id}/status`, { status, paymentStatus });
    return data;
  },
};
