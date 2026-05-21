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
  conference: 'bg-purple-100 text-purple-700',
  expo: 'bg-pink-100 text-pink-700',
  seminar: 'bg-blue-100 text-blue-700',
  workshop: 'bg-cyan-100 text-cyan-700',
  webinar: 'bg-emerald-100 text-emerald-700',
  chapter_meeting: 'bg-amber-100 text-amber-700',
};

export function HrEventsTab() {
  const { events, isLoading, error, reload } = useUpcomingCrmEvents(180);
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
        <Card className="p-6 border-amber-200 bg-amber-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-amber-900">Failed to load HR Events</div>
              <div className="text-amber-700 mt-1">{error.message}</div>
              <div className="text-amber-600 mt-2 text-xs">
                If you see a 404, the Phase 2 backend deploy is still in flight. The new <code>/api/v1/crm/events</code> route
                comes online once Cloud Build finishes (~12 min after push).
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
        <div className="text-sm">
          <span className="text-gray-500">Events in window:</span>{' '}
          <strong>{filtered.length}</strong>
          <span className="text-gray-400 mx-2">·</span>
          <span className="text-gray-500">Total must-attend booth budget:</span>{' '}
          <strong>${totalBoothCost.toLocaleString()}</strong>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs text-slate-600">
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
          <div className="flex items-center justify-center h-32 text-slate-500 text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading events…
          </div>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="text-sm text-slate-500 text-center py-12">
            No events match the current filters.
          </div>
        )}
        {!isLoading && PRIORITY_ORDER.map((p) => {
          const list = grouped[p] ?? [];
          if (list.length === 0) return null;
          return (
            <div key={p} className="mb-6">
              <h2 className="font-semibold text-sm text-slate-900 mb-2 flex items-center gap-2">
                {p === 'must-attend' && <Star className="w-4 h-4 text-amber-500" />}
                {PRIORITY_LABEL[p]}
                <Badge variant="outline" className="text-xs">{list.length}</Badge>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {list.map((e) => <EventCard key={e.id} event={e} />)}
              </div>
            </div>
          );
        })}
        {!isLoading && grouped.unclassified.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold text-sm text-slate-900 mb-2">Unclassified</h2>
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
      <span className="text-gray-500 font-medium">{label}:</span>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => {
          const active = selected === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onSelect(active ? null : opt)}
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
        {selected && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="px-2 py-0.5 rounded-full text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
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
      'p-4 hover:shadow-md transition-shadow flex flex-col',
      isMust && 'border-amber-300 bg-amber-50/30',
    )}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-sm text-slate-900 leading-tight">{event.name}</h3>
        {isMust && <Star className="w-4 h-4 text-amber-500 flex-shrink-0" />}
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        <Badge className={cn(typeColor, 'text-xs border-0')}>{event.type.replace('_', ' ')}</Badge>
        {event.status === 'live' && <Badge className="bg-red-100 text-red-700 text-xs border-0">LIVE</Badge>}
      </div>

      <div className="space-y-1 text-xs text-slate-600 mb-3 flex-1">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3 h-3 text-slate-400 flex-shrink-0" />
          <span>{dateRange}</span>
        </div>
        {(event.location_name || event.city) && (
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>
              {event.location_name && <span className="block">{event.location_name}</span>}
              {event.city && <span className="text-slate-500">{[event.city, event.state].filter(Boolean).join(', ')}</span>}
            </span>
          </div>
        )}
        {attendees !== null && (
          <div className="flex items-center gap-1.5">
            <Users className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span>~{attendees.toLocaleString()} attendees</span>
          </div>
        )}
        {(costAttend !== null || costBooth !== null) && (
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span>
              {costAttend !== null && <>attend ${costAttend.toLocaleString()}</>}
              {costAttend !== null && costBooth !== null && <span className="text-slate-400"> · </span>}
              {costBooth !== null && <>booth ${costBooth.toLocaleString()}</>}
            </span>
          </div>
        )}
        {event.target_audience && (
          <div className="text-slate-500 italic line-clamp-2">{event.target_audience}</div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-auto pt-2 border-t border-slate-100">
        {event.registration_url && (
          <a
            href={event.registration_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-xs py-1 px-2 rounded bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition"
          >
            Register
          </a>
        )}
        {event.booth_info_url && (
          <a
            href={event.booth_info_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-xs py-1 px-2 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
          >
            Booth Info
          </a>
        )}
        {event.website && !event.registration_url && (
          <a
            href={event.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-xs py-1 px-2 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition flex items-center justify-center gap-1"
          >
            <ExternalLink className="w-3 h-3" /> Website
          </a>
        )}
      </div>
    </Card>
  );
}
