import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

router.get('/', ProductController.getAll);
router.get('/categories', ProductController.getCategories);
router.get('/:id', ProductController.getById);

// Protected routes for seller or admin
router.post('/', authMiddleware, requireRole(['seller', 'admin']), ProductController.create);
router.put('/:id', authMiddleware, requireRole(['seller', 'admin']), ProductController.update);
router.delete('/:id', authMiddleware, requireRole(['seller', 'admin']), ProductController.delete);

// Customer review
router.post('/:id/reviews', authMiddleware, ProductController.addReview);

export default router;
