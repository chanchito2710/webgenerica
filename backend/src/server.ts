import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { resolveTenant } from './middleware/tenant';
import { apiLimiter, authLimiter, superAdminLimiter } from './middleware/rateLimit';
import { prisma } from './lib/prisma';

import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import productRoutes from './routes/product.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import configRoutes from './routes/config.routes';
import uploadRoutes from './routes/upload.routes';
import couponRoutes from './routes/coupon.routes';
import superadminRoutes from './routes/superadmin.routes';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const allowedOrigins = config.frontendUrl
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const tenantDomainCache = new Map<string, boolean>();
const DOMAIN_CACHE_TTL = 60_000;
let domainCacheExpiry = 0;

async function refreshDomainCache() {
  if (Date.now() < domainCacheExpiry) return;
  try {
    const tenants = await prisma.tenant.findMany({
      where: { domain: { not: null }, status: 'active' },
      select: { domain: true },
    });
    tenantDomainCache.clear();
    for (const t of tenants) {
      if (t.domain) {
        tenantDomainCache.set(`https://${t.domain}`, true);
        tenantDomainCache.set(`http://${t.domain}`, true);
      }
    }
    domainCacheExpiry = Date.now() + DOMAIN_CACHE_TTL;
  } catch {}
}

app.use(cors({
  origin: async (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      cb(null, true);
      return;
    }
    await refreshDomainCache();
    if (tenantDomainCache.has(origin)) {
      cb(null, true);
      return;
    }
    cb(null, false);
  },
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());

const uploadsBase = path.resolve(config.uploadDir);
if (!fs.existsSync(uploadsBase)) fs.mkdirSync(uploadsBase, { recursive: true });
app.use('/uploads', express.static(uploadsBase));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/super-admin', superAdminLimiter, superadminRoutes);

app.use('/api', apiLimiter, resolveTenant);

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/config', configRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/coupons', couponRoutes);

app.use(errorHandler);

void (async () => {
  const stmts = [
    `CREATE INDEX IF NOT EXISTS idx_product_name_gin ON "Product" USING gin(to_tsvector('spanish', name))`,
    `CREATE INDEX IF NOT EXISTS idx_product_desc_gin ON "Product" USING gin(to_tsvector('spanish', COALESCE(description, '')))`,
  ];
  for (const sql of stmts) {
    await prisma.$executeRawUnsafe(sql).catch(() => {});
  }
})();

app.listen(config.port, () => {
  console.log(`Backend corriendo en http://localhost:${config.port}`);
});

export default app;
