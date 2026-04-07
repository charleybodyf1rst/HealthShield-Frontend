'use client';

import { create } from 'zustand';
import { smsApi, inboxApi } from '@/lib/api';
import type {
  SmsMessage,
  InboxItem,
  InboxFilters,
} from '@/types/communication';

// ============================================================================
// SMS STORE - For individual lead conversations
// ============================================================================

interface SmsState {
  messages: SmsMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  currentLeadId: string | null;
  hasMore: boolean;
}

interface SmsActions {
  fetchConversation: (leadId: string, limit?: number) => Promise<void>;
  sendMessage: (leadId: string, message: string) => Promise<SmsMessage | null>;
  clearConversation: () => void;
  addIncomingMessage: (message: SmsMessage) => void;
}

type SmsStore = SmsState & SmsActions;

export const useSmsStore = create<SmsStore>((set, get) => ({
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
  currentLeadId: null,
  hasMore: true,

  fetchConversation: async (leadId: string, limit = 50) => {
    set({ isLoading: true, error: null, currentLeadId: leadId });
    try {
      const response = await smsApi.getConversation(leadId, limit);
      if (response.status === 200) {
        // Map API response to store's SmsMessage type
        const mappedMessages: SmsMessage[] = (response.data.messages || []).map((msg) => ({
          id: msg.id,
          leadId,
          direction: msg.direction,
          content: msg.content,
          status: msg.status as SmsMessage['status'],
          createdAt: msg.created_at,
        }));
        set({
          messages: mappedMessages,
          isLoading: false,
          hasMore: (response.data.messages?.length || 0) >= limit,
        });
      } else {
        throw new Error('Failed to fetch conversation');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch SMS conversation';
      set({ error: message, isLoading: false, messages: [] });
    }
  },

  sendMessage: async (leadId: string, messageText: string) => {
    set({ isSending: true, error: null });
    try {
      const response = await smsApi.send(leadId, messageText);
      if (response.status === 200) {
        const newMessage: SmsMessage = {
          id: response.data.message.id,
          leadId,
          direction: 'outbound',
          content: messageText,
          status: 'sent',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          messages: [...state.messages, newMessage],
          isSending: false,
        }));
        return newMessage;
      } else {
        throw new Error(response.message || 'Failed to send message');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send SMS';
      set({ error: message, isSending: false });
      return null;
    }
  },

  clearConversation: () => {
    set({
      messages: [],
      currentLeadId: null,
      error: null,
      hasMore: true,
    });
  },

  addIncomingMessage: (message: SmsMessage) => {
    const { currentLeadId, messages } = get();
    // Only add if this message belongs to the current conversation
    if (message.leadId === currentLeadId) {
      // Avoid duplicates
      const exists = messages.some((m) => m.id === message.id);
      if (!exists) {
        set((state) => ({
          messages: [...state.messages, message],
        }));
      }
    }
  },
}));

// ============================================================================
// INBOX STORE - For unified inbox view
// ============================================================================

interface InboxState {
  items: InboxItem[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  filters: InboxFilters;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

interface InboxActions {
  fetchInbox: (filters?: InboxFilters, page?: number) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  setFilters: (filters: InboxFilters) => void;
  clearFilters: () => void;
  addNewItem: (item: InboxItem) => void;
  updateItemStatus: (id: string, status: string) => void;
}

type InboxStore = InboxState & InboxActions;

export const useInboxStore = create<InboxStore>((set, get) => ({
  items: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
  },

  fetchInbox: async (filters?: InboxFilters, page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const currentFilters = filters || get().filters;
      const limit = get().pagination.limit;
      const offset = (page - 1) * limit;
      const response = await inboxApi.getInbox({
        ...currentFilters,
        limit,
        offset,
      });

      if (response.status === 200) {
        // Map API response to store's InboxItem type
        const mappedItems: InboxItem[] = (response.data.communications || []).map((comm) => ({
          id: comm.id,
          type: comm.type as InboxItem['type'],
          direction: comm.direction,
          lead: comm.lead || undefined,
          user: comm.user || undefined,
          content: comm.content,
          status: comm.status,
          isRead: comm.is_read,
          createdAt: comm.created_at,
        }));
        set({
          items: mappedItems,
          unreadCount: response.data.unread_count || 0,
          pagination: {
            total: response.data.pagination?.total || 0,
            page: page,
            limit: response.data.pagination?.limit || 20,
          },
          filters: currentFilters,
          isLoading: false,
        });
      } else {
        throw new Error('Failed to fetch inbox');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch inbox';
      set({ error: message, isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await inboxApi.getUnreadCount();
      if (response.status === 200) {
        set({ unreadCount: response.data.unread_count || 0 });
      }
    } catch {
      // Silently fail - not critical
    }
  },

  markAsRead: async (id: string) => {
    try {
      await inboxApi.markAsRead(id);
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, isRead: true } : item
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to mark as read';
      set({ error: message });
    }
  },

  markAllAsRead: async () => {
    const { items } = get();
    const unreadItems = items.filter((item) => !item.isRead);

    // Optimistically update UI
    set((state) => ({
      items: state.items.map((item) => ({ ...item, isRead: true })),
      unreadCount: 0,
    }));

    // Mark each as read in the background
    for (const item of unreadItems) {
      try {
        await inboxApi.markAsRead(item.id);
      } catch {
        // Continue even if one fails
      }
    }
  },

  setFilters: (filters: InboxFilters) => {
    set({ filters });
    get().fetchInbox(filters, 1);
  },

  clearFilters: () => {
    set({ filters: {} });
    get().fetchInbox({}, 1);
  },

  addNewItem: (item: InboxItem) => {
    set((state) => ({
      items: [item, ...state.items],
      unreadCount: !item.isRead ? state.unreadCount + 1 : state.unreadCount,
    }));
  },

  updateItemStatus: (id: string, status: string) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, status } : item
      ),
    }));
  },
}));

// ============================================================================
// CALL HISTORY STORE - For call logs
// ============================================================================

export interface CallLog {
  id: string;
  leadId: string;
  leadName?: string;
  direction: 'inbound' | 'outbound';
  status: 'completed' | 'missed' | 'failed' | 'in_progress' | 'no_answer';
  duration?: number;
  recordingUrl?: string;
  createdAt: string;
  phoneNumber: string;
}

interface CallHistoryState {
  calls: CallLog[];
  isLoading: boolean;
  error: string | null;
}

interface CallHistoryActions {
  addCall: (call: CallLog) => void;
  updateCall: (id: string, updates: Partial<CallLog>) => void;
  clearHistory: () => void;
}

type CallHistoryStore = CallHistoryState & CallHistoryActions;

export const useCallHistoryStore = create<CallHistoryStore>((set) => ({
  calls: [],
  isLoading: false,
  error: null,

  addCall: (call: CallLog) => {
    set((state) => ({
      calls: [call, ...state.calls],
    }));
  },

  updateCall: (id: string, updates: Partial<CallLog>) => {
    set((state) => ({
      calls: state.calls.map((call) =>
        call.id === id ? { ...call, ...updates } : call
      ),
    }));
  },

  clearHistory: () => {
    set({ calls: [] });
  },
}));

// ============================================================================
// SELECTOR HOOKS
// ============================================================================

export const useSmsMessages = () => useSmsStore((state) => state.messages);
export const useSmsLoading = () => useSmsStore((state) => state.isLoading || state.isSending);
export const useInboxItems = () => useInboxStore((state) => state.items);
export const useUnreadCount = () => useInboxStore((state) => state.unreadCount);
export const useInboxLoading = () => useInboxStore((state) => state.isLoading);
export const useCallLogs = () => useCallHistoryStore((state) => state.calls);
