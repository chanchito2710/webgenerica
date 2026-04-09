import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  superAdminEmail: process.env.SUPER_ADMIN_EMAIL || 'superadmin@webgenerica.com',
  superAdminPassword: process.env.SUPER_ADMIN_PASSWORD || 'superadmin123',
  appUrl: process.env.APP_URL || 'http://localhost:3001',
};
