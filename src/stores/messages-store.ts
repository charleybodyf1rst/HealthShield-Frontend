import { create } from 'zustand';
import { messagesApi } from '@/lib/api';
import type {
  Conversation,
  Message,
  ConversationsResponse,
  ConversationDetailResponse,
  SendMessagePayload
} from '@/types/message';

interface MessagesState {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  error: string | null;
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

interface MessagesActions {
  fetchConversations: () => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, payload: SendMessagePayload) => Promise<void>;
  markAsRead: (conversationId: string, messageId: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  clearSelection: () => void;
}

type MessagesStore = MessagesState & MessagesActions;

export const useMessagesStore = create<MessagesStore>((set, get) => ({
  conversations: [],
  selectedConversation: null,
  messages: [],
  isLoading: false,
  isLoadingMessages: false,
  isSending: false,
  error: null,
  pagination: {
    limit: 50,
    offset: 0,
    total: 0,
  },

  fetchConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await messagesApi.getConversations();
      set({
        conversations: response.data.conversations,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch conversations';
      set({ error: message, isLoading: false });
    }
  },

  selectConversation: async (conversationId: string) => {
    set({ isLoadingMessages: true, error: null });
    try {
      const response = await messagesApi.getConversation(conversationId, { limit: 50, offset: 0 });
      set({
        selectedConversation: response.data.conversation,
        messages: response.data.messages,
        pagination: response.data.pagination,
        isLoadingMessages: false,
      });

      // Mark the last message as read
      const lastMessage = response.data.messages[response.data.messages.length - 1];
      if (lastMessage) {
        try {
          await messagesApi.markMessageAsRead(conversationId, lastMessage.id);
          // Update unread count in conversations list
          set((state) => ({
            conversations: state.conversations.map((conv) =>
              conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
            ),
          }));
        } catch {
          // Silently fail - not critical
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load conversation';
      set({ error: message, isLoadingMessages: false });
    }
  },

  sendMessage: async (conversationId: string, payload: SendMessagePayload) => {
    set({ isSending: true, error: null });
    try {
      const response = await messagesApi.sendMessage(conversationId, payload);

      // Add the new message to the list optimistically
      const { selectedConversation } = get();
      const newMessage: Message = {
        id: response.message_id,
        conversationId,
        sender: {
          id: 'me',
          name: 'You',
        },
        messageType: payload.messageType,
        encryptedContent: payload.encryptedContent,
        iv: payload.iv,
        attachmentUrl: payload.attachmentUrl,
        attachmentType: payload.attachmentType,
        attachmentName: payload.attachmentName,
        attachmentSize: payload.attachmentSize,
        reactions: [],
        readReceipts: [],
        createdAt: response.created_at,
      };

      set((state) => ({
        messages: [...state.messages, newMessage],
        isSending: false,
        // Update the conversation's last message
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                lastMessage: newMessage,
                lastMessageAt: response.created_at,
              }
            : conv
        ),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send message';
      set({ error: message, isSending: false });
      throw error;
    }
  },

  markAsRead: async (conversationId: string, messageId: string) => {
    try {
      await messagesApi.markMessageAsRead(conversationId, messageId);
      set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        ),
      }));
    } catch (error) {
      // Silently fail - not critical
      console.error('Failed to mark message as read:', error);
    }
  },

  loadMoreMessages: async () => {
    const { selectedConversation, pagination, messages } = get();
    if (!selectedConversation || pagination.offset + pagination.limit >= pagination.total) {
      return; // No more messages to load
    }

    set({ isLoadingMessages: true });
    try {
      const newOffset = pagination.offset + pagination.limit;
      const response = await messagesApi.getConversation(selectedConversation.id, {
        limit: pagination.limit,
        offset: newOffset,
      });

      set({
        messages: [...response.data.messages, ...messages], // Prepend older messages
        pagination: response.data.pagination,
        isLoadingMessages: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load more messages';
      set({ error: message, isLoadingMessages: false });
    }
  },

  clearSelection: () => {
    set({
      selectedConversation: null,
      messages: [],
      pagination: { limit: 50, offset: 0, total: 0 },
    });
  },
}));

// Selector hooks
export const useConversations = () => useMessagesStore((state) => state.conversations);
export const useSelectedConversation = () => useMessagesStore((state) => state.selectedConversation);
export const useMessages = () => useMessagesStore((state) => state.messages);
export const useMessagesLoading = () => useMessagesStore((state) => state.isLoading || state.isLoadingMessages);
