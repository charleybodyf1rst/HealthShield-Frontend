'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Tag } from 'lucide-react';
import type { MapFilters } from '@/hooks/useLeadsMap';

const LeadsMap = dynamic(() => import('@/components/crm/LeadsMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-gray-500 text-sm">
      Loading map…
    </div>
  ),
});

const STATUS_OPTIONS = ['new', 'contacted', 'qualified', 'quoted', 'negotiating', 'converted', 'lost', 'unresponsive'];
const PRIORITY_OPTIONS = ['hot', 'warm', 'cold'];
const TAG_PRESETS = ['personal', 'hit-list-2026-05-20', 'high-target', 'mid-target', 'ideal-fit'];

export function MapTab() {
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  // Default to personal tag — Charley's run sheet
  const [tagFilter, setTagFilter] = useState<string[]>(['personal']);

  const filters: MapFilters = {
    status: statusFilter,
    priority: priorityFilter,
    tags: tagFilter,
  };

  const toggle = (value: string, current: string[], setter: (v: string[]) => void) => {
    setter(current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)] gap-3">
      {/* Filter bar */}
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
        <FilterGroup
          label="Tags"
          options={TAG_PRESETS}
          selected={tagFilter}
          onToggle={(v) => toggle(v, tagFilter, setTagFilter)}
          icon={<Tag className="w-3 h-3" />}
        />
      </div>

      <div className="flex-1 min-h-0 rounded-lg overflow-hidden border border-gray-200 bg-white">
        <LeadsMap filters={filters} />
      </div>
    </div>
  );
}

interface FilterGroupProps {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  icon?: React.ReactNode;
}

function FilterGroup({ label, options, selected, onToggle, icon }: FilterGroupProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1 text-gray-500 font-medium">
        {icon}
        {label}:
      </span>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={
                'px-2 py-0.5 rounded-full border text-xs transition-colors ' +
                (active
                  ? 'bg-cyan-50 border-cyan-300 text-cyan-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50')
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
