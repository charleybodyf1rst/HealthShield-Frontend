// ============================================================================
// SMS Types
// ============================================================================

export interface SmsMessage {
  id: string;
  leadId: string;
  userId?: string;
  direction: 'inbound' | 'outbound';
  content: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'received';
  createdAt: string;
  twilioSid?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface SmsConversation {
  leadId: string;
  leadName: string;
  leadPhone: string;
  messages: SmsMessage[];
  lastMessageAt: string;
  unreadCount: number;
}

// ============================================================================
// Inbox Types
// ============================================================================

export interface InboxItem {
  id: string;
  type: 'sms' | 'call' | 'email' | 'note';
  direction: 'inbound' | 'outbound';
  lead?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  user?: {
    id: string;
    name: string;
  };
  content: string;
  status: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface InboxFilters {
  type?: 'sms' | 'call' | 'email' | 'all';
  direction?: 'inbound' | 'outbound' | 'all';
  unreadOnly?: boolean;
  leadId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ============================================================================
// Voice/Call Types
// ============================================================================

export interface VoiceToken {
  token: string;
  identity: string;
  expiresIn: number;
}

export interface CallInitiation {
  logId: string;
  phoneNumber: string;
  leadId: string;
  callerId: string;
}

export interface CallRecording {
  recordingUrl: string;
  duration: number;
  recordingSid: string;
}

export interface CallStatus {
  callSid: string;
  status: 'queued' | 'ringing' | 'in-progress' | 'completed' | 'busy' | 'no-answer' | 'canceled' | 'failed';
  duration?: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface SmsConversationResponse {
  status: number;
  data: {
    lead: {
      id: string;
      name: string;
      phone: string;
    };
    messages: SmsMessage[];
    total: number;
  };
  message?: string;
}

export interface SendSmsResponse {
  status: number;
  data: {
    log_id: string;
    twilio_sid: string;
  };
  message?: string;
}

export interface InboxResponse {
  status: number;
  data: {
    items: InboxItem[];
    unread_count: number;
    pagination: {
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
    };
  };
  message?: string;
}

export interface UnreadCountResponse {
  status: number;
  data: {
    unread_count: number;
    by_type?: {
      sms: number;
      call: number;
      email: number;
    };
  };
  message?: string;
}

export interface VoiceTokenResponse {
  status: number;
  data: {
    token: string;
    identity: string;
    expiresIn: number;
  };
  message?: string;
}

export interface VoiceStatusResponse {
  status: number;
  data: {
    configured: boolean;
    caller_id: string | null;
  };
  message?: string;
}

export interface CallInitiateResponse {
  status: number;
  data: {
    log_id: string;
    phone_number: string;
    lead_id: string;
    caller_id: string;
  };
  message?: string;
}

export interface RecordingResponse {
  status: number;
  data: {
    recording_url: string;
    duration: number | null;
    recording_sid: string | null;
  };
  message?: string;
}

// ============================================================================
// WebSocket Event Types
// ============================================================================

export interface CommunicationReceivedEvent {
  id: string;
  type: 'sms' | 'call' | 'email';
  direction: 'inbound' | 'outbound';
  leadId: string | null;
  lead?: {
    id: string;
    name: string;
    phone?: string;
  };
  content: string;
  status: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface SmsStatusUpdateEvent {
  id: string;
  status: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface CallStatusUpdateEvent {
  callSid: string;
  status: string;
  duration?: number;
}
