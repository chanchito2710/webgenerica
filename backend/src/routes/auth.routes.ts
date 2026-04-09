import { Router } from 'express';
import { register, login, getProfile, activateAccount } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/activate/:token', activateAccount);
router.get('/profile', authenticate, getProfile);

export default router;
