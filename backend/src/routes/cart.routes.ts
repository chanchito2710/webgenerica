import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart, resolveGuestCart } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/resolve', resolveGuestCart);

router.use(authenticate);
router.get('/', getCart);
router.post('/', addToCart);
router.put('/:id', updateCartItem);
router.delete('/clear', clearCart);
router.delete('/:id', removeFromCart);

export default router;
