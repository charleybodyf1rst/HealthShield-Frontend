import type { LucideIcon } from 'lucide-react';

// Re-export backend types
export type { AIAgent, NextBestAction } from '@/lib/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestedActions?: Array<{
    type: string;
    action: string;
    icon: string;
  }>;
}

export interface GeneratedContent {
  type: 'email' | 'sms' | 'call_script';
  subject?: string;
  content: string;
  talkingPoints?: string[];
}

export interface AgentFormData {
  name: string;
  type: string;
  persona: string;
  prompt: string;
  description: string;
  voiceId: string;
  firstMessage: string;
  llm: string;
  responseStyle: string;
}

export const DEFAULT_AGENT_FORM: AgentFormData = {
  name: '',
  type: 'sales',
  persona: 'professional',
  prompt: '',
  description: '',
  voiceId: '',
  firstMessage: '',
  llm: 'claude-3-5-sonnet',
  responseStyle: 'professional',
};

export interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  prompt: string;
}
