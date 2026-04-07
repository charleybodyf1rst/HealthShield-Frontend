'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Shield, MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiAssistantApi } from '@/lib/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const systemContext =
  "You are HealthShield's AI assistant specializing in health insurance. Help users understand insurance plans (Individual, Family, Medicare Advantage, Medicare Supplement, Dental & Vision, Group/Employer). Answer questions about enrollment, coverage, premiums, deductibles, and claims. Be helpful, accurate, and HIPAA-aware. Keep responses concise.";

const defaultSuggestions = [
  'Tell me about plans',
  'How do I enroll?',
  'What does it cost?',
];

const quickActions = [
  { label: 'Compare Plans', message: 'Compare health insurance plans' },
  { label: 'Get a Quote', message: "I'd like to get a quote" },
  { label: 'Check Eligibility', message: 'How do I check my eligibility?' },
];

function formatTime(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 h-7 w-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
          <Shield className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="bg-white/5 border border-white/5 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-1">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-[typing-dots_1.4s_ease-in-out_infinite]" />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-[typing-dots_1.4s_ease-in-out_0.2s_infinite]" />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-[typing-dots_1.4s_ease-in-out_0.4s_infinite]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HealthShieldChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hello! I'm the HealthShield AI assistant. How can I help you with health insurance today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      try {
        const isFirstMessage = !conversationId;
        const payload = isFirstMessage
          ? `[System: ${systemContext}]\n\nUser: ${trimmed}`
          : trimmed;

        const response = await aiAssistantApi.chat(
          payload,
          undefined,
          conversationId,
        );

        if (response.conversation_id) {
          setConversationId(response.conversation_id);
        }

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            response.response ||
            'I apologize, I could not process that request. Please try again.',
          timestamp: new Date(),
          suggestions:
            response.suggestions && response.suggestions.length > 0
              ? response.suggestions.slice(0, 3)
              : defaultSuggestions,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            "I'm having trouble connecting right now. Please try again in a moment or contact us at 1-800-555-1234.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, conversationId],
  );

  const handleSend = async () => {
    await sendMessage(input);
  };

  const isWelcomeMessage = messages.length === 1 && messages[0].id === '1';

  return (
    <>
      {/* Chat Bubble */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow"
          >
            <MessageCircle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-full sm:w-[420px] max-h-full sm:max-h-[600px] flex flex-col bg-black/90 backdrop-blur-xl border border-white/10 rounded-none sm:rounded-2xl shadow-2xl overflow-hidden sm:bottom-6 sm:right-6 bottom-0 right-0"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-400" />
                <span className="font-['Space_Grotesk'] font-semibold text-white text-sm">
                  HealthShield AI
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[300px]">
              {messages.map((msg, index) => (
                <div key={msg.id}>
                  <div
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`flex items-start gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="flex-shrink-0 h-7 w-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          <Shield className="h-3.5 w-3.5 text-white" />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 h-7 w-7 rounded-full bg-white/20 flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">
                            U
                          </span>
                        </div>
                      )}
                      <div>
                        <div
                          className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                              : 'bg-white/5 border border-white/5 text-white/90'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <p className="text-[10px] text-white/30 mt-1 px-1">
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Welcome Quick Actions */}
                  {isWelcomeMessage && index === 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 ml-9">
                      {quickActions.map((action) => (
                        <button
                          type="button"
                          key={action.label}
                          onClick={() => sendMessage(action.message)}
                          className="flex items-center gap-1 bg-white/10 hover:bg-white/20 border border-white/10 text-white/80 text-xs px-3 py-1.5 rounded-full transition-colors"
                        >
                          <Sparkles className="h-3 w-3" />
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Suggestion Chips */}
                  {msg.role === 'assistant' &&
                    msg.suggestions &&
                    msg.suggestions.length > 0 &&
                    index === messages.length - 1 &&
                    !isLoading && (
                      <div className="flex flex-wrap gap-2 mt-2 ml-9">
                        {msg.suggestions.map((suggestion) => (
                          <button
                            type="button"
                            key={suggestion}
                            onClick={() => sendMessage(suggestion)}
                            className="bg-white/10 hover:bg-white/20 border border-white/10 text-white/80 text-xs px-3 py-1.5 rounded-full transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              ))}

              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/10 px-3 py-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about health insurance..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex-shrink-0 h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white disabled:opacity-40 transition-opacity"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
