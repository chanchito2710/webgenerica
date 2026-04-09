import { Router } from 'express';
import { createOrder, createGuestOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus } from '../controllers/order.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.post('/guest', createGuestOrder);

router.use(authenticate);
router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/admin', requireAdmin, getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', requireAdmin, updateOrderStatus);

export default router;
