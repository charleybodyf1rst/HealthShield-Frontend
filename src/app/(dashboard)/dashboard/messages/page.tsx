'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  Loader2,
  Lock,
  MoreVertical,
  Paperclip,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  Smile,
  Users,
  Video,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useMessagesStore } from '@/stores/messages-store';
import { toast } from 'sonner';
import type { Conversation, Message } from '@/types/message';

// Helper to get display name from conversation
const getConversationName = (conversation: Conversation): string => {
  if (conversation.name) return conversation.name;
  if (conversation.participants.length > 0) {
    return conversation.participants.map((p) => p.name).join(', ');
  }
  return 'Unknown';
};

// Helper to get display content from last message
const getLastMessageContent = (conversation: Conversation): string => {
  if (!conversation.lastMessage) return '';
  // In production, this would be decrypted
  return conversation.lastMessage.encryptedContent || '';
};

export default function MessagesPage() {
  const {
    conversations,
    selectedConversation,
    messages,
    isLoading,
    isLoadingMessages,
    isSending,
    error,
    fetchConversations,
    selectConversation,
    sendMessage,
    clearSelection,
  } = useMessagesStore();

  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = async (conv: Conversation) => {
    try {
      await selectConversation(conv.id);
    } catch {
      toast.error('Failed to load conversation');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    try {
      // In production, encrypt the message before sending
      await sendMessage(selectedConversation.id, {
        messageType: 'text',
        encryptedContent: newMessage, // Should be encrypted
        iv: '', // Should be generated
      });
      setNewMessage('');
    } catch {
      toast.error('Failed to send message');
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const name = getConversationName(conv).toLowerCase();
    const content = getLastMessageContent(conv).toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || content.includes(query);
  });

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4">
      {/* Sidebar - Conversation List */}
      <div className="w-80 flex flex-col border rounded-lg bg-card">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Messages</h2>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Encryption notice */}
        <div className="px-4 py-2 bg-green-500/10 border-b flex items-center gap-2 text-xs text-green-600">
          <Lock className="h-3 w-3" />
          End-to-end encrypted
        </div>

        {/* Conversation List */}
        <ScrollArea className="flex-1">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
          filteredConversations.map((conversation) => {
            const displayName = getConversationName(conversation);
            const lastContent = getLastMessageContent(conversation);
            return (
            <div
              key={conversation.id}
              className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                selectedConversation?.id === conversation.id ? 'bg-muted' : ''
              }`}
              onClick={() => handleSelectConversation(conversation)}
            >
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {conversation.type === 'group' ? (
                      <Users className="h-4 w-4" />
                    ) : (
                      displayName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">
                      {displayName}
                    </span>
                    {conversation.lastMessageAt && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(
                        new Date(conversation.lastMessageAt),
                        { addSuffix: false }
                      )}
                    </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-muted-foreground truncate">
                      {lastContent}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <Badge className="ml-2 h-5 min-w-5 flex items-center justify-center">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
          })
          )}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col border rounded-lg bg-card">
          {/* Chat Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => clearSelection()}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedConversation.type === 'group' ? (
                    <Users className="h-4 w-4" />
                  ) : (
                    getConversationName(selectedConversation)
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                  )}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{getConversationName(selectedConversation)}</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedConversation.type === 'group'
                    ? `${selectedConversation.participants.length} members`
                    : selectedConversation.participants[0]?.role}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View profile</DropdownMenuItem>
                  <DropdownMenuItem>Search in conversation</DropdownMenuItem>
                  <DropdownMenuItem>Mute notifications</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    Delete conversation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            {isLoadingMessages ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={`flex gap-3 ${i % 2 === 0 ? '' : 'justify-end'}`}>
                    {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
                    <Skeleton className={`h-16 ${i % 2 === 0 ? 'w-48' : 'w-40'} rounded-lg`} />
                  </div>
                ))}
              </div>
            ) : (
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isMe = message.sender.id === 'me';
                const showAvatar =
                  index === 0 ||
                  messages[index - 1].sender.id !== message.sender.id;

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isMe ? 'justify-end' : ''}`}
                  >
                    {!isMe && showAvatar && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {message.sender.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {!isMe && !showAvatar && <div className="w-8" />}
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        isMe
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {!isMe && showAvatar && (
                        <p className="text-xs font-medium mb-1">
                          {message.sender.name}
                        </p>
                      )}
                      <p className="text-sm">{message.encryptedContent}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isMe
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            )}
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1"
              />
              <Button variant="ghost" size="icon">
                <Smile className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isSending}
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
      ) : (
        <div className="flex-1 flex items-center justify-center border rounded-lg bg-card">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">Select a conversation</h3>
            <p className="text-sm text-muted-foreground">
              Choose a conversation to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
