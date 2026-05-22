'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Layers, Palette, Search, PanelRightOpen, PanelRightClose } from 'lucide-react';
import type { MapFilters } from '@/hooks/useLeadsMap';

const LeadsMap = dynamic(() => import('@/components/crm/LeadsMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-gray-500 text-sm">
      Loading map…
    </div>
  ),
});

export type ColorMode = 'status' | 'employees';

interface PipelineDef {
  tag: string;
  label: string;
  color: string;
}

const PIPELINES: PipelineDef[] = [
  { tag: 'primed', label: 'Primed', color: 'text-cyan-700 bg-cyan-50 border-cyan-300' },
  { tag: 'personal', label: 'Personal', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' },
  { tag: 'hr-staffing', label: 'HR Staffing', color: 'text-purple-700 bg-purple-50 border-purple-300' },
  { tag: 'insurance-broker', label: 'Insurance Broker', color: 'text-orange-700 bg-orange-50 border-orange-300' },
];

const STATUS_OPTIONS = ['new', 'contacted', 'qualified', 'quoted', 'negotiating', 'converted', 'lost', 'unresponsive'];
const PRIORITY_OPTIONS = ['hot', 'warm', 'cold'];

export function MapTab() {
  // Default to ALL pipelines visible
  const [tagFilter, setTagFilter] = useState<string[]>(PIPELINES.map((p) => p.tag));
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [colorBy, setColorBy] = useState<ColorMode>('employees');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidePanelOpen, setSidePanelOpen] = useState(false);

  const filters: MapFilters = {
    status: statusFilter,
    priority: priorityFilter,
    tags: tagFilter,
  };

  const toggle = (value: string, current: string[], setter: (v: string[]) => void) => {
    setter(current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
  };

  const allPipelines = PIPELINES.every((p) => tagFilter.includes(p.tag));
  const togglePipelineAll = () => {
    setTagFilter(allPipelines ? [] : PIPELINES.map((p) => p.tag));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] gap-3">
      {/* Top bar: pipelines + color mode */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        {/* Pipelines */}
        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2">
          <Layers className="w-3.5 h-3.5 text-white/60" />
          <span className="text-white/60 font-medium">Pipelines:</span>
          <button
            type="button"
            onClick={togglePipelineAll}
            className="text-[10px] text-white/50 hover:text-white underline underline-offset-2"
          >
            {allPipelines ? 'none' : 'all'}
          </button>
          <div className="flex flex-wrap gap-1">
            {PIPELINES.map((p) => {
              const active = tagFilter.includes(p.tag);
              return (
                <button
                  key={p.tag}
                  type="button"
                  onClick={() => toggle(p.tag, tagFilter, setTagFilter)}
                  className={
                    'px-2.5 py-0.5 rounded-full border text-xs transition-colors ' +
                    (active
                      ? p.color
                      : 'bg-transparent border-white/15 text-white/50 hover:bg-white/5')
                  }
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Color by */}
        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2">
          <Palette className="w-3.5 h-3.5 text-white/60" />
          <span className="text-white/60 font-medium">Color by:</span>
          <div className="flex gap-1">
            {(['employees', 'status'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setColorBy(mode)}
                className={
                  'px-2.5 py-0.5 rounded-full border text-xs transition-colors capitalize ' +
                  (colorBy === mode
                    ? 'bg-blue-500/20 border-blue-400/40 text-blue-200'
                    : 'bg-transparent border-white/15 text-white/50 hover:bg-white/5')
                }
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 flex-1 min-w-[200px] max-w-md">
          <Search className="w-3.5 h-3.5 text-white/60 flex-shrink-0" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company name…"
            aria-label="Search lead company names"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-[10px] text-white/40 hover:text-white"
            >
              clear
            </button>
          )}
        </div>

        {/* Side panel toggle */}
        <button
          type="button"
          onClick={() => setSidePanelOpen((v) => !v)}
          className={
            'flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs border transition-colors ' +
            (sidePanelOpen
              ? 'bg-blue-500/20 border-blue-400/40 text-blue-200'
              : 'bg-white/[0.04] border-white/10 text-white/60 hover:text-white')
          }
          title={sidePanelOpen ? 'Close visible-area panel' : 'Open visible-area panel'}
        >
          {sidePanelOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
          Visible leads
        </button>
      </div>

      {/* Secondary filter row */}
      <div className="flex flex-wrap gap-3 text-xs">
        <FilterGroup
          label="Status"
          options={STATUS_OPTIONS}
          selected={statusFilter}
          onToggle={(v) => toggle(v, statusFilter, setStatusFilter)}
        />
        <FilterGroup
          label="Priority"
          options={PRIORITY_OPTIONS}
          selected={priorityFilter}
          onToggle={(v) => toggle(v, priorityFilter, setPriorityFilter)}
        />
      </div>

      <div className="flex-1 min-h-0 rounded-lg overflow-hidden border border-white/10 bg-white">
        <LeadsMap
          filters={filters}
          colorBy={colorBy}
          searchQuery={searchQuery}
          sidePanelOpen={sidePanelOpen}
        />
      </div>
    </div>
  );
}

interface FilterGroupProps {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}

function FilterGroup({ label, options, selected, onToggle }: FilterGroupProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-white/50 font-medium">{label}:</span>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={
                'px-2 py-0.5 rounded-full border text-xs transition-colors capitalize ' +
                (active
                  ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-200'
                  : 'bg-transparent border-white/15 text-white/50 hover:bg-white/5')
              }
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
