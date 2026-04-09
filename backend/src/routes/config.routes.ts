import { Router } from 'express';
import { getSiteConfig, updateSiteConfig } from '../controllers/config.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', getSiteConfig);
router.put('/', authenticate, requireAdmin, updateSiteConfig);

export default router;
