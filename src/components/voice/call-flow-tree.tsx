'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircle2, XCircle, Loader2, MinusCircle, Circle,
  ChevronDown, ChevronRight, Activity, Copy, Check,
  List, GitBranch,
} from 'lucide-react';
import type { FlowNode, FlowNodeStatus, ToolExecutionNode } from '@/types/call-flow';
import type { LogEntry, LogFilter } from '@/stores/call-event-log-store';
import { FlowNodeDetail } from './flow-node-detail';
import { CallEventLog } from './call-event-log';

type ViewMode = 'tree' | 'logs';

interface CallFlowTreeProps {
  nodes: FlowNode[];
  isCallActive: boolean;
  callId: string | null;
  trackingStartedAt?: string | null;
  logEntries?: LogEntry[];
  logFilter?: LogFilter;
  onSetLogFilter?: (filter: Partial<LogFilter>) => void;
  onClearLog?: () => void;
  className?: string;
}

// Status icon for each node state
function StatusIcon({ status }: { status: FlowNodeStatus }) {
  switch (status) {
    case 'success':
      return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    case 'error':
      return <XCircle className="w-4 h-4 text-red-400" />;
    case 'active':
      return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
    case 'skipped':
      return <MinusCircle className="w-4 h-4 text-slate-500" />;
    default:
      return <Circle className="w-4 h-4 text-slate-600" />;
  }
}

// Connector line between nodes
function ConnectorLine({ status }: { status: FlowNodeStatus }) {
  const colorClass = {
    success: 'bg-green-500/40',
    error: 'bg-red-500/40',
    active: 'bg-blue-500/40',
    skipped: 'bg-slate-700/40',
    pending: 'bg-slate-800/40',
  }[status];

  return <div className={`w-0.5 h-3 ml-[7px] ${colorClass}`} />;
}

// Format duration for display
function formatDuration(ms: number | null): string {
  if (ms == null) return '';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

// Format elapsed time
function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Tool child node row
function ToolChildNode({ tool }: { tool: ToolExecutionNode }) {
  const statusConfig = {
    executing: { icon: Loader2, color: 'text-blue-400', spin: true },
    success: { icon: CheckCircle2, color: 'text-green-400', spin: false },
    error: { icon: XCircle, color: 'text-red-400', spin: false },
    denied: { icon: MinusCircle, color: 'text-yellow-400', spin: false },
  }[tool.status];

  const Icon = statusConfig.icon;

  return (
    <div className="flex items-center gap-2 ml-6 py-1">
      <div className="w-3 h-px bg-slate-700" />
      <Icon className={`w-3 h-3 ${statusConfig.color} ${statusConfig.spin ? 'animate-spin' : ''} flex-shrink-0`} />
      <span className="text-xs text-slate-300 truncate flex-1">{tool.toolName}</span>
      {tool.durationMs != null && (
        <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">{formatDuration(tool.durationMs)}</span>
      )}
      {tool.error && (
        <span className="text-[10px] text-red-400 truncate max-w-[100px]">{tool.error}</span>
      )}
    </div>
  );
}

// Single flow node row
function FlowNodeRow({ node, isLast }: { node: FlowNode; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = node.status !== 'pending' || node.children.length > 0;

  const bgClass = {
    success: 'bg-green-500/5 border-green-500/20',
    error: 'bg-red-500/5 border-red-500/20',
    active: 'bg-blue-500/5 border-blue-500/20',
    skipped: 'bg-slate-800/30 border-slate-700/20',
    pending: 'bg-slate-800/20 border-slate-800/30',
  }[node.status];

  const StageIcon = node.icon;

  return (
    <div>
      <button
        type="button"
        onClick={() => hasDetails && setExpanded(!expanded)}
        disabled={!hasDetails}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left ${bgClass} ${
          hasDetails ? 'cursor-pointer hover:border-slate-600' : 'cursor-default'
        } ${node.status === 'active' ? 'ring-1 ring-blue-500/30' : ''}`}
      >
        {/* Status indicator */}
        <StatusIcon status={node.status} />

        {/* Stage icon */}
        <StageIcon className={`w-3.5 h-3.5 flex-shrink-0 ${
          node.status === 'pending' ? 'text-slate-600' : 'text-slate-400'
        }`} />

        {/* Label */}
        <span className={`text-sm flex-1 truncate ${
          node.status === 'pending' ? 'text-slate-600' : 'text-slate-200'
        }`}>
          {node.label}
        </span>

        {/* Duration / status text */}
        <span className="text-xs font-mono text-slate-500 flex-shrink-0">
          {node.status === 'active' && '...'}
          {node.status === 'skipped' && 'skip'}
          {node.durationMs != null && formatDuration(node.durationMs)}
        </span>

        {/* Expand chevron */}
        {hasDetails && (
          expanded
            ? <ChevronDown className="w-3 h-3 text-slate-500 flex-shrink-0" />
            : <ChevronRight className="w-3 h-3 text-slate-500 flex-shrink-0" />
        )}
      </button>

      {/* Error inline preview (always visible without expanding) */}
      {node.error && !expanded && (
        <p className="ml-9 mt-1 text-xs text-red-400 truncate">{node.error}</p>
      )}

      {/* Tool children (always visible when present — Phase 5b fix) */}
      {node.children.length > 0 && (
        <div className="mt-0.5">
          {node.children.map((tool) => (
            <ToolChildNode key={tool.id} tool={tool} />
          ))}
        </div>
      )}

      {/* Waiting for tools placeholder */}
      {node.id === 'tool_execution' && node.status === 'active' && node.children.length === 0 && (
        <p className="ml-9 mt-1 text-[10px] text-slate-500 italic">Waiting for tool calls...</p>
      )}

      {/* Expanded detail */}
      {expanded && <FlowNodeDetail node={node} />}

      {/* Connector line to next node */}
      {!isLast && <ConnectorLine status={node.status} />}
    </div>
  );
}

export function CallFlowTree({
  nodes,
  isCallActive,
  callId,
  trackingStartedAt,
  logEntries = [],
  logFilter = { level: 'all', category: 'all' },
  onSetLogFilter,
  onClearLog,
  className = '',
}: CallFlowTreeProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);

  // Guard against undefined nodes
  const safeNodes = nodes || [];
  const activeNode = safeNodes.find((n) => n.status === 'active');
  const completedCount = safeNodes.filter((n) => n.status === 'success').length;
  const errorCount = safeNodes.filter((n) => n.status === 'error').length;
  const totalToolCalls = safeNodes.reduce((sum, n) => sum + n.children.length, 0);

  // Live elapsed timer (Phase 5b)
  useEffect(() => {
    if (!isCallActive || !trackingStartedAt) {
      setElapsed(0);
      return;
    }
    const startMs = new Date(trackingStartedAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - startMs) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isCallActive, trackingStartedAt]);

  // Copy debug JSON (Phase 5b)
  const handleCopyDebug = async () => {
    const debug = {
      callId,
      isCallActive,
      elapsed,
      trackingStartedAt,
      nodes: safeNodes.map((n) => ({
        id: n.id,
        label: n.label,
        status: n.status,
        durationMs: n.durationMs,
        error: n.error,
        children: n.children.length,
      })),
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(debug, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard not available */ }
  };

  const logErrorCount = logEntries.filter((e) => e.level === 'error').length;

  return (
    <div className={`bg-dark-card border border-dark-border rounded-xl overflow-hidden flex flex-col ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-dark-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className={`w-4 h-4 ${isCallActive ? 'text-blue-400 animate-pulse' : 'text-slate-500'}`} />
          <span className="text-sm font-medium text-slate-200">Call Flow</span>
          {isCallActive && elapsed > 0 && (
            <span className="text-[10px] font-mono text-slate-500">{formatElapsed(elapsed)}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {isCallActive ? (
            <>
              {activeNode && (
                <span className="text-xs text-blue-400 truncate max-w-[80px]">{activeNode.label}</span>
              )}
              <span className="text-xs text-slate-500">{completedCount}/10</span>
            </>
          ) : callId ? (
            <>
              {errorCount > 0 ? (
                <span className="text-xs text-red-400">{errorCount} failed</span>
              ) : (
                <span className="text-xs text-green-400">Complete</span>
              )}
              {totalToolCalls > 0 && (
                <span className="text-xs text-slate-500">{totalToolCalls} tools</span>
              )}
            </>
          ) : (
            <span className="text-xs text-slate-600">No active call</span>
          )}
          {/* Copy debug (Phase 5b) */}
          <button
            type="button"
            onClick={handleCopyDebug}
            className="p-1 rounded hover:bg-slate-700 transition-colors"
            title="Copy debug JSON"
          >
            {copied
              ? <Check className="w-3 h-3 text-green-400" />
              : <Copy className="w-3 h-3 text-slate-500" />
            }
          </button>
        </div>
      </div>

      {/* View mode toggle */}
      <div className="flex border-b border-dark-border">
        <button
          type="button"
          onClick={() => setViewMode('tree')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs transition-colors ${
            viewMode === 'tree'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <GitBranch className="w-3 h-3" />
          Tree
        </button>
        <button
          type="button"
          onClick={() => setViewMode('logs')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs transition-colors ${
            viewMode === 'logs'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <List className="w-3 h-3" />
          Logs
          {logErrorCount > 0 && (
            <span className="px-1 py-0.5 text-[9px] rounded bg-red-500/20 text-red-300">{logErrorCount}</span>
          )}
          {logEntries.length > 0 && logErrorCount === 0 && (
            <span className="px-1 py-0.5 text-[9px] rounded bg-slate-600/40 text-slate-400">{logEntries.length}</span>
          )}
        </button>
      </div>

      {/* Content area */}
      {viewMode === 'tree' ? (
        <div className="p-3 space-y-0.5 overflow-y-auto">
          {safeNodes.map((node, idx) => (
            <FlowNodeRow key={node.id} node={node} isLast={idx === safeNodes.length - 1} />
          ))}
        </div>
      ) : (
        <CallEventLog
          entries={logEntries}
          filter={logFilter}
          onSetFilter={onSetLogFilter || (() => {})}
          onClear={onClearLog || (() => {})}
          className="min-h-[300px]"
        />
      )}
    </div>
  );
}
