import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export interface TenantInfo {
  id: number;
  slug: string;
  domain: string | null;
  name: string;
  status: string;
}

declare global {
  namespace Express {
    interface Request {
      tenant?: TenantInfo;
      tenantId?: number;
    }
  }
}

const tenantCache = new Map<string, { tenant: TenantInfo; expiresAt: number }>();
const CACHE_TTL_MS = 60_000;

function getCached(key: string): TenantInfo | null {
  const entry = tenantCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    tenantCache.delete(key);
    return null;
  }
  return entry.tenant;
}

function setCache(key: string, tenant: TenantInfo) {
  tenantCache.set(key, { tenant, expiresAt: Date.now() + CACHE_TTL_MS });
}

/** Host “de la tienda” visto por el usuario. Con API en otro dominio (ej. onrender.com), Host es el del API; usamos Origin/Referer del navegador. */
function getStorefrontHost(req: Request): string {
  const forwarded = (req.headers['x-forwarded-host'] as string)?.split(':')[0]?.toLowerCase();
  if (forwarded) return forwarded;

  const apiHost = req.hostname.split(':')[0].toLowerCase();

  const origin = req.headers.origin;
  if (origin) {
    try {
      const h = new URL(origin).hostname.toLowerCase();
      if (h && h !== apiHost) return h;
    } catch {
      /* ignore */
    }
  }

  const referer = req.headers.referer;
  if (referer) {
    try {
      const h = new URL(referer).hostname.toLowerCase();
      if (h && h !== apiHost) return h;
    } catch {
      /* ignore */
    }
  }

  return apiHost;
}

export function resolveTenant(req: Request, res: Response, next: NextFunction): void {
  const devSlug = req.headers['x-tenant-slug'] as string | undefined;

  if (devSlug) {
    resolveBySlug(devSlug, req, res, next);
    return;
  }

  const cleanHost = getStorefrontHost(req);

  if (cleanHost === 'localhost' || cleanHost === '127.0.0.1') {
    resolveBySlug('default', req, res, next);
    return;
  }

  resolveByDomain(cleanHost, req, res, next);
}

async function resolveBySlug(slug: string, req: Request, res: Response, next: NextFunction) {
  try {
    const cacheKey = `slug:${slug}`;
    let tenant: TenantInfo | undefined = getCached(cacheKey) ?? undefined;

    if (!tenant) {
      const row = await prisma.tenant.findUnique({
        where: { slug },
        select: { id: true, slug: true, domain: true, name: true, status: true },
      });
      if (!row) { res.status(404).json({ error: 'Tienda no encontrada' }); return; }
      tenant = row;
      setCache(cacheKey, tenant);
    }

    if (tenant.status === 'suspended') {
      res.status(503).json({ error: 'Tienda suspendida temporalmente' });
      return;
    }

    req.tenant = tenant;
    req.tenantId = tenant.id;
    next();
  } catch (err) {
    console.error('Tenant resolution error:', err);
    res.status(500).json({ error: 'Error al resolver tienda' });
  }
}

async function resolveByDomain(domain: string, req: Request, res: Response, next: NextFunction) {
  try {
    const cacheKey = `domain:${domain}`;
    let tenant: TenantInfo | undefined = getCached(cacheKey) ?? undefined;

    if (!tenant) {
      const row = await prisma.tenant.findFirst({
        where: { domain },
        select: { id: true, slug: true, domain: true, name: true, status: true },
      });
      if (!row) {
        // Fallback: if no tenant matched this domain, use "default"
        return resolveBySlug('default', req, res, next);
      }
      tenant = row;
      setCache(cacheKey, tenant);
    }

    if (tenant.status === 'suspended') {
      res.status(503).json({ error: 'Tienda suspendida temporalmente' });
      return;
    }

    req.tenant = tenant;
    req.tenantId = tenant.id;
    next();
  } catch (err) {
    console.error('Tenant resolution error:', err);
    res.status(500).json({ error: 'Error al resolver tienda' });
  }
}

export function clearTenantCache() {
  tenantCache.clear();
}
