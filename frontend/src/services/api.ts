import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const TENANT_STORAGE_KEY = 'sa_tenant_slug';

function syncTenantFromUrl(): void {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('tenant');
  if (slug) {
    localStorage.setItem(TENANT_STORAGE_KEY, slug);
  }
}
syncTenantFromUrl();

export function getActiveTenantSlug(): string | null {
  return localStorage.getItem(TENANT_STORAGE_KEY);
}

export function setActiveTenantSlug(slug: string | null): void {
  if (slug) {
    localStorage.setItem(TENANT_STORAGE_KEY, slug);
  } else {
    localStorage.removeItem(TENANT_STORAGE_KEY);
  }
}

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export function assetUrl(path: string): string {
  if (!path || path.startsWith('http')) return path;
  const base = import.meta.env.VITE_API_URL || '';
  return base ? `${base.replace(/\/api$/, '')}${path}` : path;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const tenantSlug = localStorage.getItem(TENANT_STORAGE_KEY);
  if (tenantSlug) {
    config.headers['X-Tenant-Slug'] = tenantSlug;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
