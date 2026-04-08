/**
 * Call Flow Tree Types
 * Real-time visualization of AI caller pipeline stages.
 * Each stage maps to a backend processing step.
 */

import {
  Phone, FileText, Volume2, Users, GitBranch, PhoneOutgoing,
  MessageSquare, Wrench, CheckCircle2, BarChart3,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Stage identifiers — must match backend EmitsCallFlowStages trait
export type CallFlowStageId =
  | 'initiation'
  | 'script_generation'
  | 'voice_audio'
  | 'agent_resolution'
  | 'provider_routing'
  | 'call_placement'
  | 'conversation'
  | 'tool_execution'
  | 'call_completion'
  | 'post_processing';

export type FlowNodeStatus = 'pending' | 'active' | 'success' | 'error' | 'skipped';

export interface FlowNode {
  id: CallFlowStageId;
  index: number;
  label: string;
  description: string;
  icon: LucideIcon;
  status: FlowNodeStatus;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
  error: string | null;
  metadata: Record<string, unknown> | null;
  children: ToolExecutionNode[];
}

export interface ToolExecutionNode {
  id: string;
  toolName: string;
  parameters: Record<string, unknown> | null;
  status: 'executing' | 'success' | 'error' | 'denied';
  result: unknown | null;
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
}

// Pusher event from backend CallFlowStageUpdated
export interface CallFlowStageEvent {
  callId: string;
  stage: CallFlowStageId;
  stageIndex: number;
  status: 'started' | 'completed' | 'failed' | 'skipped';
  error: string | null;
  durationMs: number | null;
  metadata: Record<string, unknown> | null;
  timestamp: string;
}

// Stage definitions for the visual tree
export interface CallFlowStageDefinition {
  id: CallFlowStageId;
  index: number;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const CALL_FLOW_STAGES: CallFlowStageDefinition[] = [
  { id: 'initiation', index: 0, label: 'Initiation', description: 'Validate auth, phone, prepare call', icon: Phone },
  { id: 'script_generation', index: 1, label: 'Script Generation', description: 'Load template + AI personalization', icon: FileText },
  { id: 'voice_audio', index: 2, label: 'Voice Audio', description: 'Generate TTS audio', icon: Volume2 },
  { id: 'agent_resolution', index: 3, label: 'Agent Resolution', description: 'Multi-tenant phone agent routing', icon: Users },
  { id: 'provider_routing', index: 4, label: 'Provider Routing', description: 'Route to ElevenLabs / OpenAI / Custom', icon: GitBranch },
  { id: 'call_placement', index: 5, label: 'Call Placement', description: 'Twilio outbound call + webhooks', icon: PhoneOutgoing },
  { id: 'conversation', index: 6, label: 'Conversation', description: 'Real-time AI dialog active', icon: MessageSquare },
  { id: 'tool_execution', index: 7, label: 'Tool Execution', description: 'AutonomyGate + ToolRegistry', icon: Wrench },
  { id: 'call_completion', index: 8, label: 'Call Completion', description: 'Transcript + sentiment analysis', icon: CheckCircle2 },
  { id: 'post_processing', index: 9, label: 'Post-Processing', description: 'Update records, analytics, costs', icon: BarChart3 },
];

/** Create a fresh set of flow nodes with all stages pending */
export function createInitialFlowNodes(): FlowNode[] {
  return CALL_FLOW_STAGES.map((stage) => ({
    id: stage.id,
    index: stage.index,
    label: stage.label,
    description: stage.description,
    icon: stage.icon,
    status: 'pending' as FlowNodeStatus,
    startedAt: null,
    completedAt: null,
    durationMs: null,
    error: null,
    metadata: null,
    children: [],
  }));
}
