import { Router } from 'express';
import { CartController } from '../controllers/cartController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', CartController.getCart);
router.post('/add', CartController.addToCart);
router.put('/items/:id', CartController.updateCartItem);
router.delete('/items/:id', CartController.removeCartItem);
router.delete('/clear', CartController.clearCart);

export default router;
