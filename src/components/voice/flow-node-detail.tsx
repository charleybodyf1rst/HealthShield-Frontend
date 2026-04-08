'use client';

import type { FlowNode, ToolExecutionNode } from '@/types/call-flow';

interface FlowNodeDetailProps {
  node: FlowNode;
}

function formatJson(data: unknown): string {
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}

function ToolRow({ tool }: { tool: ToolExecutionNode }) {
  const statusColor = {
    executing: 'text-blue-400',
    success: 'text-green-400',
    error: 'text-red-400',
    denied: 'text-yellow-400',
  }[tool.status];

  return (
    <div className="flex items-center justify-between py-1 text-xs">
      <span className={statusColor}>{tool.toolName}</span>
      <span className="text-slate-500">
        {tool.durationMs != null ? `${tool.durationMs}ms` : tool.status}
      </span>
    </div>
  );
}

export function FlowNodeDetail({ node }: FlowNodeDetailProps) {
  return (
    <div className="mt-2 p-3 bg-slate-900/80 rounded-lg border border-slate-700/50 text-xs space-y-2 animate-fade-in">
      <div className="flex items-center justify-between text-slate-400">
        <span>Stage {node.index + 1} of 10</span>
        {node.durationMs != null && (
          <span className="font-mono">{node.durationMs < 1000 ? `${Math.round(node.durationMs)}ms` : `${(node.durationMs / 1000).toFixed(2)}s`}</span>
        )}
      </div>

      <p className="text-slate-300">{node.description}</p>

      {node.error && (
        <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-red-300">
          {node.error}
        </div>
      )}

      {node.children.length > 0 && (
        <div className="space-y-1 border-t border-slate-700/50 pt-2">
          <p className="text-slate-400 font-medium">Tools ({node.children.length})</p>
          {node.children.map((tool) => (
            <ToolRow key={tool.id} tool={tool} />
          ))}
        </div>
      )}

      {node.metadata && Object.keys(node.metadata).length > 0 && (
        <details className="group">
          <summary className="text-slate-500 cursor-pointer hover:text-slate-300 select-none">
            Raw metadata
          </summary>
          <pre className="mt-1 p-2 bg-slate-950 rounded text-slate-400 overflow-x-auto max-h-40 text-[10px] leading-4">
            {formatJson(node.metadata)}
          </pre>
        </details>
      )}
    </div>
  );
}
