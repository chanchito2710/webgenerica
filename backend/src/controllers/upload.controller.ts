import { Request, Response } from 'express';

export function uploadImage(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({ error: 'No se proporcionó imagen' });
  }
  const url = `/uploads/${req.file.filename}`;
  res.json({ url, filename: req.file.filename });
}

export function uploadImages(req: Request, res: Response) {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    return res.status(400).json({ error: 'No se proporcionaron imágenes' });
  }
  const files = (req.files as Express.Multer.File[]).map((f) => ({
    url: `/uploads/${f.filename}`,
    filename: f.filename,
  }));
  res.json(files);
}
