import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Sparkles,
  ShoppingBag,
  Package,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { ChatMessage, Product } from '../types';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  currentProduct?: Product | null;
  onViewOrders: () => void;
  initialPrompt?: string;
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  currentProduct,
  onViewOrders,
  initialPrompt,
}) => {
  const { addToCart } = useCart();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick chips directly fulfilling the user's explicit prompts
  const samplePrompts = [
    'Mujhe wedding ke liye kurti chahiye under 800',
    'Show me something similar but cheaper',
    'Which one is better?',
    'Mera order kaha hai?',
    'Add the black one to my cart',
  ];

  // Load chat history
  const loadHistory = async () => {
    try {
      const res = await api.getChatHistory();
      if (res.success && res.history) {
        setMessages(res.history);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
      if (initialPrompt) {
        handleSendMessage(initialPrompt);
      }
    }
  }, [isOpen, initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    setInputQuery('');

    // Optimistic user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await api.sendChatMessage(query, currentProduct?.id);
      if (res.success && res.message) {
        setMessages((prev) => [...prev, res.message]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'Thoda connection issue lag raha hai, par main aapke sath hoon! Please dobara try karein.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAddFromChat = async (product: Product) => {
    await addToCart(product.id, 1, product.colors[0], product.sizes[0], 0);
    setAddedItems((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [product.id]: false }));
    }, 3000);
  };

  const handleClearChat = async () => {
    try {
      const res = await api.clearChatHistory();
      if (res.success && res.history) {
        setMessages(res.history);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between border-l border-gray-100 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-4 py-3.5 bg-gradient-to-r from-rose-700 via-rose-600 to-amber-600 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs border border-white/30 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm sm:text-base leading-none">Shopzy AI Assistant</h3>
                <span className="text-[10px] bg-amber-400 text-amber-950 font-extrabold px-1.5 py-0.2 rounded-full">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-rose-100 mt-0.5">
                Hindi / Hinglish / English Shopping Partner
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearChat}
              className="p-1.5 text-rose-200 hover:text-white hover:bg-white/10 rounded-lg text-xs cursor-pointer"
              title="Reset Chat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-rose-200 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current product context badge if opened from a specific product */}
        {currentProduct && (
          <div className="bg-rose-50 px-3 py-1.5 border-b border-rose-100 flex items-center justify-between text-xs text-rose-900">
            <span className="truncate max-w-[280px]">
              Viewing: <strong>{currentProduct.title}</strong> (₹{currentProduct.price})
            </span>
            <button
              onClick={() => handleSendMessage(`Show me something similar to "${currentProduct.title}" but cheaper`)}
              className="text-[11px] text-rose-700 font-bold underline cursor-pointer"
            >
              Find cheaper
            </button>
          </div>
        )}

        {/* Chat Stream */}
        <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-br-none'
                    : 'bg-white text-gray-800 border border-gray-200/80 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Action Taken Badge (e.g. Added to cart or Order checked) */}
                {msg.actionTaken && (
                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {msg.actionTaken.message || 'Action executed successfully!'}
                    </span>
                    {msg.actionTaken.type === 'VIEW_ORDER' && (
                      <button
                        onClick={() => {
                          onClose();
                          onViewOrders();
                        }}
                        className="text-rose-600 underline font-semibold cursor-pointer"
                      >
                        View Timeline
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Recommended Products Carousel/Cards */}
              {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                <div className="mt-2.5 w-full space-y-2">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-1">
                    Recommended by Sathi AI:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.recommendedProducts.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-white p-2.5 rounded-xl border border-rose-100 shadow-xs hover:border-rose-300 transition-all flex gap-2.5 items-center"
                      >
                        <img
                          src={prod.images[0]}
                          alt={prod.title}
                          referrerPolicy="no-referrer"
                          className="w-14 h-16 object-cover rounded-lg bg-gray-100 shrink-0 cursor-pointer"
                          onClick={() => {
                            onSelectProduct(prod);
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4
                            onClick={() => onSelectProduct(prod)}
                            className="text-xs font-bold text-gray-900 truncate hover:text-rose-700 cursor-pointer"
                          >
                            {prod.title}
                          </h4>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-xs font-extrabold text-gray-950">
                              ₹{prod.price}
                            </span>
                            <span className="text-[10px] text-gray-400 line-through">
                              ₹{prod.originalPrice}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700">
                              {prod.rating}★
                            </span>
                          </div>

                          <div className="mt-1.5 flex items-center gap-1.5">
                            <button
                              onClick={() => handleQuickAddFromChat(prod)}
                              className={`px-2 py-1 rounded text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                addedItems[prod.id]
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 border border-rose-200'
                              }`}
                            >
                              <ShoppingBag className="w-3 h-3" />
                              <span>{addedItems[prod.id] ? 'Added!' : 'Add to Cart'}</span>
                            </button>

                            <button
                              onClick={() => onSelectProduct(prod)}
                              className="text-[11px] text-gray-500 hover:text-gray-900 underline cursor-pointer"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <span className="text-[10px] text-gray-400 mt-1 px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 p-3 bg-white border border-gray-200/80 rounded-2xl rounded-bl-none max-w-[120px] shadow-2xs">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-bounce [animation-delay:0.4s]" />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-white border-t border-gray-100">
          <div className="text-[11px] font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-rose-600" />
            <span>Try asking Sathi AI:</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="text-[11px] whitespace-nowrap bg-rose-50 hover:bg-rose-100 text-rose-800 font-medium px-2.5 py-1 rounded-full border border-rose-200 cursor-pointer shrink-0 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-white border-t border-gray-200 flex items-center gap-2"
        >
          <input
            id="ai-chat-input"
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Type in Hindi, Hinglish or English (e.g. wedding kurti under 800)..."
            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-rose-500 focus:ring-2 focus:ring-rose-100 placeholder:text-gray-400"
          />
          <button
            id="ai-chat-send-btn"
            type="submit"
            disabled={!inputQuery.trim() || isTyping}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white flex items-center justify-center hover:opacity-90 disabled:opacity-50 cursor-pointer transition-opacity shrink-0 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
