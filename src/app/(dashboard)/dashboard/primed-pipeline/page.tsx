'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, RefreshCw } from 'lucide-react';
import type { Lead } from '@/types/lead';
import { PipelineBoard } from '@/components/dashboard/pipeline-board';
import { toast } from 'sonner';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://systemsf1rst-backend-887571186773.us-central1.run.app';

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Organization-ID': '12',
  };
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('healthshield-crm-auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        const token = parsed?.state?.tokens?.accessToken;
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
    } catch {
      /* empty */
    }
  }
  return headers;
}

interface RawLead {
  id: number | string;
  contact_first_name?: string | null;
  contact_last_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  company_name?: string | null;
  industry?: string | null;
  estimated_employees?: number | null;
  deal_value?: number | string | null;
  status?: string | null;
  tags?: string[] | null;
}

function rawToLead(raw: RawLead): Lead {
  return {
    id: String(raw.id),
    firstName: raw.contact_first_name || '',
    lastName: raw.contact_last_name || '',
    email: raw.contact_email || '',
    phone: raw.contact_phone || undefined,
    company: raw.company_name || undefined,
    industry: raw.industry || undefined,
    estimatedEmployees:
      raw.estimated_employees != null ? Number(raw.estimated_employees) : undefined,
    value: raw.deal_value != null ? Number(raw.deal_value) : undefined,
    status: (raw.status as Lead['status']) || 'new',
    source: 'b2b_prospect' as Lead['source'],
    tags: Array.isArray(raw.tags) ? raw.tags : undefined,
    createdAt: '',
    updatedAt: '',
  };
}

export default function PrimedPipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      // 2000 cap is enough headroom for the full primed list (currently ~500
      // post-filter, was ~893 before tighter satellite exclusion).
      const url = `${API_BASE}/api/v1/crm/leads?per_page=2000&tags[]=primed`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const rawLeads: RawLead[] = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json)
          ? json
          : [];
      setLeads(rawLeads.map(rawToLead));
    } catch {
      toast.error('Failed to load Primed Pipeline');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totalValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);
  const activeLeads = leads.filter(
    (l) => !['won', 'lost', 'bad_number'].includes(l.status)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-orange-400" />
            Primed Pipeline
          </h1>
          <p className="text-sm text-white/50 mt-1 max-w-2xl">
            Your highest-fit leads — Austin-based companies with 15–200 employees,
            working phone + email, not won/lost/bad-number, with national-chain
            satellites filtered out. Same stage layout as the main Pipeline.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={isLoading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-white/50 uppercase tracking-wider">Total Primed</p>
            <p className="text-3xl font-bold text-white mt-1">{leads.length}</p>
            <p className="text-xs text-white/40 mt-1">across all stages</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-white/50 uppercase tracking-wider">Active</p>
            <p className="text-3xl font-bold text-white mt-1">{activeLeads.length}</p>
            <p className="text-xs text-white/40 mt-1">in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-white/50 uppercase tracking-wider">Pipeline Value</p>
            <p className="text-3xl font-bold text-emerald-400 mt-1">
              ${totalValue.toLocaleString()}
            </p>
            <p className="text-xs text-white/40 mt-1">at $25 / employee</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex gap-3 overflow-x-auto">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="min-w-[280px]">
              <CardContent className="pt-6 space-y-3">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-16 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <PipelineBoard
          leads={leads}
          accentClass="bg-gradient-to-br from-orange-500 to-amber-500"
        />
      )}
    </div>
  );
}