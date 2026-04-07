'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, X, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSmsStore } from '@/stores/communications-store';
import { cn } from '@/lib/utils';

interface SmsPanelProps {
  leadId: string;
  leadName: string;
  leadPhone: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SmsPanel({
  leadId,
  leadName,
  leadPhone,
  isOpen,
  onClose,
}: SmsPanelProps) {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    isLoading,
    isSending,
    error,
    fetchConversation,
    sendMessage,
    clearConversation,
  } = useSmsStore();

  // Fetch conversation when panel opens
  useEffect(() => {
    if (isOpen && leadId) {
      fetchConversation(leadId);
    }
    return () => {
      if (!isOpen) {
        clearConversation();
      }
    };
  }, [isOpen, leadId, fetchConversation, clearConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage || isSending) return;

    setInputMessage('');
    await sendMessage(leadId, trimmedMessage);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, typeof messages>);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[32rem] bg-background border rounded-lg shadow-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-primary text-primary-foreground rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <div>
            <p className="font-semibold text-sm">{leadName}</p>
            <p className="text-xs opacity-90">{leadPhone}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="text-primary-foreground hover:bg-primary-foreground/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-2 opacity-50" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs">Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date Separator */}
                <div className="flex justify-center mb-3">
                  <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                    {date}
                  </span>
                </div>

                {/* Messages for this date */}
                <div className="space-y-2">
                  {dateMessages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        'flex',
                        message.direction === 'outbound' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                          message.direction === 'outbound'
                            ? 'bg-primary text-primary-foreground rounded-br-none'
                            : 'bg-muted rounded-bl-none'
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        <div
                          className={cn(
                            'flex items-center gap-1 mt-1 text-[10px]',
                            message.direction === 'outbound'
                              ? 'text-primary-foreground/70 justify-end'
                              : 'text-muted-foreground'
                          )}
                        >
                          <span>{formatTime(message.createdAt)}</span>
                          {message.direction === 'outbound' && (
                            <span className="ml-1">
                              {message.status === 'delivered' ? (
                                <CheckDoubleIcon className="h-3 w-3 text-blue-400" />
                              ) : message.status === 'sent' ? (
                                <CheckDoubleIcon className="h-3 w-3" />
                              ) : message.status === 'failed' ? (
                                <span className="text-red-400">!</span>
                              ) : (
                                <CheckIcon className="h-3 w-3" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Error Message */}
      {error && (
        <div className="px-3 py-2 bg-destructive/10 border-t border-destructive/20 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 border-t bg-muted/30">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary max-h-24"
            rows={1}
            disabled={isSending}
          />
          <Button
            onClick={handleSend}
            disabled={!inputMessage.trim() || isSending}
            size="icon"
            className="shrink-0"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Custom check icons for message status
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.5 4.5L6 12L2.5 8.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckDoubleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.5 4.5L3 12L0.5 9.5M15.5 4.5L8 12L6.5 10.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// SMS Button for triggering the panel
interface SmsButtonProps {
  leadId: string;
  leadName: string;
  leadPhone: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function SmsButton({
  leadId,
  leadName,
  leadPhone,
  variant = 'ghost',
  size = 'icon',
  className,
}: SmsButtonProps) {
  const [showPanel, setShowPanel] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowPanel(true)}
        className={cn('text-blue-600 hover:text-blue-700 hover:bg-blue-50', className)}
        title={`SMS ${leadName}`}
      >
        <MessageSquare className="h-4 w-4" />
      </Button>

      <SmsPanel
        leadId={leadId}
        leadName={leadName}
        leadPhone={leadPhone}
        isOpen={showPanel}
        onClose={() => setShowPanel(false)}
      />
    </>
  );
}
