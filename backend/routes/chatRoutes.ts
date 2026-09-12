import { Router } from 'express';
import { ChatController } from '../controllers/chatController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/history', ChatController.getHistory);
router.post('/send', ChatController.sendMessage);
router.post('/clear', ChatController.clearHistory);

export default router;
