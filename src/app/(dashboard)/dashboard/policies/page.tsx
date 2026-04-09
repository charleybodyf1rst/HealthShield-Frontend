'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Shield,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { insuranceApi, api } from '@/lib/api';

// ---- Types ----
interface Policy {
  id: string | number;
  policy_number: string;
  policyholder_name: string;
  email: string;
  phone: string;
  carrier: string;
  plan_type: string;
  monthly_premium: number;
  deductible: number;
  status: 'active' | 'pending' | 'expired' | 'cancelled';
  effective_date: string;
  expiry_date: string;
  created_at?: string;
  updated_at?: string;
}

interface PolicyFormData {
  client_id: string;
  policy_type: string;
  carrier_name: string;
  coverage_amount: string;
  deductible: string;
  premium_amount: string;
  premium_frequency: string;
  effective_date: string;
  expiration_date: string;
  policy_number: string;
  group_number: string;
}

interface PolicyStats {
  total: number;
  active: number;
  pending_renewal: number;
  expired: number;
}

const POLICY_TYPES = [
  { value: 'auto', label: 'Auto' },
  { value: 'home', label: 'Home' },
  { value: 'health', label: 'Health' },
  { value: 'life', label: 'Life' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'liability', label: 'Liability' },
  { value: 'workers_comp', label: 'Workers Comp' },
  { value: 'umbrella', label: 'Umbrella' },
];
const PREMIUM_FREQUENCIES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semi_annual', label: 'Semi-Annual' },
  { value: 'annual', label: 'Annual' },
];

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  active: { label: 'Active', variant: 'default', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
  pending: { label: 'Pending', variant: 'secondary', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  expired: { label: 'Expired', variant: 'destructive', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
  cancelled: { label: 'Cancelled', variant: 'outline', className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
};

const EMPTY_FORM: PolicyFormData = {
  client_id: '',
  policy_type: '',
  carrier_name: '',
  coverage_amount: '',
  deductible: '',
  premium_amount: '',
  premium_frequency: 'monthly',
  effective_date: '',
  expiration_date: '',
  policy_number: '',
  group_number: '',
};

// ---- Stats Cards ----
function PolicyStatsCards({ stats, loading }: { stats: PolicyStats | null; loading: boolean }) {
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
          <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.total || 0}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.active || 0}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Renewal</CardTitle>
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.pending_renewal || 0}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expired</CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.expired || 0}</div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---- Policy Dialog ----
function PolicyDialog({
  open,
  onOpenChange,
  policy,
  onSave,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy: Policy | null;
  onSave: (data: PolicyFormData) => Promise<void>;
  loading: boolean;
}) {
  const [formData, setFormData] = useState<PolicyFormData>(EMPTY_FORM);

  useEffect(() => {
    if (policy) {
      setFormData({
        client_id: (policy as any).client_id?.toString() || '',
        policy_type: (policy as any).policy_type || policy.plan_type || '',
        carrier_name: (policy as any).carrier_name || policy.carrier || '',
        coverage_amount: (policy as any).coverage_amount?.toString() || '',
        deductible: policy.deductible?.toString() || '',
        premium_amount: (policy as any).premium_amount?.toString() || policy.monthly_premium?.toString() || '',
        premium_frequency: (policy as any).premium_frequency || 'monthly',
        effective_date: policy.effective_date || '',
        expiration_date: (policy as any).expiration_date || policy.expiry_date || '',
        policy_number: policy.policy_number || '',
        group_number: (policy as any).group_number || '',
      });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [policy, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{policy ? 'Edit Policy' : 'New Policy'}</DialogTitle>
          <DialogDescription>
            {policy ? 'Update the policy information below.' : 'Fill in the details to create a new policy.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Client/Lead ID */}
            <div className="space-y-2">
              <Label htmlFor="client_id">Client / Lead ID *</Label>
              <Input
                id="client_id"
                type="number"
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                placeholder="Enter lead ID from the leads table"
                required
              />
            </div>

            {/* Policy Type & Carrier */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="policy_type">Policy Type *</Label>
                <Select
                  value={formData.policy_type}
                  onValueChange={(value) => setFormData({ ...formData, policy_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select policy type" />
                  </SelectTrigger>
                  <SelectContent>
                    {POLICY_TYPES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="carrier_name">Carrier Name *</Label>
                <Input
                  id="carrier_name"
                  value={formData.carrier_name}
                  onChange={(e) => setFormData({ ...formData, carrier_name: e.target.value })}
                  placeholder="e.g., BlueCross, Aetna"
                  required
                />
              </div>
            </div>

            {/* Coverage & Deductible */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coverage_amount">Coverage Amount ($) *</Label>
                <Input
                  id="coverage_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.coverage_amount}
                  onChange={(e) => setFormData({ ...formData, coverage_amount: e.target.value })}
                  placeholder="e.g., 100000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deductible">Deductible ($)</Label>
                <Input
                  id="deductible"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.deductible}
                  onChange={(e) => setFormData({ ...formData, deductible: e.target.value })}
                  placeholder="e.g., 1000"
                />
              </div>
            </div>

            {/* Premium Amount & Frequency */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="premium_amount">Premium Amount ($) *</Label>
                <Input
                  id="premium_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.premium_amount}
                  onChange={(e) => setFormData({ ...formData, premium_amount: e.target.value })}
                  placeholder="e.g., 450"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="premium_frequency">Premium Frequency *</Label>
                <Select
                  value={formData.premium_frequency}
                  onValueChange={(value) => setFormData({ ...formData, premium_frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {PREMIUM_FREQUENCIES.map((f) => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="effective_date">Effective Date *</Label>
                <Input
                  id="effective_date"
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiration_date">Expiration Date</Label>
                <Input
                  id="expiration_date"
                  type="date"
                  value={formData.expiration_date}
                  onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                />
              </div>
            </div>

            {/* Policy & Group Number */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="policy_number">Policy Number</Label>
                <Input
                  id="policy_number"
                  value={formData.policy_number}
                  onChange={(e) => setFormData({ ...formData, policy_number: e.target.value })}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group_number">Group Number</Label>
                <Input
                  id="group_number"
                  value={formData.group_number}
                  onChange={(e) => setFormData({ ...formData, group_number: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : policy ? 'Update Policy' : 'Create Policy'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---- Main Page ----
export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [stats, setStats] = useState<PolicyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [carrierFilter, setCarrierFilter] = useState('all'); // kept for filter UI compatibility
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (carrierFilter !== 'all') params.carrier = carrierFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await insuranceApi.getPolicies(params);
      const data = response?.data || response?.policies || response || [];
      setPolicies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch policies:', error);
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await insuranceApi.getPolicyStats();
      const data = response?.data || response || {};
      setStats({
        total: data.total || 0,
        active: data.active || 0,
        pending_renewal: data.pending_renewal || data.pending || 0,
        expired: data.expired || 0,
      });
    } catch (error) {
      console.error('Failed to fetch policy stats:', error);
      setStats({ total: 0, active: 0, pending_renewal: 0, expired: 0 });
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchPolicies();
  }, [statusFilter, carrierFilter]);

  const handleSearch = () => {
    fetchPolicies();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleSave = async (formData: PolicyFormData) => {
    try {
      setSaving(true);
      const payload: Record<string, any> = {
        client_id: parseInt(formData.client_id),
        policy_type: formData.policy_type,
        carrier_name: formData.carrier_name,
        coverage_amount: parseFloat(formData.coverage_amount) || 0,
        deductible: formData.deductible ? parseFloat(formData.deductible) : null,
        premium_amount: parseFloat(formData.premium_amount) || 0,
        premium_frequency: formData.premium_frequency,
        effective_date: formData.effective_date,
        expiration_date: formData.expiration_date || null,
        policy_number: formData.policy_number || null,
        group_number: formData.group_number || null,
      };

      if (editingPolicy) {
        await api.put(`/api/v1/insurance/policies/${editingPolicy.id}`, payload);
        toast.success('Policy updated successfully');
      } else {
        await api.post('/api/v1/insurance/policies', payload);
        toast.success('Policy created successfully');
      }

      setDialogOpen(false);
      setEditingPolicy(null);
      fetchPolicies();
      fetchStats();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save policy');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (policy: Policy) => {
    setEditingPolicy(policy);
    setDialogOpen(true);
  };

  const handleDelete = async (policy: Policy) => {
    try {
      await api.delete(`/api/v1/insurance/policies/${policy.id}`);
      toast.success('Policy deleted successfully');
      fetchPolicies();
      fetchStats();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete policy');
    }
  };

  const handleNewPolicy = () => {
    setEditingPolicy(null);
    setDialogOpen(true);
  };

  const filteredPolicies = policies.filter((policy) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const p = policy as any;
      return (
        p.policyholder_name?.toLowerCase().includes(query) ||
        policy.policy_number?.toLowerCase().includes(query) ||
        (p.carrier_name || policy.carrier || '').toLowerCase().includes(query)
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
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Policy Management</h1>
            <p className="text-muted-foreground">Manage insurance policies and renewals</p>
          </div>
        </div>
        <Button onClick={handleNewPolicy}>
          <Plus className="mr-2 h-4 w-4" />
          New Policy
        </Button>
      </div>

      {/* Stats */}
      <PolicyStatsCards stats={stats} loading={statsLoading} />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, policy number, or carrier..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={carrierFilter} onValueChange={setCarrierFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by carrier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Carriers</SelectItem>
                <SelectItem value="BlueCross">BlueCross</SelectItem>
                <SelectItem value="Aetna">Aetna</SelectItem>
                <SelectItem value="Cigna">Cigna</SelectItem>
                <SelectItem value="UnitedHealth">UnitedHealth</SelectItem>
                <SelectItem value="Humana">Humana</SelectItem>
                <SelectItem value="Kaiser">Kaiser</SelectItem>
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
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          ) : filteredPolicies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No policies found</h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery || statusFilter !== 'all' || carrierFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by creating your first policy.'}
              </p>
              {!searchQuery && statusFilter === 'all' && carrierFilter === 'all' && (
                <Button className="mt-4" onClick={handleNewPolicy}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Policy
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policy Number</TableHead>
                  <TableHead>Policyholder Name</TableHead>
                  <TableHead>Carrier</TableHead>
                  <TableHead>Plan Type</TableHead>
                  <TableHead>Monthly Premium</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPolicies.map((policy) => {
                  const statusCfg = STATUS_CONFIG[policy.status] || STATUS_CONFIG.active;
                  return (
                    <TableRow key={policy.id}>
                      <TableCell className="font-mono text-sm">{policy.policy_number || '-'}</TableCell>
                      <TableCell className="font-medium">{policy.policyholder_name}</TableCell>
                      <TableCell>{policy.carrier}</TableCell>
                      <TableCell>{policy.plan_type}</TableCell>
                      <TableCell>{formatCurrency(policy.monthly_premium)}</TableCell>
                      <TableCell>
                        <Badge variant={statusCfg.variant} className={statusCfg.className}>
                          {statusCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(policy.effective_date)}</TableCell>
                      <TableCell>{formatDate(policy.expiry_date)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(policy)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(policy)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
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
      <PolicyDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingPolicy(null);
        }}
        policy={editingPolicy}
        onSave={handleSave}
        loading={saving}
      />
    </div>
  );
}
