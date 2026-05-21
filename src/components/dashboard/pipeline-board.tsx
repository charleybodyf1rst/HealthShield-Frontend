'use client';

/**
 * Shared stage-by-stage pipeline board.
 *
 * Used by /dashboard/primed-pipeline and /dashboard/personal-pipeline to
 * render a horizontal Kanban grouped by lead status — same column structure
 * as the main pipeline so all three pipelines look consistent.
 *
 * Supports drag-and-drop when an `onMoveLead` callback is provided. Without
 * it, the board renders as a read-only kanban (no drag handles).
 */

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  Phone,
  Mail,
  ArrowUpRight,
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
import type { Lead } from '@/types/lead';
import { LEAD_STATUSES } from '@/lib/constants';
import { useLeadFilters, LeadFilterBar } from './lead-filter-bar';

// Tailwind gradient + accent for each stage.
const stageStyles: Record<string, { gradient: string; light: string }> = {
  new: { gradient: 'from-blue-500 to-blue-600', light: 'bg-blue-50 dark:bg-blue-950/30' },
  contacted_1: { gradient: 'from-yellow-500 to-yellow-600', light: 'bg-yellow-50 dark:bg-yellow-950/30' },
  contacted_2: { gradient: 'from-amber-500 to-amber-600', light: 'bg-amber-50 dark:bg-amber-950/30' },
  contacted_3: { gradient: 'from-amber-600 to-amber-700', light: 'bg-amber-50 dark:bg-amber-950/30' },
  contacted_5: { gradient: 'from-amber-700 to-amber-800', light: 'bg-amber-50 dark:bg-amber-950/30' },
  contacted_6: { gradient: 'from-amber-800 to-amber-900', light: 'bg-amber-50 dark:bg-amber-950/30' },
  pending: { gradient: 'from-violet-500 to-violet-600', light: 'bg-violet-50 dark:bg-violet-950/30' },
  demo: { gradient: 'from-sky-500 to-sky-600', light: 'bg-sky-50 dark:bg-sky-950/30' },
  census_requested: { gradient: 'from-orange-500 to-orange-600', light: 'bg-orange-50 dark:bg-orange-950/30' },
  proposal_sent: { gradient: 'from-purple-500 to-purple-600', light: 'bg-purple-50 dark:bg-purple-950/30' },
  group_info: { gradient: 'from-indigo-500 to-indigo-600', light: 'bg-indigo-50 dark:bg-indigo-950/30' },
  agreement_signed: { gradient: 'from-pink-500 to-pink-600', light: 'bg-pink-50 dark:bg-pink-950/30' },
  implementation: { gradient: 'from-teal-500 to-teal-600', light: 'bg-teal-50 dark:bg-teal-950/30' },
  census_final: { gradient: 'from-cyan-500 to-cyan-600', light: 'bg-cyan-50 dark:bg-cyan-950/30' },
  go_live: { gradient: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50 dark:bg-emerald-950/30' },
  active: { gradient: 'from-green-500 to-green-600', light: 'bg-green-50 dark:bg-green-950/30' },
  bad_number: { gradient: 'from-rose-500 to-rose-600', light: 'bg-rose-50 dark:bg-rose-950/30' },
  email_only: { gradient: 'from-blue-700 to-blue-800', light: 'bg-blue-50 dark:bg-blue-950/30' },
  lost: { gradient: 'from-red-500 to-red-600', light: 'bg-red-50 dark:bg-red-950/30' },
};

interface LeadCardProps {
  lead: Lead;
  accentClass: string;
  /** When true, renders a grip handle and uses sortable context. */
  draggable?: boolean;
  /** When true, render in "ghost" overlay form (no Link). */
  overlay?: boolean;
}

function LeadCardInner({ lead, accentClass }: { lead: Lead; accentClass: string }) {
  const initials = `${(lead.firstName || '?')[0]}${(lead.lastName || '')[0] || ''}`.toUpperCase();
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <div className={`h-7 w-7 rounded-full ${accentClass} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">
              {lead.firstName} {lead.lastName}
            </p>
            {lead.company && (
              <p className="text-xs text-white/50 truncate flex items-center gap-1">
                <Building2 className="h-3 w-3" /> {lead.company}
              </p>
            )}
          </div>
        </div>
        <ArrowUpRight className="h-3.5 w-3.5 text-white/30 group-hover:text-white shrink-0" />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-white/60 pl-9">
        {typeof lead.estimatedEmployees === 'number' && (
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" /> {lead.estimatedEmployees}
          </span>
        )}
        {typeof lead.value === 'number' && lead.value > 0 && (
          <span className="text-emerald-400">${lead.value.toLocaleString()}</span>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap text-xs pl-9">
        {lead.phone && (
          <a
            href={`tel:${lead.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="text-white/60 hover:text-white flex items-center gap-1"
          >
            <Phone className="h-3 w-3" /> {lead.phone}
          </a>
        )}
        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            onClick={(e) => e.stopPropagation()}
            className="text-white/60 hover:text-white flex items-center gap-1 truncate max-w-[160px]"
          >
            <Mail className="h-3 w-3" />
            <span className="truncate">{lead.email}</span>
          </a>
        )}
      </div>
    </>
  );
}

function LeadCard({ lead, accentClass, draggable, overlay }: LeadCardProps) {
  // Sortable hooks only used when draggable. We can't conditionally call hooks,
  // so we delegate to a dedicated SortableLeadCard below for the draggable case.
  if (overlay) {
    return (
      <div className="block group rounded-lg border border-white/15 bg-slate-900 shadow-2xl p-2.5 space-y-1.5 cursor-grabbing">
        <LeadCardInner lead={lead} accentClass={accentClass} />
      </div>
    );
  }
  if (!draggable) {
    return (
      <Link
        href={`/dashboard/leads/${lead.id}`}
        className="block group rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] transition-colors p-2.5 space-y-1.5"
      >
        <LeadCardInner lead={lead} accentClass={accentClass} />
      </Link>
    );
  }
  return <SortableLeadCard lead={lead} accentClass={accentClass} />;
}

function SortableLeadCard({ lead, accentClass }: { lead: Lead; accentClass: string }) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] transition-colors"
    >
      <div className="flex items-start">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex-shrink-0 p-2 text-white/30 hover:text-white/60 cursor-grab active:cursor-grabbing"
          aria-label="Drag to move"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <Link
          href={`/dashboard/leads/${lead.id}`}
          className="flex-1 block p-2.5 pl-0 space-y-1.5"
          onClick={(e) => {
            // Don't navigate during drag
            if (isDragging) e.preventDefault();
          }}
        >
          <LeadCardInner lead={lead} accentClass={accentClass} />
        </Link>
      </div>
    </div>
  );
}

interface StageColumnProps {
  stageId: string;
  stageName: string;
  styles: { gradient: string; light: string };
  leads: Lead[];
  totalValue: number;
  accentClass: string;
  draggable: boolean;
}

function StageColumn({ stageId, stageName, styles, leads, totalValue, accentClass, draggable }: StageColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stageId, disabled: !draggable });
  return (
    <div className="flex flex-col w-[280px] flex-shrink-0 rounded-xl overflow-hidden border border-white/5">
      <div className={`bg-gradient-to-r ${styles.gradient} px-3 py-2.5`}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-sm uppercase tracking-wide">{stageName}</h3>
          <span className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full min-w-[24px] text-center">
            {leads.length}
          </span>
        </div>
        {totalValue > 0 && (
          <p className="text-xs text-white/80 mt-0.5">${totalValue.toLocaleString()}</p>
        )}
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 p-2 space-y-2 min-h-[200px] transition-colors ${styles.light} ${
          isOver ? 'ring-2 ring-inset ring-white/30' : ''
        }`}
      >
        {leads.length === 0 ? (
          <p className="text-center text-white/20 text-xs py-6">{draggable ? 'Drop here' : 'No leads'}</p>
        ) : (
          <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            {leads.map((l) => (
              <LeadCard key={l.id} lead={l} accentClass={accentClass} draggable={draggable} />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
}

export interface PipelineBoardProps {
  leads: Lead[];
  /** Hide stages that have zero leads. Default: false — show all stages so users can drop into empty columns. */
  hideEmptyStages?: boolean;
  /** Optional accent color for avatar circles. Default: orange/amber gradient. */
  accentClass?: string;
  /**
   * If provided, the kanban becomes drag-and-drop. Called when a lead is
   * dropped into a different stage column. Should persist the change and
   * (typically) trigger a refetch.
   */
  onMoveLead?: (leadId: string, newStageId: string) => Promise<void> | void;
}

export function PipelineBoard({
  leads,
  hideEmptyStages = false,
  accentClass = 'bg-gradient-to-br from-orange-500 to-amber-500',
  onMoveLead,
}: PipelineBoardProps) {
  const { filters, setFilters, filtered, reset, industries, activeCount } = useLeadFilters(leads);

  // Optimistic stage overrides: leadId → newStageId. Applied while the move
  // is in flight so the card visually jumps to the destination column.
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [activeId, setActiveId] = useState<string | null>(null);

  const draggable = !!onMoveLead;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Group filtered leads by status, applying any pending optimistic overrides.
  const byStage = useMemo(() => {
    const out: Record<string, Lead[]> = {};
    for (const lead of filtered) {
      const s = overrides[lead.id] ?? lead.status ?? 'new';
      (out[s] = out[s] || []).push(lead);
    }
    return out;
  }, [filtered, overrides]);

  const activeLead = useMemo(
    () => (activeId ? filtered.find((l) => l.id === activeId) ?? null : null),
    [activeId, filtered],
  );

  const stagesToRender = LEAD_STATUSES.filter(
    (s) => s.id === 'new' || !hideEmptyStages || (byStage[s.id] && byStage[s.id].length > 0),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || !onMoveLead) return;

    const leadId = active.id as string;
    const overId = over.id as string;

    // Find the lead's current stage (accounting for prior overrides)
    const lead = filtered.find((l) => l.id === leadId);
    if (!lead) return;
    const currentStage = overrides[leadId] ?? lead.status ?? 'new';

    // Resolve drop target: either a stage column id or another lead's id (in
    // which case we look up that lead's stage).
    let destStage: string | null = null;
    if (LEAD_STATUSES.some((s) => s.id === overId)) {
      destStage = overId;
    } else {
      const overLead = filtered.find((l) => l.id === overId);
      if (overLead) {
        destStage = overrides[overLead.id] ?? overLead.status ?? null;
      }
    }
    if (!destStage || destStage === currentStage) return;

    // Optimistic move
    setOverrides((o) => ({ ...o, [leadId]: destStage! }));
    try {
      await onMoveLead(leadId, destStage);
      // Parent should refetch and update leads[]; clear our override so the
      // canonical data takes over.
      setOverrides((o) => {
        const { [leadId]: _, ...rest } = o;
        return rest;
      });
    } catch (err) {
      // Revert
      setOverrides((o) => {
        const { [leadId]: _, ...rest } = o;
        return rest;
      });
      toast.error('Failed to move lead. Please try again.');
      console.error('move-lead error', err);
    }
  }, [filtered, overrides, onMoveLead]);

  const board = (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {stagesToRender.map((stage) => {
        const stageLeads = byStage[stage.id] || [];
        const styles = stageStyles[stage.id] || { gradient: 'from-gray-500 to-gray-600', light: 'bg-gray-50 dark:bg-gray-950/30' };
        const totalValue = stageLeads.reduce((sum, l) => sum + (l.value || 0), 0);
        return (
          <StageColumn
            key={stage.id}
            stageId={stage.id}
            stageName={stage.name}
            styles={styles}
            leads={stageLeads}
            totalValue={totalValue}
            accentClass={accentClass}
            draggable={draggable}
          />
        );
      })}
    </div>
  );

  return (
    <div className="space-y-4">
      <LeadFilterBar
        filters={filters}
        onChange={setFilters}
        industries={industries}
        showStatus={false}
        activeCount={activeCount}
        onReset={reset}
        theme="dark"
      />
      {filtered.length !== leads.length && (
        <p className="text-xs text-white/40">
          Showing {filtered.length} of {leads.length} leads
        </p>
      )}
      {draggable ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {board}
          <DragOverlay>
            {activeLead ? <LeadCard lead={activeLead} accentClass={accentClass} overlay /> : null}
          </DragOverlay>
        </DndContext>
      ) : board}
    </div>
  );
}
