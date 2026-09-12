import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', AuthController.login);
router.get('/profile', authMiddleware, AuthController.getProfile);
router.post('/switch-demo-user', AuthController.switchDemoUser);
router.get('/users', AuthController.listAllUsers);

export default router;
