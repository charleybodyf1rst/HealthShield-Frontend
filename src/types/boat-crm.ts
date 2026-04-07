// Boat CRM Type Definitions
// AI Orchestra features adapted for boat rental business

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
// Boat CRM Specific Types
// =============================================================================

export interface BoatCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  totalBookings: number;
  totalSpent: number;
  lastBookingDate?: string;
  preferredBoats?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Captain {
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
  captains_license_number?: string;
  license_type?: 'six_pack' | 'master' | 'oupv' | '100_ton' | '200_ton';
  license_expires?: string;
  endorsements?: string[];
  certifications?: string[];
  last_drug_test?: string;
  last_physical?: string;
  hourly_rate?: number;
  overtime_rate?: number;
  tip_percentage?: number;
  payment_method?: string;
  bank_account_last4?: string;
  bio?: string;
  photo_url?: string;
  boat_certifications?: number[];
  can_do_fishing_charters?: boolean;
  can_do_watersports?: boolean;
  can_do_overnight?: boolean;
  status: 'active' | 'inactive' | 'on_leave' | 'available' | 'on_trip' | 'off_duty';
  hire_date?: string;
  termination_date?: string;
  assignedBoatId?: string;
  rating: number;
  totalTrips: number;
  bookings_count?: number;
  schedules?: CaptainScheduleEntry[];
  created_at?: string;
  updated_at?: string;
}

export interface CaptainScheduleEntry {
  id: number;
  captain_id: number;
  booking_id?: number;
  schedule_date: string;
  start_time?: string;
  end_time?: string;
  type: 'scheduled_work' | 'day_off' | 'training';
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
}

export interface CreateCaptainData {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  captains_license_number?: string;
  license_type?: string;
  license_expires?: string;
  hourly_rate?: number;
  overtime_rate?: number;
  tip_percentage?: number;
  bio?: string;
  can_do_fishing_charters?: boolean;
  can_do_watersports?: boolean;
  can_do_overnight?: boolean;
  status?: string;
  hire_date?: string;
}

export interface BoatBooking {
  id: string;
  customerId: string;
  customer?: BoatCustomer;
  boatId: string;
  boatName: string;
  captainId?: string;
  captain?: Captain;
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
// Pending Approval Types (Boat-specific actions)
// =============================================================================

export type ApprovalActionType =
  | 'confirm_booking'
  | 'cancel_booking'
  | 'process_refund'
  | 'reschedule_booking'
  | 'assign_captain'
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

export type BoatCallType =
  | 'booking_confirmation'
  | 'reminder_24h'
  | 'reminder_2h'
  | 'weather_alert'
  | 'follow_up'
  | 'review_request'
  | 'custom';

export type BoatCallStatus =
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

export interface BoatCall {
  id: string;
  uuid: string;
  type: BoatCallType;
  status: BoatCallStatus;
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
  type: BoatCallType;
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
  | 'trip_started'
  | 'trip_completed'
  | 'call_completed'
  | 'call_scheduled'
  | 'payment_received'
  | 'refund_processed'
  | 'captain_assigned'
  | 'approval_requested'
  | 'approval_handled'
  | 'weather_alert'
  | 'maintenance_scheduled'
  | 'error';

export interface BoatActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  icon?: string;
  color?: 'green' | 'blue' | 'yellow' | 'red' | 'gray' | 'orange';
  metadata?: Record<string, unknown>;
  relatedId?: string;
  relatedType?: 'booking' | 'customer' | 'call' | 'approval' | 'captain';
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
  bookingsByBoat: Record<string, number>;
  trend: 'up' | 'down' | 'stable';
  trendPercent?: number;
}

export interface CallAnalytics {
  totalCalls: number;
  completedCalls: number;
  failedCalls: number;
  avgDuration: number;
  successRate: number;
  callsByType: Record<BoatCallType, number>;
  callsToday: number;
  callsThisWeek: number;
}

export interface CaptainAnalytics {
  totalCaptains: number;
  availableCaptains: number;
  tripsToday: number;
  avgRating: number;
  topCaptains: { id: string; name: string; trips: number; rating: number }[];
}

export interface BoatCrmAnalytics {
  bookings: BookingAnalytics;
  calls: CallAnalytics;
  captains: CaptainAnalytics;
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
  activeTrips: number;
  revenueToday: number;
  totalRevenue: number;
  revenueTrend: 'up' | 'down' | 'stable';
  revenueTrendPercent?: number;
}

export interface TodaySchedule {
  id: string;
  time: string;
  boatName: string;
  boatEmoji: string;
  captainName: string;
  customerName: string;
  partySize: number;
  status: 'upcoming' | 'in_progress' | 'completed';
  waiversRequired: number;
  waiversCollected: number;
}

// =============================================================================
// API Request/Response Types
// =============================================================================

export interface ScheduleCallRequest {
  phoneNumber: string;
  customerName?: string;
  customerId?: string;
  bookingId?: string;
  type: BoatCallType;
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

export interface BoatCrmTab {
  id: 'overview' | 'customers' | 'approvals' | 'ai-caller' | 'analytics' | 'waivers';
  label: string;
  icon: string;
  badge?: number;
}

export interface BoatCrmFilters {
  bookings: {
    status?: BookingStatus[];
    boatId?: string;
    dateRange?: { start: string; end: string };
  };
  calls: {
    status?: BoatCallStatus[];
    type?: BoatCallType[];
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
// Waiver Types
// =============================================================================

export interface PassengerWaiverStatus {
  id: number;
  fullName: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  isPrimaryRenter: boolean;
  isMinor: boolean;
  waiverSigned: boolean;
  signedAt?: string;
  collectionMethod?: 'online' | 'captain_device' | 'in_person';
  captainVerified?: boolean;
}

export interface BookingWaiverStatus {
  bookingId: number;
  bookingNumber: string;
  rentalDate: string;
  startTime: string;
  boatName: string;
  customerName: string;
  customerPhone?: string;
  waiversRequired: number;
  waiversCollected: number;
  passengers: PassengerWaiverStatus[];
  status: 'pending' | 'partial' | 'complete';
}

export interface WaiverSignatureData {
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

export interface WaiverTemplate {
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
  captainId: number;
  expectedCount: number;
  waiversSignedCount: number;
  actualCount: number;
  discrepancy: number;
  allWaiversCollected: boolean;
  departureApproved: boolean;
  notes?: string;
  recordedAt: string;
}

// =============================================================================
// Lead Types (Sales Pipeline)
// =============================================================================

export type LeadBoatType = 'double_decker' | 'pink' | 'pontoon' | 'wakesurfing' | 'any';

export type LeadOccasion =
  | 'birthday'
  | 'bachelorette'
  | 'bachelor'
  | 'corporate'
  | 'family'
  | 'date'
  | 'wedding'
  | 'graduation'
  | 'reunion'
  | 'holiday'
  | 'team_building'
  | 'sunset_cruise'
  | 'fishing'
  | 'wakesurfing'
  | 'other';

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

export type LakePreference = 'lake_travis' | 'either';

export interface BoatLead {
  id: number;
  userId: number;
  firstName: string;
  lastName?: string;
  email?: string;
  phone: string;
  boatTypeInterested?: LeadBoatType;
  specificBoatName?: string;
  hoursRequested?: number;
  partySize?: number;
  occasion?: LeadOccasion;
  preferredDate?: string;
  preferredTime?: string;
  lakePreference: LakePreference;
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
  interactions?: BoatInteraction[];
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

export interface BoatInteraction {
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
  boatTypes: Record<LeadBoatType, string>;
  occasions: Record<LeadOccasion, string>;
  sources: Record<LeadSource, string>;
  statuses: Record<LeadStatus, string>;
}

export interface InteractionOptions {
  types: Record<InteractionType, string>;
  outcomes: Record<InteractionOutcome, string>;
}

// =============================================================================
// Waiver Administration Types
// =============================================================================

export interface CaptainContext {
  captain: {
    id: number;
    firstName: string;
    lastName: string;
    photoUrl?: string;
  };
  assignedBoat: {
    id: number;
    name: string;
    emoji?: string;
  } | null;
  todayStats: {
    totalBookings: number;
    pendingWaivers: number;
    completedWaivers: number;
    readyToDepartCount: number;
  };
}

export interface ArchivedWaiver {
  id: number;
  bookingId: number;
  bookingNumber: string;
  fullName: string;
  email?: string;
  phone?: string;
  isMinor: boolean;
  boatName: string;
  captainName?: string;
  signedAt: string;
  collectionMethod: 'online' | 'captain_device' | 'in_person';
  status: 'valid' | 'expired' | 'revoked';
  pdfUrl?: string;
}

export interface WaiverArchiveFilters {
  dateFrom: string | null;
  dateTo: string | null;
  bookingNumber: string;
  customerSearch: string;
  boatId: number | null;
  captainId: number | null;
  status: 'all' | 'valid' | 'expired' | 'revoked';
  sortBy: 'signed_at' | 'full_name' | 'booking_number';
  sortDir: 'asc' | 'desc';
}

export interface QuickSignSearchResult {
  bookingId: number;
  bookingNumber: string;
  customerName: string;
  phone?: string;
  rentalDate: string;
  startTime: string;
  boatName: string;
  unsignedPassengers: Array<{
    id: number;
    fullName: string;
    isMinor: boolean;
  }>;
}

export interface WaiverArchivePagination {
  page: number;
  lastPage: number;
  total: number;
  perPage: number;
}

export type WaiverSubTab = 'today' | 'archive' | 'quick-sign' | 'templates';
