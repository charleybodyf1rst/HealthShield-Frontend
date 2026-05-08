import type { LeadStatus, LeadSource, LeadClassification } from '@/lib/constants';

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  companyAddress?: string;
  companyCity?: string;
  companyState?: string;
  companyZip?: string;
  companyCountry?: string;
  industry?: string;
  estimatedEmployees?: number;
  website?: string;
  status: LeadStatus;
  source: LeadSource;
  classification?: LeadClassification;
  classificationLabel?: string;
  value?: number;
  currency?: string;
  assignedTo?: string;
  assignedToUser?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  tags?: string[];
  notes?: string;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  wonAt?: string;
  lostAt?: string;
  lostReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'deal' | 'status_change';
  title: string;
  description?: string;
  outcome?: string;
  duration?: number; // in minutes for calls/meetings
  scheduledAt?: string;
  completedAt?: string;
  createdBy: string;
  createdByUser?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface LeadTask {
  id: string;
  leadId: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo: string;
  assignedToUser?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadComment {
  id: string;
  leadId: string;
  content: string;
  createdBy: string;
  createdByUser?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  description?: string;
  color: string;
  order: number;
  leads: Lead[];
  totalValue: number;
  weightedValue?: number;
  count: number;
  probability?: number;
  exitCriteria?: string[];
}

export interface LeadFilters {
  status?: LeadStatus | LeadStatus[];
  source?: LeadSource | LeadSource[];
  assignedTo?: string;
  tags?: string[];
  minValue?: number;
  maxValue?: number;
  createdAfter?: string;
  createdBefore?: string;
  search?: string;
}

export interface LeadStats {
  total: number;
  byStatus: Record<LeadStatus, number>;
  bySource: Record<LeadSource, number>;
  totalValue: number;
  wonValue: number;
  lostValue: number;
  conversionRate: number;
  averageDealSize: number;
  // Dashboard-specific stats
  totalLeads?: number;
  leadsChange?: number;
  conversionChange?: number;
  revenueThisMonth?: number;
  revenueChange?: number;
  aiCallsMade?: number;
  callsChange?: number;
}

export interface CreateLeadData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  source: LeadSource;
  value?: number;
  notes?: string;
  consultation_date?: string;
  consultation_time?: string;
  serviceName?: string;
  industry?: string;
  tags?: string[];
}

export interface UpdateLeadData extends Partial<CreateLeadData> {
  status?: LeadStatus;
  assignedTo?: string;
  nextFollowUpAt?: string;
  lostReason?: string;
}
