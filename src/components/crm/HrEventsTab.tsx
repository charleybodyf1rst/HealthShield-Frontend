'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  ExternalLink,
  Star,
  AlertCircle,
  X,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useUpcomingCrmEvents, type CrmEvent } from '@/hooks/useCrmEvents';
import { cn } from '@/lib/utils';

const PRIORITY_LABEL: Record<string, string> = {
  'must-attend': '⭐ Must Attend',
  'worth-evaluating': 'Worth Evaluating',
  'skip': 'Skip Unless Free',
};

const PRIORITY_ORDER: Array<'must-attend' | 'worth-evaluating' | 'skip'> = [
  'must-attend',
  'worth-evaluating',
  'skip',
];

const TYPE_COLORS: Record<string, string> = {
  conference: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  expo: 'bg-pink-500/20 text-pink-300 border border-pink-500/30',
  seminar: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  workshop: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
  webinar: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  chapter_meeting: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  networking_mixer: 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30',
};

interface HrEventsTabProps {
  /** Backend tag filter. Defaults to 'hr-event'; pass 'business-networking' etc. */
  tag?: string;
  /** Lookback window in days; defaults to 180. */
  withinDays?: number;
  /** Label for the budget metric in the header. */
  budgetLabel?: string;
}

export function HrEventsTab({ tag = 'hr-event', withinDays = 180, budgetLabel = 'Total must-attend booth budget' }: HrEventsTabProps = {}) {
  const { events, isLoading, error, reload } = useUpcomingCrmEvents(withinDays, tag);
  const [cityFilter, setCityFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [hidePast, setHidePast] = useState(true);

  const cities = useMemo(() => {
    const s = new Set<string>();
    events.forEach((e) => e.city && s.add(e.city));
    return Array.from(s).sort();
  }, [events]);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (cityFilter && e.city !== cityFilter) return false;
      if (priorityFilter && e.priority !== priorityFilter) return false;
      if (hidePast && e.status === 'past') return false;
      return true;
    });
  }, [events, cityFilter, priorityFilter, hidePast]);

  const grouped = useMemo(() => {
    const out: Record<string, CrmEvent[]> = {
      'must-attend': [],
      'worth-evaluating': [],
      'skip': [],
      'unclassified': [],
    };
    filtered.forEach((e) => {
      const key = (e.priority && out[e.priority] !== undefined) ? e.priority : 'unclassified';
      out[key].push(e);
    });
    // Sort within each group by date
    Object.values(out).forEach((arr) => arr.sort((a, b) => a.start_date.localeCompare(b.start_date)));
    return out;
  }, [filtered]);

  const totalBoothCost = useMemo(
    () => filtered
      .filter((e) => e.priority === 'must-attend')
      .reduce((sum, e) => sum + (Number(e.cost_booth) || 0), 0),
    [filtered],
  );

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-6 border border-amber-500/30 bg-amber-500/[0.08]">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-amber-200">Failed to load HR Events</div>
              <div className="text-amber-100/80 mt-1">{error.message}</div>
              <div className="text-amber-200/60 mt-2 text-xs">
                If you see a 404, the backend deploy may still be in flight. The new <code className="px-1 rounded bg-white/10">/api/v1/crm/events</code> route
                comes online once Cloud Build finishes (~5-10 min after push).
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)] gap-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-white/70">
          <span className="text-white/50">Events in window:</span>{' '}
          <strong className="text-white">{filtered.length}</strong>
          <span className="text-white/30 mx-2">·</span>
          <span className="text-white/50">{budgetLabel}:</span>{' '}
          <strong className="text-white">${totalBoothCost.toLocaleString()}</strong>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs text-white/60">
            <input
              type="checkbox"
              checked={hidePast}
              onChange={(e) => setHidePast(e.target.checked)}
              className="rounded"
            />
            Hide past
          </label>
          <Button variant="ghost" size="sm" onClick={reload} disabled={isLoading}>
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-3 text-xs">
        <FilterGroup
          label="Priority"
          options={['must-attend', 'worth-evaluating', 'skip']}
          selected={priorityFilter}
          onSelect={setPriorityFilter}
        />
        <FilterGroup
          label="City"
          options={cities}
          selected={cityFilter}
          onSelect={setCityFilter}
        />
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center h-32 text-white/50 text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading events…
          </div>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="text-sm text-white/50 text-center py-12">
            No events match the current filters.
          </div>
        )}
        {!isLoading && PRIORITY_ORDER.map((p) => {
          const list = grouped[p] ?? [];
          if (list.length === 0) return null;
          return (
            <div key={p} className="mb-6">
              <h2 className="font-semibold text-sm text-white mb-2 flex items-center gap-2">
                {p === 'must-attend' && <Star className="w-4 h-4 text-amber-400" />}
                {PRIORITY_LABEL[p]}
                <Badge variant="outline" className="text-xs border-white/20 text-white/70 bg-transparent">{list.length}</Badge>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {list.map((e) => <EventCard key={e.id} event={e} />)}
              </div>
            </div>
          );
        })}
        {!isLoading && grouped.unclassified.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold text-sm text-white mb-2">Unclassified</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {grouped.unclassified.map((e) => <EventCard key={e.id} event={e} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface FilterGroupProps {
  label: string;
  options: string[];
  selected: string | null;
  onSelect: (value: string | null) => void;
}

function FilterGroup({ label, options, selected, onSelect }: FilterGroupProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-white/50 font-medium">{label}:</span>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => {
          const active = selected === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onSelect(active ? null : opt)}
              className={
                'px-2.5 py-1 rounded-full border text-xs transition-colors ' +
                (active
                  ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200'
                  : 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.06] hover:border-white/20')
              }
            >
              {opt}
            </button>
          );
        })}
        {selected && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="px-2 py-1 rounded-full text-xs text-white/40 hover:text-white/70 flex items-center gap-1"
            title="Clear filter"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

function EventCard({ event }: { event: CrmEvent }) {
  const start = new Date(event.start_date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
  const end = event.end_date
    ? new Date(event.end_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;
  const dateRange = end && end !== start ? `${start} → ${end}` : start;

  const isMust = event.priority === 'must-attend';
  const typeColor = TYPE_COLORS[event.type] ?? 'bg-slate-100 text-slate-700';

  const attendees = event.expected_attendees ?? null;
  const costAttend = event.cost_attendance ? Number(event.cost_attendance) : null;
  const costBooth = event.cost_booth ? Number(event.cost_booth) : null;

  return (
    <Card className={cn(
      'p-4 flex flex-col transition-all border bg-white/[0.02] hover:bg-white/[0.04]',
      isMust ? 'border-amber-400/40 bg-amber-500/[0.05] hover:border-amber-400/60' : 'border-white/10 hover:border-white/20',
    )}>
      {/* Prominent date chip — visual anchor of each card */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.06] border border-white/10 text-xs font-semibold text-white">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          {dateRange}
        </div>
        {isMust && <Star className="w-4 h-4 text-amber-400 flex-shrink-0" fill="currentColor" />}
      </div>

      <h3 className="font-semibold text-sm text-white leading-tight mb-2.5">{event.name}</h3>

      <div className="flex flex-wrap gap-1 mb-3">
        <Badge className={cn(typeColor, 'text-xs')}>{event.type.replace('_', ' ')}</Badge>
        {event.status === 'live' && <Badge className="bg-red-500/20 text-red-300 border border-red-500/30 text-xs">LIVE</Badge>}
      </div>

      <div className="space-y-1.5 text-xs text-white/75 mb-3 flex-1">
        {(event.location_name || event.city) && (
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-white/40 flex-shrink-0 mt-0.5" />
            <span>
              {event.location_name && <span className="block text-white/80">{event.location_name}</span>}
              {event.city && <span className="text-white/55">{[event.city, event.state].filter(Boolean).join(', ')}</span>}
            </span>
          </div>
        )}
        {attendees !== null && (
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
            <span>~{attendees.toLocaleString()} attendees</span>
          </div>
        )}
        {(costAttend !== null || costBooth !== null) && (
          <div className="flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
            <span>
              {costAttend !== null && <>attend <span className="text-emerald-300">${costAttend.toLocaleString()}</span></>}
              {costAttend !== null && costBooth !== null && <span className="text-white/30 mx-1">·</span>}
              {costBooth !== null && <>booth <span className="text-amber-300">${costBooth.toLocaleString()}</span></>}
            </span>
          </div>
        )}
        {event.target_audience && (
          <div className="text-white/45 italic line-clamp-2 mt-1.5">{event.target_audience}</div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-auto pt-2.5 border-t border-white/10">
        {event.registration_url && (
          <a
            href={event.registration_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-xs py-1.5 px-2 rounded bg-cyan-500/15 text-cyan-200 border border-cyan-500/30 hover:bg-cyan-500/25 hover:border-cyan-400/50 transition"
          >
            Register
          </a>
        )}
        {event.booth_info_url && (
          <a
            href={event.booth_info_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-xs py-1.5 px-2 rounded bg-amber-500/15 text-amber-200 border border-amber-500/30 hover:bg-amber-500/25 hover:border-amber-400/50 transition"
          >
            Booth Info
          </a>
        )}
        {event.website && !event.registration_url && (
          <a
            href={event.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-xs py-1.5 px-2 rounded bg-white/[0.05] text-white/80 border border-white/10 hover:bg-white/[0.1] transition flex items-center justify-center gap-1"
          >
            <ExternalLink className="w-3 h-3" /> Website
          </a>
        )}
      </div>
    </Card>
  );
}
