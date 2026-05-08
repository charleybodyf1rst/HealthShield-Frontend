import type { UserRole } from '@/types/auth';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://systemsf1rst-backend-887571186773.us-central1.run.app';

export const AUTH_TOKEN_KEY = 'healthshield_crm_auth_tokens';
export const USER_KEY = 'healthshield_crm_user';

// HealthShield organization ID — separates data from BodyF1RST (org 5)
// This is created by the setup endpoint and should match the organizations table
export const HEALTHSHIELD_ORG_ID = process.env.NEXT_PUBLIC_HEALTHSHIELD_ORG_ID || '12';

// CRM Routes
export const ROUTES = {
  // Public/Marketing
  HOME: '/',
  ABOUT: '/about',
  SERVICES: '/services',
  PLANS: '/plans',
  PRICING: '/pricing',
  CONTACT: '/contact',
  QUOTE: '/quote',
  SAVINGS_CALCULATOR: '/savings-calculator',
  VERIFY_POLICY: '/verify-policy',
  FAQ: '/faq',
  COMPLIANCE: '/compliance',

  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // CRM Dashboard
  DASHBOARD: '/dashboard',

  // Leads & Pipeline
  LEADS: '/leads',
  LEAD_DETAIL: '/leads/[id]',
  PIPELINE: '/pipeline',

  // Policyholders
  POLICYHOLDERS: '/contacts',

  // Insurance
  PROGRAMS: '/programs',
  ENROLLMENTS: '/enrollments',
  PROPOSALS: '/proposals',
  POLICIES: '/policies',
  CLAIMS: '/claims',
  RENEWALS: '/renewals',
  COMMISSIONS: '/commissions',
  WELLNESS: '/wellness',

  // Communication
  MESSAGES: '/messages',
  INBOX: '/inbox',
  EMAIL_CAMPAIGNS: '/campaigns/email',
  SMS_CAMPAIGNS: '/campaigns/sms',
  VOICE_CALLS: '/calls',

  // AI Features
  AI_AGENTS: '/ai-agents',
  AI_CALLER: '/ai-caller',
  AI_CHAT: '/ai-chat',
  AI_NOTES: '/ai-notes',

  // Analytics & Reports
  ANALYTICS: '/analytics',
  REPORTS: '/reports',

  // Team Management
  TEAM: '/team',
  TEAM_SETTINGS: '/team/settings',

  // Settings
  SETTINGS: '/settings',
  PROFILE: '/settings/profile',
  INTEGRATIONS: '/settings/integrations',
  NOTIFICATIONS: '/settings/notifications',
  BILLING: '/settings/billing',
} as const;

// Lead Status Pipeline Stages
export const LEAD_STATUSES = [
  { id: 'new', name: 'New Inquiry', color: 'bg-blue-500' },
  { id: 'contacted_1', name: 'Contacted (1st)', color: 'bg-yellow-500' },
  { id: 'contacted_2', name: 'Contacted (2nd)', color: 'bg-amber-500' },
  { id: 'contacted_3', name: 'Contacted (3rd)', color: 'bg-amber-600' },
  { id: 'contacted_5', name: 'Contacted (5th)', color: 'bg-amber-700' },
  { id: 'contacted_6', name: 'Contacted (6th)', color: 'bg-amber-800' },
  { id: 'pending', name: 'Pending', color: 'bg-violet-500' },
  { id: 'demo', name: 'Demo', color: 'bg-sky-500' },
  { id: 'census_requested', name: 'Census Requested', color: 'bg-orange-500' },
  { id: 'proposal_sent', name: 'Proposal Sent', color: 'bg-purple-500' },
  { id: 'group_info', name: 'Group Info Submitted', color: 'bg-indigo-500' },
  { id: 'agreement_signed', name: 'Agreement Signed', color: 'bg-pink-500' },
  { id: 'implementation', name: 'Implementation Call', color: 'bg-teal-500' },
  { id: 'census_final', name: 'Census Finalized', color: 'bg-cyan-500' },
  { id: 'go_live', name: 'Go-Live', color: 'bg-emerald-500' },
  { id: 'active', name: 'Active Client', color: 'bg-green-500' },
  { id: 'bad_number', name: 'Bad Number', color: 'bg-rose-500' },
  { id: 'email_only', name: 'Email Only', color: 'bg-blue-700' },
  { id: 'lost', name: 'Lost', color: 'bg-red-500' },
] as const;

export type LeadStatus = typeof LEAD_STATUSES[number]['id'];

// Lead Sources
export const LEAD_SOURCES = [
  { id: 'website', name: 'Website' },
  { id: 'referral', name: 'Referral' },
  { id: 'phone', name: 'Phone Call' },
  { id: 'social_media', name: 'Social Media' },
  { id: 'google', name: 'Google / Search' },
  { id: 'health_fair', name: 'Health Fair' },
  { id: 'employer_referral', name: 'Employer Referral' },
  { id: 'medicare_gov', name: 'Medicare.gov' },
  { id: 'insurance_broker', name: 'Insurance Broker' },
  { id: 'open_enrollment', name: 'Open Enrollment' },
  { id: 'direct_mail', name: 'Direct Mail' },
  { id: 'partner', name: 'Partner' },
  { id: 'advertisement', name: 'Advertisement' },
  { id: 'tablet-presentation', name: 'Corporate Wellness' },
  { id: 'demo_request', name: 'Demo Request' },
  { id: 'phone_call', name: 'AI Caller' },
  { id: 'other', name: 'Other' },
] as const;

export type LeadSource = typeof LEAD_SOURCES[number]['id'];

// Lead Classifications (Insurance Plan Types)
export const LEAD_CLASSIFICATIONS = [
  { id: 'individual_health', name: 'Individual Health Plan', color: 'bg-blue-500' },
  { id: 'family_health', name: 'Family Health Plan', color: 'bg-cyan-500' },
  { id: 'medicare_advantage', name: 'Medicare Advantage', color: 'bg-green-500' },
  { id: 'medicare_supplement', name: 'Medicare Supplement', color: 'bg-purple-500' },
  { id: 'dental_vision', name: 'Dental & Vision', color: 'bg-teal-500' },
  { id: 'short_term', name: 'Short-Term Health', color: 'bg-orange-500' },
  { id: 'group_health', name: 'Group / Employer Health', color: 'bg-indigo-500' },
  { id: 'life_insurance', name: 'Life Insurance', color: 'bg-pink-500' },
  { id: 'corporate_wellness', name: 'Corporate Wellness', color: 'bg-flame-500' },
  { id: 'other', name: 'Other', color: 'bg-gray-500' },
] as const;

export type LeadClassification = typeof LEAD_CLASSIFICATIONS[number]['id'];

// Sidebar navigation items
interface SidebarItem {
  title: string;
  href: string;
  icon: string;
  roles: UserRole[];
  badge?: string;
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  // Main
  { title: 'Dashboard', href: ROUTES.DASHBOARD, icon: 'LayoutDashboard', roles: ['sales_admin', 'sales_rep', 'sales_manager'] },
  { title: 'Leads', href: ROUTES.LEADS, icon: 'UserPlus', roles: ['sales_admin', 'sales_rep', 'sales_manager'] },
  { title: 'Pipeline', href: ROUTES.PIPELINE, icon: 'GitBranch', roles: ['sales_admin', 'sales_rep', 'sales_manager'] },
  { title: 'Policyholders', href: ROUTES.POLICYHOLDERS, icon: 'Users', roles: ['sales_admin', 'sales_rep', 'sales_manager'] },
  { title: 'Calendar', href: '/dashboard/calendar', icon: 'Calendar', roles: ['sales_admin', 'sales_rep', 'sales_manager'] },
  // Insurance
  { title: 'Programs', href: ROUTES.PROGRAMS, icon: 'ShieldCheck', roles: ['sales_admin', 'sales_manager'] },
  { title: 'Enrollments', href: ROUTES.ENROLLMENTS, icon: 'ClipboardList', roles: ['sales_admin', 'sales_rep', 'sales_manager'] },
  { title: 'Proposals', href: ROUTES.PROPOSALS, icon: 'FileText', roles: ['sales_admin', 'sales_rep', 'sales_manager'] },
  { title: 'Policies', href: ROUTES.POLICIES, icon: 'Shield', roles: ['sales_admin', 'sales_rep', 'sales_manager'] },
  { title: 'Claims', href: ROUTES.CLAIMS, icon: 'FileText', roles: ['sales_admin', 'sales_rep', 'sales_manager'] },
  { title: 'Renewals', href: ROUTES.RENEWALS, icon: 'RefreshCw', roles: ['sales_admin', 'sales_manager'] },
  { title: 'Commissions', href: ROUTES.COMMISSIONS, icon: 'DollarSign', roles: ['sales_admin', 'sales_manager'] },
  { title: 'Wellness', href: ROUTES.WELLNESS, icon: 'Heart', roles: ['sales_admin', 'sales_manager'] },
  // Communication
  { title: 'Inbox', href: ROUTES.INBOX, icon: 'Inbox', roles: ['sales_admin', 'sales_rep', 'sales_manager'] },
  { title: 'Messages', href: ROUTES.MESSAGES, icon: 'MessageSquare', roles: ['sales_admin', 'sales_rep', 'sales_manager'] },
  { title: 'Campaigns', href: ROUTES.EMAIL_CAMPAIGNS, icon: 'Mail', roles: ['sales_admin', 'sales_manager'] },
  // AI Tools
  { title: 'AI Assistant', href: ROUTES.AI_AGENTS, icon: 'Bot', roles: ['sales_admin', 'sales_manager'] },
  { title: 'AI Caller', href: ROUTES.AI_CALLER, icon: 'Phone', roles: ['sales_admin', 'sales_manager'] },
  { title: 'AI Notes', href: ROUTES.AI_NOTES, icon: 'StickyNote', roles: ['sales_admin', 'sales_manager'] },
  // Reports
  { title: 'Analytics', href: ROUTES.ANALYTICS, icon: 'BarChart3', roles: ['sales_admin', 'sales_manager'] },
];

export const ADMIN_ITEMS: SidebarItem[] = [
  { title: 'Team Management', href: ROUTES.TEAM, icon: 'UserCog', roles: ['sales_admin'] },
  { title: 'Settings', href: ROUTES.SETTINGS, icon: 'Settings', roles: ['sales_admin', 'sales_rep', 'sales_manager'] },
  { title: 'Compliance', href: ROUTES.COMPLIANCE, icon: 'ShieldCheck', roles: ['sales_admin', 'sales_manager'] },
  { title: 'Integrations', href: ROUTES.INTEGRATIONS, icon: 'Plug', roles: ['sales_admin'] },
  { title: 'Billing', href: ROUTES.BILLING, icon: 'CreditCard', roles: ['sales_admin'] },
];

// Polling intervals
export const POLLING_INTERVAL = 5000;
export const MESSAGE_POLLING_INTERVAL = 3000;

// Communication channels
export const COMMUNICATION_CHANNELS = [
  { id: 'email', name: 'Email', icon: 'Mail' },
  { id: 'sms', name: 'SMS', icon: 'MessageSquare' },
  { id: 'voice', name: 'Voice Call', icon: 'Phone' },
  { id: 'whatsapp', name: 'WhatsApp', icon: 'MessageCircle' },
] as const;

// Activity types
export const ACTIVITY_TYPES = [
  { id: 'call', name: 'Phone Call', icon: 'Phone' },
  { id: 'email', name: 'Email', icon: 'Mail' },
  { id: 'meeting', name: 'Meeting', icon: 'Calendar' },
  { id: 'note', name: 'Note', icon: 'StickyNote' },
  { id: 'task', name: 'Task', icon: 'CheckSquare' },
  { id: 'deal', name: 'Policy Update', icon: 'DollarSign' },
] as const;
