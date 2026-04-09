'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, Users, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCampaignStore } from '@/stores/campaign-store';
import { campaignsApi } from '@/lib/api';
import type { AudienceFilters } from '@/types/campaign';

const LEAD_STATUSES = [
  'New',
  'Contacted (1st)',
  'Contacted (2nd)',
  'Contacted (3rd)',
  'Qualified',
  'Quoted',
  'Negotiating',
  'Converted',
  'Lost',
  'Unresponsive',
];

const LEAD_SOURCES = [
  'Website',
  'Referral',
  'Phone',
  'Social Media',
  'Google',
  'Health Fair',
  'Medicare.gov',
  'Insurance Broker',
];

export function CampaignAudienceStep() {
  const { wizard, updateWizard, estimateAudience, isEstimating } = useCampaignStore();
  const [allContacts, setAllContacts] = useState(
    !wizard.audience.status?.length &&
    !wizard.audience.source?.length &&
    !wizard.audience.tags?.length &&
    !wizard.audience.date_from &&
    !wizard.audience.date_to
  );
  const [tagsInput, setTagsInput] = useState(wizard.audience.tags?.join(', ') || '');
  const [csvResult, setCsvResult] = useState<{ valid: number; invalid: number } | null>(null);
  const [sampleRecipients, setSampleRecipients] = useState<
    Array<{ id: number; contact_first_name: string; contact_last_name: string; contact_email: string; status: string }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runEstimate = useCallback(
    (filters: AudienceFilters) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const result = await estimateAudience(filters);
        if (result.sample) {
          setSampleRecipients(result.sample.slice(0, 5));
        }
      }, 500);
    },
    [estimateAudience]
  );

  useEffect(() => {
    if (allContacts) {
      runEstimate({});
    } else {
      runEstimate(wizard.audience);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [allContacts, wizard.audience, runEstimate]);

  const updateFilters = (updates: Partial<AudienceFilters>) => {
    const newAudience = { ...wizard.audience, ...updates };
    updateWizard({ audience: newAudience });
  };

  const toggleArrayFilter = (
    key: 'status' | 'source',
    value: string
  ) => {
    const current = wizard.audience[key] || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilters({ [key]: updated });
  };

  const handleAllContactsToggle = (checked: boolean) => {
    setAllContacts(checked);
    if (checked) {
      updateWizard({ audience: {} });
    }
  };

  const handleTagsChange = (value: string) => {
    setTagsInput(value);
    const tags = value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    updateFilters({ tags: tags.length ? tags : undefined });
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }
    try {
      const result = await campaignsApi.importAudienceCsv(file);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = (result as any)?.data || result;
      setCsvResult({ valid: data.count || data.recipients?.length || 0, invalid: data.invalid_count || 0 });
      if (data.recipients?.length) {
        updateFilters({
          imported_emails: data.recipients.map((r: { email: string; name?: string }) => ({
            email: r.email,
            name: r.name,
          })),
        });
      }
      toast.success(`Imported ${data.count || data.recipients?.length || 0} contacts`);
    } catch {
      toast.error('Failed to import CSV');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Audience Count Badge */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Target Audience</h3>
        <Badge variant="secondary" className="gap-1.5 text-sm px-3 py-1">
          <Users className="h-3.5 w-3.5" />
          {isEstimating ? (
            <Skeleton className="h-4 w-12 inline-block" />
          ) : (
            `Estimated ${wizard.audienceCount.toLocaleString()} recipients`
          )}
        </Badge>
      </div>

      {/* All Contacts Toggle */}
      <div className="flex items-center gap-3">
        <Switch
          id="all-contacts"
          checked={allContacts}
          onCheckedChange={handleAllContactsToggle}
        />
        <Label htmlFor="all-contacts" className="cursor-pointer">
          All Contacts
        </Label>
      </div>

      {/* Filter Panel */}
      {!allContacts && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Lead Status */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Lead Status</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {LEAD_STATUSES.map((status) => (
                  <label
                    key={status}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <Checkbox
                      checked={wizard.audience.status?.includes(status) || false}
                      onCheckedChange={() => toggleArrayFilter('status', status)}
                    />
                    <span className="truncate">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            <Separator />

            {/* Lead Source */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Lead Source</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {LEAD_SOURCES.map((source) => (
                  <label
                    key={source}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <Checkbox
                      checked={wizard.audience.source?.includes(source) || false}
                      onCheckedChange={() => toggleArrayFilter('source', source)}
                    />
                    <span className="truncate">{source}</span>
                  </label>
                ))}
              </div>
            </div>

            <Separator />

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags-input" className="text-sm font-medium">
                Tags (comma-separated)
              </Label>
              <Input
                id="tags-input"
                placeholder="e.g., medicare, aep-2026, high-priority"
                value={tagsInput}
                onChange={(e) => handleTagsChange(e.target.value)}
              />
            </div>

            <Separator />

            {/* Date Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Date Range</Label>
              <div className="flex gap-4">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="date-from" className="text-xs text-muted-foreground">
                    From
                  </Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={wizard.audience.date_from || ''}
                    onChange={(e) => updateFilters({ date_from: e.target.value || undefined })}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor="date-to" className="text-xs text-muted-foreground">
                    To
                  </Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={wizard.audience.date_to || ''}
                    onChange={(e) => updateFilters({ date_to: e.target.value || undefined })}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CSV Import */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            CSV Import
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/50'
            )}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const file = e.dataTransfer.files[0];
              if (file && fileInputRef.current) {
                const dt = new DataTransfer();
                dt.items.add(file);
                fileInputRef.current.files = dt.files;
                fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }}
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drop CSV file here or click to upload
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCsvUpload}
            />
          </div>
          {csvResult && (
            <div className="flex gap-4 mt-3 text-sm">
              <Badge variant="default" className="bg-green-500">
                {csvResult.valid} valid
              </Badge>
              {csvResult.invalid > 0 && (
                <Badge variant="destructive">{csvResult.invalid} invalid</Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sample Recipients */}
      {sampleRecipients.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Sample Recipients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium">Email</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleRecipients.map((r) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-2">
                        {r.contact_first_name} {r.contact_last_name}
                      </td>
                      <td className="py-2 text-muted-foreground">{r.contact_email}</td>
                      <td className="py-2">
                        <Badge variant="outline" className="text-xs">
                          {r.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
