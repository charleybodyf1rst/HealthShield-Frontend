// CRM Type Definitions
// AI Orchestra features adapted for HealthShield insurance platform

// =============================================================================
// Agent Status Types
// =============================================================================

export type AgentChannel = 'chat' | 'voice' | 'sms' | 'email';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

export interface AgentStatus {
  isOnline: boolean;
  connectionStatus: ConnectionStatus;
  channel: AgentChannel;
  activeCalls: number;
  pendingTasks: number;
  totalTools: number;
  availableTools: string[];
  lastHeartbeat?: string;
  uptime?: number;
  version?: string;
}

// =============================================================================
// CRM Specific Types
// =============================================================================

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  totalBookings: number;
  totalSpent: number;
  lastBookingDate?: string;
  insurancePlans?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: number;
  user_id: number;
  user_account_id?: number;
  first_name: string;
  last_name: string;
  full_name?: string;
  name: string; // computed for backward compat
  email?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  agents_license_number?: string;
  license_type?: 'health' | 'life' | 'property_casualty' | 'series_6' | 'series_7';
  license_expires?: string;
  endorsements?: string[];
  certifications?: string[];
  last_background_check?: string;
  last_ce_completion?: string;
  hourly_rate?: number;
  overtime_rate?: number;
  tip_percentage?: number;
  payment_method?: string;
  bank_account_last4?: string;
  bio?: string;
  photo_url?: string;
  can_handle_medicare?: boolean;
  status: 'active' | 'inactive' | 'on_leave' | 'available' | 'on_call' | 'off_duty';
  hire_date?: string;
  termination_date?: string;
  rating: number;
  totalAppointments: number;
  bookings_count?: number;
  schedules?: AgentScheduleEntry[];
  created_at?: string;
  updated_at?: string;
}

export interface AgentScheduleEntry {
  id: number;
  agent_id: number;
  booking_id?: number;
  schedule_date: string;
  start_time?: string;
  end_time?: string;
  type: 'scheduled_work' | 'day_off' | 'training';
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
}

export interface CreateAgentData {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  agents_license_number?: string;
  license_type?: string;
  license_expires?: string;
  hourly_rate?: number;
  overtime_rate?: number;
  tip_percentage?: number;
  bio?: string;
  can_handle_medicare?: boolean;
  status?: string;
  hire_date?: string;
}

export interface Appointment {
  id: string;
  customerId: string;
  customer?: Contact;
  serviceId: string;
  serviceName: string;
  agentId?: string;
  agent?: Agent;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // hours
  status: BookingStatus;
  totalPrice: number;
  depositPaid: number;
  balanceDue: number;
  partySize: number;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'refunded';

// =============================================================================
// Chat & Message Types
// =============================================================================

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export type ToolCallStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface ToolCall {
  id: string;
  toolName: string;
  parameters: Record<string, unknown>;
  status: ToolCallStatus;
  result?: unknown;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  toolCalls?: ToolCall[];
  requiresApproval?: boolean;
  approvalId?: string;
  metadata?: {
    model?: string;
    tokensUsed?: number;
    processingTime?: number;
  };
}

// =============================================================================
// Pending Approval Types (CRM actions)
// =============================================================================

export type ApprovalActionType =
  | 'confirm_booking'
  | 'cancel_booking'
  | 'process_refund'
  | 'reschedule_booking'
  | 'assign_agent'
  | 'send_reminder'
  | 'send_weather_alert'
  | 'update_customer'
  | 'schedule_maintenance'
  | 'process_payment';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface PendingApproval {
  id: string;
  actionType: ApprovalActionType;
  title: string;
  description: string;
  payload: Record<string, unknown>;
  confidence: number;
  risk: 'low' | 'medium' | 'high';
  status: ApprovalStatus;
  expiresAt?: string;
  createdAt: string;
  relatedBookingId?: string;
  relatedCustomerId?: string;
}

// =============================================================================
// AI Caller Types (Customer communication)
// =============================================================================

export type CrmCallType =
  | 'booking_confirmation'
  | 'reminder_24h'
  | 'reminder_2h'
  | 'weather_alert'
  | 'follow_up'
  | 'review_request'
  | 'custom';

export type CrmCallStatus =
  | 'scheduled'
  | 'queued'
  | 'dialing'
  | 'ringing'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'no_answer'
  | 'voicemail'
  | 'cancelled';

export interface CrmCall {
  id: string;
  uuid: string;
  type: CrmCallType;
  status: CrmCallStatus;
  subject: string;
  phoneNumber: string;
  customerName?: string;
  customerId?: string;
  bookingId?: string;
  duration?: number;
  durationSeconds?: number;
  transcript?: string;
  summary?: string;
  recordingUrl?: string;
  outcome?: string;
  voice?: string;
  scheduledFor?: string;
  startedAt?: string;
  answeredAt?: string;
  endedAt?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface CallScript {
  id: string;
  name: string;
  type: CrmCallType;
  prompt: string;
  voice: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// Activity Feed Types
// =============================================================================

export type ActivityType =
  | 'booking_created'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'appointment_started'
  | 'appointment_completed'
  | 'call_completed'
  | 'call_scheduled'
  | 'payment_received'
  | 'refund_processed'
  | 'agent_assigned'
  | 'approval_requested'
  | 'approval_handled'
  | 'weather_alert'
  | 'maintenance_scheduled'
  | 'error';

export interface CrmActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  icon?: string;
  color?: 'green' | 'blue' | 'yellow' | 'red' | 'gray' | 'orange';
  metadata?: Record<string, unknown>;
  relatedId?: string;
  relatedType?: 'booking' | 'customer' | 'call' | 'approval' | 'agent';
}

// =============================================================================
// Analytics Types
// =============================================================================

export interface BookingAnalytics {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  revenue: number;
  avgBookingValue: number;
  bookingsToday: number;
  bookingsThisWeek: number;
  bookingsThisMonth: number;
  bookingsByService: Record<string, number>;
  trend: 'up' | 'down' | 'stable';
  trendPercent?: number;
}

export interface CallAnalytics {
  totalCalls: number;
  completedCalls: number;
  failedCalls: number;
  avgDuration: number;
  successRate: number;
  callsByType: Record<CrmCallType, number>;
  callsToday: number;
  callsThisWeek: number;
}

export interface AgentAnalytics {
  totalAgents: number;
  availableAgents: number;
  appointmentsToday: number;
  avgRating: number;
  topAgents: { id: string; name: string; appointments: number; rating: number }[];
}

export interface CrmAnalytics {
  bookings: BookingAnalytics;
  calls: CallAnalytics;
  agents: AgentAnalytics;
  period: 'day' | 'week' | 'month' | 'year';
  generatedAt: string;
}

// =============================================================================
// Dashboard KPI Types
// =============================================================================

export interface DashboardKPIs {
  todayBookings: number;
  totalBookings: number;
  upcomingBookings: number;
  pendingApprovals: number;
  activeAppointments: number;
  revenueToday: number;
  totalRevenue: number;
  revenueTrend: 'up' | 'down' | 'stable';
  revenueTrendPercent?: number;
}

export interface TodaySchedule {
  id: string;
  time: string;
  serviceName: string;
  serviceIcon: string;
  agentName: string;
  customerName: string;
  partySize: number;
  status: 'upcoming' | 'in_progress' | 'completed';
  consentsRequired: number;
  consentsCollected: number;
}

// =============================================================================
// API Request/Response Types
// =============================================================================

export interface ScheduleCallRequest {
  phoneNumber: string;
  customerName?: string;
  customerId?: string;
  bookingId?: string;
  type: CrmCallType;
  scriptId?: string;
  scheduledFor?: string;
  variables?: Record<string, string>;
}

export interface ApprovalRequest {
  approvalId: string;
  approved: boolean;
  reason?: string;
}

export interface ApprovalResponse {
  success: boolean;
  message: string;
  result?: unknown;
}

// =============================================================================
// UI State Types
// =============================================================================

export interface CrmTab {
  id: 'overview' | 'customers' | 'approvals' | 'ai-caller' | 'analytics' | 'consents';
  label: string;
  icon: string;
  badge?: number;
}

export interface CrmFilters {
  bookings: {
    status?: BookingStatus[];
    serviceId?: string;
    dateRange?: { start: string; end: string };
  };
  calls: {
    status?: CrmCallStatus[];
    type?: CrmCallType[];
    dateRange?: { start: string; end: string };
  };
  activity: {
    type?: ActivityType[];
    dateRange?: { start: string; end: string };
  };
}

// =============================================================================
// Weather Alert Types
// =============================================================================

export interface WeatherAlert {
  id: string;
  type: 'storm' | 'high_wind' | 'lightning' | 'heat' | 'cold' | 'fog';
  severity: 'advisory' | 'watch' | 'warning';
  message: string;
  affectedDates: string[];
  affectedBookings: string[];
  isActive: boolean;
  createdAt: string;
  expiresAt: string;
}

// =============================================================================
// Consent Types
// =============================================================================

export interface ClientConsentStatus {
  id: number;
  fullName: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  isPrimaryRenter: boolean;
  isMinor: boolean;
  consentSigned: boolean;
  signedAt?: string;
  collectionMethod?: 'online' | 'agent_device' | 'in_person';
  agentVerified?: boolean;
}

export interface AppointmentConsentStatus {
  bookingId: number;
  bookingNumber: string;
  appointmentDate: string;
  startTime: string;
  serviceName: string;
  customerName: string;
  customerPhone?: string;
  consentsRequired: number;
  consentsCollected: number;
  passengers: ClientConsentStatus[];
  status: 'pending' | 'partial' | 'complete';
}

export interface ConsentSignatureData {
  fullName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalConditions?: string;
  acknowledgedRisks: boolean;
  acknowledgedRules: boolean;
  signatureData: string; // Base64 canvas image
  signatureType: 'drawn' | 'typed' | 'uploaded';
  isMinor?: boolean;
  guardianName?: string;
  guardianRelationship?: string;
}

export interface ConsentTemplate {
  id: number;
  name: string;
  version: string;
  content: string;
  requiredFields: string[];
  requiresWitness: boolean;
  requiresNotary: boolean;
  allowsMinors: boolean;
  minimumAge: number;
  isActive: boolean;
  effectiveDate: string;
}

export interface HeadCountRecord {
  id: number;
  bookingId: number;
  agentId: number;
  expectedCount: number;
  consentsSignedCount: number;
  actualCount: number;
  discrepancy: number;
  allConsentsCollected: boolean;
  departureApproved: boolean;
  notes?: string;
  recordedAt: string;
}

// =============================================================================
// Lead Types (Sales Pipeline)
// =============================================================================

export type LeadCategory = 'individual' | 'family' | 'group' | 'corporate';

export type LeadOccasion =
  | 'new_policy'
  | 'renewal'
  | 'upgrade'
  | 'group_enrollment'
  | 'consultation';

export type LeadSource =
  | 'website'
  | 'phone'
  | 'sms'
  | 'walk_in'
  | 'referral'
  | 'google'
  | 'facebook'
  | 'instagram'
  | 'yelp'
  | 'other';

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'quoted'
  | 'negotiating'
  | 'converted'
  | 'lost'
  | 'unresponsive';

export interface CrmLead {
  id: number;
  userId: number;
  firstName: string;
  lastName?: string;
  email?: string;
  phone: string;
  contactPhoneAlt?: string;
  companyName?: string;
  contactTitle?: string;
  companyAddress?: string;
  companyCity?: string;
  companyState?: string;
  companyZip?: string;
  companyCountry?: string;
  industry?: string;
  estimatedEmployees?: number;
  website?: string;
  categoryInterested?: LeadCategory;
  hoursRequested?: number;
  partySize?: number;
  occasion?: LeadOccasion;
  preferredDate?: string;
  preferredTime?: string;
  budgetMin?: number;
  budgetMax?: number;
  specialRequests?: string;
  source: LeadSource;
  status: LeadStatus;
  lostReason?: string;
  lastContactAt?: string;
  contactAttempts: number;
  nextFollowUpAt?: string;
  assignedTo?: number;
  assignedUser?: { id: number; name: string };
  convertedCustomerId?: number;
  convertedBookingId?: number;
  convertedAt?: string;
  notes?: string;
  interactions?: CrmInteraction[];
  createdAt: string;
  updatedAt: string;
}

export interface LeadPipelineStats {
  pipeline: Record<LeadStatus, number>;
  needsFollowUp: number;
  todayLeads: number;
  totalActive: number;
}

// =============================================================================
// Interaction Types (Unified Communication Log)
// =============================================================================

export type InteractionType = 'sms' | 'email' | 'call' | 'voicemail' | 'note' | 'meeting' | 'site_visit';

export type InteractionDirection = 'inbound' | 'outbound';

export type InteractionChannel = 'manual' | 'ai_agent' | 'automated' | 'system';

export type InteractionStatus =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'replied'
  | 'bounced'
  | 'failed';

export type CallInteractionStatus =
  | 'initiated'
  | 'ringing'
  | 'answered'
  | 'no_answer'
  | 'busy'
  | 'voicemail'
  | 'failed'
  | 'completed';

export type InteractionOutcome =
  | 'interested'
  | 'callback_requested'
  | 'not_interested'
  | 'left_message'
  | 'no_response'
  | 'booked'
  | 'needs_info'
  | 'referred';

export interface CrmInteraction {
  id: number;
  userId: number;
  leadId?: number;
  customerId?: number;
  type: InteractionType;
  direction: InteractionDirection;
  channel: InteractionChannel;
  fromAddress?: string;
  toAddress?: string;
  subject?: string;
  content?: string;
  transcript?: string;
  recordingUrl?: string;
  status?: InteractionStatus;
  callStatus?: CallInteractionStatus;
  durationSeconds?: number;
  outcome?: InteractionOutcome;
  outcomeNotes?: string;
  followUpAt?: string;
  twilioSid?: string;
  sendgridId?: string;
  elevenlabsConversationId?: string;
  createdBy?: number;
  createdByUser?: { id: number; name: string };
  interactionAt: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  // Computed
  formattedDuration?: string;
  typeIcon?: string;
  typeLabel?: string;
}

// =============================================================================
// Lead Options (for dropdowns)
// =============================================================================

export interface LeadOptions {
  categories: Record<LeadCategory, string>;
  occasions: Record<LeadOccasion, string>;
  sources: Record<LeadSource, string>;
  statuses: Record<LeadStatus, string>;
}

export interface InteractionOptions {
  types: Record<InteractionType, string>;
  outcomes: Record<InteractionOutcome, string>;
}

// =============================================================================
// Consent Administration Types
// =============================================================================

export interface AgentContext {
  agent: {
    id: number;
    firstName: string;
    lastName: string;
    photoUrl?: string;
  };
  assignedService: {
    id: number;
    name: string;
    icon?: string;
  } | null;
  todayStats: {
    totalBookings: number;
    pendingConsents: number;
    completedConsents: number;
    readyToDepartCount: number;
  };
}

export interface ArchivedConsent {
  id: number;
  bookingId: number;
  bookingNumber: string;
  fullName: string;
  email?: string;
  phone?: string;
  isMinor: boolean;
  serviceName: string;
  agentName?: string;
  signedAt: string;
  collectionMethod: 'online' | 'agent_device' | 'in_person';
  status: 'valid' | 'expired' | 'revoked';
  pdfUrl?: string;
}

export interface ConsentArchiveFilters {
  dateFrom: string | null;
  dateTo: string | null;
  bookingNumber: string;
  customerSearch: string;
  serviceId: number | null;
  agentId: number | null;
  status: 'all' | 'valid' | 'expired' | 'revoked';
  sortBy: 'signed_at' | 'full_name' | 'booking_number';
  sortDir: 'asc' | 'desc';
}

export interface QuickSignSearchResult {
  bookingId: number;
  bookingNumber: string;
  customerName: string;
  phone?: string;
  appointmentDate: string;
  startTime: string;
  serviceName: string;
  unsignedPassengers: Array<{
    id: number;
    fullName: string;
    isMinor: boolean;
  }>;
}

export interface ConsentArchivePagination {
  page: number;
  lastPage: number;
  total: number;
  perPage: number;
}

export type ConsentSubTab = 'today' | 'archive' | 'quick-sign' | 'templates';

// =============================================================================
// Legacy Aliases (for backward compatibility during migration)
// =============================================================================

/** @deprecated Use Contact */
export type Contact = Contact;
/** @deprecated Use Appointment */
export type Appointment = Appointment;
/** @deprecated Use CrmCall */
export type CrmCall = CrmCall;
/** @deprecated Use CrmCallType */
export type CrmCallType = CrmCallType;
/** @deprecated Use CrmActivity */
export type CrmActivity = CrmActivity;
/** @deprecated Use CrmAnalytics */
/** @deprecated Use CrmFilters */
/** @deprecated Use CrmLead */
export type CrmLead = CrmLead;
/** @deprecated Use CrmInteraction */
export type CrmInteraction = CrmInteraction;
/** @deprecated Use LeadCategory */
