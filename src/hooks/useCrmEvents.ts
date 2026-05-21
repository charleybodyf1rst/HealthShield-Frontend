'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';

/**
 * CrmEvent row returned by GET /api/v1/crm/events.
 * Mirrors the crm_events table in SystemsF1RST-Backend.
 */
export interface CrmEvent {
  id: number;
  organization_id: number;
  name: string;
  type: string;
  start_date: string;
  end_date: string | null;
  timezone: string | null;
  location_name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  website: string | null;
  registration_url: string | null;
  booth_info_url: string | null;
  expected_attendees: number | null;
  target_audience: string | null;
  industries: string[] | null;
  cost_attendance: string | number | null;
  cost_booth: string | number | null;
  status: 'upcoming' | 'live' | 'past' | 'cancelled';
  priority: 'must-attend' | 'worth-evaluating' | 'skip' | null;
  notes: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface CrmEventFilters {
  status?: string;
  type?: string;
  city?: string;
  priority?: string;
  from?: string;
  to?: string;
}

interface UpcomingResponse {
  success: boolean;
  count: number;
  events: CrmEvent[];
}

interface PaginatedResponse {
  data: CrmEvent[];
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
}

function paramsFromFilters(filters: CrmEventFilters): Record<string, string> {
  const out: Record<string, string> = {};
  if (filters.status) out.status = filters.status;
  if (filters.type) out.type = filters.type;
  if (filters.city) out.city = filters.city;
  if (filters.priority) out.priority = filters.priority;
  if (filters.from) out.from = filters.from;
  if (filters.to) out.to = filters.to;
  return out;
}

/**
 * Fetches upcoming HR events (default: next 180 days).
 * Backed by GET /api/v1/crm/events/upcoming.
 */
export function useUpcomingCrmEvents(withinDays: number = 180) {
  const [events, setEvents] = useState<CrmEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(undefined);
    api
      .get<UpcomingResponse>('/api/v1/crm/events/upcoming', { within_days: String(withinDays) })
      .then((res) => {
        if (!cancelled) setEvents(res.events ?? []);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [withinDays, reloadKey]);

  return { events, isLoading, error, reload };
}

/**
 * Fetches a filtered, paginated list of events.
 * Backed by GET /api/v1/crm/events.
 */
export function useCrmEvents(filters: CrmEventFilters = {}) {
  const [data, setData] = useState<PaginatedResponse | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const key = JSON.stringify(filters);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(undefined);
    api
      .get<PaginatedResponse>('/api/v1/crm/events', paramsFromFilters(filters))
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { data, isLoading, error };
}

/** POST /api/v1/crm/events */
export async function createCrmEvent(payload: Partial<CrmEvent>): Promise<CrmEvent> {
  return api.post<CrmEvent>('/api/v1/crm/events', payload);
}

/** PUT /api/v1/crm/events/{id} */
export async function updateCrmEvent(id: number, payload: Partial<CrmEvent>): Promise<CrmEvent> {
  return api.put<CrmEvent>(`/api/v1/crm/events/${id}`, payload);
}

/** DELETE /api/v1/crm/events/{id} */
export async function deleteCrmEvent(id: number): Promise<void> {
  await api.delete<void>(`/api/v1/crm/events/${id}`);
}
