'use client';

/**
 * Shared lead-filter bar — search + industry + size + (optional) status.
 *
 * Used by:
 *  - TaggedLeadsList (primed-leads, personal-leads)
 *  - PipelineBoard (primed-pipeline, personal-pipeline)
 *  - /dashboard/pipeline (main Pipeline)
 *
 * UX matches the dropdowns on the main /dashboard/leads page so all sections
 * behave the same way.
 */

import { useMemo, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Factory, Users, Activity } from 'lucide-react';
import type { Lead } from '@/types/lead';

export const SIZE_RANGES: Record<string, { min?: number; max?: number; label: string }> = {
  all: { label: 'All Sizes' },
  '1-25': { min: 1, max: 25, label: '1-25' },
  '25-50': { min: 25, max: 50, label: '25-50' },
  '50-100': { min: 50, max: 100, label: '50-100' },
  '100-200': { min: 100, max: 200, label: '100-200' },
  '200-500': { min: 200, max: 500, label: '200-500' },
  '500-1000': { min: 500, max: 1000, label: '500-1,000' },
  '1000-5000': { min: 1000, max: 5000, label: '1,000-5,000' },
  '5000+': { min: 5000, label: '5,000+' },
};

export interface LeadFilters {
  search: string;
  industry: string;
  size: string;
  status: string;
}

const EMPTY_FILTERS: LeadFilters = {
  search: '',
  industry: 'all',
  size: 'all',
  status: 'all',
};

/**
 * Returns filtered leads + filter state + reset callback. Caller renders the
 * filter UI by mounting <LeadFilterBar filters=... onChange=... />.
 */
export function useLeadFilters(leads: Lead[]) {
  const [filters, setFilters] = useState<LeadFilters>(EMPTY_FILTERS);

  const industries = useMemo(() => {
    const s = new Set<string>();
    leads.forEach((l) => l.industry && s.add(l.industry));
    return Array.from(s).sort();
  }, [leads]);

  const statuses = useMemo(() => {
    const s = new Set<string>();
    leads.forEach((l) => l.status && s.add(l.status));
    return Array.from(s).sort();
  }, [leads]);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    const sizeRange = SIZE_RANGES[filters.size] || {};
    return leads.filter((l) => {
      if (q) {
        const haystack = `${l.firstName || ''} ${l.lastName || ''} ${l.email || ''} ${l.company || ''} ${l.phone || ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filters.industry !== 'all' && l.industry !== filters.industry) return false;
      if (filters.status !== 'all' && l.status !== filters.status) return false;
      if (sizeRange.min !== undefined || sizeRange.max !== undefined) {
        const emp = l.estimatedEmployees ?? null;
        if (emp === null) return false;
        if (sizeRange.min !== undefined && emp < sizeRange.min) return false;
        if (sizeRange.max !== undefined && emp >= sizeRange.max) return false;
      }
      return true;
    });
  }, [leads, filters]);

  const reset = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const activeCount = (
    (filters.search.trim() ? 1 : 0) +
    (filters.industry !== 'all' ? 1 : 0) +
    (filters.size !== 'all' ? 1 : 0) +
    (filters.status !== 'all' ? 1 : 0)
  );

  return { filters, setFilters, filtered, reset, industries, statuses, activeCount };
}

interface LeadFilterBarProps {
  filters: LeadFilters;
  onChange: (next: LeadFilters) => void;
  industries: string[];
  statuses?: string[];
  /** Show the status dropdown. Default true. Hide for views grouped by status (kanban). */
  showStatus?: boolean;
  activeCount: number;
  onReset: () => void;
  /** Optional extra controls (e.g., refresh button) rendered to the right. */
  rightSlot?: React.ReactNode;
  /** Visual theme: 'dark' for dashboard-dark, 'light' for HealthShield CRM light. */
  theme?: 'dark' | 'light';
}

export function LeadFilterBar({
  filters,
  onChange,
  industries,
  statuses = [],
  showStatus = true,
  activeCount,
  onReset,
  rightSlot,
  theme = 'dark',
}: LeadFilterBarProps) {
  const update = (patch: Partial<LeadFilters>) => onChange({ ...filters, ...patch });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[16rem]">
        <Search className={
          'absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 ' +
          (theme === 'dark' ? 'text-white/30' : 'text-gray-400')
        } />
        <Input
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          placeholder="Search name, email, company, phone..."
          className="pl-9 h-9"
        />
      </div>

      <Select value={filters.industry} onValueChange={(v) => update({ industry: v })}>
        <SelectTrigger className="w-44 h-9">
          <Factory className="w-3.5 h-3.5 mr-1.5" />
          <SelectValue placeholder="All Industries" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Industries</SelectItem>
          {industries.map((ind) => (
            <SelectItem key={ind} value={ind}>{ind}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.size} onValueChange={(v) => update({ size: v })}>
        <SelectTrigger className="w-40 h-9">
          <Users className="w-3.5 h-3.5 mr-1.5" />
          <SelectValue placeholder="All Sizes" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(SIZE_RANGES).map(([key, range]) => (
            <SelectItem key={key} value={key}>{range.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showStatus && (
        <Select value={filters.status} onValueChange={(v) => update({ status: v })}>
          <SelectTrigger className="w-40 h-9">
            <Activity className="w-3.5 h-3.5 mr-1.5" />
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {activeCount > 0 && (
        <Button variant="ghost" size="sm" onClick={onReset} className="h-9 text-xs">
          Clear ({activeCount})
        </Button>
      )}

      {rightSlot}
    </div>
  );
}
