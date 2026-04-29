import { API_BASE_URL, AUTH_TOKEN_KEY } from './constants';
import type { AuthTokens, User } from '@/types/auth';
import type {
  Lead, LeadActivity, LeadTask, LeadComment, LeadStats,
  CreateLeadData, UpdateLeadData, LeadFilters
} from '@/types/lead';
import type {
  Conversation, Message, ConversationsResponse, ConversationDetailResponse,
  SendMessagePayload, CreateConversationPayload
} from '@/types/message';

interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getTokens(): AuthTokens | null {
    if (typeof window === 'undefined') return null;

    // Read from Zustand's persisted storage key (healthshield-crm-auth)
    // The state object contains { state: { tokens, user, isAuthenticated }, version: 0 }
    const zustandStored = localStorage.getItem('healthshield-crm-auth');
    if (zustandStored) {
      try {
        const parsed = JSON.parse(zustandStored);
        if (parsed?.state?.tokens) {
          return parsed.state.tokens;
        }
      } catch (e) {
        console.warn('Failed to parse Zustand auth state:', e);
      }
    }

    // Fallback to legacy key for backwards compatibility
    const legacyStored = localStorage.getItem(AUTH_TOKEN_KEY);
    if (legacyStored) {
      try {
        return JSON.parse(legacyStored);
      } catch {
        return null;
      }
    }

    return null;
  }

  private async getHeaders(): Promise<HeadersInit> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const tokens = this.getTokens();
    if (tokens?.accessToken) {
      headers['Authorization'] = `Bearer ${tokens.accessToken}`;
    }

    // Always scope to HealthShield organization — separates data from BodyF1RST
    headers['X-Organization-ID'] = process.env.NEXT_PUBLIC_HEALTHSHIELD_ORG_ID || '12';

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = {
        message: 'An error occurred',
        status: response.status,
      };

      try {
        const data = await response.json();
        error.message = data.message || data.error || error.message;
        error.errors = data.errors;
      } catch {
        error.message = response.statusText;
      }

      // 401 handling - don't immediately redirect, let the auth guard handle it
      // This prevents race conditions during hydration where tokens aren't loaded yet
      if (response.status === 401) {
        // Only log the error - auth guard in dashboard layout will handle redirect
        console.warn('API returned 401 - auth guard will handle redirect if needed');
      }

      throw error;
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: await this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: await this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: await this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: await this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const tokens = this.getTokens();
    const headers: HeadersInit = {};

    if (tokens?.accessToken) {
      headers['Authorization'] = `Bearer ${tokens.accessToken}`;
    }

    // Always scope uploads to HealthShield organization
    headers['X-Organization-ID'] = process.env.NEXT_PUBLIC_HEALTHSHIELD_ORG_ID || '12';

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return this.handleResponse<T>(response);
  }
}

export const api = new ApiClient(API_BASE_URL);

// ==================== AUTH API ====================

interface BackendLoginResponse {
  status: number;
  message: string;
  token: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    profile_image?: string;
    role?: string;
    is_active?: number;
    created_at?: string;
    updated_at?: string;
  };
  user_type: 'sales_admin' | 'sales_manager' | 'sales_rep';
}

function transformLoginResponse(backendResponse: BackendLoginResponse): {
  user: User;
  tokens: AuthTokens;
} {
  return {
    user: {
      id: String(backendResponse.user.id),
      email: backendResponse.user.email,
      firstName: backendResponse.user.first_name,
      lastName: backendResponse.user.last_name,
      role: backendResponse.user_type,
      avatar: backendResponse.user.profile_image,
      phone: backendResponse.user.phone,
      organizationId: backendResponse.user.organization_id,
      createdAt: backendResponse.user.created_at || new Date().toISOString(),
      updatedAt: backendResponse.user.updated_at || new Date().toISOString(),
    },
    tokens: {
      accessToken: backendResponse.token,
      refreshToken: '',
      expiresIn: 86400,
      createdAt: Date.now(),
    },
  };
}

export const authApi = {
  login: async (email: string, password: string) => {
    // Use unified auth endpoint - supports ALL user types including sales team
    // Normalize email to lowercase to prevent case-sensitivity login failures
    const normalizedEmail = email.toLowerCase().trim();
    const response = await api.post<BackendLoginResponse>('/api/v1/auth/login', {
      email: normalizedEmail,
      password,
      app: 'crm'
    });
    return transformLoginResponse(response);
  },

  logout: () => api.post('/api/v1/auth/logout'),

  refreshToken: (refreshToken: string) =>
    api.post<{ tokens: AuthTokens }>('/api/v1/sales/refresh', { refreshToken }),

  forgotPassword: (email: string) =>
    api.post('/api/v1/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post('/api/v1/sales/reset-password', { token, password }),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/api/v1/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: newPassword,
    }),

  me: async (): Promise<User> => {
    // Use unified auth /me endpoint
    const response = await api.get<{ user: BackendLoginResponse['user']; status: number }>('/api/v1/auth/me');
    return {
      id: String(response.user.id),
      email: response.user.email,
      firstName: response.user.first_name,
      lastName: response.user.last_name,
      role: 'sales_rep',
      avatar: response.user.profile_image,
      createdAt: response.user.created_at || new Date().toISOString(),
      updatedAt: response.user.updated_at || new Date().toISOString(),
    };
  },
};

// ==================== LEADS API ====================

// Valid backend sources for CrmLeadController
const VALID_BACKEND_SOURCES = ['website', 'phone', 'sms', 'walk_in', 'referral', 'google', 'facebook', 'instagram', 'yelp', 'other'];

function mapLeadSource(source: string): string {
  return VALID_BACKEND_SOURCES.includes(source) ? source : 'other';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCrmLeadToLead(raw: any): Lead {
  return {
    id: String(raw.id),
    firstName: raw.contact_first_name || raw.first_name || raw.firstName || '',
    lastName: raw.contact_last_name || raw.last_name || raw.lastName || '',
    email: raw.contact_email || raw.email || '',
    phone: raw.contact_phone || raw.phone,
    company: raw.company_name || raw.companyName,
    jobTitle: raw.contact_title || raw.contactTitle,
    industry: raw.industry || '',
    estimatedEmployees: raw.estimated_employees ? Number(raw.estimated_employees) : undefined,
    website: raw.website || '',
    companyAddress: raw.company_address,
    companyCity: raw.company_city,
    companyState: raw.company_state,
    companyZip: raw.company_zip,
    status: raw.status || raw.stage || 'new',
    source: raw.lead_source || raw.source || 'other',
    classification: raw.classification || raw.plan_type,
    classificationLabel: raw.company_type !== 'organization' ? raw.company_type : undefined,
    value: raw.deal_value ? Number(raw.deal_value) : raw.value ? Number(raw.value) : undefined,
    notes: raw.notes,
    assignedTo: raw.assigned_to_user_id != null ? String(raw.assigned_to_user_id) : raw.assignedTo,
    lastContactedAt: raw.last_contacted_at || raw.lastContactedAt,
    nextFollowUpAt: raw.next_follow_up_at || raw.nextFollowUpAt,
    lostReason: raw.lost_reason || raw.lostReason,
    createdAt: raw.created_at || raw.createdAt || '',
    updatedAt: raw.updated_at || raw.updatedAt || '',
  };
}

export const leadsApi = {
  getAll: async (params?: LeadFilters & { page?: number; limit?: number; per_page?: number }) => {
    // API returns Laravel pagination directly: { current_page, data: [...leads], total, per_page }
    // Backend uses 'per_page' not 'limit' — map it
    const queryParams: Record<string, string> = { ...(params as Record<string, string>) };
    if (queryParams.limit && !queryParams.per_page) {
      queryParams.per_page = queryParams.limit;
      delete queryParams.limit;
    }
    const response = await api.get<{ current_page: number; data: unknown[]; total: number; per_page: number; last_page: number }>(
      '/api/v1/crm/leads',
      queryParams
    );
    const rawLeads = Array.isArray(response.data) ? response.data : [];
    return {
      data: {
        data: rawLeads.map(mapCrmLeadToLead),
        leads: rawLeads.map(mapCrmLeadToLead),
        current_page: response.current_page || 1,
        total: response.total || rawLeads.length,
        per_page: response.per_page || 20,
        last_page: response.last_page || 1,
      },
    };
  },

  getById: async (id: string) => {
    const response = await api.get<any>(`/api/v1/crm/leads/${id}`);
    // CRM controller returns lead at top level
    const rawLead = response.data || response;
    return { data: mapCrmLeadToLead(rawLead) };
  },

  create: async (data: CreateLeadData) => {
    const payload = {
      company_name: data.serviceName || `${data.firstName} ${data.lastName}`.trim(),
      contact_first_name: data.firstName,
      contact_last_name: data.lastName,
      contact_email: data.email,
      contact_phone: data.phone,
      lead_source: mapLeadSource(data.source),
      industry: data.serviceName || undefined,
      deal_value: data.value,
      notes: data.notes,
    };
    const response = await api.post<any>(
      '/api/v1/crm/leads',
      payload
    );
    // CRM controller returns lead at top level, not in {data: lead}
    const rawLead = response.data || response;
    return { data: mapCrmLeadToLead(rawLead) };
  },

  update: async (id: string, data: UpdateLeadData) => {
    const payload: Record<string, unknown> = {};
    if (data.status !== undefined) payload.status = data.status;
    if (data.firstName !== undefined) payload.contact_first_name = data.firstName;
    if (data.lastName !== undefined) payload.contact_last_name = data.lastName;
    if (data.email !== undefined) payload.contact_email = data.email;
    if (data.phone !== undefined) payload.contact_phone = data.phone;
    if (data.notes !== undefined) payload.notes = data.notes;
    if (data.value !== undefined) payload.deal_value = data.value;
    if (data.source !== undefined) payload.lead_source = mapLeadSource(data.source);
    if (data.assignedTo !== undefined) payload.assigned_to_user_id = data.assignedTo;
    if (data.nextFollowUpAt !== undefined) payload.next_follow_up_at = data.nextFollowUpAt;
    if (data.lostReason !== undefined) payload.lost_reason = data.lostReason;

    const response = await api.put<unknown>(`/api/v1/crm/leads/${id}`, payload);
    return {
      data: mapCrmLeadToLead(response),
    };
  },

  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/api/v1/crm/leads/${id}`),

  updateStatus: (id: string, status: string, reason?: string) =>
    api.patch<{ status: number; message: string; data: { lead: Lead } }>(`/api/v1/sales/leads/${id}/status`, { status, reason }),

  assign: (id: string, assignedTo: string) =>
    api.patch<{ status: number; message: string }>(`/api/v1/sales/leads/${id}/assign`, { assigned_to: assignedTo }),

  bulkAssign: (leadIds: string[], assignedTo: string) =>
    api.post<{ status: number; message: string; updated: number }>('/api/v1/sales/leads/bulk-assign', {
      lead_ids: leadIds,
      assigned_to: assignedTo,
    }),

  bulkDelete: (leadIds: string[]) =>
    api.post<{ status: number; message: string; deleted: number }>('/api/v1/sales/leads/bulk-delete', {
      lead_ids: leadIds,
    }),

  getStats: () =>
    api.get<{ status: number; stats: LeadStats }>('/api/v1/sales/leads/stats'),

  // Activities / Notes — uses CRM endpoints
  getActivities: (leadId: string) =>
    api.get<{ success: boolean; activities: Array<{ id: number; lead_id: number; activity_type: string; description: string; metadata: string | null; user_id: number | null; activity_at: string; created_at: string; }> }>(`/api/v1/crm/leads/${leadId}/activities`).catch(() => ({ success: false, activities: [] })),

  addActivity: (leadId: string, data: Partial<LeadActivity>) =>
    api.post<{ success: boolean; message: string; lead: unknown }>(`/api/v1/crm/leads/${leadId}/note`, {
      note: data.description || data.title || '',
      note_type: data.type || 'general',
    }),

  // Tasks — uses CRM tasks endpoint (GET/POST /crm/tasks)
  getTasks: (leadId: string) =>
    api.get<{ success: boolean; data: LeadTask[] }>(`/api/v1/crm/tasks`, { linked_lead_id: leadId } as Record<string, string>).catch(() => ({ success: false, data: [] })),

  addTask: (leadId: string, data: Partial<LeadTask>) =>
    api.post<{ success: boolean; data: LeadTask }>(`/api/v1/crm/tasks`, {
      ...data,
      linked_lead_id: leadId,
    }),

  updateTask: (leadId: string, taskId: string, data: Partial<LeadTask>) =>
    api.put<{ success: boolean; data: LeadTask }>(`/api/v1/crm/tasks/${taskId}`, data),

  // Comments
  getComments: (leadId: string) =>
    api.get<{ status: number; comments: LeadComment[] }>(`/api/v1/sales/leads/${leadId}/comments`),

  addComment: (leadId: string, content: string) =>
    api.post<{ status: number; message: string; comment: LeadComment }>(`/api/v1/sales/leads/${leadId}/comments`, { content }),

  // Documents
  getDocuments: (leadId: string) =>
    api.get<{ success: boolean; data: Array<{ id: number; lead_id: number; name: string; original_filename: string; file_path: string; file_type: string; file_size: number; category: string; description: string | null; uploaded_by_name: string | null; created_at: string; }> }>(`/api/v1/crm/leads/${leadId}/documents`),

  uploadDocument: (leadId: string, file: File, name?: string, category?: string, description?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);
    if (category) formData.append('category', category);
    if (description) formData.append('description', description);
    return api.upload<{ success: boolean; message: string; data: { id: number; name: string; file_type: string; file_size: number; category: string; created_at: string; } }>(`/api/v1/crm/leads/${leadId}/documents`, formData);
  },

  deleteDocument: (documentId: string) =>
    api.delete<{ success: boolean; message: string }>(`/api/v1/crm/leads/documents/${documentId}`),

  // CRM Tasks (persisted, with notifications)
  createCrmTask: (data: {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    status?: string;
    due_date?: string;
    linked_lead_id?: string | number;
    assigned_to?: string | number;
    notify_via?: ('app' | 'email' | 'sms')[];
  }) =>
    api.post<{ success: boolean; data: Record<string, unknown> }>('/api/v1/crm/tasks', data),

  getCrmTasks: (filters?: { linked_lead_id?: string; status?: string; priority?: string }) => {
    const params: Record<string, string> = {};
    if (filters?.linked_lead_id) params.linked_lead_id = filters.linked_lead_id;
    if (filters?.status) params.status = filters.status;
    if (filters?.priority) params.priority = filters.priority;
    return api.get<{ success: boolean; data: { data: Array<Record<string, unknown>> } }>('/api/v1/crm/tasks', params);
  },

  updateCrmTask: (taskId: string, data: Record<string, unknown>) =>
    api.put<{ success: boolean; data: Record<string, unknown> }>(`/api/v1/crm/tasks/${taskId}`, data),

  deleteCrmTask: (taskId: string) =>
    api.delete<{ success: boolean }>(`/api/v1/crm/tasks/${taskId}`),
};

// ==================== NOTIFICATIONS API ====================

export const notificationsApi = {
  getAll: (params?: { page?: number; per_page?: number }) =>
    api.get<{ success: boolean; data: Array<{ id: number; title: string; message: string; cta_link?: string; redirect_url?: string; metadata?: Record<string, unknown>; created_at: string; read_at?: string | null; }> }>('/api/v1/crm/notifications', params as Record<string, string>),

  markRead: (notificationId: number) =>
    api.put<{ success: boolean }>(`/api/v1/crm/notifications/${notificationId}/read`),

  markAllRead: () =>
    api.put<{ success: boolean }>('/api/v1/crm/notifications/mark-all-read'),

  getUnreadCount: () =>
    api.get<{ success: boolean; count: number }>('/api/v1/crm/notifications/count'),
};

// ==================== PIPELINE API ====================

export const pipelineApi = {
  getKanban: () =>
    api.get<{ status: number; data: { stages: Array<{
      id: string;
      name: string;
      description?: string;
      color: string;
      order: number;
      probability: number;
      exit_criteria: string[];
      leads: Lead[];
      total_value: number;
      weighted_value: number;
    }> } }>(
      '/api/v1/sales/pipeline/kanban'
    ),

  moveLead: (leadId: string, stageId: string, position?: number) =>
    api.patch<{ status: number; message: string }>(`/api/sales/pipeline/move`, {
      lead_id: leadId,
      stage_id: stageId,
      position,
    }),

  getStageStats: () =>
    api.get<{ status: number; stats: Record<string, { count: number; value: number }> }>('/api/v1/sales/pipeline/stats'),
};

// ==================== MESSAGES API (Encrypted) ====================

export const messagesApi = {
  getConversations: () =>
    api.get<{ status: number; data: ConversationsResponse }>('/api/v1/sales/conversations'),

  getConversation: (conversationId: string, params?: { limit?: number; offset?: number }) =>
    api.get<{ status: number; data: ConversationDetailResponse }>(
      `/api/sales/conversations/${conversationId}`,
      params as Record<string, string>
    ),

  sendMessage: (conversationId: string, data: SendMessagePayload) =>
    api.post<{ status: number; message_id: string; created_at: string }>(
      `/api/sales/conversations/${conversationId}/messages`,
      data
    ),

  markMessageAsRead: (conversationId: string, messageId: string) =>
    api.post(`/api/sales/conversations/${conversationId}/messages/${messageId}/read`),

  addReaction: (conversationId: string, messageId: string, emoji: string) =>
    api.post(`/api/sales/conversations/${conversationId}/messages/${messageId}/react`, { emoji }),

  createConversation: (data: CreateConversationPayload) =>
    api.post<{ status: number; conversation_id: string; is_new: boolean }>('/api/v1/sales/conversations', data),

  addParticipant: (conversationId: string, userId: string) =>
    api.post(`/api/sales/conversations/${conversationId}/participants`, { user_id: userId }),

  removeParticipant: (conversationId: string, userId: string) =>
    api.delete(`/api/sales/conversations/${conversationId}/participants/${userId}`),

  updateSettings: (conversationId: string, settings: { push?: boolean; email?: boolean }) =>
    api.put(`/api/sales/conversations/${conversationId}/settings`, settings),

  deleteConversation: (conversationId: string) =>
    api.delete(`/api/sales/conversations/${conversationId}`),
};

// ==================== AI AGENT API ====================

export interface AIAgent {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'voice' | 'chat';
  description: string;
  isActive: boolean;
  settings: {
    tone: 'professional' | 'friendly' | 'casual';
    responseDelay: number;
    autoRespond: boolean;
    requireApproval: boolean;
  };
  stats: {
    totalInteractions: number;
    successRate: number;
    avgResponseTime: number;
  };
}

export interface AIConversation {
  id: string;
  agentId: string;
  leadId?: string;
  messages: AIMessage[];
  status: 'active' | 'completed' | 'escalated';
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export const aiAgentsApi = {
  getAll: () =>
    api.get<{ status: number; agents: AIAgent[] }>('/api/v1/crm/ai-agents'),

  getById: (id: string) =>
    api.get<{ status: number; agent: AIAgent }>(`/api/v1/crm/ai-agents/${id}`),

  create: (data: Partial<AIAgent>) =>
    api.post<{ status: number; message: string; agent: AIAgent }>('/api/v1/crm/ai-agents', data),

  update: (id: string, data: Partial<AIAgent>) =>
    api.patch<{ status: number; message: string; agent: AIAgent }>(`/api/v1/crm/ai-agents/${id}`, data),

  delete: (id: string) =>
    api.delete<{ status: number; message: string }>(`/api/v1/crm/ai-agents/${id}`),

  toggle: (id: string, isActive: boolean) =>
    api.patch<{ status: number; message: string }>(`/api/v1/crm/ai-agents/${id}/toggle`, { is_active: isActive }),

  // AI Voice Calling (Twilio + ElevenLabs + ChatGPT)
  initiateCall: (leadId: string, agentId: string, script?: string) =>
    api.post<{ status: number; call_sid: string; message: string }>('/api/v1/sales/ai-caller/initiate', {
      lead_id: leadId,
      agent_id: agentId,
      script,
    }),

  getCallStatus: (callSid: string) =>
    api.get<{ status: number; call: { sid: string; status: string; duration: number; recording_url?: string } }>(
      `/api/sales/ai-caller/status/${callSid}`
    ),

  getCallHistory: (params?: { lead_id?: string; agent_id?: string; limit?: number }) =>
    api.get<{ status: number; calls: Array<{ id: string; lead_id: string; status: string; duration: number; created_at: string }> }>(
      '/api/v1/sales/ai-caller/history',
      params as Record<string, string>
    ),

  // Chat with AI (Claude via Anthropic)
  chat: (leadId: string, message: string) =>
    api.post<{ status: number; data: { response: string; suggestedActions: Array<{ type: string; action: string; icon: string }>; conversationId: string; tokensUsed: number } }>('/api/v1/sales/ai-agents/chat', {
      message,
      leadId: leadId || undefined,
    }),

  getConversations: (agentId: string) =>
    api.get<{ status: number; conversations: AIConversation[] }>(`/api/sales/ai-agents/${agentId}/conversations`),
};

// ==================== COMMUNICATION API (SMS/Email) ====================

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  createdAt: string;
}

export interface SMSTemplate {
  id: string;
  name: string;
  body: string;
  variables: string[];
  createdAt: string;
}

export const communicationApi = {
  // Email — sends via SendGrid and logs in CRM communications
  sendEmail: (data: {
    to: string;
    subject: string;
    body: string;
    bodyHtml?: string;
    leadId?: string;
    cc?: string;
    bcc?: string;
  }) =>
    api.post<unknown>('/api/v1/crm/communications', {
      lead_id: data.leadId || null,
      type: 'email',
      direction: 'outbound',
      subject: data.subject,
      content: data.body,
      content_html: data.bodyHtml,
      email_to: data.to,
      email_cc: data.cc,
      email_bcc: data.bcc,
      send_immediately: true,
    }),

  getEmailTemplates: () =>
    api.get<{ status: number; templates: EmailTemplate[] }>('/api/v1/crm/communications/templates'),

  createEmailTemplate: (data: Partial<EmailTemplate>) =>
    api.post<{ status: number; template: EmailTemplate }>('/api/v1/crm/communications/templates', data),

  // SMS
  sendSMS: (data: { to: string; body: string; leadId: string }) =>
    api.post<unknown>('/api/v1/crm/communications', {
      lead_id: data.leadId,
      type: 'sms',
      direction: 'outbound',
      content: data.body,
      sms_to: data.to,
      send_immediately: true,
    }),

  getSMSTemplates: () =>
    api.get<{ status: number; templates: SMSTemplate[] }>('/api/v1/crm/communications/templates'),

  createSMSTemplate: (data: Partial<SMSTemplate>) =>
    api.post<{ status: number; template: SMSTemplate }>('/api/v1/crm/communications/templates', data),

  // Voice (Twilio)
  makeCall: (data: { to: string; from?: string; leadId?: string }) =>
    api.post<unknown>('/api/v1/crm/communications', {
      lead_id: data.leadId,
      type: 'voice_call',
      direction: 'outbound',
      content: 'Outbound call initiated',
      call_to: data.to,
      call_from: data.from,
    }),

  getCallLogs: (params?: { lead_id?: string; limit?: number }) =>
    api.get<{ status: number; calls: Array<{ sid: string; to: string; from: string; status: string; duration: number; created_at: string }> }>(
      '/api/v1/crm/communications',
      { type: 'voice_call', ...(params as Record<string, string>) }
    ),

  // AI Assist
  aiGenerateDraft: (data: { leadId?: string; purpose: string; tone?: string; context?: string }) =>
    api.post<{ subject: string; body: string; body_html: string }>('/api/v1/crm/communications/ai/generate-draft', {
      lead_id: data.leadId,
      purpose: data.purpose,
      tone: data.tone,
      context: data.context,
    }),

  aiSuggestSubject: (data: { body: string }) =>
    api.post<{ subjects: string[] }>('/api/v1/crm/communications/ai/suggest-subject', data),

  aiImproveTone: (data: { body: string; targetTone: string }) =>
    api.post<{ body: string }>('/api/v1/crm/communications/ai/improve-tone', {
      body: data.body,
      target_tone: data.targetTone,
    }),

  // Drafts
  saveDraft: (data: { leadId?: string; emailTo?: string; subject?: string; content?: string; contentHtml?: string }) =>
    api.post<CommunicationLog>('/api/v1/crm/communications/drafts', {
      lead_id: data.leadId,
      email_to: data.emailTo,
      subject: data.subject,
      content: data.content,
      content_html: data.contentHtml,
    }),

  updateDraft: (id: string, data: { emailTo?: string; subject?: string; content?: string }) =>
    api.put<CommunicationLog>(`/api/v1/crm/communications/drafts/${id}`, {
      email_to: data.emailTo,
      subject: data.subject,
      content: data.content,
    }),

  // Email thread
  getEmailThread: (threadId: string) =>
    api.get<{ data: CommunicationLog[] }>(`/api/v1/crm/communications/email-thread/${threadId}`),

  // Single email
  getEmail: (id: string) =>
    api.get<CommunicationLog>(`/api/v1/crm/communications/${id}`),
};

// ==================== ANALYTICS API ====================

export interface DashboardStats {
  totalLeads: number;
  newLeadsToday: number;
  leadsInPipeline: number;
  convertedThisMonth: number;
  totalRevenue: number;
  revenueThisMonth: number;
  conversionRate: number;
  avgDealSize: number;
}

export interface SalesPerformance {
  userId: string;
  userName: string;
  leadsAssigned: number;
  leadsConverted: number;
  revenue: number;
  conversionRate: number;
  avgResponseTime: number;
}

export const analyticsApi = {
  getDashboardStats: () =>
    api.get<{ status: number; stats: DashboardStats }>('/api/v1/sales/analytics/dashboard'),

  getTeamPerformance: (params?: { period?: string }) =>
    api.get<{ status: number; performance: SalesPerformance[] }>('/api/v1/sales/analytics/team', params as Record<string, string>),

  getLeadSourceReport: (params?: { start_date?: string; end_date?: string }) =>
    api.get<{ status: number; data: Array<{ source: string; count: number; converted: number; revenue: number }> }>(
      '/api/v1/sales/analytics/lead-sources',
      params as Record<string, string>
    ),

  getConversionFunnel: () =>
    api.get<{ status: number; funnel: Array<{ stage: string; count: number; conversion_rate: number }> }>(
      '/api/v1/sales/analytics/funnel'
    ),

  getRevenueReport: (params?: { period?: 'daily' | 'weekly' | 'monthly'; start_date?: string; end_date?: string }) =>
    api.get<{ status: number; data: Array<{ date: string; revenue: number; deals: number }> }>(
      '/api/v1/sales/analytics/revenue',
      params as Record<string, string>
    ),
};

// ==================== TEAM API ====================

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'sales_admin' | 'sales_manager' | 'sales_rep';
  avatar?: string;
  phone?: string;
  isActive: boolean;
  leadsAssigned: number;
  createdAt: string;
}

export const teamApi = {
  getAll: () =>
    api.get<{ status: number; members: TeamMember[] }>('/api/v1/sales/team'),

  getById: (id: string) =>
    api.get<{ status: number; member: TeamMember }>(`/api/sales/team/${id}`),

  invite: (data: { email: string; firstName: string; lastName: string; role: string }) =>
    api.post<{ status: number; message: string }>('/api/v1/sales/team/invite', data),

  update: (id: string, data: Partial<TeamMember>) =>
    api.patch<{ status: number; message: string; member: TeamMember }>(`/api/sales/team/${id}`, data),

  remove: (id: string) =>
    api.delete<{ status: number; message: string }>(`/api/sales/team/${id}`),

  updateRole: (id: string, role: string) =>
    api.patch<{ status: number; message: string }>(`/api/sales/team/${id}/role`, { role }),
};

// ==================== AI SALES ASSISTANT API ====================

export interface AIInsight {
  type: 'opportunity' | 'risk' | 'action' | 'info';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  leadId?: string;
  leadName?: string;
}

export interface NextBestAction {
  id: string;
  action: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  leadId: string;
  leadName: string;
  dueDate?: string;
  type: 'call' | 'email' | 'meeting' | 'follow_up' | 'proposal';
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export const aiAssistantApi = {
  // Chat with AI Sales Assistant
  chat: (message: string, leadId?: string, conversationId?: string) =>
    api.post<{
      status: number;
      response: string;
      conversation_id: string;
      suggestions?: string[];
    }>('/api/v1/sales/ai-agents/chat', {
      message,
      lead_id: leadId,
      conversation_id: conversationId,
    }),

  // Get conversation history
  getHistory: (conversationId?: string) =>
    api.get<{
      status: number;
      messages: ChatMessage[];
      conversation_id: string;
    }>('/api/v1/sales/ai-agents/history', conversationId ? { conversation_id: conversationId } : undefined),

  // Get AI suggestions for a specific lead
  getLeadSuggestions: (leadId: string) =>
    api.get<{
      status: number;
      suggestions: Array<{
        type: string;
        title: string;
        description: string;
        priority: string;
      }>;
    }>(`/api/sales/ai-agents/leads/${leadId}/suggestions`),

  // Get lead insights from AI
  getLeadInsights: (leadId: string) =>
    api.get<{
      status: number;
      insights: AIInsight[];
      score: number;
      summary: string;
    }>(`/api/sales/ai-agents/leads/${leadId}/insights`),

  // Get next best actions across all leads
  getNextBestActions: (limit?: number) =>
    api.get<{
      status: number;
      actions: NextBestAction[];
    }>('/api/v1/sales/ai-agents/next-best-actions', limit ? { limit: String(limit) } : undefined),

  // Generate email draft
  generateEmail: (leadId: string, context: string, tone?: 'formal' | 'friendly' | 'urgent') =>
    api.post<{
      status: number;
      subject: string;
      body: string;
    }>('/api/v1/sales/ai-agents/generate/email', {
      lead_id: leadId,
      context,
      tone: tone || 'friendly',
    }),

  // Generate SMS draft
  generateSMS: (leadId: string, context: string) =>
    api.post<{
      status: number;
      message: string;
    }>('/api/v1/sales/ai-agents/generate/sms', {
      lead_id: leadId,
      context,
    }),

  // Generate call script
  generateCallScript: (leadId: string, objective: string) =>
    api.post<{
      status: number;
      script: string;
      talking_points: string[];
    }>('/api/v1/sales/ai-agents/generate/call-script', {
      lead_id: leadId,
      objective,
    }),
};

// ==================== VOICE API (Browser Calling) ====================

export interface VoiceTokenResponse {
  status: number;
  data: {
    token: string;
    identity: string;
    expiresIn: number;
  };
}

export interface VoiceStatusResponse {
  status: number;
  data: {
    configured: boolean;
    caller_id: string;
  };
}

export interface CallInitiateResponse {
  status: number;
  message: string;
  data: {
    log_id: string;
    phone_number: string;
    lead_id: string;
    caller_id: string;
  };
}

export interface RecordingResponse {
  status: number;
  data: {
    recording_url: string;
    duration: number | null;
    recording_sid: string | null;
  };
}

export const voiceApi = {
  // Get Twilio access token for browser calling
  getToken: () =>
    api.get<VoiceTokenResponse>('/api/v1/sales/voice/token'),

  // Check if voice is configured
  getStatus: () =>
    api.get<VoiceStatusResponse>('/api/v1/sales/voice/status'),

  // Initiate a call to a lead
  initiateCall: (leadId: string, phoneNumber: string) =>
    api.post<CallInitiateResponse>('/api/v1/sales/voice/call', {
      lead_id: leadId,
      phone_number: phoneNumber,
    }),

  // Get call recording
  getRecording: (logId: string) =>
    api.get<RecordingResponse>(`/api/sales/voice/recording/${logId}`),
};

// ==================== SMS CHAT API (Lead Conversations) ====================

export interface SmsMessage {
  id: string;
  direction: 'inbound' | 'outbound';
  content: string;
  status: string;
  created_at: string;
  is_read: boolean;
  media_urls: Array<{ url: string; content_type: string }>;
}

export interface SmsConversationResponse {
  status: number;
  data: {
    messages: SmsMessage[];
    lead: {
      id: string;
      name: string;
      phone: string;
    };
  };
}

export interface SendSmsResponse {
  status: number;
  message: string;
  data: {
    message: SmsMessage;
  };
}

export const smsApi = {
  // Get SMS conversation for a lead
  getConversation: (leadId: string, limit?: number) =>
    api.get<SmsConversationResponse>(
      `/api/v1/sales/leads/${leadId}/sms`,
      limit ? { limit: String(limit) } : undefined
    ),

  // Send SMS to a lead
  send: (leadId: string, message: string) =>
    api.post<SendSmsResponse>(`/api/v1/sales/leads/${leadId}/sms`, { message }),
};

// ==================== UNIFIED INBOX API ====================

export interface CommunicationLog {
  id: string;
  type: 'email' | 'sms' | 'call' | 'voice_call' | 'meeting' | 'note';
  direction: 'inbound' | 'outbound';
  from: string;
  to: string;
  subject: string | null;
  content: string;
  content_html?: string;
  status: string;
  is_read: boolean;
  created_at: string;
  // Email-specific fields
  email_from?: string;
  email_to?: string;
  email_cc?: string;
  email_bcc?: string;
  email_thread_id?: string;
  email_message_id?: string;
  opened_at?: string;
  clicked_at?: string;
  open_count?: number;
  click_count?: number;
  lead: {
    id: string;
    name: string;
    company: string;
  } | null;
  user: {
    id: string;
    name: string;
  } | null;
}

export interface InboxResponse {
  status: number;
  data: {
    communications: CommunicationLog[];
    unread_count: number;
    pagination: {
      total: number;
      limit: number;
      offset: number;
    };
  };
}

export interface UnreadCountResponse {
  status: number;
  data: {
    unread_count: number;
  };
}

export const inboxApi = {
  // Get unified inbox (CRM communications endpoint)
  getInbox: (params?: { type?: string; direction?: string; status?: string; unread_only?: boolean; limit?: number; offset?: number; search?: string }) =>
    api.get<InboxResponse>('/api/v1/crm/communications', {
      ...(params?.type && { type: params.type }),
      ...(params?.direction && { direction: params.direction }),
      ...(params?.status && { status: params.status }),
      ...(params?.unread_only !== undefined && { unread_only: String(params.unread_only) }),
      ...(params?.limit && { limit: String(params.limit) }),
      ...(params?.offset && { offset: String(params.offset) }),
      ...(params?.search && { search: params.search }),
    }),

  // Get inbox stats (unread counts, etc.)
  getUnreadCount: () =>
    api.get<UnreadCountResponse>('/api/v1/crm/communications/inbox-stats'),

  // Mark communication as read
  markAsRead: (id: string) =>
    api.patch<{ status: number; message: string }>(`/api/v1/crm/communications/${id}/read`),
};

// ==================== COMMUNICATIONS API (Logging) ====================

export const communicationsApi = {
  // Log an email sent to a lead
  logEmail: (leadId: string, data: { to: string; subject: string; body: string }) =>
    api.post<unknown>(
      '/api/v1/crm/communications',
      {
        lead_id: leadId,
        type: 'email',
        direction: 'outbound',
        subject: data.subject,
        content: data.body,
        email_to: data.to,
      }
    ),

  // Get communication history for a lead
  getHistory: (leadId: string, params?: { type?: string; limit?: number }) =>
    api.get<{
      status: number;
      data: {
        communications: CommunicationLog[];
        pagination: { total: number; limit: number; offset: number };
      };
    }>(
      `/api/v1/crm/communications/lead/${leadId}/thread`,
      params as Record<string, string>
    ),

  // Log a note on a lead
  logNote: (leadId: string, content: string) =>
    api.post<unknown>(
      '/api/v1/crm/communications',
      {
        lead_id: leadId,
        type: 'note',
        direction: 'outbound',
        content,
      }
    ),
};

// ============================================================================
// ELEVENLABS VOICE API
// ============================================================================

export interface ElevenLabsVoice {
  id: string;
  name: string;
  description?: string;
  use_case?: string;
  accent?: string;
  gender?: string;
  preview_url?: string;
  premium_info?: {
    key: string;
    name: string;
    description: string;
    use_case: string;
  };
}

export interface VoiceSynthesisOptions {
  text: string;
  voice_id?: string;
  voice_key?: string;
  model?: 'turbo_v2' | 'multilingual_v2' | 'monolingual_v1' | 'turbo_v2_5';
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface VoiceSynthesisResult {
  audio_url: string;
  filename?: string;
  size?: number;
}

export const elevenLabsApi = {
  // Get service status
  getStatus: () =>
    api.get<{
      status: number;
      data: {
        configured: boolean;
        subscription?: {
          character_count: number;
          character_limit: number;
          remaining: number;
        };
      };
    }>('/api/v1/sales/voice/elevenlabs/status'),

  // Get usage info
  getUsage: () =>
    api.get<{
      status: number;
      data: {
        subscription: {
          character_count: number;
          character_limit: number;
          remaining: number;
          usage_percentage: number;
        } | null;
        monthly_usage: unknown;
      };
    }>('/api/v1/sales/voice/elevenlabs/usage'),

  // Get available models
  getModels: () =>
    api.get<{
      status: number;
      data: {
        models: Array<{ model_id: string; name: string; description: string }>;
        recommended: Record<string, string>;
      };
    }>('/api/v1/sales/voice/elevenlabs/models'),

  // Get premium voices (curated for HealthShield)
  getVoices: (params?: { use_case?: string; gender?: string }) =>
    api.get<{
      status: number;
      data: {
        premium_voices: ElevenLabsVoice[];
        use_cases: string[];
      };
    }>('/api/v1/sales/voice/elevenlabs/voices', params as Record<string, string>),

  // Get all voices (including cloned)
  getAllVoices: (includeCloned = true) =>
    api.get<{
      status: number;
      data: {
        voices: ElevenLabsVoice[];
      };
    }>('/api/v1/sales/voice/elevenlabs/voices/all', { include_cloned: String(includeCloned) }),

  // Get single voice details
  getVoice: (voiceId: string) =>
    api.get<{
      status: number;
      data: ElevenLabsVoice;
    }>(`/api/sales/voice/elevenlabs/voices/${voiceId}`),

  // Get voice settings
  getVoiceSettings: (voiceId: string) =>
    api.get<{
      status: number;
      data: {
        stability: number;
        similarity_boost: number;
        style?: number;
        use_speaker_boost?: boolean;
      };
    }>(`/api/sales/voice/elevenlabs/voices/${voiceId}/settings`),

  // Update voice settings
  updateVoiceSettings: (
    voiceId: string,
    settings: {
      stability: number;
      similarity_boost: number;
      style?: number;
      use_speaker_boost?: boolean;
    }
  ) =>
    api.put<{ status: number; message: string }>(
      `/api/sales/voice/elevenlabs/voices/${voiceId}/settings`,
      settings
    ),

  // Generate voice preview
  generatePreview: (voiceId: string, text?: string) =>
    api.post<{
      status: number;
      data: { audio_url: string };
    }>('/api/v1/sales/voice/elevenlabs/preview', { voice_id: voiceId, text }),

  // Synthesize speech
  synthesize: (options: VoiceSynthesisOptions) =>
    api.post<{
      status: number;
      data: VoiceSynthesisResult;
    }>('/api/v1/sales/voice/elevenlabs/synthesize', options),

  // Generate sales-optimized voice
  generateSalesVoice: (text: string, voiceKey?: string) =>
    api.post<{
      status: number;
      data: { audio_url: string };
    }>('/api/v1/sales/voice/elevenlabs/sales', { text, voice_key: voiceKey }),

  // Generate fitness coaching voice
  generateFitnessVoice: (text: string, voiceKey?: string) =>
    api.post<{
      status: number;
      data: { audio_url: string };
    }>('/api/v1/sales/voice/elevenlabs/fitness', { text, voice_key: voiceKey }),
};

// ============================================================================
// AI CALLER API (ElevenLabs + Twilio)
// ============================================================================

export type ScriptTemplateKey =
  | 'introduction'
  | 'follow_up'
  | 'appointment_reminder'
  | 'workout_motivation'
  | 'win_back';

export interface ScriptTemplate {
  key: ScriptTemplateKey;
  name: string;
  description: string;
  voice_key: string;
  script_preview: string;
}

export interface GeneratedScript {
  success: boolean;
  script: string;
  voice_key: string;
  template_name: string;
}

export interface AiCallResult {
  success: boolean;
  log_id: string;
  audio_url: string;
  script: string;
  template: string;
  voice: string;
}

export interface AiCallStats {
  total_calls: number;
  completed: number;
  failed: number;
  success_rate: number;
  by_template: Record<string, number>;
}

export const aiCallerApi = {
  // Get service status
  getStatus: () =>
    api.get<{
      status: number;
      data: {
        configured: boolean;
        features: {
          ai_personalization: boolean;
          premium_voices: boolean;
          script_templates: boolean;
          voicemail_generation: boolean;
          real_time_responses: boolean;
        };
      };
    }>('/api/v1/sales/ai-caller/status'),

  // Get available script templates
  getScriptTemplates: () =>
    api.get<{
      status: number;
      data: { templates: ScriptTemplate[] };
    }>('/api/v1/sales/ai-caller/scripts'),

  // Generate a personalized script
  generateScript: (
    templateKey: ScriptTemplateKey,
    leadId?: string,
    variables?: Record<string, string>
  ) =>
    api.post<{
      status: number;
      data: GeneratedScript;
    }>('/api/v1/sales/ai-caller/scripts/generate', {
      template_key: templateKey,
      lead_id: leadId,
      variables,
    }),

  // Initiate an AI-powered call
  initiateCall: (
    leadId: string,
    templateKey: ScriptTemplateKey,
    variables?: Record<string, string>,
    phone?: string
  ) =>
    api.post<{
      status: number;
      message: string;
      data: AiCallResult;
    }>('/api/v1/sales/ai-caller/call', {
      lead_id: leadId,
      template_key: templateKey,
      variables,
      phone,
    }),

  // Generate a voicemail message
  generateVoicemail: (
    leadId: string,
    templateKey: ScriptTemplateKey,
    variables?: Record<string, string>
  ) =>
    api.post<{
      status: number;
      data: {
        success: boolean;
        audio_url: string;
        script: string;
        voice: string;
      };
    }>('/api/v1/sales/ai-caller/voicemail', {
      lead_id: leadId,
      template_key: templateKey,
      variables,
    }),

  // Generate a real-time AI response
  generateAiResponse: (
    leadResponse: string,
    context?: Record<string, unknown>,
    voiceKey?: string
  ) =>
    api.post<{
      status: number;
      data: {
        success: boolean;
        text: string;
        audio_url: string;
      };
    }>('/api/v1/sales/ai-caller/response', {
      lead_response: leadResponse,
      context,
      voice_key: voiceKey,
    }),

  // Get call statistics
  getCallStats: (params?: { user_id?: string; start_date?: string; end_date?: string }) =>
    api.get<{
      status: number;
      data: AiCallStats;
    }>('/api/v1/sales/ai-caller/stats', params as Record<string, string>),
};

// ============================================================================
// CONVERSATIONAL AI API (Real-Time Voice Calling)
// ============================================================================

export type ConversationalPersona = 'sales' | 'follow_up' | 'appointment' | 'coach' | 'win_back' | 'support' | 'insurance_sales' | 'insurance_claims' | 'insurance_service' | 'health_insurance' | 'auto_insurance' | 'dental_insurance' | 'life_insurance' | 'healthshield_assistant';
export type ConversationalLlm = 'gpt-4o' | 'gpt-4o-mini' | 'gpt-4-turbo' | 'claude-3-5-sonnet' | 'gemini-1.5-pro';

export interface ConversationalPersonaInfo {
  key: string;
  name: string;
  description: string;
  voice_id: string;
  style: string;
}

export interface ConversationalLlmOption {
  key: string;
  provider: string;
  model: string;
  description: string;
  recommended: boolean;
}

export interface ConversationalCallResult {
  success: boolean;
  conversation_id: string;
  call_sid?: string;
  agent_id?: string;
  status: string;
  phone: string;
  persona: string;
}

export interface ConversationalCallStatus {
  success: boolean;
  conversation_id: string;
  status: 'initiated' | 'ringing' | 'in_progress' | 'completed' | 'failed' | 'no_answer';
  duration_seconds?: number;
  started_at?: string;
  ended_at?: string;
}

export interface ConversationalTranscript {
  success: boolean;
  conversation_id: string;
  transcript: Array<{
    role: 'agent' | 'user';
    text: string;
    timestamp: string;
  }>;
  full_text: string;
}

export interface ConversationalAnalytics {
  success: boolean;
  conversation_id: string;
  duration_seconds: number;
  turns: number;
  agent_talk_time: number;
  user_talk_time: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  key_topics: string[];
  outcome: string;
}

export interface ConversationalStats {
  total_calls: number;
  completed: number;
  failed: number;
  no_answer: number;
  success_rate: number;
  avg_duration_seconds: number;
  positive_sentiment: number;
  by_persona: Record<string, number>;
  by_outcome: Record<string, number>;
}

export interface ConversationSummary {
  conversation_id: string;
  phone: string;
  persona: string;
  status: string;
  duration_seconds?: number;
  created_at: string;
  lead_name?: string;
}

export const conversationalAiApi = {
  // Get service configuration status
  getStatus: () =>
    api.get<{
      status: number;
      data: {
        configured: boolean;
        elevenlabs_configured: boolean;
        twilio_configured: boolean;
        agent_id: string | null;
        phone_number_id: string | null;
      };
    }>('/api/v1/sales/conversational-ai/status'),

  // Get available agent personas
  getPersonas: () =>
    api.get<{
      status: number;
      data: { personas: ConversationalPersonaInfo[] };
    }>('/api/v1/sales/conversational-ai/personas'),

  // Get available LLM options
  getLlmOptions: () =>
    api.get<{
      status: number;
      data: {
        options: ConversationalLlmOption[];
        default: string;
      };
    }>('/api/v1/sales/conversational-ai/llm-options'),

  // Initiate a real-time conversational AI call
  initiateCall: (params: {
    lead_id?: string;
    phone?: string;
    persona: ConversationalPersona;
    llm?: ConversationalLlm;
    voice_id?: string;
    voice_provider?: string;
    custom_prompt?: string;
    first_message?: string;
    context?: Record<string, unknown>;
    organization_id?: string;
  }) =>
    api.post<{
      status: number;
      message: string;
      data: ConversationalCallResult;
    }>('/api/v1/sales/conversational-ai/call', params),

  // Get call status
  getCallStatus: (conversationId: string) =>
    api.get<{
      status: number;
      data: ConversationalCallStatus;
    }>(`/api/v1/sales/conversational-ai/call/${conversationId}`),

  // Get call transcript
  getTranscript: (conversationId: string) =>
    api.get<{
      status: number;
      data: ConversationalTranscript;
    }>(`/api/v1/sales/conversational-ai/call/${conversationId}/transcript`),

  // Get call analytics
  getAnalytics: (conversationId: string) =>
    api.get<{
      status: number;
      data: ConversationalAnalytics;
    }>(`/api/v1/sales/conversational-ai/call/${conversationId}/analytics`),

  // Get call recording URL
  getRecording: (conversationId: string) =>
    api.get<{
      status: number;
      data: {
        success: boolean;
        recording_url: string;
        duration_seconds: number;
      };
    }>(`/api/sales/conversational-ai/call/${conversationId}/recording`),

  // List recent conversations
  listConversations: (params?: { limit?: number; offset?: number }) =>
    api.get<{
      status: number;
      data: {
        success: boolean;
        conversations: ConversationSummary[];
        total: number;
      };
    }>('/api/v1/sales/conversational-ai/conversations', params as Record<string, string>),

  // Create a custom AI agent
  createAgent: (params: {
    name: string;
    persona: ConversationalPersona;
    first_message: string;
    llm?: ConversationalLlm;
    custom_prompt?: string;
    voice_id?: string;
  }) =>
    api.post<{
      status: number;
      message: string;
      data: {
        success: boolean;
        agent_id: string;
        name: string;
      };
    }>('/api/v1/sales/conversational-ai/agent', params),

  // Get aggregated call statistics
  getStats: (params?: { user_id?: string; start_date?: string; end_date?: string }) =>
    api.get<{
      status: number;
      data: ConversationalStats;
    }>('/api/v1/sales/conversational-ai/stats', params as Record<string, string>),

  // Aliases used by the history page
  getConversations: (params?: { limit?: number; offset?: number; search?: string }) =>
    api.get<{
      status: number;
      data: {
        success: boolean;
        conversations: ConversationSummary[];
        total: number;
      };
    }>('/api/v1/sales/conversational-ai/conversations', params as Record<string, string>),

  getCallTranscript: (conversationId: string) =>
    api.get<{
      status: number;
      data: {
        success: boolean;
        transcript: Array<{ role: string; message: string; text?: string; timestamp?: number }>;
      };
    }>(`/api/v1/sales/conversational-ai/call/${conversationId}/transcript`),

  getCallRecording: (conversationId: string) =>
    api.get<{
      status: number;
      data: {
        success: boolean;
        recording_url: string;
        audio_url?: string;
        duration_seconds: number;
      };
    }>(`/api/sales/conversational-ai/call/${conversationId}/recording`),

  getCallAnalytics: (conversationId: string) =>
    api.get<{
      status: number;
      data: {
        success: boolean;
        duration_seconds?: number;
        turns?: number;
        sentiment?: string;
        outcome?: string;
        summary?: string;
      };
    }>(`/api/v1/sales/conversational-ai/call/${conversationId}/analytics`),
};

// ============================================================================
// CAMPAIGNS API
// ============================================================================

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  type: 'email' | 'push' | 'sms' | 'in_app';
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  target_audience: string | null;
  subject: string | null;
  content: string | null;
  template_id: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
  completed_at: string | null;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  unsubscribed_count: number;
  conversion_count: number;
  conversion_value: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignCreateData {
  name: string;
  type: 'email' | 'push' | 'sms' | 'in_app' | 'social' | 'multi_channel';
  description?: string;
  subject?: string;
  content: string;
  target_audience?: Record<string, unknown> | string;
  scheduled_at?: string;
  metadata?: Record<string, unknown>;
  template_id?: string;
}

export interface CampaignsResponse {
  status: number;
  data: {
    data: Campaign[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const campaignsApi = {
  // Get all campaigns with optional filtering
  getCampaigns: (params?: {
    page?: number;
    per_page?: number;
    status?: string;
    type?: string;
  }) =>
    api.get<CampaignsResponse>('/api/v1/crm/campaigns', params as Record<string, string>),

  // Get a single campaign by ID
  getCampaign: (id: string) =>
    api.get<{ status: number; data: Campaign }>(`/api/v1/crm/campaigns/${id}`),

  // Create a new campaign
  createCampaign: (data: CampaignCreateData) =>
    api.post<{ status: number; message: string; data: Campaign }>(
      '/api/v1/crm/campaigns',
      data
    ),

  // Update a campaign
  updateCampaign: (id: string, data: Partial<CampaignCreateData>) =>
    api.patch<{ status: number; message: string; data: Campaign }>(
      `/api/v1/crm/campaigns/${id}`,
      data
    ),

  // Delete a campaign
  deleteCampaign: (id: string) =>
    api.delete<{ status: number; message: string }>(`/api/v1/crm/campaigns/${id}`),

  // Send a campaign
  sendCampaign: (id: string) =>
    api.post<{ status: number; message: string; data: { recipients_count: number } }>(
      `/api/v1/crm/campaigns/${id}/send`,
      {}
    ),

  // Estimate audience size based on filters
  estimateAudience: (filters: { status?: string[]; source?: string[]; tags?: string[]; date_from?: string; date_to?: string }) =>
    api.post<{ count: number; sample: Array<{ id: number; contact_first_name: string; contact_last_name: string; contact_email: string; status: string; source: string }> }>(
      '/api/v1/crm/campaigns/estimate-audience',
      filters
    ),

  // List recipients for audience picker
  listRecipients: (params?: { search?: string; status?: string; source?: string; per_page?: number; page?: number }) =>
    api.get<{ data: Array<{ id: number; contact_first_name: string; contact_last_name: string; contact_email: string; contact_phone: string; status: string; source: string; company_name: string }>; total: number; current_page: number; last_page: number }>(
      '/api/v1/crm/campaigns/recipients',
      params as Record<string, string>
    ),

  // Import audience from CSV
  importAudienceCsv: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload<{ recipients: Array<{ email: string; name: string }>; count: number; invalid_count: number; invalid: string[] }>(
      '/api/v1/crm/campaigns/import-audience',
      formData
    );
  },

  // Get email templates
  getTemplates: () =>
    api.get<{ data: Array<{ id: string; name: string; subject: string; body: string; type: string; category: string; variables: string[] }> }>(
      '/api/v1/crm/communications/templates'
    ),
};

// ============================================================================
// COMPANIES API
// ============================================================================

export interface Company {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  size: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  description: string | null;
  logo_url: string | null;
  linkedin_url: string | null;
  annual_revenue: number | null;
  employee_count: number | null;
  status: 'active' | 'inactive' | 'prospect';
  tags: string[] | null;
  custom_fields: Record<string, unknown> | null;
  owner_id: string | null;
  contacts_count?: number;
  leads_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CompanyCreateData {
  name: string;
  domain?: string;
  industry?: string;
  size?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  description?: string;
  logo_url?: string;
  linkedin_url?: string;
  annual_revenue?: number;
  employee_count?: number;
  status?: 'active' | 'inactive' | 'prospect';
  tags?: string[];
  custom_fields?: Record<string, unknown>;
}

export interface CompanyFilters {
  search?: string;
  status?: string;
  industry?: string;
  size?: string;
  owner_id?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface CompanyStats {
  total: number;
  active: number;
  inactive: number;
  prospect: number;
  this_month: number;
  by_industry: Array<{ industry: string; count: number }>;
  by_size: Array<{ size: string; count: number }>;
  recent: Company[];
}

export interface CompaniesResponse {
  success: boolean;
  companies: Company[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const companiesApi = {
  // Get all companies with optional filtering
  getCompanies: (params?: CompanyFilters) =>
    api.get<CompaniesResponse>('/api/admin/crm/companies', params as Record<string, string>),

  // Get a single company by ID
  getCompany: (id: string) =>
    api.get<{ success: boolean; company: Company }>(`/api/admin/crm/companies/${id}`),

  // Create a new company
  createCompany: (data: CompanyCreateData) =>
    api.post<{ success: boolean; message: string; company: Company }>(
      '/api/admin/crm/companies',
      data
    ),

  // Update a company
  updateCompany: (id: string, data: Partial<CompanyCreateData>) =>
    api.patch<{ success: boolean; message: string; company: Company }>(
      `/api/admin/crm/companies/${id}`,
      data
    ),

  // Delete a company
  deleteCompany: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/api/admin/crm/companies/${id}`),

  // Get company statistics
  getStats: () =>
    api.get<{ success: boolean; stats: CompanyStats }>('/api/admin/crm/companies/stats'),
};

// ============================================================================
// CONTACTS API
// ============================================================================

export interface Contact {
  id: string;
  company_id: string | null;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  job_title: string | null;
  department: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  avatar_url: string | null;
  status: 'active' | 'inactive' | 'unsubscribed';
  lead_source: string | null;
  birthday: string | null;
  notes: string | null;
  tags: string[] | null;
  custom_fields: Record<string, unknown> | null;
  owner_id: string | null;
  last_contacted_at: string | null;
  company?: { id: string; name: string } | null;
  owner?: { id: string; name: string; email: string } | null;
  created_at: string;
  updated_at: string;
}

export interface ContactCreateData {
  company_id?: string;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  job_title?: string;
  department?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  linkedin_url?: string;
  twitter_url?: string;
  avatar_url?: string;
  status?: 'active' | 'inactive' | 'unsubscribed';
  lead_source?: string;
  birthday?: string;
  notes?: string;
  tags?: string[];
  custom_fields?: Record<string, unknown>;
}

export interface ContactFilters {
  search?: string;
  status?: string;
  company_id?: string;
  owner_id?: string;
  lead_source?: string;
  tag?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface ContactStats {
  total: number;
  active: number;
  inactive: number;
  unsubscribed: number;
  with_company: number;
  without_company: number;
  this_month: number;
  recently_contacted: number;
  never_contacted: number;
  by_lead_source: Array<{ lead_source: string; count: number }>;
  recent: Contact[];
}

export interface ContactsResponse {
  success: boolean;
  contacts: Contact[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const contactsApi = {
  // Get all contacts with optional filtering
  getContacts: (params?: ContactFilters) =>
    api.get<ContactsResponse>('/api/admin/crm/contacts', params as Record<string, string>),

  // Get a single contact by ID
  getContact: (id: string) =>
    api.get<{ success: boolean; contact: Contact }>(`/api/admin/crm/contacts/${id}`),

  // Create a new contact
  createContact: (data: ContactCreateData) =>
    api.post<{ success: boolean; message: string; contact: Contact }>(
      '/api/admin/crm/contacts',
      data
    ),

  // Update a contact
  updateContact: (id: string, data: Partial<ContactCreateData>) =>
    api.patch<{ success: boolean; message: string; contact: Contact }>(
      `/api/admin/crm/contacts/${id}`,
      data
    ),

  // Delete a contact
  deleteContact: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/api/admin/crm/contacts/${id}`),

  // Get contact statistics
  getStats: () =>
    api.get<{ success: boolean; stats: ContactStats }>('/api/admin/crm/contacts/stats'),

  // Get contacts by company
  getByCompany: (companyId: string) =>
    api.get<{ success: boolean; company: { id: string; name: string }; contacts: Contact[] }>(
      `/api/admin/crm/contacts/by-company/${companyId}`
    ),

  // Mark contact as contacted
  markContacted: (id: string) =>
    api.post<{ success: boolean; message: string; contact: Contact }>(
      `/api/admin/crm/contacts/${id}/mark-contacted`,
      {}
    ),
};

// ============================================================================
// SALES CALENDAR API
// ============================================================================

export interface SalesAppointment {
  id: string;
  sales_rep_id: string;
  lead_id?: string;
  lead?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    company?: string;
  };
  type: 'discovery_call' | 'demo' | 'follow_up' | 'proposal_review' | 'closing_call' | 'onboarding' | 'check_in' | 'ai_scheduled';
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  location?: string;
  meeting_link?: string;
  is_ai_scheduled?: boolean;
  ai_call_id?: string;
  notes?: string;
  outcome?: string;
  next_steps?: string;
  agent_name?: string;
  service_id?: number;
  service_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSalesAppointmentData {
  title: string;
  type: SalesAppointment['type'];
  date: string;
  start_time: string;
  end_time?: string;
  duration: number;
  lead_id?: string;
  description?: string;
  location?: string;
  meeting_link?: string;
  notes?: string;
  agent_name?: string;
  service_id?: number;
}

export interface UpdateSalesAppointmentData {
  title?: string;
  type?: SalesAppointment['type'];
  date?: string;
  start_time?: string;
  end_time?: string;
  duration?: number;
  lead_id?: string;
  status?: SalesAppointment['status'];
  description?: string;
  location?: string;
  meeting_link?: string;
  notes?: string;
  outcome?: string;
  next_steps?: string;
  agent_name?: string;
  service_id?: number;
}

export const salesCalendarApi = {
  // Get all appointments with optional filtering
  getAppointments: (params?: {
    start_date?: string;
    end_date?: string;
    status?: string;
    type?: string;
    lead_id?: string;
  }) =>
    api.get<{
      status: number;
      data: {
        appointments: SalesAppointment[];
        total: number;
      };
    }>('/api/v1/sales/calendar/appointments', params as Record<string, string>),

  // Get a single appointment by ID
  getAppointment: (id: string) =>
    api.get<{
      status: number;
      data: { appointment: SalesAppointment };
    }>(`/api/sales/calendar/appointments/${id}`),

  // Create a new appointment
  createAppointment: (data: CreateSalesAppointmentData) =>
    api.post<{
      status: number;
      message: string;
      data: { appointment: SalesAppointment };
    }>('/api/v1/sales/calendar/appointments', data),

  // Update an appointment
  updateAppointment: (id: string, data: UpdateSalesAppointmentData) =>
    api.patch<{
      status: number;
      message: string;
      data: { appointment: SalesAppointment };
    }>(`/api/sales/calendar/appointments/${id}`, data),

  // Delete an appointment
  deleteAppointment: (id: string) =>
    api.delete<{
      status: number;
      message: string;
    }>(`/api/sales/calendar/appointments/${id}`),

  // Mark appointment as completed
  markCompleted: (id: string, data?: { outcome?: string; next_steps?: string }) =>
    api.post<{
      status: number;
      message: string;
      data: { appointment: SalesAppointment };
    }>(`/api/sales/calendar/appointments/${id}/complete`, data || {}),

  // Mark appointment as cancelled
  markCancelled: (id: string, data?: { reason?: string }) =>
    api.post<{
      status: number;
      message: string;
      data: { appointment: SalesAppointment };
    }>(`/api/sales/calendar/appointments/${id}/cancel`, data || {}),

  // Mark appointment as no-show
  markNoShow: (id: string) =>
    api.post<{
      status: number;
      message: string;
      data: { appointment: SalesAppointment };
    }>(`/api/sales/calendar/appointments/${id}/no-show`, {}),

  // Get today's schedule
  getTodaySchedule: () =>
    api.get<{
      status: number;
      data: {
        appointments: SalesAppointment[];
        total: number;
      };
    }>('/api/v1/sales/calendar/today'),

  // Get this week's schedule
  getWeekSchedule: () =>
    api.get<{
      status: number;
      data: {
        appointments: SalesAppointment[];
        total: number;
      };
    }>('/api/v1/sales/calendar/week'),

  // Get availability for booking (for AI caller integration)
  getAvailableSlots: (params: { date: string; duration?: number }) =>
    api.get<{
      status: number;
      data: {
        slots: Array<{
          start_time: string;
          end_time: string;
          is_available: boolean;
        }>;
      };
    }>('/api/v1/sales/calendar/available-slots', { date: params.date, ...(params.duration ? { duration: String(params.duration) } : {}) }),

  // Book appointment from AI caller
  bookFromAiCall: (data: {
    lead_id: string;
    ai_call_id: string;
    date: string;
    start_time: string;
    duration: number;
    type?: SalesAppointment['type'];
    notes?: string;
  }) =>
    api.post<{
      status: number;
      message: string;
      data: { appointment: SalesAppointment };
    }>('/api/v1/sales/calendar/book-from-ai', data),
};

// ==================== FINANCE API ====================

export const financeApi = {
  // Metrics/Dashboard
  getMetrics: () => api.get<any>('/api/v1/crm/finance/metrics'),
  getOverview: () => api.get<any>('/api/v1/crm/finance/reports/overview'),

  // Invoices CRUD
  getInvoices: (params?: Record<string, string>) => api.get<any>('/api/v1/crm/finance/invoices', params),
  createInvoice: (data: Record<string, any>) => api.post<any>('/api/v1/crm/finance/invoices', data),
  getInvoice: (id: string) => api.get<any>(`/api/v1/crm/finance/invoices/${id}`),
  updateInvoice: (id: string, data: Record<string, any>) => api.put<any>(`/api/v1/crm/finance/invoices/${id}`, data),
  deleteInvoice: (id: string) => api.delete<any>(`/api/v1/crm/finance/invoices/${id}`),
  sendInvoice: (id: string) => api.post<any>(`/api/v1/crm/finance/invoices/${id}/send`),
  markInvoicePaid: (id: string) => api.post<any>(`/api/v1/crm/finance/invoices/${id}/mark-paid`),

  // Expenses CRUD
  getExpenses: (params?: Record<string, string>) => api.get<any>('/api/v1/crm/finance/expenses', params),
  createExpense: (data: Record<string, any>) => api.post<any>('/api/v1/crm/finance/expenses', data),
  getExpense: (id: string) => api.get<any>(`/api/v1/crm/finance/expenses/${id}`),
  updateExpense: (id: string, data: Record<string, any>) => api.put<any>(`/api/v1/crm/finance/expenses/${id}`, data),
  deleteExpense: (id: string) => api.delete<any>(`/api/v1/crm/finance/expenses/${id}`),
  approveExpense: (id: string) => api.post<any>(`/api/v1/crm/finance/expenses/${id}/approve`),

  // Payments CRUD
  getPayments: (params?: Record<string, string>) => api.get<any>('/api/v1/crm/finance/payments', params),
  createPayment: (data: Record<string, any>) => api.post<any>('/api/v1/crm/finance/payments', data),
  getPaymentStats: () => api.get<any>('/api/v1/crm/finance/payments/stats'),
  refundPayment: (id: string) => api.post<any>(`/api/v1/crm/finance/payments/${id}/refund`),

  // Payroll CRUD
  getPayroll: (params?: Record<string, string>) => api.get<any>('/api/v1/crm/finance/payroll', params),
  createPayroll: (data: Record<string, any>) => api.post<any>('/api/v1/crm/finance/payroll', data),
  getPayrollEntry: (id: string) => api.get<any>(`/api/v1/crm/finance/payroll/${id}`),
  updatePayroll: (id: string, data: Record<string, any>) => api.put<any>(`/api/v1/crm/finance/payroll/${id}`, data),
  deletePayroll: (id: string) => api.delete<any>(`/api/v1/crm/finance/payroll/${id}`),
  processPayroll: (id: string) => api.post<any>(`/api/v1/crm/finance/payroll/${id}/process`),
  runPayroll: () => api.post<any>('/api/v1/crm/finance/payroll/run'),
  getPayrollStats: () => api.get<any>('/api/v1/crm/finance/payroll/stats'),

  // Reports
  getIncomeStatement: () => api.get<any>('/api/v1/crm/finance/reports/income-statement'),
  getExpenseBreakdown: () => api.get<any>('/api/v1/crm/finance/reports/expense-breakdown'),
  getCashFlow: () => api.get<any>('/api/v1/crm/finance/reports/cash-flow'),
  exportReport: (params?: Record<string, string>) => api.get<any>('/api/v1/crm/finance/reports/export', params),
};

// HealthShield Insurance API
export const insuranceApi = {
  // Programs
  getPrograms: () => api.get<any>('/api/v1/insurance/healthshield/programs'),
  getProgram: (id: string) => api.get<any>(`/api/insurance/healthshield/programs/${id}`),
  createProgram: (data: Record<string, any>) => api.post<any>('/api/v1/insurance/healthshield/programs', data),
  updateProgram: (id: string, data: Record<string, any>) => api.put<any>(`/api/insurance/healthshield/programs/${id}`, data),
  deleteProgram: (id: string) => api.delete<any>(`/api/insurance/healthshield/programs/${id}`),

  // Enrollments
  getEnrollments: (programId: string) => api.get<any>(`/api/insurance/healthshield/programs/${programId}/enrollment`),
  enroll: (programId: string, data: Record<string, any>) => api.post<any>(`/api/insurance/healthshield/programs/${programId}/enroll`, data),

  // Savings & Wellness
  getSavingsCalculator: (params?: Record<string, string>) => api.get<any>('/api/v1/insurance/healthshield/savings-calculator', params),
  getWellnessMetrics: () => api.get<any>('/api/v1/insurance/healthshield/wellness-metrics'),
  getStats: () => api.get<any>('/api/v1/insurance/healthshield/stats'),

  // Proposals
  getProposals: () => api.get<any>('/api/v1/insurance/healthshield/proposals'),
  createProposal: (data: Record<string, any>) => api.post<any>('/api/v1/insurance/healthshield/proposals', data),

  // Policies
  getPolicies: (params?: Record<string, string>) => api.get<any>('/api/v1/insurance/policies', params),
  getPolicy: (id: string) => api.get<any>(`/api/insurance/policies/${id}`),
  getPolicyStats: () => api.get<any>('/api/v1/insurance/policies/stats'),

  // Quotes
  getQuotes: (params?: Record<string, string>) => api.get<any>('/api/v1/insurance/quotes', params),
  createQuote: (data: Record<string, any>) => api.post<any>('/api/v1/insurance/quotes', data),
  estimatePremium: (data: Record<string, any>) => api.post<any>('/api/v1/insurance/quotes/estimate', data),

  // Claims
  getClaims: (params?: Record<string, string>) => api.get<any>('/api/v1/insurance/claims', params),
  fileClaim: (data: Record<string, any>) => api.post<any>('/api/v1/insurance/claims', data),
  getClaimStats: () => api.get<any>('/api/v1/insurance/claims/stats'),

  // Public (no auth required)
  requestQuote: (data: Record<string, any>) => api.post<any>('/api/v1/insurance/public/quote-request', data),
  verifyPolicy: (data: Record<string, any>) => api.post<any>('/api/v1/insurance/public/verify-policy', data),
  checkClaimStatus: (data: Record<string, any>) => api.post<any>('/api/v1/insurance/public/claim-status', data),
};
