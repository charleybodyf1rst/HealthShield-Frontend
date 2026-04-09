'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Upload,
  Users,
  FileSpreadsheet,
  Search,
  CheckSquare,
  Square,
  Loader2,
  UserPlus,
  Mail,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCampaignStore } from '@/stores/campaign-store';
import { campaignsApi } from '@/lib/api';

interface Recipient {
  id: number;
  contact_first_name: string;
  contact_last_name: string;
  contact_email: string;
  contact_phone: string;
  status: string;
  source: string;
  company_name: string;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'contacted_1', label: 'Contacted (1st)' },
  { value: 'contacted_2', label: 'Contacted (2nd)' },
  { value: 'contacted_3', label: 'Contacted (3rd)' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'negotiating', label: 'Negotiating' },
  { value: 'converted', label: 'Converted' },
];

const SOURCE_OPTIONS = [
  { value: '', label: 'All Sources' },
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'phone', label: 'Phone' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'google', label: 'Google' },
  { value: 'health_fair', label: 'Health Fair' },
  { value: 'medicare_gov', label: 'Medicare.gov' },
  { value: 'insurance_broker', label: 'Insurance Broker' },
];

export function CampaignAudienceStep() {
  const { wizard, updateWizard } = useCampaignStore();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    new Set((wizard.audience?.selected_ids as number[]) || [])
  );
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState('leads');
  const [csvRecipients, setCsvRecipients] = useState<Array<{ email: string; name: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const fetchRecipients = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = { per_page: '50' };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (sourceFilter) params.source = sourceFilter;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await campaignsApi.listRecipients(params as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = response as any;
      const data = Array.isArray(raw?.data) ? raw.data : [];
      setRecipients(data);
      setTotal(raw?.total || data.length);
    } catch {
      setRecipients([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, sourceFilter]);

  useEffect(() => {
    fetchRecipients();
  }, [fetchRecipients]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => fetchRecipients(), 300);
  };

  // Selection handlers
  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    updateWizard({
      audience: { ...wizard.audience, selected_ids: Array.from(newSelected) },
      audienceCount: newSelected.size + csvRecipients.length,
    });
  };

  const selectAll = () => {
    const allIds = new Set(recipients.map((r) => r.id));
    const merged = new Set([...selectedIds, ...allIds]);
    setSelectedIds(merged);
    updateWizard({
      audience: { ...wizard.audience, selected_ids: Array.from(merged) },
      audienceCount: merged.size + csvRecipients.length,
    });
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
    updateWizard({
      audience: { ...wizard.audience, selected_ids: [] },
      audienceCount: csvRecipients.length,
    });
  };

  // CSV import
  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await campaignsApi.importAudienceCsv(file);
      setCsvRecipients(result.recipients || []);
      updateWizard({
        audience: {
          ...wizard.audience,
          imported_emails: result.recipients,
        },
        audienceCount: selectedIds.size + (result.recipients?.length || 0),
      });
      toast.success(`Imported ${result.count} recipients${result.invalid_count > 0 ? ` (${result.invalid_count} invalid)` : ''}`);
    } catch {
      toast.error('Failed to import CSV');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const statusLabel = (status: string) => {
    const opt = STATUS_OPTIONS.find((s) => s.value === status);
    return opt?.label || status;
  };

  return (
    <div className="space-y-5">
      {/* Header with count */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Target Audience</h3>
        <Badge variant="secondary" className="gap-1.5 text-sm px-3 py-1.5">
          <Users className="h-3.5 w-3.5" />
          {selectedIds.size + csvRecipients.length} selected
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="leads" className="flex-1 gap-1.5">
            <UserPlus className="h-3.5 w-3.5" />
            CRM Leads
          </TabsTrigger>
          <TabsTrigger value="csv" className="flex-1 gap-1.5">
            <FileSpreadsheet className="h-3.5 w-3.5" />
            CSV Import
          </TabsTrigger>
        </TabsList>

        {/* CRM Leads Tab */}
        <TabsContent value="leads" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, company..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value || 'all'} value={opt.value || 'all_statuses'}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value || 'all'} value={opt.value || 'all_sources'}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Select All / Deselect All */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={selectAll}>
                <CheckSquare className="h-3.5 w-3.5" />
                Select All ({recipients.length})
              </Button>
              <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs" onClick={deselectAll}>
                <Square className="h-3.5 w-3.5" />
                Deselect All
              </Button>
            </div>
            <span className="text-xs text-muted-foreground">
              {total} total leads found
            </span>
          </div>

          {/* Recipient List */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              ) : recipients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No leads found</p>
                  <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="divide-y max-h-[400px] overflow-y-auto">
                  {recipients.map((r) => {
                    const isSelected = selectedIds.has(r.id);
                    const fullName = `${r.contact_first_name || ''} ${r.contact_last_name || ''}`.trim() || 'Unknown';

                    return (
                      <label
                        key={r.id}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelect(r.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{fullName}</span>
                            {r.company_name && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                                <Building2 className="h-3 w-3" />
                                {r.company_name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {r.contact_email || 'No email'}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {statusLabel(r.status)}
                        </Badge>
                      </label>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CSV Import Tab */}
        <TabsContent value="csv" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                CSV Import
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Drop CSV file here or click to upload</p>
                <p className="text-xs text-muted-foreground mt-1">CSV with email column (and optional name column)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={handleCsvUpload}
                />
              </div>

              {csvRecipients.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="gap-1">
                      <Users className="h-3 w-3" />
                      {csvRecipients.length} imported
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => {
                      setCsvRecipients([]);
                      updateWizard({
                        audience: { ...wizard.audience, imported_emails: [] },
                        audienceCount: selectedIds.size,
                      });
                    }}>
                      Clear
                    </Button>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto border rounded-md divide-y">
                    {csvRecipients.slice(0, 20).map((r, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 text-xs">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>{r.email}</span>
                        {r.name && <span className="text-muted-foreground">({r.name})</span>}
                      </div>
                    ))}
                    {csvRecipients.length > 20 && (
                      <div className="px-3 py-2 text-xs text-muted-foreground">
                        ...and {csvRecipients.length - 20} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
