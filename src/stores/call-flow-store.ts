'use client';

import { create } from 'zustand';
import type {
  FlowNode,
  FlowNodeStatus,
  CallFlowStageId,
  ToolExecutionNode,
} from '@/types/call-flow';
import { createInitialFlowNodes } from '@/types/call-flow';
import type {
  CallStatusUpdatedEvent,
  AgentToolExecutingEvent,
  AgentToolCompletedEvent,
  CallFlowStageEvent,
} from '@/hooks/useOrchestraChannel';

interface CallFlowState {
  /** Current call ID being tracked */
  callId: string | null;
  /** Flow nodes for the 10 stages */
  nodes: FlowNode[];
  /** Whether a call flow is actively being tracked */
  isTracking: boolean;
  /** Timestamp when tracking started */
  trackingStartedAt: string | null;

  // Actions
  /** Reset all nodes to pending and start tracking a new call */
  resetFlow: (callId?: string) => void;
  /** Stop tracking (call ended) */
  stopTracking: () => void;
  /** Handle a granular stage event from backend (call.flow.stage) */
  handleStageEvent: (event: CallFlowStageEvent) => void;
  /** Handle tool executing event */
  handleToolExecuting: (event: AgentToolExecutingEvent) => void;
  /** Handle tool completed event */
  handleToolCompleted: (event: AgentToolCompletedEvent) => void;
  /** Fallback: infer flow stages from existing call.status.updated events */
  inferFromCallStatus: (event: CallStatusUpdatedEvent) => void;
  /** Mark stages stuck active for >120s as timed out */
  checkTimeouts: () => void;
}

function updateNode(
  nodes: FlowNode[],
  stageId: CallFlowStageId,
  updater: (node: FlowNode) => Partial<FlowNode>
): FlowNode[] {
  return nodes.map((node) =>
    node.id === stageId ? { ...node, ...updater(node) } : node
  );
}

function updateNodeByIndex(
  nodes: FlowNode[],
  index: number,
  updater: (node: FlowNode) => Partial<FlowNode>
): FlowNode[] {
  return nodes.map((node) =>
    node.index === index ? { ...node, ...updater(node) } : node
  );
}

/** Per-stage timeout thresholds (ms). Conversation gets 10min; fast stages get 10-30s. */
const STAGE_TIMEOUTS: Record<string, number> = {
  initiation: 10_000,
  script_generation: 15_000,
  voice_audio: 5_000,
  agent_resolution: 20_000,
  provider_routing: 15_000,
  call_placement: 30_000,
  conversation: 600_000,
  tool_execution: 60_000,
  call_completion: 15_000,
  post_processing: 30_000,
};
const DEFAULT_TIMEOUT_MS = 120_000;

/** Map backend event status to frontend FlowNodeStatus */
function mapEventStatus(eventStatus: string): FlowNodeStatus {
  switch (eventStatus) {
    case 'started': return 'active';
    case 'completed': return 'success';
    case 'failed': return 'error';
    case 'skipped': return 'skipped';
    default: return 'pending';
  }
}

export const useCallFlowStore = create<CallFlowState>()((set) => ({
  callId: null,
  nodes: createInitialFlowNodes(),
  isTracking: false,
  trackingStartedAt: null,

  resetFlow: (callId?: string) => {
    set({
      callId: callId ?? null,
      nodes: createInitialFlowNodes(),
      isTracking: true,
      trackingStartedAt: new Date().toISOString(),
    });
  },

  stopTracking: () => {
    set((state) => ({
      isTracking: false,
      nodes: state.nodes.map((n) =>
        n.status === 'active'
          ? { ...n, status: 'error' as FlowNodeStatus, error: 'Call ended unexpectedly', completedAt: new Date().toISOString() }
          : n
      ),
    }));
  },

  handleStageEvent: (event: CallFlowStageEvent) => {
    set((state) => {
      if (!state.isTracking) return state;

      // Adopt the backend's callId on first event (fixes frontend/backend ID mismatch).
      // The controller uses Pub/Sub so the service's flowCallId isn't available in the
      // HTTP response — we adopt it from the first stage event instead.
      const adoptedCallId = state.callId || event.callId;

      // Ignore events for a different call (after callId has been adopted)
      if (state.callId && event.callId !== state.callId) return state;

      const newNodes = updateNodeByIndex(state.nodes, event.stageIndex, () => ({
        status: mapEventStatus(event.status),
        durationMs: event.durationMs,
        error: event.error,
        metadata: event.metadata,
        ...(event.status === 'started' ? { startedAt: event.timestamp } : {}),
        ...(event.status === 'completed' || event.status === 'failed'
          ? { completedAt: event.timestamp }
          : {}),
      }));

      return { callId: adoptedCallId, nodes: newNodes };
    });
  },

  handleToolExecuting: (event: AgentToolExecutingEvent) => {
    set((state) => {
      const toolNode: ToolExecutionNode = {
        id: event.toolId || `tool-${Date.now()}`,
        toolName: event.toolName,
        parameters: (event.parameters as Record<string, unknown>) || null,
        status: 'executing',
        result: null,
        error: null,
        startedAt: event.timestamp,
        completedAt: null,
        durationMs: null,
      };

      const newNodes = updateNode(state.nodes, 'tool_execution', (node) => ({
        status: 'active' as FlowNodeStatus,
        startedAt: node.startedAt || event.timestamp,
        children: [...node.children, toolNode],
      }));

      return { nodes: newNodes };
    });
  },

  handleToolCompleted: (event: AgentToolCompletedEvent) => {
    set((state) => {
      const newNodes = updateNode(state.nodes, 'tool_execution', (node) => {
        const updatedChildren = node.children.map((child) => {
          if (child.id === event.toolId || child.toolName === event.toolName) {
            const startTime = child.startedAt ? new Date(child.startedAt).getTime() : 0;
            const endTime = new Date(event.timestamp).getTime();
            return {
              ...child,
              status: (event.success ? 'success' : 'error') as ToolExecutionNode['status'],
              result: event.result || null,
              error: event.error || null,
              completedAt: event.timestamp,
              durationMs: startTime ? endTime - startTime : null,
            };
          }
          return child;
        });

        // If all tools are done, mark stage as success
        const allDone = updatedChildren.every((c) => c.status !== 'executing');
        const anyError = updatedChildren.some((c) => c.status === 'error');

        return {
          children: updatedChildren,
          ...(allDone ? {
            status: (anyError ? 'error' : 'success') as FlowNodeStatus,
            completedAt: event.timestamp,
          } : {}),
        };
      });

      return { nodes: newNodes };
    });
  },

  inferFromCallStatus: (event: CallStatusUpdatedEvent) => {
    set((state) => {
      if (!state.isTracking) return state;

      const now = event.timestamp || new Date().toISOString();
      let newNodes = [...state.nodes];

      switch (event.status) {
        case 'initiated':
        case 'queued':
          // Mark initiation as active, set stages 0-1 in progress
          newNodes = updateNode(newNodes, 'initiation', () => ({
            status: 'active' as FlowNodeStatus,
            startedAt: now,
          }));
          break;

        case 'ringing':
          // Stages 0-4 completed, 5 active
          for (let i = 0; i <= 4; i++) {
            if (newNodes[i].status === 'pending' || newNodes[i].status === 'active') {
              newNodes = updateNodeByIndex(newNodes, i, () => ({
                status: (i === 2 ? 'skipped' : 'success') as FlowNodeStatus,
                completedAt: now,
              }));
            }
          }
          newNodes = updateNode(newNodes, 'call_placement', () => ({
            status: 'active' as FlowNodeStatus,
            startedAt: now,
          }));
          break;

        case 'in-progress':
          // Stages 0-5 completed, 6 active
          for (let i = 0; i <= 5; i++) {
            if (newNodes[i].status === 'pending' || newNodes[i].status === 'active') {
              newNodes = updateNodeByIndex(newNodes, i, () => ({
                status: (i === 2 ? 'skipped' : 'success') as FlowNodeStatus,
                completedAt: now,
              }));
            }
          }
          newNodes = updateNode(newNodes, 'conversation', () => ({
            status: 'active' as FlowNodeStatus,
            startedAt: now,
          }));
          break;

        case 'completed':
          // All stages completed
          newNodes = newNodes.map((node) => {
            if (node.status === 'pending' || node.status === 'active') {
              return {
                ...node,
                status: (node.id === 'voice_audio' ? 'skipped' : 'success') as FlowNodeStatus,
                completedAt: now,
              };
            }
            return node;
          });
          break;

        case 'failed':
        case 'busy':
        case 'no-answer':
        case 'canceled': {
          // Find the currently active node and mark it as error
          const activeIdx = newNodes.findIndex((n) => n.status === 'active');
          if (activeIdx >= 0) {
            newNodes = updateNodeByIndex(newNodes, activeIdx, () => ({
              status: 'error' as FlowNodeStatus,
              error: `Call ${event.status}${event.outcome ? `: ${event.outcome}` : ''}`,
              completedAt: now,
            }));
          } else {
            // No active node — mark call_placement as error
            newNodes = updateNode(newNodes, 'call_placement', () => ({
              status: 'error' as FlowNodeStatus,
              error: `Call ${event.status}`,
              completedAt: now,
            }));
          }
          break;
        }
      }

      return { nodes: newNodes };
    });
  },

  checkTimeouts: () => {
    set((state) => {
      if (!state.isTracking) return state;
      const now = Date.now();
      let changed = false;
      const newNodes = state.nodes.map((node) => {
        if (node.status === 'active' && node.startedAt) {
          const timeout = STAGE_TIMEOUTS[node.id] ?? DEFAULT_TIMEOUT_MS;
          const started = new Date(node.startedAt).getTime();
          if (now - started > timeout) {
            changed = true;
            return {
              ...node,
              status: 'error' as FlowNodeStatus,
              error: `Timed out after ${Math.round((now - started) / 1000)}s`,
              completedAt: new Date().toISOString(),
            };
          }
        }
        return node;
      });
      return changed ? { nodes: newNodes } : state;
    });
  },
}));

// Selector hooks
export const useFlowNodes = () => useCallFlowStore((s) => s.nodes);
export const useFlowCallId = () => useCallFlowStore((s) => s.callId);
export const useIsFlowTracking = () => useCallFlowStore((s) => s.isTracking);
