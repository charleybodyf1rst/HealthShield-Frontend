'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Info, AlertTriangle, XCircle, Bug, Copy, Check,
  ChevronDown, ChevronRight, Trash2, Filter,
} from 'lucide-react';
import type { LogEntry, LogLevel, LogCategory, LogFilter } from '@/stores/call-event-log-store';

interface CallEventLogProps {
  entries: LogEntry[];
  filter: LogFilter;
  onSetFilter: (filter: Partial<LogFilter>) => void;
  onClear: () => void;
  className?: string;
}

// Level icon + color config
const levelConfig: Record<LogLevel, { icon: typeof Info; color: string; bg: string }> = {
  info: { icon: Info, color: 'text-slate-400', bg: 'bg-slate-500/10' },
  warn: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  debug: { icon: Bug, color: 'text-blue-400', bg: 'bg-blue-500/10' },
};

// Category badge colors
const categoryColors: Record<LogCategory, string> = {
  stage: 'bg-purple-500/20 text-purple-300',
  tool: 'bg-cyan-500/20 text-cyan-300',
  diagnostic: 'bg-amber-500/20 text-amber-300',
  status: 'bg-green-500/20 text-green-300',
  state: 'bg-slate-500/20 text-slate-300',
};

// Filter options
const levelOptions: Array<{ value: LogFilter['level']; label: string }> = [
  { value: 'all', label: 'All Levels' },
  { value: 'error', label: 'Errors' },
  { value: 'warn', label: 'Warnings' },
  { value: 'info', label: 'Info' },
  { value: 'debug', label: 'Debug' },
];

const categoryOptions: Array<{ value: LogFilter['category']; label: string }> = [
  { value: 'all', label: 'All Categories' },
  { value: 'stage', label: 'Stages' },
  { value: 'tool', label: 'Tools' },
  { value: 'diagnostic', label: 'Diagnostics' },
  { value: 'status', label: 'Status' },
  { value: 'state', label: 'State' },
];

function formatTime(timestamp: string): string {
  try {
    const d = new Date(timestamp);
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      + '.' + String(d.getMilliseconds()).padStart(3, '0');
  } catch {
    return '--:--:--';
  }
}

function formatJson(data: unknown): string {
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}

// Single log entry row
function LogEntryRow({ entry }: { entry: LogEntry }) {
  const [expanded, setExpanded] = useState(false);
  const config = levelConfig[entry.level];
  const Icon = config.icon;
  const hasData = entry.data && Object.keys(entry.data).length > 0;

  return (
    <div className={`group ${config.bg} rounded px-2 py-1.5 transition-colors`}>
      <button
        type="button"
        onClick={() => hasData && setExpanded(!expanded)}
        disabled={!hasData}
        className="w-full flex items-start gap-1.5 text-left"
      >
        {/* Level icon */}
        <Icon className={`w-3 h-3 mt-0.5 flex-shrink-0 ${config.color}`} />

        {/* Timestamp */}
        <span className="text-[10px] font-mono text-slate-500 flex-shrink-0 mt-px">
          {formatTime(entry.timestamp)}
        </span>

        {/* Category badge */}
        <span className={`text-[9px] px-1 rounded flex-shrink-0 mt-px ${categoryColors[entry.category]}`}>
          {entry.category}
        </span>

        {/* Message */}
        <span className="text-xs text-slate-300 flex-1 break-words leading-4">
          {entry.message}
        </span>

        {/* Expand chevron */}
        {hasData && (
          expanded
            ? <ChevronDown className="w-3 h-3 text-slate-600 flex-shrink-0 mt-0.5" />
            : <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </button>

      {/* Expanded data */}
      {expanded && entry.data && (
        <pre className="mt-1 ml-5 p-2 bg-slate-950 rounded text-[10px] text-slate-400 overflow-x-auto max-h-32 leading-4 font-mono">
          {formatJson(entry.data)}
        </pre>
      )}
    </div>
  );
}

export function CallEventLog({
  entries,
  filter,
  onSetFilter,
  onClear,
  className = '',
}: CallEventLogProps) {
  // Guard against undefined props
  const safeEntries = entries || [];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Auto-scroll to bottom when new entries arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [safeEntries.length, autoScroll]);

  // Detect manual scroll to disable auto-scroll
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 40;
    setAutoScroll(isAtBottom);
  };

  // Copy all entries as text
  const handleCopy = async () => {
    const text = entries
      .map((e) => `[${formatTime(e.timestamp)}] [${e.level.toUpperCase()}] [${e.category}] ${e.message}${e.data ? '\n  ' + JSON.stringify(e.data) : ''}`)
      .join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  };

  const errorCount = safeEntries.filter((e) => e.level === 'error').length;
  const warnCount = safeEntries.filter((e) => e.level === 'warn').length;

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-dark-border">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            {safeEntries.length} event{safeEntries.length !== 1 ? 's' : ''}
          </span>
          {errorCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300">
              {errorCount} error{errorCount !== 1 ? 's' : ''}
            </span>
          )}
          {warnCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300">
              {warnCount} warn{warnCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1 rounded hover:bg-slate-700 transition-colors ${showFilters ? 'bg-slate-700' : ''}`}
            title="Filter"
          >
            <Filter className="w-3 h-3 text-slate-400" />
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded hover:bg-slate-700 transition-colors"
            title="Copy all"
          >
            {copied
              ? <Check className="w-3 h-3 text-green-400" />
              : <Copy className="w-3 h-3 text-slate-400" />
            }
          </button>
          <button
            type="button"
            onClick={onClear}
            className="p-1 rounded hover:bg-slate-700 transition-colors"
            title="Clear log"
          >
            <Trash2 className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-dark-border bg-slate-900/50">
          <select
            value={filter.level}
            onChange={(e) => onSetFilter({ level: e.target.value as LogFilter['level'] })}
            className="text-[10px] bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-slate-300"
          >
            {levelOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={filter.category}
            onChange={(e) => onSetFilter({ category: e.target.value as LogFilter['category'] })}
            className="text-[10px] bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-slate-300"
          >
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Log entries */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-0.5 font-mono"
      >
        {safeEntries.length === 0 ? (
          <p className="text-xs text-slate-600 text-center py-4">
            No events yet. Start a call to see diagnostic logs.
          </p>
        ) : (
          safeEntries.map((entry) => (
            <LogEntryRow key={entry.id} entry={entry} />
          ))
        )}
      </div>

      {/* Auto-scroll indicator */}
      {!autoScroll && safeEntries.length > 0 && (
        <button
          type="button"
          onClick={() => {
            setAutoScroll(true);
            if (scrollRef.current) {
              scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
          }}
          className="mx-2 mb-2 py-1 text-[10px] text-center text-blue-400 bg-blue-500/10 rounded hover:bg-blue-500/20 transition-colors"
        >
          Scroll to latest
        </button>
      )}
    </div>
  );
}
