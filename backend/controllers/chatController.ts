import { Response } from 'express';
import { ChatModel } from '../models/Chat';
import { AIService } from '../services/aiService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class ChatController {
  static getHistory(req: AuthenticatedRequest, res: Response): void {
    const sessionId = (req.query.sessionId as string) || req.user?.id || 'default-session';
    const history = ChatModel.getHistory(sessionId);
    res.json({ success: true, history });
  }

  static async sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    const sessionId = req.body.sessionId || req.user?.id || 'default-session';
    const userId = req.user?.id || 'user-priya';
    const { query, currentProductId } = req.body;

    if (!query) {
      res.status(400).json({ success: false, error: 'Query is required' });
      return;
    }

    // Save user message to history
    ChatModel.addMessage(sessionId, {
      sender: 'user',
      text: query,
    });

    // Process with AI Service
    try {
      const aiResult = await AIService.processShoppingQuery(sessionId, query, userId, currentProductId);

      // Save assistant response to history
      const assistantMessage = ChatModel.addMessage(sessionId, {
        sender: 'assistant',
        text: aiResult.reply,
        recommendedProducts: aiResult.recommendedProducts,
        actionTaken: aiResult.actionTaken,
      });

      res.json({
        success: true,
        message: assistantMessage,
      });
    } catch (err: any) {
      console.error('Error in chat controller:', err);
      const fallbackMsg = ChatModel.addMessage(sessionId, {
        sender: 'assistant',
        text: 'Maaf kijiye, kuch dikkat aayi. Aap dobara pooch sakte hain ya direct categories browse kar sakte hain!',
      });
      res.json({ success: true, message: fallbackMsg });
    }
  }

  static clearHistory(req: AuthenticatedRequest, res: Response): void {
    const sessionId = req.body.sessionId || req.user?.id || 'default-session';
    ChatModel.clearHistory(sessionId);
    res.json({ success: true, history: ChatModel.getHistory(sessionId) });
  }
}
