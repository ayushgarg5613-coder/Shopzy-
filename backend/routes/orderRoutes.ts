import { Router } from 'express';
import { OrderController } from '../controllers/orderController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', OrderController.getOrders);
router.get('/addresses', OrderController.getAddresses);
router.post('/addresses', OrderController.addAddress);
router.get('/:id', OrderController.getOrderById);
router.post('/', OrderController.createOrder);

// Seller or Admin can update status
router.patch('/:id/status', requireRole(['seller', 'admin']), OrderController.updateStatus);

export default router;
