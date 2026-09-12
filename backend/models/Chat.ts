import { ChatMessage } from '../../frontend/src/types';

// In-memory chat storage by session or userId
const chatHistoryMap: Record<string, ChatMessage[]> = {};

export class ChatModel {
  static getHistory(sessionId: string): ChatMessage[] {
    if (!chatHistoryMap[sessionId]) {
      chatHistoryMap[sessionId] = [
        {
          id: 'welcome-msg',
          sender: 'assistant',
          text: 'नमस्ते! मैं आपकी पर्सनल शॉपिंग साथी हूँ 🙏 (I am your Shopzy AI). Aap mujhse Hindi, Hinglish ya English me kuch bhi pooch sakte hain — jaise "Mujhe wedding ke liye kurti chahiye under 800", "Mera order kaha hai?", ya "Saste me best jhumka dikhao"!',
          timestamp: new Date().toISOString(),
        },
      ];
    }
    return chatHistoryMap[sessionId];
  }

  static addMessage(sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    if (!chatHistoryMap[sessionId]) {
      this.getHistory(sessionId);
    }
    const newMsg: ChatMessage = {
      ...message,
      id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };
    chatHistoryMap[sessionId].push(newMsg);
    return newMsg;
  }

  static clearHistory(sessionId: string): void {
    chatHistoryMap[sessionId] = [];
    this.getHistory(sessionId);
  }
}
