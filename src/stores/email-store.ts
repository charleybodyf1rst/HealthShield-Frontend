'use client';

import { create } from 'zustand';
import { inboxApi, communicationApi } from '@/lib/api';
import type { CommunicationLog } from '@/lib/api';

export type EmailTab = 'inbox' | 'sent' | 'drafts';

interface EmailState {
  emails: CommunicationLog[];
  selectedEmail: CommunicationLog | null;
  threadEmails: CommunicationLog[];
  activeTab: EmailTab;
  isLoading: boolean;
  isThreadLoading: boolean;
  isSending: boolean;
  searchQuery: string;
  composing: boolean;
  pagination: {
    total: number;
    page: number;
    perPage: number;
  };
  error: string | null;
}

interface EmailActions {
  fetchEmails: (tab?: EmailTab, search?: string) => Promise<void>;
  fetchThread: (threadId: string) => Promise<void>;
  selectEmail: (email: CommunicationLog | null) => void;
  setActiveTab: (tab: EmailTab) => void;
  setSearchQuery: (query: string) => void;
  setComposing: (composing: boolean) => void;
  sendEmail: (data: { to: string; subject: string; body: string; bodyHtml?: string; leadId?: string; cc?: string; bcc?: string }) => Promise<void>;
  saveDraft: (data: { emailTo?: string; subject?: string; content?: string; leadId?: string }) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
}

type EmailStore = EmailState & EmailActions;

export const useEmailStore = create<EmailStore>((set, get) => ({
  emails: [],
  selectedEmail: null,
  threadEmails: [],
  activeTab: 'inbox',
  isLoading: false,
  isThreadLoading: false,
  isSending: false,
  searchQuery: '',
  composing: false,
  pagination: { total: 0, page: 1, perPage: 50 },
  error: null,

  fetchEmails: async (tab?: EmailTab, search?: string) => {
    const activeTab = tab || get().activeTab;
    set({ isLoading: true, error: null });

    try {
      const params: Record<string, string | boolean | number> = {
        type: 'email',
        limit: 50,
      };

      if (activeTab === 'inbox') {
        params.direction = 'inbound';
      } else if (activeTab === 'sent') {
        params.direction = 'outbound';
      } else if (activeTab === 'drafts') {
        params.status = 'draft';
      }

      if (search) {
        params.search = search;
      }

      const response = await inboxApi.getInbox(params as Parameters<typeof inboxApi.getInbox>[0]);
      // Backend returns Laravel paginated: { data: [...], current_page, total, per_page }
      // OR wrapped format: { data: { communications: [...] } }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = response as any;
      let comms: CommunicationLog[] = [];
      let total = 0;

      if (Array.isArray(raw?.data)) {
        // Laravel paginated format: response.data is the array
        comms = raw.data as CommunicationLog[];
        total = (raw.total as number) || comms.length;
      } else if (raw?.data && typeof raw.data === 'object') {
        const inner = raw.data as Record<string, unknown>;
        if (Array.isArray(inner.communications)) {
          comms = inner.communications as CommunicationLog[];
          total = (inner.pagination as Record<string, number>)?.total || comms.length;
        } else if (Array.isArray(inner.data)) {
          comms = inner.data as CommunicationLog[];
          total = (inner.total as number) || comms.length;
        }
      }

      set({
        emails: comms,
        isLoading: false,
        pagination: { total, page: 1, perPage: 50 },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch emails';
      set({ error: message, isLoading: false, emails: [] });
    }
  },

  fetchThread: async (threadId: string) => {
    set({ isThreadLoading: true });
    try {
      const response = await communicationApi.getEmailThread(threadId);
      set({
        threadEmails: response?.data || [],
        isThreadLoading: false,
      });
    } catch {
      set({ threadEmails: [], isThreadLoading: false });
    }
  },

  selectEmail: (email: CommunicationLog | null) => {
    set({ selectedEmail: email, composing: false });
    if (email?.email_thread_id) {
      get().fetchThread(email.email_thread_id);
    } else {
      set({ threadEmails: email ? [email] : [] });
    }
  },

  setActiveTab: (tab: EmailTab) => {
    set({ activeTab: tab, selectedEmail: null, threadEmails: [], composing: false });
    get().fetchEmails(tab, get().searchQuery);
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    get().fetchEmails(get().activeTab, query);
  },

  setComposing: (composing: boolean) => {
    set({ composing, selectedEmail: composing ? null : get().selectedEmail });
  },

  sendEmail: async (data) => {
    set({ isSending: true, error: null });
    try {
      await communicationApi.sendEmail(data);
      set({ isSending: false, composing: false });
      // Refresh sent tab
      get().fetchEmails(get().activeTab);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send email';
      set({ error: message, isSending: false });
      throw error;
    }
  },

  saveDraft: async (data) => {
    try {
      await communicationApi.saveDraft(data);
      if (get().activeTab === 'drafts') {
        get().fetchEmails('drafts');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save draft';
      set({ error: message });
      throw error;
    }
  },

  markAsRead: async (id: string) => {
    try {
      await inboxApi.markAsRead(id);
      set((state) => ({
        emails: state.emails.map((e) =>
          e.id === id ? { ...e, is_read: true } : e
        ),
      }));
    } catch {
      // Silent fail for mark as read
    }
  },
}));
