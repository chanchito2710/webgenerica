import { Router } from 'express';
import { uploadImage, uploadImages } from '../controllers/upload.controller';
import { authenticate, requireAdmin } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/single', authenticate, requireAdmin, upload.single('image'), uploadImage);
router.post('/multiple', authenticate, requireAdmin, upload.array('images', 10), uploadImages);

export default router;
