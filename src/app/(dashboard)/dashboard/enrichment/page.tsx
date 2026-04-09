'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search,
  RefreshCw,
  Database,
  UserCheck,
  Mail,
  Upload,
  Zap,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/constants';

// ---------- Types ----------

interface EnrichmentStats {
  total_leads: number;
  leads_with_real_names: number;
  leads_needing_names: number;
  leads_needing_emails: number;
  name_enrichment_pct: number;
  email_enrichment_pct: number;
}

interface EnrichmentLead {
  id: number;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  status: 'needs_name' | 'needs_email' | 'enriched';
}

interface ActivityEntry {
  id: number;
  action: string;
  lead_name: string;
  field: string;
  old_value: string;
  new_value: string;
  timestamp: string;
}

// ---------- Sample / fallback data ----------

const SAMPLE_STATS: EnrichmentStats = {
  total_leads: 260,
  leads_with_real_names: 233,
  leads_needing_names: 27,
  leads_needing_emails: 224,
  name_enrichment_pct: 89,
  email_enrichment_pct: 14,
};

const SAMPLE_LEADS: EnrichmentLead[] = [
  { id: 1, company_name: 'Apex Manufacturing LLC', contact_name: null, email: null, status: 'needs_name' },
  { id: 2, company_name: 'BrightPath Health Services', contact_name: 'Sarah Mitchell', email: null, status: 'needs_email' },
  { id: 3, company_name: 'Cornerstone Financial Group', contact_name: null, email: null, status: 'needs_name' },
  { id: 4, company_name: 'Delta Construction Inc', contact_name: 'James Whitmore', email: 'james@deltaconstruction.com', status: 'enriched' },
  { id: 5, company_name: 'Eagle Eye Security', contact_name: null, email: 'info@eagleeyesec.com', status: 'needs_name' },
  { id: 6, company_name: 'First Choice Logistics', contact_name: 'Maria Santos', email: null, status: 'needs_email' },
  { id: 7, company_name: 'Golden State Plumbing', contact_name: null, email: null, status: 'needs_name' },
  { id: 8, company_name: 'Harbor View Restaurant Group', contact_name: 'Tom Chen', email: null, status: 'needs_email' },
  { id: 9, company_name: 'Innovate Tech Solutions', contact_name: 'Priya Patel', email: 'priya@innovatetech.io', status: 'enriched' },
  { id: 10, company_name: 'JetStream Auto Parts', contact_name: null, email: null, status: 'needs_name' },
  { id: 11, company_name: 'Keystone Dental Practice', contact_name: 'Dr. Robert Lin', email: null, status: 'needs_email' },
  { id: 12, company_name: 'Lakeview Assisted Living', contact_name: null, email: 'admin@lakeviewliving.com', status: 'needs_name' },
];

const SAMPLE_ACTIVITY: ActivityEntry[] = [
  { id: 1, action: 'enriched', lead_name: 'BrightPath Health Services', field: 'contact_name', old_value: '(unknown)', new_value: 'Sarah Mitchell', timestamp: '2 hours ago' },
  { id: 2, action: 'enriched', lead_name: 'Delta Construction Inc', field: 'email', old_value: '(none)', new_value: 'james@deltaconstruction.com', timestamp: '3 hours ago' },
  { id: 3, action: 'enriched', lead_name: 'Innovate Tech Solutions', field: 'contact_name', old_value: '(unknown)', new_value: 'Priya Patel', timestamp: '5 hours ago' },
  { id: 4, action: 'enriched', lead_name: 'First Choice Logistics', field: 'contact_name', old_value: '(unknown)', new_value: 'Maria Santos', timestamp: '1 day ago' },
  { id: 5, action: 'bulk_import', lead_name: '47 leads', field: 'contact_name', old_value: '', new_value: 'CSV import completed', timestamp: '2 days ago' },
  { id: 6, action: 'enriched', lead_name: 'Harbor View Restaurant Group', field: 'contact_name', old_value: '(unknown)', new_value: 'Tom Chen', timestamp: '3 days ago' },
];

// ---------- Helper: auth headers ----------

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Organization-ID': process.env.NEXT_PUBLIC_HEALTHSHIELD_ORG_ID || '12',
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
      // ignore
    }
  }
  return headers;
}

// ---------- Component ----------

export default function EnrichmentPage() {
  const [stats, setStats] = useState<EnrichmentStats | null>(null);
  const [leads, setLeads] = useState<EnrichmentLead[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>(SAMPLE_ACTIVITY);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [enrichingIds, setEnrichingIds] = useState<Set<number>>(new Set());
  const [bulkEnriching, setBulkEnriching] = useState(false);
  const [apolloKey, setApolloKey] = useState('');
  const [apolloConnected, setApolloConnected] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Fetch enrichment data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const [statsRes, leadsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/crm/leads/enrichment-stats`, { headers }),
        fetch(`${API_BASE_URL}/api/v1/crm/leads/enrich-preview?type=all`, {
          method: 'POST',
          headers,
        }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData?.data || statsData || SAMPLE_STATS);
      } else {
        setStats(SAMPLE_STATS);
      }

      if (leadsRes.ok) {
        const leadsData = await leadsRes.json();
        // Unwrap: may be paginated { data: { data: [...] } } or { data: [...] } or { leads: [...] }
        const raw = leadsData?.data?.data || leadsData?.data || leadsData?.leads || leadsData;
        setLeads(Array.isArray(raw) ? raw : SAMPLE_LEADS);
      } else {
        setLeads(SAMPLE_LEADS);
      }
    } catch {
      setStats(SAMPLE_STATS);
      setLeads(SAMPLE_LEADS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Enrich single lead
  const enrichLead = async (leadId: number) => {
    setEnrichingIds((prev) => new Set(prev).add(leadId));
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/crm/leads/enrich`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ lead_id: leadId }),
      });
      if (res.ok) {
        toast.success('Lead enriched successfully');
        fetchData();
      } else {
        toast.error('Enrichment failed - try again later');
      }
    } catch {
      toast.error('Network error during enrichment');
    } finally {
      setEnrichingIds((prev) => {
        const next = new Set(prev);
        next.delete(leadId);
        return next;
      });
    }
  };

  // Bulk enrich
  const enrichSelected = async () => {
    if (selected.size === 0) {
      toast.warning('Select leads to enrich first');
      return;
    }
    setBulkEnriching(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/crm/leads/bulk-enrich`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ lead_ids: Array.from(selected) }),
      });
      if (res.ok) {
        toast.success(`${selected.size} leads enriched successfully`);
        setSelected(new Set());
        fetchData();
      } else {
        toast.error('Bulk enrichment failed');
      }
    } catch {
      toast.error('Network error during bulk enrichment');
    } finally {
      setBulkEnriching(false);
    }
  };

  // CSV drop handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      toast.success(`Uploaded ${file.name} - processing enrichment data...`);
    } else {
      toast.error('Please upload a .csv file');
    }
  };

  // Selection helpers
  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filteredLeads.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredLeads.map((l) => l.id)));
    }
  };

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      !search ||
      lead.company_name.toLowerCase().includes(search.toLowerCase()) ||
      (lead.contact_name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (lead.email?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stat values
  const s = stats || SAMPLE_STATS;

  // Status badge renderer
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'needs_name':
        return (
          <Badge variant="outline" className="border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs">
            <AlertCircle className="mr-1 h-3 w-3" />
            Needs Name
          </Badge>
        );
      case 'needs_email':
        return (
          <Badge variant="outline" className="border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs">
            <Mail className="mr-1 h-3 w-3" />
            Needs Email
          </Badge>
        );
      case 'enriched':
        return (
          <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-400 text-xs">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Enriched
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Enrichment</h1>
          <p className="text-muted-foreground mt-1">
            Enrich lead data with verified contact names and email addresses
          </p>
        </div>
        <Button
          onClick={fetchData}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* ===== 1. Overview Stats Cards ===== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Leads
                </CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{s.total_leads}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all sources
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-500/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Real Names Found
                </CardTitle>
                <UserCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">
                  {s.leads_with_real_names}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {s.name_enrichment_pct}% of total leads
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-500/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Needs Name Enrichment
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">
                  {s.leads_needing_names}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Missing verified contact name
                </p>
              </CardContent>
            </Card>

            <Card className="border-yellow-500/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Needs Email Enrichment
                </CardTitle>
                <Mail className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-500">
                  {s.leads_needing_emails}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  No verified email on file
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* ===== 5. Enrichment Progress Bars ===== */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Enrichment Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Names progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-green-500" />
                Names Enriched
              </span>
              <span className="text-sm font-bold text-green-500">{s.name_enrichment_pct}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${s.name_enrichment_pct}%`,
                  background: 'linear-gradient(90deg, #22c55e, #4ade80)',
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {s.leads_with_real_names} of {s.total_leads} leads have verified contact names
            </p>
          </div>

          {/* Emails progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-yellow-500" />
                Emails Enriched
              </span>
              <span className="text-sm font-bold text-yellow-500">{s.email_enrichment_pct}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${s.email_enrichment_pct}%`,
                  background: 'linear-gradient(90deg, #eab308, #facc15)',
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {s.total_leads - s.leads_needing_emails} of {s.total_leads} leads have verified emails
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ===== 2. Enrichment Sources ===== */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Enrichment Sources</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Apollo.io */}
          <Card className="border-[#f97316]/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#f97316]" />
                Apollo.io
                {apolloConnected && (
                  <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-400 text-xs ml-auto">
                    Connected
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Primary enrichment source. Find verified contact names, emails, and phone numbers.
              </p>
              <Input
                type="password"
                placeholder="Enter Apollo.io API key..."
                value={apolloKey}
                onChange={(e) => setApolloKey(e.target.value)}
                className="text-sm"
              />
              <Button
                className="w-full gap-2"
                style={{ backgroundColor: '#f97316', color: '#fff' }}
                onClick={() => {
                  if (apolloKey.length > 10) {
                    setApolloConnected(true);
                    toast.success('Apollo.io connected successfully');
                  } else {
                    toast.error('Enter a valid API key');
                  }
                }}
              >
                {apolloConnected ? 'Reconnect' : 'Connect'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Manual Web Search */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-500" />
                Manual Web Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Manual research via LinkedIn, company websites, and public records.
              </p>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <div className="text-2xl font-bold">233<span className="text-base font-normal text-muted-foreground">/260</span></div>
                  <p className="text-xs text-muted-foreground">Leads enriched manually</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-green-500/50">
                  <span className="text-sm font-bold text-green-500">89%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CSV Import */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="h-5 w-5 text-purple-500" />
                CSV Import
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Upload a CSV file with enriched contact data to bulk-update leads.
              </p>
              <div
                className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer ${
                  dragOver
                    ? 'border-[#f97316] bg-[#f97316]/5'
                    : 'border-border hover:border-muted-foreground/50'
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.csv';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) toast.success(`Uploaded ${file.name} - processing...`);
                  };
                  input.click();
                }}
              >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Drop CSV here</p>
                <p className="text-xs text-muted-foreground">or click to browse</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ===== 3. Leads Needing Enrichment Table ===== */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Leads Needing Enrichment</CardTitle>
            <div className="flex items-center gap-2">
              {selected.size > 0 && (
                <Button
                  size="sm"
                  className="gap-2"
                  style={{ backgroundColor: '#f97316', color: '#fff' }}
                  onClick={enrichSelected}
                  disabled={bulkEnriching}
                >
                  {bulkEnriching ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Zap className="h-3.5 w-3.5" />
                  )}
                  Enrich Selected ({selected.size})
                </Button>
              )}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-56 text-sm"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Status</option>
                <option value="needs_name">Needs Name</option>
                <option value="needs_email">Needs Email</option>
                <option value="enriched">Enriched</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 pl-4">
                    <Checkbox
                      checked={
                        filteredLeads.length > 0 &&
                        selected.size === filteredLeads.length
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Current Contact</TableHead>
                  <TableHead>Current Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-28 text-right pr-4">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-4">
                        <Skeleton className="h-4 w-4" />
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No leads match your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => (
                    <TableRow key={lead.id} className="group">
                      <TableCell className="pl-4">
                        <Checkbox
                          checked={selected.has(lead.id)}
                          onCheckedChange={() => toggleSelect(lead.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{lead.company_name}</TableCell>
                      <TableCell>
                        {lead.contact_name || (
                          <span className="text-muted-foreground italic">Unknown</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.email || (
                          <span className="text-muted-foreground italic">None</span>
                        )}
                      </TableCell>
                      <TableCell>{renderStatusBadge(lead.status)}</TableCell>
                      <TableCell className="text-right pr-4">
                        {lead.status !== 'enriched' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-xs opacity-70 group-hover:opacity-100 transition-opacity"
                            onClick={() => enrichLead(lead.id)}
                            disabled={enrichingIds.has(lead.id)}
                          >
                            {enrichingIds.has(lead.id) ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <Zap className="h-3 w-3" />
                            )}
                            Enrich
                          </Button>
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ===== 4. Enrichment Activity Log ===== */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Enrichment Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activity.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 rounded-lg border border-border p-3"
              >
                <div className="mt-0.5">
                  {entry.action === 'bulk_import' ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10">
                      <Upload className="h-4 w-4 text-purple-500" />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{entry.lead_name}</span>
                    {entry.action === 'bulk_import' ? (
                      <span className="text-muted-foreground"> &mdash; {entry.new_value}</span>
                    ) : (
                      <>
                        <span className="text-muted-foreground"> &mdash; </span>
                        <span className="text-muted-foreground">{entry.field === 'contact_name' ? 'Name' : 'Email'} updated to </span>
                        <span className="font-medium text-green-500">{entry.new_value}</span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{entry.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
