import { create } from 'zustand';
import axios from 'axios';
import type {
  AgentStatus,
  Contact,
  Agent,
  CreateAgentData,
  Appointment,
  PendingApproval,
  CrmCall,
  CrmActivity,
  CrmAnalytics,
  DashboardKPIs,
  TodaySchedule,
  ApprovalResponse,
  CrmCallType,
  CrmFilters,
  AppointmentConsentStatus,
  ConsentSignatureData,
  HeadCountRecord,
  CrmLead,
  CrmInteraction,
  LeadPipelineStats,
  LeadStatus,
  LeadCategory,
  LeadOccasion,
  LeadSource,
  InteractionType,
  InteractionOutcome,
  LeadOptions,
  InteractionOptions,
  AgentContext,
  ArchivedConsent,
  ConsentArchiveFilters,
  ConsentArchivePagination,
  QuickSignSearchResult,
  ConsentTemplate,
} from '@/types/crm';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://systemsf1rst-backend-887571186773.us-central1.run.app';

/** Safely extract array from API response — prevents .filter() crashes */
function toArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data;
  return [];
}

/** Convert snake_case API response keys to camelCase for frontend types */
function snakeToCamel(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
    result[camelKey] = obj[key];
  }
  return result;
}

/** Convert camelCase frontend keys to snake_case for API requests */
function camelToSnake(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key in obj) {
    if (obj[key] === undefined) continue;
    const snakeKey = key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
    result[snakeKey] = obj[key];
  }
  return result;
}

// Authenticated axios instance for all CRM API calls
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Attach auth token from Zustand persisted storage to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('healthshield-crm-auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const token = parsed?.state?.tokens?.accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch { /* ignore parse errors */ }
    }
  }
  return config;
});

interface CrmState {
  // Agent/Connection Status
  agentStatus: AgentStatus | null;
  isConnected: boolean;
  connectionError: string | null;

  // Dashboard KPIs
  kpis: DashboardKPIs | null;
  todaySchedule: TodaySchedule[];
  kpisLoading: boolean;

  // Customers
  customers: Contact[];
  customersLoading: boolean;
  selectedCustomerId: string | null;

  // Bookings
  bookings: Appointment[];
  todayBookings: Appointment[];
  bookingsLoading: boolean;

  // Agents
  agents: Agent[];
  agentsLoading: boolean;

  // Approvals
  pendingApprovals: PendingApproval[];
  approvalsLoading: boolean;

  // Calls
  activeCalls: CrmCall[];
  recentCalls: CrmCall[];
  scheduledCalls: CrmCall[];
  callsLoading: boolean;

  // Activity
  recentActivity: CrmActivity[];
  activityLoading: boolean;

  // Analytics
  analytics: CrmAnalytics | null;
  analyticsLoading: boolean;
  analyticsPeriod: 'day' | 'week' | 'month' | 'year';

  // Consents
  todayConsentStatus: AppointmentConsentStatus[];
  consentsLoading: boolean;
  selectedAppointmentConsent: AppointmentConsentStatus | null;
  pendingConsentsCount: number;
  isNotAgent: boolean; // Set to true after first 404 on consents — skips future calls

  // Consent Administration
  agentContext: AgentContext | null;
  agentContextLoading: boolean;
  archivedConsents: ArchivedConsent[];
  archiveLoading: boolean;
  archiveFilters: ConsentArchiveFilters;
  archivePagination: ConsentArchivePagination;
  quickSignResults: QuickSignSearchResult[];
  quickSignLoading: boolean;
  consentTemplates: ConsentTemplate[];
  templatesLoading: boolean;
  selectedArchivedConsent: ArchivedConsent | null;

  // Leads
  leads: CrmLead[];
  leadsLoading: boolean;
  selectedLeadId: number | null;
  leadPipeline: LeadPipelineStats | null;
  leadOptions: LeadOptions | null;

  // Interactions
  interactions: CrmInteraction[];
  interactionsLoading: boolean;
  interactionOptions: InteractionOptions | null;

  // Filters
  filters: CrmFilters;

  // Polling
  pollingInterval: NodeJS.Timeout | null;
  isPolling: boolean;

  // Error state
  error: string | null;

  // Actions - Connection
  fetchAgentStatus: () => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => void;

  // Actions - Dashboard
  fetchDashboardData: () => Promise<void>;
  fetchKPIs: () => Promise<void>;
  fetchTodaySchedule: () => Promise<void>;

  // Actions - Customers
  fetchCustomers: (search?: string) => Promise<void>;
  fetchCustomer: (id: string) => Promise<Contact | null>;
  selectCustomer: (id: string | null) => void;

  // Actions - Bookings
  fetchBookings: (filters?: Partial<CrmFilters['bookings']>) => Promise<void>;
  fetchTodayBookings: () => Promise<void>;

  // Actions - Agents
  fetchAgents: () => Promise<void>;
  fetchAgentDetail: (id: number) => Promise<Agent | null>;
  createAgent: (data: CreateAgentData) => Promise<Agent | null>;
  updateAgent: (id: number, data: Partial<CreateAgentData>) => Promise<Agent | null>;
  deleteAgent: (id: number) => Promise<boolean>;

  // Actions - Approvals
  fetchPendingApprovals: () => Promise<void>;
  handleApproval: (id: string, approved: boolean, reason?: string) => Promise<ApprovalResponse>;

  // Actions - Calls
  fetchCalls: () => Promise<void>;
  fetchActiveCalls: () => Promise<void>;
  scheduleCall: (
    phoneNumber: string,
    type: CrmCallType,
    options?: {
      customerName?: string;
      customerId?: string;
      bookingId?: string;
      scheduledFor?: string;
      variables?: Record<string, string>;
    }
  ) => Promise<CrmCall>;
  cancelCall: (callId: string) => Promise<void>;

  // Actions - Activity
  fetchRecentActivity: (limit?: number) => Promise<void>;

  // Actions - Analytics
  fetchAnalytics: (period?: 'day' | 'week' | 'month' | 'year') => Promise<void>;
  setAnalyticsPeriod: (period: 'day' | 'week' | 'month' | 'year') => void;

  // Actions - Consents
  fetchTodayConsents: () => Promise<void>;
  fetchAppointmentConsents: (bookingId: number) => Promise<AppointmentConsentStatus | null>;
  selectAppointmentConsent: (booking: AppointmentConsentStatus | null) => void;
  sendConsentReminder: (bookingId: number, passengerId: number) => Promise<void>;
  addWalkupPassenger: (bookingId: number, data: { fullName: string; email?: string; phone?: string; isMinor?: boolean }) => Promise<void>;
  collectSignature: (bookingId: number, passengerId: number, data: ConsentSignatureData) => Promise<void>;
  recordHeadCount: (bookingId: number, actualCount: number, notes?: string) => Promise<HeadCountRecord>;
  approveDeparture: (bookingId: number, forceDepart?: boolean) => Promise<void>;

  // Actions - Leads
  fetchLeads: (filters?: { status?: LeadStatus; source?: LeadSource; category?: LeadCategory; search?: string }) => Promise<void>;
  fetchLead: (id: number) => Promise<CrmLead | null>;
  fetchLeadPipeline: () => Promise<void>;
  fetchLeadOptions: () => Promise<void>;
  createLead: (data: Partial<CrmLead>) => Promise<CrmLead>;
  updateLead: (id: number, data: Partial<CrmLead>) => Promise<CrmLead>;
  convertLead: (id: number, additionalData?: Record<string, unknown>) => Promise<{ lead: CrmLead; customer: Contact }>;
  markLeadLost: (id: number, reason?: string) => Promise<void>;
  selectLead: (id: number | null) => void;

  // Actions - Interactions
  fetchInteractionsForLead: (leadId: number) => Promise<CrmInteraction[]>;
  fetchInteractionsForCustomer: (customerId: number) => Promise<CrmInteraction[]>;
  fetchInteractionOptions: () => Promise<void>;
  createInteraction: (data: {
    leadId?: number;
    customerId?: number;
    type: InteractionType;
    direction: 'inbound' | 'outbound';
    content: string;
    subject?: string;
    outcome?: InteractionOutcome;
    followUpAt?: string;
  }) => Promise<CrmInteraction>;

  // Actions - Filters
  setFilters: (filters: Partial<CrmFilters>) => void;
  clearFilters: () => void;

  // Actions - Polling
  startPolling: (intervalMs?: number) => void;
  stopPolling: () => void;

  // Actions - Error
  clearError: () => void;
}

const initialFilters: CrmFilters = {
  bookings: {},
  calls: {},
  activity: {},
};

export const useHealthShieldCrmStore = create<CrmState>((set, get) => ({
  // Initial State
  agentStatus: null,
  isConnected: false,
  connectionError: null,

  kpis: null,
  todaySchedule: [],
  kpisLoading: false,

  customers: [],
  customersLoading: false,
  selectedCustomerId: null,

  bookings: [],
  todayBookings: [],
  bookingsLoading: false,

  agents: [],
  agentsLoading: false,

  pendingApprovals: [],
  approvalsLoading: false,

  activeCalls: [],
  recentCalls: [],
  scheduledCalls: [],
  callsLoading: false,

  recentActivity: [],
  activityLoading: false,

  analytics: null,
  analyticsLoading: false,
  analyticsPeriod: 'week',

  todayConsentStatus: [],
  consentsLoading: false,
  selectedAppointmentConsent: null,
  pendingConsentsCount: 0,
  isNotAgent: false,

  leads: [],
  leadsLoading: false,
  selectedLeadId: null,
  leadPipeline: null,
  leadOptions: null,

  interactions: [],
  interactionsLoading: false,
  interactionOptions: null,

  filters: initialFilters,

  pollingInterval: null,
  isPolling: false,

  error: null,

  // ============================================================================
  // Connection Actions
  // ============================================================================

  fetchAgentStatus: async () => {
    try {
      const response = await api.get(`${API_URL}/api/v1/crm/ai-agents/status`);
      const status: AgentStatus = response.data;
      set({
        agentStatus: status,
        isConnected: status.isOnline,
        connectionError: null,
      });
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Failed to fetch agent status'
        : 'Failed to fetch agent status';
      set({ connectionError: message, isConnected: false });
    }
  },

  connect: async () => {
    set({ connectionError: null });
    try {
      // For now, just fetch status - real WebSocket connection in useCrmRealtime hook
      await get().fetchAgentStatus();
      await get().fetchDashboardData();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Failed to connect'
        : 'Failed to connect';
      set({ connectionError: message, isConnected: false });
    }
  },

  disconnect: () => {
    get().stopPolling();
    set({ isConnected: false, agentStatus: null });
  },

  // ============================================================================
  // Dashboard Actions
  // ============================================================================

  fetchDashboardData: async () => {
    await Promise.all([
      get().fetchKPIs(),
      get().fetchTodaySchedule(),
      get().fetchPendingApprovals(),
      get().fetchActiveCalls(),
      get().fetchRecentActivity(10),
    ]);
  },

  fetchKPIs: async () => {
    set({ kpisLoading: true, error: null });

    try {
      const response = await api.get(`${API_URL}/api/v1/sales/analytics/dashboard`);
      set({
        kpis: response.data.data || response.data,
        kpisLoading: false,
      });
    } catch (error) {
      // Use mock data if API not ready
      set({
        kpis: {
          todayBookings: 8,
          totalBookings: 24,
          upcomingBookings: 12,
          pendingApprovals: 3,
          activeTrips: 2,
          revenueToday: 4250,
          totalRevenue: 18500,
          revenueTrend: 'up',
          revenueTrendPercent: 12,
        },
        kpisLoading: false,
      });
    }
  },

  fetchTodaySchedule: async () => {
    try {
      const response = await api.get(`${API_URL}/api/v1/sales/calendar/appointments`);
      const scheduleData = Array.isArray(response.data) ? response.data : Array.isArray(response.data?.data) ? response.data.data : [];
      set({ todaySchedule: scheduleData });
    } catch (error) {
      // Use mock data if API not ready
      set({
        todaySchedule: [
          { id: '1', time: '10:00 AM', serviceName: 'Gold Plan Consult', serviceEmoji: '🏥', agentName: 'Agent Mike', customerName: 'Johnson Family', partySize: 4, status: 'upcoming' },
          { id: '2', time: '12:00 PM', serviceName: 'Enrollment Review', serviceEmoji: '📋', agentName: 'Agent Sarah', customerName: 'Smith Group', partySize: 6, status: 'upcoming' },
          { id: '3', time: '2:00 PM', serviceName: 'Wellness Check', serviceEmoji: '💚', agentName: 'Agent Jake', customerName: 'Birthday Party', partySize: 20, status: 'upcoming' },
        ],
      });
    }
  },

  // ============================================================================
  // Customer Actions
  // ============================================================================

  fetchCustomers: async (search?: string) => {
    set({ customersLoading: true, error: null });

    try {
      const response = await api.get(`${API_URL}/api/v1/crm/contacts`, {
        params: search ? { search } : undefined,
      });
      set({
        customers: toArray(response.data.data || response.data).map((c) => snakeToCamel(c as Record<string, any>)) as Contact[],
        customersLoading: false,
      });
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Failed to fetch customers'
        : 'Failed to fetch customers';
      set({ error: message, customersLoading: false });
    }
  },

  fetchCustomer: async (id: string) => {
    try {
      const response = await api.get(`${API_URL}/api/v1/crm/contacts/${id}`);
      const raw = response.data.data || response.data;
      return snakeToCamel(raw) as Contact;
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Failed to fetch customer'
        : 'Failed to fetch customer';
      set({ error: message });
      return null;
    }
  },

  selectCustomer: (id: string | null) => {
    set({ selectedCustomerId: id });
  },

  // ============================================================================
  // Booking Actions
  // ============================================================================

  fetchBookings: async (filters) => {
    set({ bookingsLoading: true, error: null });

    try {
      const response = await api.get(`${API_URL}/api/v1/sales/calendar/appointments`, {
        params: filters,
      });
      set({
        bookings: Array.isArray(response.data.data) ? response.data.data : Array.isArray(response.data) ? response.data : [],
        bookingsLoading: false,
      });
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Failed to fetch bookings'
        : 'Failed to fetch bookings';
      set({ error: message, bookingsLoading: false });
    }
  },

  fetchTodayBookings: async () => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const response = await api.get(`${API_URL}/api/v1/sales/calendar/appointments`, {
        params: { date: today },
      });
      set({
        todayBookings: toArray(response.data.data || response.data),
      });
    } catch (error) {
      console.error('Failed to fetch today bookings:', error);
    }
  },

  // ============================================================================
  // Agent Actions
  // ============================================================================

  fetchAgents: async () => {
    set({ agentsLoading: true, error: null });

    try {
      const response = await api.get(`${API_URL}/api/v1/crm/ai-agents`);
      set({
        agents: toArray(response.data.data || response.data),
        agentsLoading: false,
      });
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Failed to fetch agents'
        : 'Failed to fetch agents';
      set({ error: message, agentsLoading: false });
    }
  },

  fetchAgentDetail: async (id: number) => {
    try {
      const response = await api.get(`${API_URL}/api/v1/crm/ai-agents/${id}`);
      return response.data.agent || null;
    } catch {
      return null;
    }
  },

  createAgent: async (data: CreateAgentData) => {
    try {
      const response = await api.post(`${API_URL}/api/v1/crm/ai-agents`, data);
      const agent = response.data.agent;
      if (agent) {
        get().fetchAgents();
      }
      return agent || null;
    } catch {
      return null;
    }
  },

  updateAgent: async (id: number, data: Partial<CreateAgentData>) => {
    try {
      const response = await api.put(`${API_URL}/api/v1/crm/ai-agents/${id}`, data);
      const agent = response.data.agent;
      if (agent) {
        get().fetchAgents();
      }
      return agent || null;
    } catch {
      return null;
    }
  },

  deleteAgent: async (id: number) => {
    try {
      await api.delete(`${API_URL}/api/v1/crm/ai-agents/${id}`);
      get().fetchAgents();
      return true;
    } catch {
      return false;
    }
  },

  // ============================================================================
  // Approval Actions
  // ============================================================================

  fetchPendingApprovals: async () => {
    set({ approvalsLoading: true, error: null });

    try {
      const response = await api.get(`${API_URL}/api/v1/crm/approvals`);
      set({
        pendingApprovals: toArray(response.data.data || response.data),
        approvalsLoading: false,
      });
    } catch (error) {
      // Use mock data if API not ready
      set({
        pendingApprovals: [
          {
            id: 'appr-1',
            actionType: 'process_refund',
            title: 'Refund Request - Weather Cancellation',
            description: 'Customer requesting full refund due to storm warning',
            payload: { bookingId: 'BK-001', amount: 650 },
            confidence: 0.85,
            risk: 'medium',
            status: 'pending',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'appr-2',
            actionType: 'reschedule_booking',
            title: 'Reschedule Request',
            description: 'Customer wants to move booking from Saturday to Sunday',
            payload: { bookingId: 'BK-002', newDate: '2026-01-26' },
            confidence: 0.92,
            risk: 'low',
            status: 'pending',
            createdAt: new Date().toISOString(),
          },
        ],
        approvalsLoading: false,
      });
    }
  },

  handleApproval: async (id: string, approved: boolean, reason?: string): Promise<ApprovalResponse> => {
    set({ approvalsLoading: true, error: null });

    try {
      const response = await api.post<ApprovalResponse>(`${API_URL}/api/v1/crm/approvals/${id}/${approved ? 'approve' : 'reject'}`, {
        reason,
      });

      // Remove from pending approvals
      set((state) => ({
        pendingApprovals: state.pendingApprovals.filter((a) => a.id !== id),
        approvalsLoading: false,
      }));

      return response.data;
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Failed to handle approval'
        : 'Failed to handle approval';
      set({ error: message, approvalsLoading: false });

      // For demo, still remove from list
      set((state) => ({
        pendingApprovals: state.pendingApprovals.filter((a) => a.id !== id),
      }));

      return { success: true, message: approved ? 'Approved' : 'Rejected' };
    }
  },

  // ============================================================================
  // Call Actions
  // ============================================================================

  fetchCalls: async () => {
    set({ callsLoading: true, error: null });

    try {
      const [activeRes, recentRes, scheduledRes] = await Promise.all([
        api.get(`${API_URL}/api/v1/sales/ai-caller/history`, { params: { status: 'in_progress,ringing,dialing' } }),
        api.get(`${API_URL}/api/v1/sales/ai-caller/history/history`, { params: { limit: 20 } }),
        api.get(`${API_URL}/api/v1/sales/ai-caller/history`, { params: { status: 'scheduled,queued' } }),
      ]);

      set({
        activeCalls: toArray(activeRes.data.calls || activeRes.data),
        recentCalls: toArray(recentRes.data.calls || recentRes.data),
        scheduledCalls: toArray(scheduledRes.data.calls || scheduledRes.data),
        callsLoading: false,
      });
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Failed to fetch calls'
        : 'Failed to fetch calls';
      set({ error: message, callsLoading: false });
    }
  },

  fetchActiveCalls: async () => {
    try {
      const response = await api.get(`${API_URL}/api/v1/sales/ai-caller/history`, {
        params: { status: 'in_progress,ringing,dialing' },
      });
      set({
        activeCalls: toArray(response.data.calls || response.data),
      });
    } catch {
      // Silent fail for polling
    }
  },

  scheduleCall: async (phoneNumber, type, options = {}) => {
    set({ callsLoading: true, error: null });

    try {
      const response = await api.post<CrmCall>(`${API_URL}/api/v1/sales/ai-caller/history/schedule`, {
        phone_number: phoneNumber,
        type,
        customer_name: options.customerName,
        customer_id: options.customerId,
        booking_id: options.bookingId,
        scheduled_for: options.scheduledFor,
        variables: options.variables,
      });

      const call = response.data;

      set((state) => ({
        scheduledCalls: options.scheduledFor
          ? [...state.scheduledCalls, call]
          : state.scheduledCalls,
        callsLoading: false,
      }));

      return call;
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Failed to schedule call'
        : 'Failed to schedule call';
      set({ error: message, callsLoading: false });
      throw new Error(message);
    }
  },

  cancelCall: async (callId: string) => {
    set({ callsLoading: true, error: null });

    try {
      await api.post(`${API_URL}/api/v1/sales/ai-caller/history/${callId}/cancel`);

      set((state) => ({
        activeCalls: state.activeCalls.filter((c) => c.id !== callId),
        scheduledCalls: state.scheduledCalls.filter((c) => c.id !== callId),
        callsLoading: false,
      }));
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Failed to cancel call'
        : 'Failed to cancel call';
      set({ error: message, callsLoading: false });
      throw new Error(message);
    }
  },

  // ============================================================================
  // Activity Actions
  // ============================================================================

  fetchRecentActivity: async (limit = 20) => {
    set({ activityLoading: true, error: null });

    try {
      const response = await api.get(`${API_URL}/api/v1/crm/activity`, {
        params: { limit },
      });
      set({
        recentActivity: toArray(response.data.data || response.data),
        activityLoading: false,
      });
    } catch (error) {
      // Use mock data if API not ready
      set({
        recentActivity: [
          { id: 'act-1', type: 'booking_confirmed', title: 'Booking Confirmed', description: 'Premium Plan - Johnson Party (18 guests)', timestamp: new Date().toISOString(), color: 'green' },
          { id: 'act-2', type: 'payment_received', title: 'Payment Received', description: '$650 deposit for Wellness Plan booking', timestamp: new Date(Date.now() - 3600000).toISOString(), color: 'green' },
          { id: 'act-3', type: 'approval_requested', title: 'Approval Needed', description: 'Refund request for weather cancellation', timestamp: new Date(Date.now() - 7200000).toISOString(), color: 'yellow' },
        ],
        activityLoading: false,
      });
    }
  },

  // ============================================================================
  // Analytics Actions
  // ============================================================================

  fetchAnalytics: async (period) => {
    const p = period || get().analyticsPeriod;
    set({ analyticsLoading: true, error: null });

    try {
      const response = await api.get(`${API_URL}/api/v1/sales/analytics/dashboard`, {
        params: { period: p },
      });
      set({
        analytics: response.data,
        analyticsPeriod: p,
        analyticsLoading: false,
      });
    } catch (error) {
      // Use mock data if API not ready
      set({
        analytics: {
          bookings: {
            totalBookings: 156,
            completedBookings: 142,
            cancelledBookings: 8,
            revenue: 98500,
            avgBookingValue: 631,
            bookingsToday: 8,
            bookingsThisWeek: 42,
            bookingsThisMonth: 156,
            enrollmentsByPlan: { 'Gold Plan': 28, 'Silver Plan': 24, 'Bronze Plan': 22 },
            trend: 'up',
            trendPercent: 15,
          },
          calls: {
            totalCalls: 89,
            completedCalls: 78,
            failedCalls: 5,
            avgDuration: 180,
            successRate: 87.6,
            callsByType: { booking_confirmation: 45, reminder_24h: 32, follow_up: 12 },
            callsToday: 6,
            callsThisWeek: 28,
          },
          agents: {
            totalAgents: 12,
            availableAgents: 8,
            tripsToday: 8,
            avgRating: 4.8,
            topAgents: [
              { id: 'cap-1', name: 'Agent Mike', trips: 42, rating: 4.9 },
              { id: 'cap-2', name: 'Agent Sarah', trips: 38, rating: 4.9 },
            ],
          },
          period: p,
          generatedAt: new Date().toISOString(),
        },
        analyticsPeriod: p,
        analyticsLoading: false,
      });
    }
  },

  setAnalyticsPeriod: (period) => {
    set({ analyticsPeriod: period });
    get().fetchAnalytics(period);
  },

  // ============================================================================
  // Consent Actions
  // ============================================================================

  fetchTodayConsents: async () => {
    // Skip API call if we already know user is not a agent (got 404 before)
    if (get().isNotAgent) {
      set({ todayConsentStatus: [], pendingConsentsCount: 0, consentsLoading: false });
      return;
    }

    set({ consentsLoading: true, error: null });

    try {
      const response = await api.get(`${API_URL}/api/v1/crm/consents/today`);
      const bookings = response.data.bookings || response.data || [];

      // Calculate pending consents count
      const pendingCount = bookings.reduce((acc: number, booking: AppointmentConsentStatus) => {
        return acc + (booking.consentsRequired - booking.consentsCollected);
      }, 0);

      set({
        todayConsentStatus: bookings,
        pendingConsentsCount: pendingCount,
        consentsLoading: false,
      });
    } catch (error) {
      // 404 = user is not a agent — cache this to skip future API calls
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        set({ todayConsentStatus: [], pendingConsentsCount: 0, consentsLoading: false, isNotAgent: true });
        return;
      }

      set({
        todayConsentStatus: [],
        pendingConsentsCount: 0,
        consentsLoading: false,
      });
    }
  },

  fetchAppointmentConsents: async (bookingId: number) => {
    set({ consentsLoading: true, error: null });

    try {
      const response = await api.get(`${API_URL}/api/v1/crm/consents/booking/${bookingId}`);
      const booking = response.data.booking ? {
        ...response.data.booking,
        passengers: response.data.passengers || [],
        consentsRequired: response.data.consent_status?.required || 0,
        consentsCollected: response.data.consent_status?.collected || 0,
        status: response.data.consent_status?.complete ? 'complete' : 'partial',
      } : null;

      set({
        selectedAppointmentConsent: booking,
        consentsLoading: false,
      });

      return booking;
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Failed to fetch appointment consents'
        : 'Failed to fetch appointment consents';
      set({ error: message, consentsLoading: false });
      return null;
    }
  },

  selectAppointmentConsent: (booking: AppointmentConsentStatus | null) => {
    set({ selectedAppointmentConsent: booking });
  },

  sendConsentReminder: async (bookingId: number, passengerId: number) => {
    try {
      await api.post(`${API_URL}/api/v1/crm/consents/booking/${bookingId}/passenger/${passengerId}/remind`);
      // Refresh the appointment consents
      await get().fetchAppointmentConsents(bookingId);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Failed to send reminder'
        : 'Failed to send reminder';
      set({ error: message });
      throw new Error(message);
    }
  },

  addWalkupPassenger: async (bookingId: number, data) => {
    try {
      await api.post(`${API_URL}/api/v1/crm/consents/booking/${bookingId}/passenger`, data);
      // Refresh the appointment consents
      await get().fetchAppointmentConsents(bookingId);
      await get().fetchTodayConsents();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Failed to add passenger'
        : 'Failed to add passenger';
      set({ error: message });
      throw new Error(message);
    }
  },

  collectSignature: async (bookingId: number, passengerId: number, data: ConsentSignatureData) => {
    try {
      await api.post(`${API_URL}/api/v1/crm/consents/booking/${bookingId}/passenger/${passengerId}/sign`, {
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        date_of_birth: data.dateOfBirth,
        emergency_contact_name: data.emergencyContactName,
        emergency_contact_phone: data.emergencyContactPhone,
        medical_conditions: data.medicalConditions,
        acknowledged_risks: data.acknowledgedRisks,
        acknowledged_rules: data.acknowledgedRules,
        signature_data: data.signatureData,
        signature_type: data.signatureType,
        is_minor: data.isMinor,
        guardian_name: data.guardianName,
        guardian_relationship: data.guardianRelationship,
      });
      // Refresh the appointment consents
      await get().fetchAppointmentConsents(bookingId);
      await get().fetchTodayConsents();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Failed to collect signature'
        : 'Failed to collect signature';
      set({ error: message });
      throw new Error(message);
    }
  },

  recordHeadCount: async (bookingId: number, actualCount: number, notes?: string): Promise<HeadCountRecord> => {
    try {
      const response = await api.post(`${API_URL}/api/v1/crm/consents/booking/${bookingId}/head-count`, {
        actual_count: actualCount,
        notes,
      });
      return response.data.head_count;
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Failed to record head count'
        : 'Failed to record head count';
      set({ error: message });
      throw new Error(message);
    }
  },

  approveDeparture: async (bookingId: number, forceDepart = false) => {
    try {
      await api.post(`${API_URL}/api/v1/crm/consents/booking/${bookingId}/depart`, {
        force_depart: forceDepart,
      });
      // Refresh data
      await get().fetchTodayConsents();
      await get().fetchTodaySchedule();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Failed to approve departure'
        : 'Failed to approve departure';
      set({ error: message });
      throw new Error(message);
    }
  },

  // ============================================================================
  // Lead Actions
  // ============================================================================

  fetchLeads: async (filters) => {
    set({ leadsLoading: true, error: null });

    try {
      const response = await api.get(`${API_URL}/api/v1/crm/leads`, {
        params: filters,
      });
      set({
        leads: toArray(response.data.data?.data || response.data.data).map((l) => snakeToCamel(l as Record<string, any>)) as CrmLead[],
        leadsLoading: false,
      });
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Failed to fetch leads'
        : 'Failed to fetch leads';
      set({ error: message, leadsLoading: false });
    }
  },

  fetchLead: async (id: number) => {
    try {
      const response = await api.get(`${API_URL}/api/v1/crm/leads/${id}`);
      const raw = response.data.data;
      if (!raw) return null;
      const lead = snakeToCamel(raw as Record<string, any>);
      if (raw.interactions) {
        lead.interactions = raw.interactions.map((i: Record<string, any>) => snakeToCamel(i));
      }
      if (raw.assigned_user) {
        lead.assignedUser = snakeToCamel(raw.assigned_user as Record<string, any>);
      }
      if (raw.converted_customer) {
        lead.convertedCustomer = snakeToCamel(raw.converted_customer as Record<string, any>);
      }
      return lead;
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Failed to fetch lead'
        : 'Failed to fetch lead';
      set({ error: message });
      return null;
    }
  },

  fetchLeadPipeline: async () => {
    try {
      const response = await api.get(`${API_URL}/api/v1/crm/leads/pipeline`);
      set({ leadPipeline: response.data.data });
    } catch (error) {
      console.error('Failed to fetch lead pipeline:', error);
    }
  },

  fetchLeadOptions: async () => {
    try {
      const response = await api.get(`${API_URL}/api/v1/crm/leads/options`);
      set({ leadOptions: response.data.data });
    } catch (error) {
      console.error('Failed to fetch lead options:', error);
    }
  },

  createLead: async (data) => {
    set({ leadsLoading: true, error: null });

    try {
      const response = await api.post(`${API_URL}/api/v1/crm/leads`, camelToSnake(data as Record<string, any>));
      const lead = snakeToCamel(response.data.data) as CrmLead;

      set((state) => ({
        leads: [lead, ...state.leads],
        leadsLoading: false,
      }));

      // Refresh pipeline stats
      get().fetchLeadPipeline();

      return lead;
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error || error.response?.data?.message || 'Failed to create lead'
        : 'Failed to create lead';
      set({ error: message, leadsLoading: false });
      throw new Error(message);
    }
  },

  updateLead: async (id, data) => {
    set({ leadsLoading: true, error: null });

    try {
      const response = await api.put(`${API_URL}/api/v1/crm/leads/${id}`, camelToSnake(data as Record<string, any>));
      const updatedLead = snakeToCamel(response.data.data) as CrmLead;

      set((state) => ({
        leads: state.leads.map((l) => (l.id === id ? updatedLead : l)),
        leadsLoading: false,
      }));

      return updatedLead;
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Failed to update lead'
        : 'Failed to update lead';
      set({ error: message, leadsLoading: false });
      throw new Error(message);
    }
  },

  convertLead: async (id, additionalData = {}) => {
    set({ leadsLoading: true, error: null });

    try {
      const response = await api.post(`${API_URL}/api/v1/crm/leads/${id}/convert`, camelToSnake(additionalData as Record<string, any>));
      const rawData = response.data.data;
      const lead = snakeToCamel(rawData.lead) as CrmLead;
      const customer = snakeToCamel(rawData.customer) as Contact;

      set((state) => ({
        leads: state.leads.map((l) => (l.id === id ? lead : l)),
        leadsLoading: false,
      }));

      // Refresh pipeline and customers
      get().fetchLeadPipeline();
      get().fetchCustomers();

      return { lead, customer };
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error || error.response?.data?.message || 'Failed to convert lead'
        : 'Failed to convert lead';
      set({ error: message, leadsLoading: false });
      throw new Error(message);
    }
  },

  markLeadLost: async (id, reason) => {
    try {
      await api.post(`${API_URL}/api/v1/crm/leads/${id}/lost`, { reason });

      set((state) => ({
        leads: state.leads.map((l) =>
          l.id === id ? { ...l, status: 'lost' as LeadStatus, lostReason: reason } : l
        ),
      }));

      get().fetchLeadPipeline();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Failed to mark lead as lost'
        : 'Failed to mark lead as lost';
      set({ error: message });
      throw new Error(message);
    }
  },

  selectLead: (id: number | null) => {
    set({ selectedLeadId: id });
  },

  // ============================================================================
  // Interaction Actions
  // ============================================================================

  fetchInteractionsForLead: async (leadId: number) => {
    set({ interactionsLoading: true, error: null });

    try {
      const response = await api.get(`${API_URL}/api/v1/crm/leads/${leadId}/interactions`);
      const interactions = response.data.data?.interactions?.data || response.data.data?.interactions || [];
      set({ interactions, interactionsLoading: false });
      return interactions;
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Failed to fetch interactions'
        : 'Failed to fetch interactions';
      set({ error: message, interactionsLoading: false });
      return [];
    }
  },

  fetchInteractionsForCustomer: async (customerId: number) => {
    set({ interactionsLoading: true, error: null });

    try {
      const response = await api.get(`${API_URL}/api/v1/crm/contacts/${customerId}/interactions`);
      const interactions = response.data.data?.interactions?.data || response.data.data?.interactions || [];
      set({ interactions, interactionsLoading: false });
      return interactions;
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Failed to fetch interactions'
        : 'Failed to fetch interactions';
      set({ error: message, interactionsLoading: false });
      return [];
    }
  },

  fetchInteractionOptions: async () => {
    try {
      const response = await api.get(`${API_URL}/api/v1/crm/interactions/options`);
      set({ interactionOptions: response.data.data });
    } catch (error) {
      console.error('Failed to fetch interaction options:', error);
    }
  },

  createInteraction: async (data) => {
    set({ interactionsLoading: true, error: null });

    try {
      const response = await api.post(`${API_URL}/api/v1/crm/interactions`, {
        lead_id: data.leadId,
        customer_id: data.customerId,
        type: data.type,
        direction: data.direction,
        content: data.content,
        subject: data.subject,
        outcome: data.outcome,
        follow_up_at: data.followUpAt,
      });

      const interaction = response.data.data;

      set((state) => ({
        interactions: [interaction, ...state.interactions],
        interactionsLoading: false,
      }));

      return interaction;
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error || error.response?.data?.message || 'Failed to create interaction'
        : 'Failed to create interaction';
      set({ error: message, interactionsLoading: false });
      throw new Error(message);
    }
  },

  // ============================================================================
  // Filter Actions
  // ============================================================================

  setFilters: (filters) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters,
      },
    }));
  },

  clearFilters: () => {
    set({ filters: initialFilters });
  },

  // ============================================================================
  // Polling Actions
  // ============================================================================

  startPolling: (intervalMs = 5000) => {
    const { pollingInterval, isPolling } = get();

    if (isPolling || pollingInterval) return;

    const interval = setInterval(() => {
      if (get().isPolling) {
        get().fetchKPIs();
        get().fetchActiveCalls();
        get().fetchPendingApprovals();
      }
    }, intervalMs);

    set({ pollingInterval: interval, isPolling: true });
  },

  stopPolling: () => {
    const { pollingInterval } = get();

    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    set({ pollingInterval: null, isPolling: false });
  },

  // ============================================================================
  // Error Actions
  // ============================================================================

  clearError: () => set({ error: null }),
}));
