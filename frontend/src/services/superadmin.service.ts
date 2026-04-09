import api from './api';
import type { Tenant, AdminUser, PlatformStats, AuditLog } from '../types';

interface PaginatedTenants {
  tenants: Tenant[];
  total: number;
  page: number;
  pages: number;
}

interface PaginatedAdmins {
  admins: AdminUser[];
  total: number;
  page: number;
  pages: number;
}

interface PaginatedLogs {
  logs: AuditLog[];
  total: number;
  page: number;
  pages: number;
}

export const superadminService = {
  async getStats(): Promise<PlatformStats> {
    const { data } = await api.get<PlatformStats>('/super-admin/stats');
    return data;
  },

  // Tenants
  async getTenants(params?: Record<string, string>): Promise<PaginatedTenants> {
    const { data } = await api.get<PaginatedTenants>('/super-admin/tenants', { params });
    return data;
  },
  async getTenantById(id: number): Promise<Tenant> {
    const { data } = await api.get<Tenant>(`/super-admin/tenants/${id}`);
    return data;
  },
  async createTenant(body: { name: string; domain?: string; slug?: string; plan?: string }): Promise<Tenant> {
    const { data } = await api.post<Tenant>('/super-admin/tenants', body);
    return data;
  },
  async updateTenant(id: number, body: Partial<{ name: string; domain: string; plan: string }>): Promise<Tenant> {
    const { data } = await api.put<Tenant>(`/super-admin/tenants/${id}`, body);
    return data;
  },
  async suspendTenant(id: number): Promise<Tenant> {
    const { data } = await api.put<Tenant>(`/super-admin/tenants/${id}/suspend`);
    return data;
  },
  async reactivateTenant(id: number): Promise<Tenant> {
    const { data } = await api.put<Tenant>(`/super-admin/tenants/${id}/reactivate`);
    return data;
  },
  async deleteTenant(id: number): Promise<void> {
    await api.delete(`/super-admin/tenants/${id}`);
  },

  // Admins
  async getAdmins(params?: Record<string, string>): Promise<PaginatedAdmins> {
    const { data } = await api.get<PaginatedAdmins>('/super-admin/admins', { params });
    return data;
  },
  async createAdmin(body: { email: string; name: string; tenantId: number }): Promise<AdminUser> {
    const { data } = await api.post<AdminUser>('/super-admin/admins', body);
    return data;
  },
  async updateAdmin(id: number, body: Partial<{ name: string; email: string; tenantId: number }>): Promise<AdminUser> {
    const { data } = await api.put<AdminUser>(`/super-admin/admins/${id}`, body);
    return data;
  },
  async suspendAdmin(id: number, reason?: string): Promise<void> {
    await api.put(`/super-admin/admins/${id}/suspend`, { reason });
  },
  async reactivateAdmin(id: number): Promise<void> {
    await api.put(`/super-admin/admins/${id}/reactivate`);
  },
  async deleteAdmin(id: number): Promise<void> {
    await api.delete(`/super-admin/admins/${id}`);
  },
  async resendActivation(id: number): Promise<void> {
    await api.post(`/super-admin/admins/${id}/resend-activation`);
  },

  // Audit logs
  async getAuditLogs(params?: Record<string, string>): Promise<PaginatedLogs> {
    const { data } = await api.get<PaginatedLogs>('/super-admin/audit-logs', { params });
    return data;
  },
};
