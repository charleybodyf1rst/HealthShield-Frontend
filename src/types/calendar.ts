// CRM Calendar Types for Sales Appointments

export type SalesAppointmentType =
  | 'discovery_call'
  | 'demo'
  | 'follow_up'
  | 'proposal_review'
  | 'closing_call'
  | 'onboarding'
  | 'check_in'
  | 'ai_scheduled';

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface SalesAppointment {
  id: string;
  salesRepId: string;
  leadId?: string;
  lead?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
  };
  type: SalesAppointmentType;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: AppointmentStatus;
  location?: string;
  meetingLink?: string;
  isAiScheduled?: boolean;
  aiCallId?: string;
  notes?: string;
  outcome?: string;
  nextSteps?: string;
  agent_name?: string;
  plan_type?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSalesAppointmentData {
  title: string;
  type: SalesAppointmentType;
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
  plan_type?: string;
}

export interface UpdateSalesAppointmentData {
  title?: string;
  type?: SalesAppointmentType;
  date?: string;
  start_time?: string;
  end_time?: string;
  duration?: number;
  lead_id?: string;
  status?: AppointmentStatus;
  description?: string;
  location?: string;
  meeting_link?: string;
  notes?: string;
  outcome?: string;
  next_steps?: string;
  agent_name?: string;
  plan_type?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: SalesAppointmentType;
  status: AppointmentStatus;
  leadId?: string;
  leadName?: string;
  color?: string;
  isAiScheduled?: boolean;
}

export const APPOINTMENT_TYPES: { value: SalesAppointmentType; label: string; color: string }[] = [
  { value: 'discovery_call', label: 'Discovery Call', color: '#3B82F6' },
  { value: 'demo', label: 'Demo/Presentation', color: '#8B5CF6' },
  { value: 'follow_up', label: 'Follow Up', color: '#10B981' },
  { value: 'proposal_review', label: 'Proposal Review', color: '#F59E0B' },
  { value: 'closing_call', label: 'Closing Call', color: '#EF4444' },
  { value: 'onboarding', label: 'Onboarding', color: '#06B6D4' },
  { value: 'check_in', label: 'Check-in', color: '#EC4899' },
  { value: 'ai_scheduled', label: 'AI Scheduled', color: '#6366F1' },
];

export const getAppointmentTypeColor = (type: SalesAppointmentType): string => {
  const typeInfo = APPOINTMENT_TYPES.find(t => t.value === type);
  return typeInfo?.color || '#6B7280';
};

export const getAppointmentTypeLabel = (type: SalesAppointmentType): string => {
  const typeInfo = APPOINTMENT_TYPES.find(t => t.value === type);
  return typeInfo?.label || type;
};
