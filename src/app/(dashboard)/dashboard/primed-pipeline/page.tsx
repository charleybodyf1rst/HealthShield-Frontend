'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sparkles,
  Building2,
  Users,
  Phone,
  Mail,
  RefreshCw,
  ArrowUpRight,
  Globe,
} from 'lucide-react';
import type { Lead } from '@/types/lead';
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
  website?: string | null;
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
    website: raw.website || undefined,
    value: raw.deal_value != null ? Number(raw.deal_value) : undefined,
    status: (raw.status as Lead['status']) || 'new',
    source: 'b2b_prospect' as Lead['source'],
    tags: Array.isArray(raw.tags) ? raw.tags : undefined,
    createdAt: '',
    updatedAt: '',
  };
}

const SMB_LABEL = 'SMB · 15–75 employees';
const MID_LABEL = 'Mid-Market · 75–200 employees';

function tier(emp?: number): 'smb' | 'mid' | 'other' {
  if (!emp) return 'other';
  if (emp >= 15 && emp <= 75) return 'smb';
  if (emp >= 76 && emp <= 200) return 'mid';
  return 'other';
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
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
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
        <ArrowUpRight className="h-4 w-4 text-white/30 group-hover:text-orange-400 shrink-0" />
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
            className="text-white/60 hover:text-orange-400 flex items-center gap-1"
            title="Call"
          >
            <Phone className="h-3 w-3" /> {lead.phone}
          </a>
        )}
        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            onClick={(e) => e.stopPropagation()}
            className="text-white/60 hover:text-orange-400 flex items-center gap-1 truncate max-w-[220px]"
            title="Email"
          >
            <Mail className="h-3 w-3" />
            <span className="truncate">{lead.email}</span>
          </a>
        )}
        {lead.website && (
          <a
            href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
            onClick={(e) => e.stopPropagation()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 hover:text-orange-400 flex items-center gap-1"
            title="Website"
          >
            <Globe className="h-3 w-3" /> {lead.website}
          </a>
        )}
      </div>
    </Link>
  );
}

function Column({ title, leads }: { title: string; leads: Lead[] }) {
  const total = leads.length;
  const totalValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);
  return (
    <div className="flex flex-col rounded-xl border border-white/5 bg-white/[0.01]">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-xs text-white/40 mt-0.5">
            {total} lead{total === 1 ? '' : 's'} · ${totalValue.toLocaleString()} potential
          </p>
        </div>
        <span className="text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded-full">
          {total}
        </span>
      </div>
      <div className="p-3 space-y-2 min-h-[400px]">
        {leads.length === 0 ? (
          <div className="text-center text-white/30 py-12">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No primed leads in this tier yet.</p>
            <p className="text-xs mt-1">
              Run the build endpoint to tag qualifying leads.
            </p>
          </div>
        ) : (
          leads.map((l) => <LeadCard key={l.id} lead={l} />)
        )}
      </div>
    </div>
  );
}

export default function PrimedPipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      // CrmLeadController::index supports tags[]= via whereJsonContains.
      // Hitting it directly because leadsApi.getAll's param serializer
      // collapses array values when it casts to Record<string, string>.
      const url = `${API_BASE}/api/v1/crm/leads?per_page=500&tags[]=primed`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();
      const rawLeads: RawLead[] = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json)
          ? json
          : [];
      setLeads(rawLeads.map(rawToLead));
    } catch {
      toast.error('Failed to load primed pipeline');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const smb = leads.filter((l) => tier(l.estimatedEmployees) === 'smb');
  const mid = leads.filter((l) => tier(l.estimatedEmployees) === 'mid');
  const totalValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-orange-400" />
            Primed Pipeline
          </h1>
          <p className="text-sm text-white/50 mt-1 max-w-2xl">
            Your highest-fit leads — Austin-based companies with 15–200 employees, working
            phone + email, not won/lost/bad-number. Two tiers split by company size.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={load}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-white/50 uppercase tracking-wider">Total Primed</p>
            <p className="text-3xl font-bold text-white mt-1">{leads.length}</p>
            <p className="text-xs text-white/40 mt-1">across both tiers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-white/50 uppercase tracking-wider">SMB (15–75)</p>
            <p className="text-3xl font-bold text-white mt-1">{smb.length}</p>
            <p className="text-xs text-white/40 mt-1">faster decisions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-white/50 uppercase tracking-wider">Potential Value</p>
            <p className="text-3xl font-bold text-emerald-400 mt-1">
              ${totalValue.toLocaleString()}
            </p>
            <p className="text-xs text-white/40 mt-1">at $25 / employee</p>
          </CardContent>
        </Card>
      </div>

      {/* Two-tier Kanban */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-5">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6 space-y-3">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-20 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          <Column title={SMB_LABEL} leads={smb} />
          <Column title={MID_LABEL} leads={mid} />
        </div>
      )}
    </div>
  );
}