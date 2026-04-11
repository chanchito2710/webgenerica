import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { config } from '../config';

const baseUploadDir = path.resolve(config.uploadDir);
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req: Request, _file, cb) => {
    const tenantId = req.tenantId;
    const dir = tenantId ? path.join(baseUploadDir, String(tenantId)) : baseUploadDir;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const extOk = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
    const mimeOk = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ].includes(file.mimetype);
    cb(null, extOk && mimeOk);
  },
});
