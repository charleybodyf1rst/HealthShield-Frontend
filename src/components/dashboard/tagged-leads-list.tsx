'use client';

/**
 * Shared list-view (table) for tag-filtered leads.
 * Used by /dashboard/primed-leads and /dashboard/personal-leads.
 *
 * Pure presentational + a single fetch. Caller passes the tag to filter on
 * (e.g. 'primed' or 'personal') plus any header customization.
 */

import { useEffect, useState, useCallback, type ReactNode } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Phone,
  Mail,
  Building2,
  RefreshCw,
  ArrowUpRight,
  Search,
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
  contact_title?: string | null;
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
    jobTitle: raw.contact_title || undefined,
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

const statusBadgeStyles: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  contacted_1: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  contacted_2: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  contacted_3: 'bg-amber-600/10 text-amber-400 border-amber-600/30',
  contacted_5: 'bg-amber-700/10 text-amber-400 border-amber-700/30',
  contacted_6: 'bg-amber-800/10 text-amber-400 border-amber-800/30',
  pending: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
  demo: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  census_requested: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  proposal_sent: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  group_info: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  agreement_signed: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
  implementation: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
  census_final: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  go_live: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  active: 'bg-green-500/10 text-green-400 border-green-500/30',
  bad_number: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  email_only: 'bg-blue-700/10 text-blue-400 border-blue-700/30',
  lost: 'bg-red-500/10 text-red-400 border-red-500/30',
};

function statusLabel(id: string): string {
  return LEAD_STATUSES.find((s) => s.id === id)?.name || id;
}

export interface TaggedLeadsListProps {
  /** Tag the backend filters on (e.g., 'primed' or 'personal'). */
  tag: string;
  /** Page header / title row. */
  title: ReactNode;
  /** Subtitle under the title. */
  subtitle?: string;
  /** Right-side action button (e.g., Add Personal Lead). Refresh is added automatically. */
  rightActions?: ReactNode;
  /** Avatar gradient classes (Tailwind). */
  avatarClass?: string;
  /** Empty-state message when no leads match the filter. */
  emptyTitle?: string;
  emptySubtitle?: string;
}

export function TaggedLeadsList({
  tag,
  title,
  subtitle,
  rightActions,
  avatarClass = 'bg-gradient-to-br from-orange-500 to-amber-500',
  emptyTitle = 'No leads here yet',
  emptySubtitle,
}: TaggedLeadsListProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = `${API_BASE}/api/v1/crm/leads?per_page=2000&tags[]=${encodeURIComponent(tag)}`;
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
      toast.error('Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  }, [tag]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = leads.filter((l) => {
    if (!search) return true;
    const haystack = `${l.firstName} ${l.lastName} ${l.email} ${l.company ?? ''} ${l.phone ?? ''}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const totalValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);
  const activeLeads = leads.filter(
    (l) => !['won', 'lost', 'bad_number'].includes(l.status)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          {title}
          {subtitle && <p className="text-sm text-white/50 mt-1 max-w-2xl">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {rightActions}
          <Button variant="outline" size="sm" onClick={load} disabled={isLoading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-white/50 uppercase tracking-wider">Total</p>
            <p className="text-3xl font-bold text-white mt-1">{leads.length}</p>
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
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-5 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, company, phone..."
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-white/40">
              <p className="text-base font-medium">{emptyTitle}</p>
              {emptySubtitle && <p className="text-xs mt-1">{emptySubtitle}</p>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-white/40">
                  <tr>
                    <th className="font-semibold pb-3 pr-4">Lead</th>
                    <th className="font-semibold pb-3 pr-4">Industry</th>
                    <th className="font-semibold pb-3 pr-4">Status</th>
                    <th className="font-semibold pb-3 pr-4">Phone</th>
                    <th className="font-semibold pb-3 pr-4 text-right">Employees</th>
                    <th className="font-semibold pb-3 pr-4 text-right">Value</th>
                    <th className="font-semibold pb-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead) => {
                    const initials = `${(lead.firstName || '?')[0]}${(lead.lastName || '')[0] || ''}`.toUpperCase();
                    return (
                      <tr
                        key={lead.id}
                        className="border-t border-white/5 hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`h-9 w-9 rounded-full ${avatarClass} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <Link
                                href={`/dashboard/leads/${lead.id}`}
                                className="font-semibold text-white hover:text-orange-400 truncate block max-w-[260px]"
                              >
                                {lead.firstName} {lead.lastName}
                              </Link>
                              {lead.company && (
                                <p className="text-xs text-white/40 truncate flex items-center gap-1 max-w-[260px]">
                                  <Building2 className="h-3 w-3" /> {lead.company}
                                </p>
                              )}
                              {lead.email && (
                                <a
                                  href={`mailto:${lead.email}`}
                                  className="text-xs text-white/40 hover:text-orange-400 truncate flex items-center gap-1 max-w-[260px]"
                                >
                                  <Mail className="h-3 w-3" /> {lead.email}
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-white/60">{lead.industry || '—'}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-flex text-xs px-2 py-0.5 rounded-full border ${statusBadgeStyles[lead.status] || 'bg-white/10 text-white/60 border-white/10'}`}
                          >
                            {statusLabel(lead.status)}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          {lead.phone ? (
                            <a
                              href={`tel:${lead.phone}`}
                              className="text-white/70 hover:text-orange-400 flex items-center gap-1"
                            >
                              <Phone className="h-3 w-3" /> {lead.phone}
                            </a>
                          ) : (
                            <span className="text-white/30">—</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-right text-white/70">
                          {lead.estimatedEmployees ?? '—'}
                        </td>
                        <td className="py-3 pr-4 text-right text-emerald-400 font-semibold">
                          {lead.value ? `$${lead.value.toLocaleString()}` : '—'}
                        </td>
                        <td className="py-3">
                          <Link
                            href={`/dashboard/leads/${lead.id}`}
                            className="text-white/30 hover:text-orange-400 inline-flex"
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
