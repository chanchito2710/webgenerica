import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { prisma } from './lib/prisma';

import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import productRoutes from './routes/product.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import configRoutes from './routes/config.routes';
import uploadRoutes from './routes/upload.routes';
import couponRoutes from './routes/coupon.routes';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const allowedOrigins = config.frontendUrl
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(null, false);
  },
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());

app.use('/uploads', express.static(path.resolve(config.uploadDir)));

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/config', configRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/coupons', couponRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

// Índices GIN para búsqueda de texto (idempotente; Prisma no declara GIN en schema)
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
