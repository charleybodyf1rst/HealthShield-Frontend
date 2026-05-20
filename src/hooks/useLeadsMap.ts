'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

/**
 * Slim lead payload returned by GET /api/v1/crm/leads/map.
 * Mirrors the columns selected in CrmLeadController::map() in SystemsF1RST-Backend.
 */
export interface MapLead {
  id: number;
  organization_id: number | null;
  assigned_to_user_id: number | null;
  contact_first_name: string | null;
  contact_last_name: string | null;
  contact_title: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  company_name: string | null;
  industry: string | null;
  estimated_employees: number | null;
  company_address: string | null;
  company_city: string | null;
  company_state: string | null;
  company_zip: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  geocoded_at: string | null;
  status: string | null;
  stage: string | null;
  priority: string | null;
  tags: string[] | null;
  lead_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface MapFilters {
  status?: string[];
  priority?: string[];
  tags?: string[];
  assignedToUserId?: number;
}

interface MapResponse {
  success: boolean;
  count: number;
  leads: MapLead[];
}

function paramsFromFilters(filters: MapFilters): Record<string, string> {
  const out: Record<string, string> = {};
  if (filters.status?.length) out.status = filters.status.join(',');
  if (filters.priority?.length) out.priority = filters.priority.join(',');
  if (filters.tags?.length) out.tags = filters.tags.join(',');
  if (filters.assignedToUserId) out.assigned_to_user_id = String(filters.assignedToUserId);
  return out;
}

export function useLeadsMap(filters: MapFilters = {}) {
  return useQuery<MapResponse, Error>({
    queryKey: ['crm-leads-map', filters],
    queryFn: () => api.get<MapResponse>('/api/v1/crm/leads/map', paramsFromFilters(filters)),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
