export type CampaignType = 'email' | 'sms' | 'push' | 'in_app' | 'social' | 'multi_channel';
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  type: CampaignType;
  status: CampaignStatus;
  target_audience: AudienceFilters | string | null;
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

export interface CampaignSend {
  id: string;
  campaign_id: string;
  user_id: string | null;
  email: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed' | 'converted';
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  bounced_at: string | null;
  bounce_reason: string | null;
  created_at: string;
}

export interface AudienceFilters {
  status?: string[];
  source?: string[];
  tags?: string[];
  date_from?: string;
  date_to?: string;
  selected_ids?: number[];
  imported_emails?: Array<{ email: string; name?: string }>;
  manual_emails?: string;
}

export interface AudienceEstimate {
  count: number;
  sample: Array<{
    id: number;
    contact_first_name: string;
    contact_last_name: string;
    contact_email: string;
    status: string;
    source: string;
  }>;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: string;
  category: string;
  variables: string[];
  is_system_template: boolean;
}

export interface WizardState {
  step: number;
  name: string;
  description: string;
  type: CampaignType;
  scheduleType: 'now' | 'later';
  scheduledAt: string | null;
  audience: AudienceFilters;
  audienceCount: number;
  subject: string;
  content: string;
  contentHtml: string;
  templateId: string | null;
  // Multi-channel content
  smsContent: string;
  pushTitle: string;
  pushBody: string;
  // A/B testing
  hasVariantB: boolean;
  variantBSubject: string;
  variantBContent: string;
  splitPercentage: number;
}

export const CAMPAIGN_TYPE_CONFIG: Record<CampaignType, { label: string; icon: string; description: string; color: string }> = {
  email: { label: 'Email', icon: 'Mail', description: 'Send emails via SendGrid', color: 'bg-blue-500' },
  sms: { label: 'SMS', icon: 'MessageSquare', description: 'Text messages via Twilio', color: 'bg-green-500' },
  push: { label: 'Push', icon: 'Bell', description: 'Push notifications via OneSignal', color: 'bg-purple-500' },
  in_app: { label: 'In-App', icon: 'Smartphone', description: 'In-app messages', color: 'bg-orange-500' },
  social: { label: 'Social', icon: 'Share2', description: 'Social media posts', color: 'bg-pink-500' },
  multi_channel: { label: 'Multi-Channel', icon: 'Layers', description: 'Email + SMS + Push combined', color: 'bg-indigo-500' },
};

export const CAMPAIGN_STATUS_CONFIG: Record<CampaignStatus, { label: string; color: string; dotColor: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', dotColor: 'bg-gray-400' },
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700', dotColor: 'bg-blue-400' },
  active: { label: 'Active', color: 'bg-green-100 text-green-700', dotColor: 'bg-green-400' },
  paused: { label: 'Paused', color: 'bg-yellow-100 text-yellow-700', dotColor: 'bg-yellow-400' },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700', dotColor: 'bg-emerald-400' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', dotColor: 'bg-red-400' },
};

export const DEFAULT_WIZARD_STATE: WizardState = {
  step: 1,
  name: '',
  description: '',
  type: 'email',
  scheduleType: 'now',
  scheduledAt: null,
  audience: {},
  audienceCount: 0,
  subject: '',
  content: '',
  contentHtml: '',
  templateId: null,
  smsContent: '',
  pushTitle: '',
  pushBody: '',
  hasVariantB: false,
  variantBSubject: '',
  variantBContent: '',
  splitPercentage: 50,
};
