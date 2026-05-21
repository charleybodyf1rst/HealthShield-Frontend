'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Users,
  RefreshCw,
  Search,
  ChevronDown,
  Send,
  ExternalLink,
  Loader2,
  Factory,
  MapPinned,
} from 'lucide-react';
import {
  useHrStaffingStages,
  useHrStaffingLeads,
  moveLeadToStage,
  type HrStaffingLead,
  type PipelineStage,
} from '@/hooks/useHrStaffingLeads';
import { cn } from '@/lib/utils';

const SIZE_RANGES: Record<string, { min?: number; max?: number; label: string }> = {
  all: { label: 'All Sizes' },
  '1-25': { min: 1, max: 25, label: '1-25' },
  '25-50': { min: 25, max: 50, label: '25-50' },
  '50-100': { min: 50, max: 100, label: '50-100' },
  '100-200': { min: 100, max: 200, label: '100-200' },
  '200-500': { min: 200, max: 500, label: '200-500' },
  '500-1000': { min: 500, max: 1000, label: '500-1,000' },
  '1000-5000': { min: 1000, max: 5000, label: '1,000-5,000' },
  '5000+': { min: 5000, label: '5,000+' },
};

export function HrStaffingPipelineTab() {
  const { stages, isLoading: stagesLoading, error: stagesError } = useHrStaffingStages();
  const { leads, isLoading: leadsLoading, error: leadsError, reload: reloadLeads } = useHrStaffingLeads();
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [movingLeadId, setMovingLeadId] = useState<number | null>(null);

  // Compute distinct industries + cities present in the loaded leads
  const industries = useMemo(() => {
    const s = new Set<string>();
    leads.forEach((l) => l.industry && s.add(l.industry));
    return Array.from(s).sort();
  }, [leads]);

  const cities = useMemo(() => {
    const s = new Set<string>();
    leads.forEach((l) => l.company_city && s.add(l.company_city));
    return Array.from(s).sort();
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    const sizeRange = SIZE_RANGES[sizeFilter] || {};
    return leads.filter((l) => {
      if (q) {
        const matches = (
          l.company_name?.toLowerCase().includes(q) ||
          l.contact_email?.toLowerCase().includes(q) ||
          l.company_city?.toLowerCase().includes(q) ||
          l.contact_first_name?.toLowerCase().includes(q) ||
          l.contact_last_name?.toLowerCase().includes(q)
        );
        if (!matches) return false;
      }
      if (industryFilter !== 'all' && l.industry !== industryFilter) return false;
      if (cityFilter !== 'all' && l.company_city !== cityFilter) return false;
      if (sizeRange.min !== undefined || sizeRange.max !== undefined) {
        const emp = l.estimated_employees ?? null;
        if (emp === null) return false;
        if (sizeRange.min !== undefined && emp < sizeRange.min) return false;
        if (sizeRange.max !== undefined && emp >= sizeRange.max) return false;
      }
      return true;
    });
  }, [leads, search, industryFilter, sizeFilter, cityFilter]);

  const activeFilterCount = [
    industryFilter !== 'all',
    sizeFilter !== 'all',
    cityFilter !== 'all',
    search.trim() !== '',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setIndustryFilter('all');
    setSizeFilter('all');
    setCityFilter('all');
    setSearch('');
  };

  const leadsByStage = useMemo(() => {
    const groups: Record<string, HrStaffingLead[]> = {};
    for (const stage of stages) groups[stage.slug] = [];
    for (const l of filteredLeads) {
      if (groups[l.stage]) groups[l.stage].push(l);
    }
    return groups;
  }, [filteredLeads, stages]);

  const totalValue = useMemo(() => {
    // $25/employee × probability — quick estimate of pipeline value
    return stages.reduce((sum, stage) => {
      const stageLeads = leadsByStage[stage.slug] ?? [];
      const stageRev = stageLeads.reduce((s, l) => s + (l.estimated_employees ?? 0) * 25, 0);
      return sum + stageRev * (stage.probability_percentage / 100);
    }, 0);
  }, [stages, leadsByStage]);

  const handleMoveStage = async (lead: HrStaffingLead, newStageSlug: string) => {
    setMovingLeadId(lead.id);
    try {
      await moveLeadToStage(lead.id, newStageSlug);
      reloadLeads();
    } catch (e) {
      console.error('Failed to move lead', e);
      // eslint-disable-next-line no-alert
      alert('Failed to move lead. Check console.');
    } finally {
      setMovingLeadId(null);
    }
  };

  if (stagesError || leadsError) {
    return (
      <div className="p-6 text-sm text-red-600">
        Failed to load HR Staffing pipeline. {stagesError?.message || leadsError?.message}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)] gap-4">
      {/* Summary line */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm">
          <span className="text-gray-500">Showing:</span>{' '}
          <strong>{filteredLeads.length}</strong>
          {filteredLeads.length !== leads.length && (
            <span className="text-gray-400"> of {leads.length}</span>
          )}
          <span className="text-gray-400 mx-2">·</span>
          <span className="text-gray-500">Weighted pipeline value:</span>{' '}
          <strong>${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
        </div>
        <Button variant="ghost" size="sm" onClick={reloadLeads} disabled={leadsLoading}>
          <RefreshCw className={cn('w-4 h-4', leadsLoading && 'animate-spin')} />
        </Button>
      </div>

      {/* Filter bar — matches Leads tab UX */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search firms / contacts / cities…"
            className="pl-8 h-9 text-sm"
          />
        </div>

        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger className="w-44 h-9">
            <Factory className="w-3.5 h-3.5 mr-1.5" />
            <SelectValue placeholder="All Industries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            {industries.map((ind) => (
              <SelectItem key={ind} value={ind}>{ind}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sizeFilter} onValueChange={setSizeFilter}>
          <SelectTrigger className="w-40 h-9">
            <Users className="w-3.5 h-3.5 mr-1.5" />
            <SelectValue placeholder="All Sizes" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SIZE_RANGES).map(([key, range]) => (
              <SelectItem key={key} value={key}>{range.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-40 h-9">
            <MapPinned className="w-3.5 h-3.5 mr-1.5" />
            <SelectValue placeholder="All Cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 text-xs">
            Clear ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Kanban */}
      <div className="flex-1 min-h-0 overflow-x-auto">
        <div className="flex gap-4 h-full pb-2">
          {stagesLoading && (
            <div className="flex items-center justify-center w-full text-gray-500 text-sm gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading stages…
            </div>
          )}
          {!stagesLoading && stages.length === 0 && (
            <div className="flex items-center justify-center w-full text-gray-500 text-sm">
              No HR Staffing stages yet. Run <code className="mx-1 px-1 bg-gray-100 rounded">HrStaffingPipelineStagesSeeder</code>.
            </div>
          )}
          {stages.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              leads={leadsByStage[stage.slug] ?? []}
              allStages={stages}
              onMove={handleMoveStage}
              movingLeadId={movingLeadId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface StageColumnProps {
  stage: PipelineStage;
  leads: HrStaffingLead[];
  allStages: PipelineStage[];
  onMove: (lead: HrStaffingLead, newStageSlug: string) => void;
  movingLeadId: number | null;
}

function StageColumn({ stage, leads, allStages, onMove, movingLeadId }: StageColumnProps) {
  const stageRevenue = leads.reduce((sum, l) => sum + (l.estimated_employees ?? 0) * 25, 0);
  const color = stage.color ?? '#64748b';

  return (
    <div className="flex flex-col w-72 min-w-72 bg-slate-50 rounded-lg border border-slate-200">
      <div className="p-3 border-b border-slate-200 bg-white rounded-t-lg">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <h3 className="font-semibold text-sm text-slate-900">{stage.name}</h3>
          </div>
          <Badge variant="outline" className="text-xs">{leads.length}</Badge>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {stage.probability_percentage}% probability ·{' '}
          ${stageRevenue.toLocaleString()} est.
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {leads.length === 0 && (
          <div className="text-xs text-gray-400 italic py-6 text-center">
            No leads in this stage
          </div>
        )}
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            allStages={allStages}
            onMove={(slug) => onMove(lead, slug)}
            isMoving={movingLeadId === lead.id}
          />
        ))}
      </div>
    </div>
  );
}

interface LeadCardProps {
  lead: HrStaffingLead;
  allStages: PipelineStage[];
  onMove: (newStageSlug: string) => void;
  isMoving: boolean;
}

function LeadCard({ lead, allStages, onMove, isMoving }: LeadCardProps) {
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const contactName = [lead.contact_first_name, lead.contact_last_name].filter(Boolean).join(' ');
  const isPlaceholderEmail = lead.contact_email?.startsWith('info@') || lead.contact_email === 'unknown@example.com';

  const composeEmailLink = () => {
    if (!lead.contact_email || isPlaceholderEmail) return '#';
    const subject = encodeURIComponent(`A revenue share idea for ${lead.company_name}`);
    return `mailto:${lead.contact_email}?subject=${subject}`;
  };

  return (
    <Card className="p-3 bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all relative">
      {isMoving && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded">
          <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
        </div>
      )}

      <div className="flex items-start gap-2 mb-2">
        <Building2 className="w-3.5 h-3.5 mt-0.5 text-slate-400 flex-shrink-0" />
        <div className="font-medium text-sm text-slate-900 leading-tight">{lead.company_name}</div>
      </div>

      {contactName && contactName !== 'HR Contact' && (
        <div className="text-xs text-slate-600 ml-5 mb-1">
          {contactName}
          {lead.contact_title && <span className="text-slate-400"> · {lead.contact_title}</span>}
        </div>
      )}

      <div className="ml-5 space-y-0.5 text-xs text-slate-500">
        {lead.contact_email && (
          <div className="flex items-center gap-1 truncate">
            <Mail className="w-3 h-3 flex-shrink-0" />
            <span className={cn('truncate', isPlaceholderEmail && 'text-slate-400 italic')}>{lead.contact_email}</span>
          </div>
        )}
        {lead.contact_phone && (
          <div className="flex items-center gap-1">
            <Phone className="w-3 h-3 flex-shrink-0" />
            <span>{lead.contact_phone}</span>
          </div>
        )}
        {(lead.company_city || lead.company_zip) && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span>
              {[lead.company_city, lead.company_zip].filter(Boolean).join(', ')}
            </span>
          </div>
        )}
        {lead.estimated_employees && (
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 flex-shrink-0" />
            <span>{lead.estimated_employees.toLocaleString()} employees</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-100">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs flex-1"
          onClick={() => window.open(composeEmailLink(), '_blank')}
          disabled={isPlaceholderEmail}
          title={isPlaceholderEmail ? 'No direct email yet — enrich via Hunter or LinkedIn first' : 'Compose partnership pitch'}
        >
          <Send className="w-3 h-3 mr-1" />
          Pitch
        </Button>
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setShowMoveMenu((s) => !s)}
          >
            Move <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
          {showMoveMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded shadow-lg z-10 w-48">
              {allStages
                .filter((s) => s.slug !== lead.stage)
                .map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setShowMoveMenu(false);
                      onMove(s.slug);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color ?? '#64748b' }} />
                    {s.name}
                  </button>
                ))}
            </div>
          )}
        </div>
        {lead.website && (
          <a
            href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-7 w-7 inline-flex items-center justify-center text-slate-400 hover:text-slate-600"
            title="Open website"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </Card>
  );
}
