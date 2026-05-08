'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Heart,
  Building2,
  Users,
  Phone,
  Mail,
  RefreshCw,
  ArrowUpRight,
  Plus,
} from 'lucide-react';
import type { Lead } from '@/types/lead';
import { LEAD_STATUSES } from '@/lib/constants';
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

function LeadCard({ lead }: { lead: Lead }) {
  const initials = `${(lead.firstName || '?')[0]}${(lead.lastName || '')[0] || ''}`.toUpperCase();
  return (
    <Link
      href={`/dashboard/leads/${lead.id}`}
      className="block group rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] transition-colors p-3 space-y-2"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">
              {lead.firstName} {lead.lastName}
            </p>
            {lead.company && (
              <p className="text-xs text-white/50 truncate flex items-center gap-1">
                <Building2 className="h-3 w-3" /> {lead.company}
              </p>
            )}
          </div>
        </div>
        <ArrowUpRight className="h-4 w-4 text-white/30 group-hover:text-pink-400 shrink-0" />
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
        {typeof lead.estimatedEmployees === 'number' && (
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" /> {lead.estimatedEmployees}
          </span>
        )}
        {lead.industry && <span className="text-white/50">{lead.industry}</span>}
        {typeof lead.value === 'number' && lead.value > 0 && (
          <span className="text-emerald-400">${lead.value.toLocaleString()}</span>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap text-xs">
        {lead.phone && (
          <a
            href={`tel:${lead.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="text-white/60 hover:text-pink-400 flex items-center gap-1"
          >
            <Phone className="h-3 w-3" /> {lead.phone}
          </a>
        )}
        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            onClick={(e) => e.stopPropagation()}
            className="text-white/60 hover:text-pink-400 flex items-center gap-1 truncate max-w-[200px]"
          >
            <Mail className="h-3 w-3" />
            <span className="truncate">{lead.email}</span>
          </a>
        )}
      </div>
    </Link>
  );
}

function StageColumn({ stageId, stageName, leads }: { stageId: string; stageName: string; leads: Lead[] }) {
  const total = leads.length;
  return (
    <div className="flex flex-col rounded-xl border border-white/5 bg-white/[0.01] min-w-[280px]">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <p className="text-sm font-semibold text-white">{stageName}</p>
        <span className="text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded-full">
          {total}
        </span>
      </div>
      <div className="p-3 space-y-2 min-h-[300px]">
        {leads.map((l) => (
          <LeadCard key={`${stageId}-${l.id}`} lead={l} />
        ))}
        {total === 0 && (
          <div className="text-center text-white/20 py-8 text-xs">No leads in this stage</div>
        )}
      </div>
    </div>
  );
}

export default function PersonalPipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = `${API_BASE}/api/v1/crm/leads?per_page=500&tags[]=personal`;
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
      toast.error('Failed to load Personal Pipeline');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Group leads by status; show only stages that have leads, plus 'new' always.
  const byStage: Record<string, Lead[]> = {};
  for (const lead of leads) {
    const s = lead.status || 'new';
    (byStage[s] = byStage[s] || []).push(lead);
  }

  // Show stages in their canonical order; only render columns that have leads or are 'new'.
  const stagesWithLeads = LEAD_STATUSES.filter(
    (s) => s.id === 'new' || (byStage[s.id] && byStage[s.id].length > 0)
  );

  const totalValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Heart className="h-6 w-6 text-pink-400" />
            Personal Pipeline
          </h1>
          <p className="text-sm text-white/50 mt-1 max-w-2xl">
            Leads you know personally — friends, ex-coworkers, neighbors, anyone who'd
            actually take your call. Tag any lead with ★ Personal on its detail page to
            move it here.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <Link href="/dashboard/leads/new?personal=1" className="gap-1.5">
              <Plus className="h-4 w-4" /> Add Personal Lead
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={load} disabled={isLoading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-white/50 uppercase tracking-wider">Personal Leads</p>
            <p className="text-3xl font-bold text-white mt-1">{leads.length}</p>
            <p className="text-xs text-white/40 mt-1">across all stages</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-white/50 uppercase tracking-wider">Active</p>
            <p className="text-3xl font-bold text-white mt-1">
              {leads.filter((l) => !['won', 'lost', 'bad_number'].includes(l.status)).length}
            </p>
            <p className="text-xs text-white/40 mt-1">in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-white/50 uppercase tracking-wider">Pipeline Value</p>
            <p className="text-3xl font-bold text-emerald-400 mt-1">
              ${totalValue.toLocaleString()}
            </p>
            <p className="text-xs text-white/40 mt-1">total deal value</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="min-w-[280px]">
              <CardContent className="pt-6 space-y-3">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-20 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : leads.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-white/40">
            <Heart className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No personal leads yet</p>
            <p className="text-xs mt-1">
              Click ★ Personal on any lead's detail page to add them here, or use Add Personal Lead above.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stagesWithLeads.map((stage) => (
            <StageColumn
              key={stage.id}
              stageId={stage.id}
              stageName={stage.name}
              leads={byStage[stage.id] || []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
