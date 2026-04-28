'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowUpDown,
  ClipboardCheck,
  Download,
  Filter,
  MoreHorizontal,
  Phone,
  Mail,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import { useLeadsStore, useLeadStats, useLeadsLoading } from '@/stores/leads-store';
import { LEAD_STATUSES, LEAD_SOURCES, LEAD_CLASSIFICATIONS } from '@/lib/constants';
import type { Lead, LeadFilters } from '@/types/lead';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  contacted_1: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  contacted_2: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  contacted_3: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
  contacted: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  qualified: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  quoted: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  negotiating: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  converted: 'bg-green-500/10 text-green-500 border-green-500/20',
  lost: 'bg-red-500/10 text-red-500 border-red-500/20',
  unresponsive: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export default function LeadsPage() {
  const router = useRouter();
  const { fetchLeads, leads, bulkDelete, bulkAssign, deleteLead, pagination, error } = useLeadsStore();
  const stats = useLeadStats();
  const isLoading = useLeadsLoading();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'pipeline'>('all');

  // Fetch leads on mount and when filters change
  useEffect(() => {
    const filters: LeadFilters = {};
    if (statusFilter !== 'all') {
      filters.status = statusFilter as LeadFilters['status'];
    }
    if (sourceFilter !== 'all') {
      filters.source = sourceFilter as LeadFilters['source'];
    }
    if (search) {
      filters.search = search;
    }
    fetchLeads(filters);
  }, [fetchLeads, statusFilter, sourceFilter, search]);

  // Pending approval sources (from corporate wellness site)
  const PENDING_SOURCES = ['tablet-presentation', 'demo_request'];
  const isPendingLead = (lead: Lead) =>
    (PENDING_SOURCES.includes(lead.source) || lead.classification === 'corporate_wellness') &&
    lead.status === 'new';
  const PIPELINE_STATUSES = ['contacted', 'contacted_1', 'contacted_2', 'contacted_3', 'qualified', 'quoted', 'negotiating'];

  const pendingCount = (leads ?? []).filter(isPendingLead).length;
  const pipelineCount = (leads ?? []).filter((l) => PIPELINE_STATUSES.includes(l.status)).length;

  // Client-side filtering for immediate feedback
  const filteredLeads = (leads ?? []).filter((lead) => {
    // Tab filter
    if (activeTab === 'pending' && !isPendingLead(lead)) return false;
    if (activeTab === 'pipeline' && !PIPELINE_STATUSES.includes(lead.status)) return false;

    const matchesSearch =
      !search ||
      `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  });

  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map((lead) => lead.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) return;
    try {
      await bulkDelete(selectedLeads);
      setSelectedLeads([]);
    } catch (err) {
      console.error('Failed to delete leads:', err);
    }
  };

  const handleDeleteLead = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteLead(id);
      toast.success('Lead deleted successfully');
    } catch (err) {
      console.error('Failed to delete lead:', err);
      toast.error('Failed to delete lead. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            Manage and track your sales leads
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button asChild>
            <Link href="/dashboard/leads/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Lead
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total || (leads ?? []).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(leads ?? []).filter((l) => l.status === 'new').length}
            </div>
          </CardContent>
        </Card>
        <Card className={pendingCount > 0 ? 'border-amber-500/30 bg-amber-500/5' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${pendingCount > 0 ? 'text-amber-600' : ''}`}>
              {pendingCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(leads ?? []).reduce((sum, l) => sum + (Number(l.value) || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'pending' | 'pipeline')} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            All Leads
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Pending Approval
            {pendingCount > 0 && (
              <Badge variant="secondary" className="ml-1 bg-amber-500/15 text-amber-600 border-amber-500/30 text-xs px-1.5 py-0">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Active Pipeline
            {pipelineCount > 0 && (
              <Badge variant="secondary" className="ml-1 bg-blue-500/15 text-blue-600 border-blue-500/30 text-xs px-1.5 py-0">
                {pipelineCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {LEAD_STATUSES.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {LEAD_SOURCES.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedLeads.length > 0 && (
            <div className="mt-4 flex items-center gap-4 rounded-lg bg-muted/50 p-3">
              <span className="text-sm text-muted-foreground">
                {selectedLeads.length} selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedLeads.length === filteredLeads.length &&
                      filteredLeads.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Plan Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    Value
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Last Contact</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (leads ?? []).length === 0 ? (
                // Loading skeleton rows
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : filteredLeads.length === 0 ? (
                // Empty state
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="text-muted-foreground">
                      <p className="font-medium">No leads found</p>
                      <p className="text-sm">Try adjusting your filters or add a new lead</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
              filteredLeads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedLeads.includes(lead.id)}
                      onCheckedChange={() => toggleSelect(lead.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {lead.firstName[0]}
                          {lead.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {lead.firstName} {lead.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {lead.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {lead.classification ? (
                      <Badge variant="outline" className="text-xs">
                        {LEAD_CLASSIFICATIONS.find(c => c.id === lead.classification)?.name || lead.classification}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusColors[lead.status]}
                    >
                      {LEAD_STATUSES.find((s) => s.id === lead.status)?.name ||
                        lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {LEAD_SOURCES.find((s) => s.id === lead.source)?.name ||
                        lead.source}
                    </span>
                  </TableCell>
                  <TableCell>
                    {lead.value ? (
                      <span className="font-medium">
                        ${lead.value.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {lead.lastContactedAt ? (
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(lead.lastContactedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Phone className="mr-2 h-4 w-4" />
                          Call
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/dashboard/leads/${lead.id}`)
                          }
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteLead(lead.id, `${lead.firstName} ${lead.lastName}`)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} leads
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => {
                  const filters: LeadFilters = {};
                  if (statusFilter !== 'all') filters.status = statusFilter as LeadFilters['status'];
                  if (sourceFilter !== 'all') filters.source = sourceFilter as LeadFilters['source'];
                  if (search) filters.search = search;
                  fetchLeads(filters, pagination.page - 1);
                }}
              >
                Previous
              </Button>
              <span className="text-sm font-medium">
                Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                onClick={() => {
                  const filters: LeadFilters = {};
                  if (statusFilter !== 'all') filters.status = statusFilter as LeadFilters['status'];
                  if (sourceFilter !== 'all') filters.source = sourceFilter as LeadFilters['source'];
                  if (search) filters.search = search;
                  fetchLeads(filters, pagination.page + 1);
                }}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Total count footer */}
        {pagination.total > 0 && pagination.total <= pagination.limit && (
          <div className="px-6 py-3 border-t">
            <p className="text-sm text-muted-foreground">
              Showing all {pagination.total} leads
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
