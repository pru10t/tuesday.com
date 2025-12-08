import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, Loader2, Lightbulb } from 'lucide-react';
import type { Customer } from '../types';
import { chatWithPersona, type ChatMessage } from '../services/personaChatService';

interface PersonaChatModalProps {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
}

const segmentEmojis: Record<string, string> = {
  'Tech Enthusiast': '💻',
  'Fashionista': '👗',
  'Home Decor': '🏠',
  'Bargain Hunter': '🏷️',
};

const quickPrompts = [
  "What makes you open a marketing email?",
  "What annoys you about promotional emails?",
  "How do you feel about our 20% off promotion?",
  "What would make you more likely to buy?",
];

export const PersonaChatModal: React.FC<PersonaChatModalProps> = ({
  customer,
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setInputValue('');
      setHasStarted(false);
    }
  }, [isOpen]);

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text || isLoading) return;

    setHasStarted(true);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatWithPersona(customer, messages, text);
      const personaMessage: ChatMessage = {
        id: `persona-${Date.now()}`,
        role: 'persona',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, personaMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'persona',
        content: "Sorry, I couldn't respond right now. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col font-['Plus_Jakarta_Sans']"
          >
            {/* Header */}
            <div className="p-6 border-b border-neutral-100 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-2xl border border-white/20">
                    {segmentEmojis[customer.interest_segment] || '👤'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-['Outfit']">{customer.name}</h2>
                    <p className="text-sm text-neutral-300 mt-0.5">
                      {customer.age}y · {customer.interest_segment} · {customer.income_bracket}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full">
                        {customer.historical_opens || 0} opens
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full">
                        {customer.past_purchase_count} orders
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-neutral-50">
              {!hasStarted ? (
                /* Welcome State */
                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                  <div className="w-16 h-16 rounded-full bg-neutral-900 text-white flex items-center justify-center mb-4">
                    <MessageCircle size={28} />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    Chat with {customer.name.split(' ')[0]}
                  </h3>
                  <p className="text-sm text-neutral-500 mb-6 max-w-xs">
                    Ask about their preferences, get feedback on your campaigns, or understand what motivates them.
                  </p>
                  
                  {/* Quick Prompts */}
                  <div className="space-y-2 w-full max-w-sm">
                    <p className="text-xs text-neutral-400 uppercase tracking-wide mb-3 flex items-center justify-center gap-1">
                      <Lightbulb size={12} /> Try asking
                    </p>
                    {quickPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt)}
                        className="w-full text-left p-3 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 transition-all group"
                      >
                        <span className="group-hover:text-neutral-900">{prompt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Messages */
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-neutral-900 text-white'
                            : 'bg-white border border-neutral-200 text-neutral-800'
                        }`}
                      >
                        {message.role === 'persona' && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm">{segmentEmojis[customer.interest_segment]}</span>
                            <span className="text-xs font-medium text-neutral-500">
                              {customer.name.split(' ')[0]}
                            </span>
                          </div>
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white border border-neutral-200 rounded-2xl px-4 py-3 flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin text-neutral-400" />
                        <span className="text-sm text-neutral-500">
                          {customer.name.split(' ')[0]} is typing...
                        </span>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-neutral-200 bg-white">
              <div className="flex items-center gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask ${customer.name.split(' ')[0]} something...`}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-neutral-100 border border-neutral-200 rounded-xl text-sm placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 disabled:opacity-50 transition-colors"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  className="p-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-[10px] text-neutral-400 text-center mt-2">
                Powered by AI · Responses reflect the persona's simulated preferences
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
