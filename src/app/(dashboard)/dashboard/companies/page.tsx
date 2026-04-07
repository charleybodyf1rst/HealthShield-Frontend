'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Building2,
  Plus,
  RefreshCw,
  MoreHorizontal,
  Trash2,
  Edit,
  Eye,
  Users,
  TrendingUp,
  Globe,
  Search,
  Loader2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { companiesApi, type Company, type CompanyCreateData, type CompanyStats } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  active: 'bg-green-500',
  inactive: 'bg-gray-500',
  prospect: 'bg-blue-500',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  prospect: 'Prospect',
};

const sizeOptions = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1001-5000', label: '1001-5000 employees' },
  { value: '5001+', label: '5001+ employees' },
];

const industryOptions = [
  'Technology',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Retail',
  'Education',
  'Real Estate',
  'Consulting',
  'Marketing',
  'Legal',
  'Non-profit',
  'Other',
];

interface CompanyFormData extends CompanyCreateData {
  id?: string;
}

interface CompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editCompany?: Company | null;
}

function CompanyDialog({ open, onOpenChange, onSuccess, editCompany }: CompanyDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    domain: '',
    industry: '',
    size: '',
    website: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    description: '',
    linkedin_url: '',
    annual_revenue: undefined,
    employee_count: undefined,
    status: 'prospect',
  });

  useEffect(() => {
    if (editCompany) {
      setFormData({
        name: editCompany.name,
        domain: editCompany.domain || '',
        industry: editCompany.industry || '',
        size: editCompany.size || '',
        website: editCompany.website || '',
        phone: editCompany.phone || '',
        email: editCompany.email || '',
        address: editCompany.address || '',
        city: editCompany.city || '',
        state: editCompany.state || '',
        country: editCompany.country || '',
        postal_code: editCompany.postal_code || '',
        description: editCompany.description || '',
        linkedin_url: editCompany.linkedin_url || '',
        annual_revenue: editCompany.annual_revenue || undefined,
        employee_count: editCompany.employee_count || undefined,
        status: editCompany.status,
      });
    } else {
      setFormData({
        name: '',
        domain: '',
        industry: '',
        size: '',
        website: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        description: '',
        linkedin_url: '',
        annual_revenue: undefined,
        employee_count: undefined,
        status: 'prospect',
      });
    }
  }, [editCompany, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Company name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editCompany) {
        await companiesApi.updateCompany(editCompany.id, formData);
        toast.success('Company updated successfully');
      } else {
        await companiesApi.createCompany(formData);
        toast.success('Company created successfully');
      }
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Failed to save company:', error);
      toast.error(editCompany ? 'Failed to update company' : 'Failed to create company');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{editCompany ? 'Edit Company' : 'Add New Company'}</DialogTitle>
          <DialogDescription>
            {editCompany ? 'Update company information.' : 'Add a new company to your CRM.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Acme Inc."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  placeholder="e.g., acme.com"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => setFormData({ ...formData, industry: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industryOptions.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="size">Company Size</Label>
                <Select
                  value={formData.size}
                  onValueChange={(value) => setFormData({ ...formData, size: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {sizeOptions.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive' | 'prospect') =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="https://www.acme.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@acme.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Address */}
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="123 Main Street"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="Country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  placeholder="12345"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                />
              </div>
            </div>

            {/* Financial Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="annual_revenue">Annual Revenue ($)</Label>
                <Input
                  id="annual_revenue"
                  type="number"
                  placeholder="e.g., 1000000"
                  value={formData.annual_revenue || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      annual_revenue: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="employee_count">Employee Count</Label>
                <Input
                  id="employee_count"
                  type="number"
                  placeholder="e.g., 100"
                  value={formData.employee_count || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      employee_count: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </div>

            {/* Social */}
            <div className="grid gap-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                placeholder="https://linkedin.com/company/acme"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the company..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editCompany ? 'Update Company' : 'Create Company'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface ViewCompanyDialogProps {
  company: Company | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (company: Company) => void;
}

function ViewCompanyDialog({ company, open, onOpenChange, onEdit }: ViewCompanyDialogProps) {
  if (!company) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {company.name}
          </DialogTitle>
          <DialogDescription>
            {company.industry && <span>{company.industry}</span>}
            {company.industry && company.size && <span> • </span>}
            {company.size && <span>{company.size}</span>}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <Badge className={`${statusColors[company.status]} text-white`}>
              {statusLabels[company.status]}
            </Badge>
            {company.contacts_count !== undefined && (
              <Badge variant="outline">
                <Users className="mr-1 h-3 w-3" />
                {company.contacts_count} contacts
              </Badge>
            )}
            {company.leads_count !== undefined && (
              <Badge variant="outline">
                <TrendingUp className="mr-1 h-3 w-3" />
                {company.leads_count} leads
              </Badge>
            )}
          </div>

          {company.description && (
            <div>
              <Label className="text-muted-foreground">Description</Label>
              <p className="text-sm mt-1">{company.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {company.website && (
              <div>
                <Label className="text-muted-foreground">Website</Label>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline flex items-center gap-1 mt-1"
                >
                  {company.website}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
            {company.email && (
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="text-sm mt-1">{company.email}</p>
              </div>
            )}
            {company.phone && (
              <div>
                <Label className="text-muted-foreground">Phone</Label>
                <p className="text-sm mt-1">{company.phone}</p>
              </div>
            )}
            {company.domain && (
              <div>
                <Label className="text-muted-foreground">Domain</Label>
                <p className="text-sm mt-1">{company.domain}</p>
              </div>
            )}
          </div>

          {(company.address || company.city || company.country) && (
            <div>
              <Label className="text-muted-foreground">Address</Label>
              <p className="text-sm mt-1">
                {[company.address, company.city, company.state, company.country, company.postal_code]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {company.annual_revenue && (
              <div>
                <Label className="text-muted-foreground">Annual Revenue</Label>
                <p className="text-sm mt-1">${company.annual_revenue.toLocaleString()}</p>
              </div>
            )}
            {company.employee_count && (
              <div>
                <Label className="text-muted-foreground">Employees</Label>
                <p className="text-sm mt-1">{company.employee_count.toLocaleString()}</p>
              </div>
            )}
          </div>

          {company.linkedin_url && (
            <div>
              <Label className="text-muted-foreground">LinkedIn</Label>
              <a
                href={company.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline flex items-center gap-1 mt-1"
              >
                {company.linkedin_url}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Created {format(new Date(company.created_at), 'PPP')}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              onEdit(company);
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CompanyStatsCards({ stats }: { stats: CompanyStats | null }) {
  if (!stats) return null;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            {stats.this_month} added this month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.active}</div>
          <p className="text-xs text-muted-foreground">
            {stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(0) : 0}% of total
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Prospects</CardTitle>
          <Users className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.prospect}</div>
          <p className="text-xs text-muted-foreground">Potential customers</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inactive</CardTitle>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.inactive}</div>
          <p className="text-xs text-muted-foreground">Dormant accounts</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [viewCompany, setViewCompany] = useState<Company | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 20,
    total: 0,
  });

  const fetchCompanies = async (page = 1) => {
    try {
      setError(null);
      const params: Record<string, string> = {
        page: page.toString(),
        per_page: '20',
      };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (industryFilter !== 'all') params.industry = industryFilter;

      const response = await companiesApi.getCompanies(params);
      if (response.success) {
        setCompanies(response.companies || []);
        setPagination({
          currentPage: response.pagination?.current_page || 1,
          lastPage: response.pagination?.last_page || 1,
          perPage: response.pagination?.per_page || 20,
          total: response.pagination?.total || 0,
        });
      }
    } catch (err) {
      console.error('Failed to fetch companies:', err);
      setError('Failed to load companies. Please try again.');
      setCompanies([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await companiesApi.getStats();
      if (response.success && response.stats) {
        setStats(response.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchStats();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCompanies();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, statusFilter, industryFilter]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchCompanies(pagination.currentPage), fetchStats()]);
  };

  const handleDelete = async (company: Company) => {
    if (!confirm(`Are you sure you want to delete "${company.name}"?`)) return;

    setDeletingId(company.id);
    try {
      await companiesApi.deleteCompany(company.id);
      toast.success('Company deleted');
      fetchCompanies(pagination.currentPage);
      fetchStats();
    } catch (err) {
      console.error('Failed to delete company:', err);
      toast.error('Failed to delete company');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (company: Company) => {
    setEditCompany(company);
    setCreateDialogOpen(true);
  };

  const handleView = (company: Company) => {
    setViewCompany(company);
    setViewDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    fetchCompanies(page);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-60" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">Track and manage your target companies</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => {
            setEditCompany(null);
            setCreateDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        </div>
      </div>

      {/* Stats */}
      <CompanyStatsCards stats={stats} />

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Companies List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Companies</CardTitle>
          <CardDescription>Search and filter your company database</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Status:</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Industry:</Label>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industryOptions.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          {companies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-muted rounded-full mb-4">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">No companies yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your first company to start building your database.
              </p>
              <Button onClick={() => {
                setEditCompany(null);
                setCreateDialogOpen(true);
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Company
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Contacts</TableHead>
                      <TableHead className="text-right">Leads</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{company.name}</p>
                            {company.domain && (
                              <p className="text-sm text-muted-foreground">{company.domain}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {company.industry || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusColors[company.status]} text-white`}>
                            {statusLabels[company.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {company.size || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {company.contacts_count ?? 0}
                        </TableCell>
                        <TableCell className="text-right">
                          {company.leads_count ?? 0}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(company.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(company)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(company)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDelete(company)}
                                disabled={deletingId === company.id}
                              >
                                {deletingId === company.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="mr-2 h-4 w-4" />
                                )}
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.lastPage > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {((pagination.currentPage - 1) * pagination.perPage) + 1} to{' '}
                    {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} of{' '}
                    {pagination.total} companies
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {pagination.currentPage} of {pagination.lastPage}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.lastPage}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <CompanyDialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) setEditCompany(null);
        }}
        onSuccess={() => {
          fetchCompanies(pagination.currentPage);
          fetchStats();
        }}
        editCompany={editCompany}
      />

      {/* View Dialog */}
      <ViewCompanyDialog
        company={viewCompany}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        onEdit={handleEdit}
      />
    </div>
  );
}
