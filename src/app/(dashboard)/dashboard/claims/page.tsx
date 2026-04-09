'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  FileText,
  Plus,
  Search,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  DollarSign,
  AlertTriangle,
  ClipboardList,
} from 'lucide-react';
import { insuranceApi, api } from '@/lib/api';

// ---- Types ----
interface Claim {
  id: string | number;
  claim_number: string;
  policyholder_name: string;
  policy_number: string;
  claim_type: string;
  amount: number;
  status: 'filed' | 'under_review' | 'approved' | 'denied' | 'paid';
  filed_date: string;
  description?: string;
  supporting_documents_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface ClaimFormData {
  policy_id: string;
  claim_type: string;
  incident_date: string;
  description: string;
  estimated_amount: string;
  notes: string;
}

interface ClaimStats {
  total: number;
  under_review: number;
  approved: number;
  denied: number;
}

const CLAIM_TYPES = ['Medical', 'Dental', 'Vision', 'Prescription', 'Emergency'];

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  filed: { label: 'Filed', variant: 'default', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  under_review: { label: 'Under Review', variant: 'secondary', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  approved: { label: 'Approved', variant: 'default', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
  denied: { label: 'Denied', variant: 'destructive', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
  paid: { label: 'Paid', variant: 'default', className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
};

const EMPTY_FORM: ClaimFormData = {
  policy_id: '',
  claim_type: '',
  incident_date: '',
  description: '',
  estimated_amount: '',
  notes: '',
};

// ---- Stats Cards ----
function ClaimStatsCards({ stats, loading }: { stats: ClaimStats | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.total || 0}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Under Review</CardTitle>
          <Clock className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.under_review || 0}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Approved</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.approved || 0}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Denied</CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.denied || 0}</div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---- File Claim Dialog ----
function FileClaimDialog({
  open,
  onOpenChange,
  onSave,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ClaimFormData) => Promise<void>;
  loading: boolean;
}) {
  const [formData, setFormData] = useState<ClaimFormData>(EMPTY_FORM);

  useEffect(() => {
    if (open) {
      setFormData(EMPTY_FORM);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>File a Claim</DialogTitle>
          <DialogDescription>
            Submit a new insurance claim with the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="policy_id">Policy ID *</Label>
                <Input
                  id="policy_id"
                  type="number"
                  value={formData.policy_id}
                  onChange={(e) => setFormData({ ...formData, policy_id: e.target.value })}
                  placeholder="Enter policy ID"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="claim_type">Claim Type *</Label>
                <Select
                  value={formData.claim_type}
                  onValueChange={(value) => setFormData({ ...formData, claim_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select claim type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLAIM_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="incident_date">Incident Date *</Label>
                <Input
                  id="incident_date"
                  type="date"
                  value={formData.incident_date}
                  onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimated_amount">Estimated Amount ($)</Label>
                <Input
                  id="estimated_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.estimated_amount}
                  onChange={(e) => setFormData({ ...formData, estimated_amount: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the claim details..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes (optional)"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Filing...' : 'File Claim'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---- Main Page ----
export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [stats, setStats] = useState<ClaimStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.claim_type = typeFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await insuranceApi.getClaims(params);
      // Unwrap paginated response: {success, data: {current_page, data: [...]}}
      const wrapper = response?.data || response;
      const items = wrapper?.data || wrapper?.claims || wrapper || [];
      setClaims(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error('Failed to fetch claims:', error);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await insuranceApi.getClaimStats();
      const data = response?.data || response || {};
      setStats({
        total: data.total || 0,
        under_review: data.under_review || data.pending || 0,
        approved: data.approved || 0,
        denied: data.denied || 0,
      });
    } catch (error) {
      console.error('Failed to fetch claim stats:', error);
      setStats({ total: 0, under_review: 0, approved: 0, denied: 0 });
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchClaims();
  }, [statusFilter, typeFilter]);

  const handleSearch = () => {
    fetchClaims();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleFileClaim = async (formData: ClaimFormData) => {
    try {
      setSaving(true);
      const payload: Record<string, any> = {
        policy_id: parseInt(formData.policy_id),
        claim_type: formData.claim_type,
        incident_date: formData.incident_date,
        description: formData.description,
        estimated_amount: formData.estimated_amount ? parseFloat(formData.estimated_amount) : null,
        notes: formData.notes || null,
      };

      await insuranceApi.fileClaim(payload);
      toast.success('Claim filed successfully');
      setDialogOpen(false);
      fetchClaims();
      fetchStats();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to file claim');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (claim: Claim) => {
    try {
      await api.patch(`/api/v1/insurance/claims/${claim.id}`, { status: 'approved' });
      toast.success(`Claim ${claim.claim_number} approved`);
      fetchClaims();
      fetchStats();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to approve claim');
    }
  };

  const handleDeny = async (claim: Claim) => {
    try {
      await api.patch(`/api/v1/insurance/claims/${claim.id}`, { status: 'denied' });
      toast.success(`Claim ${claim.claim_number} denied`);
      fetchClaims();
      fetchStats();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to deny claim');
    }
  };

  const filteredClaims = claims.filter((claim) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        claim.policyholder_name?.toLowerCase().includes(query) ||
        claim.claim_number?.toLowerCase().includes(query) ||
        claim.policy_number?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Claims</h1>
            <p className="text-muted-foreground">Track and manage insurance claims</p>
          </div>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          File Claim
        </Button>
      </div>

      {/* Stats */}
      <ClaimStatsCards stats={stats} loading={statsLoading} />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by policyholder, claim #, or policy #..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="filed">Filed</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="denied">Denied</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {CLAIM_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>
          ) : filteredClaims.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No claims found</h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'No claims have been filed yet.'}
              </p>
              {!searchQuery && statusFilter === 'all' && typeFilter === 'all' && (
                <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  File Claim
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim #</TableHead>
                  <TableHead>Policyholder</TableHead>
                  <TableHead>Claim Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Filed Date</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.map((claim) => {
                  const statusCfg = STATUS_CONFIG[claim.status] || STATUS_CONFIG.filed;
                  const canAction = claim.status === 'filed' || claim.status === 'under_review';
                  return (
                    <TableRow key={claim.id}>
                      <TableCell className="font-mono text-sm">{claim.claim_number || '-'}</TableCell>
                      <TableCell className="font-medium">{claim.policyholder_name}</TableCell>
                      <TableCell>{claim.claim_type}</TableCell>
                      <TableCell>{formatCurrency(claim.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={statusCfg.variant} className={statusCfg.className}>
                          {statusCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(claim.filed_date)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {claim.supporting_documents_url && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => window.open(claim.supporting_documents_url, '_blank')}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Documents
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            {canAction && (
                              <>
                                <DropdownMenuItem onClick={() => handleApprove(claim)}>
                                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeny(claim)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Deny
                                </DropdownMenuItem>
                              </>
                            )}
                            {!canAction && !claim.supporting_documents_url && (
                              <DropdownMenuItem disabled>
                                No actions available
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <FileClaimDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleFileClaim}
        loading={saving}
      />
    </div>
  );
}
