'use client';

import { useCallback, useMemo, useState } from 'react';
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
  GripVertical,
} from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import {
  useNamedPipelineStages,
  useNamedPipelineLeads,
  moveLeadToStage,
  type NamedPipelineLead,
  type NamedPipelineStage,
} from '@/hooks/useNamedPipeline';
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

export interface NamedPipelineKanbanProps {
  /** pipeline_slug to filter crm_pipeline_stages by (e.g. 'hr-staffing', 'insurance-broker'). */
  pipelineSlug: string;
  /** tag in crm_leads.tags to filter leads by (typically same as pipelineSlug). */
  leadTag: string;
  /** Subject line for the pitch email. {{company}} interpolated. */
  pitchSubjectTemplate?: string;
  /** Display name of the seeder, shown in the empty-state hint. */
  seederName?: string;
  /** Display name of this pipeline (e.g. 'HR Staffing', 'Insurance Broker'). */
  displayName?: string;
}

export function NamedPipelineKanban({
  pipelineSlug,
  leadTag,
  pitchSubjectTemplate = 'A revenue share idea for {{company}}',
  seederName,
  displayName,
}: NamedPipelineKanbanProps) {
  const { stages, isLoading: stagesLoading, error: stagesError } = useNamedPipelineStages(pipelineSlug);
  const { leads, isLoading: leadsLoading, error: leadsError, reload: reloadLeads } = useNamedPipelineLeads(leadTag);
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [movingLeadId, setMovingLeadId] = useState<number | null>(null);

  // Compute distinct industries + cities from loaded leads
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

  // Optimistic per-lead stage overrides while drag-move is in flight
  const [stageOverrides, setStageOverrides] = useState<Record<number, string>>({});
  const [activeDragId, setActiveDragId] = useState<number | null>(null);

  const leadsByStage = useMemo(() => {
    const groups: Record<string, NamedPipelineLead[]> = {};
    for (const stage of stages) groups[stage.slug] = [];
    for (const l of filteredLeads) {
      const stageSlug = stageOverrides[l.id] ?? l.stage;
      if (groups[stageSlug]) groups[stageSlug].push(l);
    }
    return groups;
  }, [filteredLeads, stages, stageOverrides]);

  const totalValue = useMemo(() => {
    return stages.reduce((sum, stage) => {
      const stageLeads = leadsByStage[stage.slug] ?? [];
      const stageRev = stageLeads.reduce((s, l) => s + (l.estimated_employees ?? 0) * 25, 0);
      return sum + stageRev * (stage.probability_percentage / 100);
    }, 0);
  }, [stages, leadsByStage]);

  const handleMoveStage = useCallback(async (lead: NamedPipelineLead, newStageSlug: string) => {
    setMovingLeadId(lead.id);
    try {
      await moveLeadToStage(lead.id, newStageSlug);
      reloadLeads();
    } catch (e) {
      console.error('Failed to move lead', e);
      toast.error('Failed to move lead.');
    } finally {
      setMovingLeadId(null);
    }
  }, [reloadLeads]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const activeDragLead = useMemo(
    () => (activeDragId ? filteredLeads.find((l) => l.id === activeDragId) ?? null : null),
    [activeDragId, filteredLeads],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const id = typeof event.active.id === 'string' ? Number(event.active.id) : (event.active.id as number);
    setActiveDragId(id);
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over) return;
    const leadId = typeof active.id === 'string' ? Number(active.id) : (active.id as number);
    const lead = filteredLeads.find((l) => l.id === leadId);
    if (!lead) return;

    const currentStage = stageOverrides[leadId] ?? lead.stage;
    const overId = String(over.id);

    let destStage: string | null = null;
    if (stages.some((s) => s.slug === overId)) {
      destStage = overId;
    } else {
      const overLeadId = Number(overId);
      const overLead = filteredLeads.find((l) => l.id === overLeadId);
      if (overLead) destStage = stageOverrides[overLead.id] ?? overLead.stage;
    }
    if (!destStage || destStage === currentStage) return;

    setStageOverrides((o) => ({ ...o, [leadId]: destStage! }));
    try {
      await moveLeadToStage(leadId, destStage);
      await reloadLeads();
      setStageOverrides((o) => {
        const { [leadId]: _, ...rest } = o;
        return rest;
      });
    } catch (e) {
      console.error('Drag move failed', e);
      setStageOverrides((o) => {
        const { [leadId]: _, ...rest } = o;
        return rest;
      });
      toast.error('Failed to move lead.');
    }
  }, [filteredLeads, stages, stageOverrides, reloadLeads]);

  if (stagesError || leadsError) {
    return (
      <Card className="p-6 border border-red-500/30 bg-red-500/[0.08]">
        <div className="text-sm text-red-200">
          Failed to load {displayName ?? pipelineSlug} pipeline. {stagesError?.message || leadsError?.message}
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)] gap-4">
      {/* Summary line */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-white/70">
          <span className="text-white/50">Showing:</span>{' '}
          <strong className="text-white">{filteredLeads.length}</strong>
          {filteredLeads.length !== leads.length && (
            <span className="text-white/40"> of {leads.length}</span>
          )}
          <span className="text-white/30 mx-2">·</span>
          <span className="text-white/50">Weighted pipeline value:</span>{' '}
          <strong className="text-emerald-300">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
        </div>
        <Button variant="ghost" size="sm" onClick={reloadLeads} disabled={leadsLoading} className="text-white/70 hover:text-white">
          <RefreshCw className={cn('w-4 h-4', leadsLoading && 'animate-spin')} />
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 min-h-0 overflow-x-auto">
          <div className="flex gap-4 h-full pb-2">
            {stagesLoading && (
              <div className="flex items-center justify-center w-full text-white/50 text-sm gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading stages…
              </div>
            )}
            {!stagesLoading && stages.length === 0 && (
              <div className="flex items-center justify-center w-full text-white/50 text-sm">
                No {displayName ?? pipelineSlug} stages yet.
                {seederName && (
                  <> Run <code className="mx-1 px-1.5 py-0.5 bg-white/10 rounded text-white/80">{seederName}</code>.</>
                )}
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
                pitchSubjectTemplate={pitchSubjectTemplate}
              />
            ))}
          </div>
        </div>
        <DragOverlay>
          {activeDragLead ? (
            <Card className="p-3 bg-slate-900 border border-white/20 shadow-2xl w-72">
              <div className="flex items-start gap-2 mb-2">
                <Building2 className="w-3.5 h-3.5 mt-0.5 text-white/40 flex-shrink-0" />
                <div className="font-semibold text-sm text-white leading-tight">{activeDragLead.company_name}</div>
              </div>
              {activeDragLead.contact_first_name !== 'HR' && (
                <div className="text-xs text-white/75 ml-5">
                  {activeDragLead.contact_first_name} {activeDragLead.contact_last_name}
                </div>
              )}
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

interface StageColumnProps {
  stage: NamedPipelineStage;
  leads: NamedPipelineLead[];
  allStages: NamedPipelineStage[];
  onMove: (lead: NamedPipelineLead, newStageSlug: string) => void;
  movingLeadId: number | null;
  pitchSubjectTemplate: string;
}

function StageColumn({ stage, leads, allStages, onMove, movingLeadId, pitchSubjectTemplate }: StageColumnProps) {
  const stageRevenue = leads.reduce((sum, l) => sum + (l.estimated_employees ?? 0) * 25, 0);
  const color = stage.color ?? '#64748b';
  const { setNodeRef, isOver } = useDroppable({ id: stage.slug });

  return (
    <div className="flex flex-col w-72 min-w-72 bg-white/[0.02] rounded-lg border border-white/10">
      <div
        className="p-3 border-b border-white/10 rounded-t-lg"
        style={{ backgroundColor: `${color}15` }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <h3 className="font-semibold text-sm text-white">{stage.name}</h3>
          </div>
          <Badge variant="outline" className="text-xs border-white/20 text-white/80 bg-white/[0.05]">
            {leads.length}
          </Badge>
        </div>
        <div className="text-xs text-white/55 mt-1.5">
          {stage.probability_percentage}% probability
          {stageRevenue > 0 && (
            <> · <span className="text-emerald-300">${stageRevenue.toLocaleString()} est.</span></>
          )}
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 overflow-y-auto p-2 space-y-2 transition-colors',
          isOver && 'bg-white/[0.04] ring-2 ring-inset ring-white/20',
        )}
      >
        {leads.length === 0 && (
          <div className="text-xs text-white/30 italic py-6 text-center">
            {isOver ? 'Drop here' : 'No leads in this stage'}
          </div>
        )}
        <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              allStages={allStages}
              onMove={(slug) => onMove(lead, slug)}
              isMoving={movingLeadId === lead.id}
              pitchSubjectTemplate={pitchSubjectTemplate}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

interface LeadCardProps {
  lead: NamedPipelineLead;
  allStages: NamedPipelineStage[];
  onMove: (newStageSlug: string) => void;
  isMoving: boolean;
  pitchSubjectTemplate: string;
}

function LeadCard({ lead, allStages, onMove, isMoving, pitchSubjectTemplate }: LeadCardProps) {
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const contactName = [lead.contact_first_name, lead.contact_last_name].filter(Boolean).join(' ');
  const isPlaceholderName = lead.contact_first_name === 'HR' && lead.contact_last_name === 'Contact';
  const isPlaceholderEmail = lead.contact_email?.startsWith('info@') || lead.contact_email === 'unknown@example.com';

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.id });
  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  const composeEmailLink = () => {
    if (!lead.contact_email || isPlaceholderEmail) return '#';
    const subject = encodeURIComponent(pitchSubjectTemplate.replace('{{company}}', lead.company_name || ''));
    return `mailto:${lead.contact_email}?subject=${subject}`;
  };

  return (
    <Card
      ref={setNodeRef}
      style={dragStyle}
      className="p-3 bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all relative"
    >
      {isMoving && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center rounded">
          <Loader2 className="w-4 h-4 animate-spin text-white/70" />
        </div>
      )}

      <div className="flex items-start gap-1 mb-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex-shrink-0 -ml-1 p-1 text-white/30 hover:text-white/70 cursor-grab active:cursor-grabbing"
          aria-label="Drag to move"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <Building2 className="w-3.5 h-3.5 mt-0.5 text-white/40 flex-shrink-0" />
        <div className="font-semibold text-sm text-white leading-tight flex-1">{lead.company_name}</div>
      </div>

      {!isPlaceholderName && contactName && (
        <div className="text-xs text-white/75 ml-5 mb-1.5">
          {contactName}
          {lead.contact_title && <span className="text-white/40"> · {lead.contact_title}</span>}
        </div>
      )}

      <div className="ml-5 space-y-1 text-xs text-white/60">
        {lead.contact_email && (
          <div className="flex items-center gap-1.5 truncate">
            <Mail className="w-3 h-3 flex-shrink-0 text-white/40" />
            <span className={cn('truncate', isPlaceholderEmail && 'text-white/35 italic')}>{lead.contact_email}</span>
          </div>
        )}
        {lead.contact_phone && (
          <div className="flex items-center gap-1.5">
            <Phone className="w-3 h-3 flex-shrink-0 text-white/40" />
            <span>{lead.contact_phone}</span>
          </div>
        )}
        {(lead.company_city || lead.company_zip) && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 flex-shrink-0 text-white/40" />
            <span>
              {[lead.company_city, lead.company_zip].filter(Boolean).join(', ')}
            </span>
          </div>
        )}
        {lead.estimated_employees && (
          <div className="flex items-center gap-1.5">
            <Users className="w-3 h-3 flex-shrink-0 text-white/40" />
            <span>{lead.estimated_employees.toLocaleString()} employees</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 mt-2.5 pt-2 border-t border-white/10">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs flex-1 text-white/80 hover:text-white hover:bg-cyan-500/15 disabled:opacity-40"
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
            className="h-7 px-2 text-xs text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => setShowMoveMenu((s) => !s)}
          >
            Move <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
          {showMoveMenu && (
            <div className="absolute right-0 top-full mt-1 bg-slate-900 border border-white/15 rounded-md shadow-xl z-10 w-48 overflow-hidden">
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
                    className="w-full text-left px-3 py-2 text-xs text-white/85 hover:bg-white/10 flex items-center gap-2"
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
            className="h-7 w-7 inline-flex items-center justify-center text-white/40 hover:text-white/80 rounded hover:bg-white/10"
            title="Open website"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </Card>
  );
}
