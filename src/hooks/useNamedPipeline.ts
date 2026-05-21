'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';

/**
 * Generic hooks + types for named CRM pipelines (HR Staffing, Insurance Broker,
 * etc.). Each pipeline is identified by:
 *  - a pipeline_slug in crm_pipeline_stages (e.g. 'hr-staffing', 'insurance-broker')
 *  - a tag in crm_leads.tags (typically the same string)
 *
 * Replaces the original useHrStaffingLeads.ts which was hard-coded to 'hr-staffing'.
 */

export interface NamedPipelineStage {
  id: number;
  name: string;
  slug: string;
  pipeline_slug: string;
  description: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
  is_closed_won: boolean;
  is_closed_lost: boolean;
  probability_percentage: number;
  current_lead_count?: number;
}

export interface NamedPipelineLead {
  id: number;
  organization_id: number;
  company_name: string;
  company_address: string | null;
  company_city: string | null;
  company_state: string | null;
  company_zip: string | null;
  industry: string | null;
  estimated_employees: number | null;
  contact_first_name: string;
  contact_last_name: string;
  contact_title: string | null;
  contact_email: string;
  contact_phone: string | null;
  status: string | null;
  stage: string;
  priority: string | null;
  tags: string[];
  website: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface PaginatedLeadsResponse {
  data: NamedPipelineLead[];
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
}

/**
 * Fetches pipeline stages filtered by ?pipeline=<slug> on the
 * /api/v1/crm/pipeline-stages endpoint (introduced in Phase 2 backend).
 */
export function useNamedPipelineStages(pipelineSlug: string) {
  const [stages, setStages] = useState<NamedPipelineStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    api
      .get<NamedPipelineStage[]>('/api/v1/crm/pipeline-stages', { pipeline: pipelineSlug, include_inactive: 'false' })
      .then((res) => {
        if (cancelled) return;
        // Defensive: keep only the stages whose slug starts with our prefix in
        // case the API returns mixed pipelines.
        const filtered = (res ?? []).filter((s) => s.slug?.startsWith(pipelineSlug));
        filtered.sort((a, b) => a.sort_order - b.sort_order);
        setStages(filtered);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [pipelineSlug, reloadKey]);

  return { stages, isLoading, error, reload };
}

/**
 * Fetches all leads tagged with the given tag for the current org.
 * Backed by GET /api/v1/crm/leads?tags[]=<tag>.
 */
export function useNamedPipelineLeads(leadTag: string) {
  const [leads, setLeads] = useState<NamedPipelineLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    api
      .get<PaginatedLeadsResponse>('/api/v1/crm/leads', {
        'tags[]': leadTag,
        per_page: '500',
      })
      .then((res) => {
        if (!cancelled) setLeads(res.data ?? []);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [leadTag, reloadKey]);

  return { leads, isLoading, error, reload };
}

/**
 * Move a single lead to a different stage.
 * Backed by POST /api/v1/crm/leads/{id}/move-stage.
 */
export async function moveLeadToStage(leadId: number, newStageSlug: string): Promise<void> {
  await api.post(`/api/v1/crm/leads/${leadId}/move-stage`, { stage: newStageSlug });
}
