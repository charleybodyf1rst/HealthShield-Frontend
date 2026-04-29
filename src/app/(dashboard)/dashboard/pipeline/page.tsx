'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  GripVertical,
  Info,
  Loader2,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  RefreshCw,
  Target,
  TrendingUp,
  User,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
import { LEAD_STATUSES, LEAD_CLASSIFICATIONS } from '@/lib/constants';
import { usePipelineStore, useLeadsStore } from '@/stores/leads-store';
import { toast } from 'sonner';
import type { Lead, PipelineStage } from '@/types/lead';

// Stage color configurations with gradients and background colors
const stageConfig: Record<string, { bg: string; gradient: string; text: string; light: string }> = {
  new: { bg: 'bg-blue-500', gradient: 'from-blue-500 to-blue-600', text: 'text-blue-600', light: 'bg-blue-50 dark:bg-blue-950/30' },
  contacted_1: { bg: 'bg-yellow-500', gradient: 'from-yellow-500 to-yellow-600', text: 'text-yellow-600', light: 'bg-yellow-50 dark:bg-yellow-950/30' },
  contacted_2: { bg: 'bg-amber-500', gradient: 'from-amber-500 to-amber-600', text: 'text-amber-600', light: 'bg-amber-50 dark:bg-amber-950/30' },
  contacted_3: { bg: 'bg-amber-600', gradient: 'from-amber-600 to-amber-700', text: 'text-amber-700', light: 'bg-amber-50 dark:bg-amber-950/40' },
  contacted_5: { bg: 'bg-amber-700', gradient: 'from-amber-700 to-amber-800', text: 'text-amber-800', light: 'bg-amber-100 dark:bg-amber-950/50' },
  contacted_6: { bg: 'bg-amber-800', gradient: 'from-amber-800 to-amber-900', text: 'text-amber-900', light: 'bg-amber-100 dark:bg-amber-950/60' },
  pending: { bg: 'bg-violet-500', gradient: 'from-violet-500 to-violet-600', text: 'text-violet-600', light: 'bg-violet-50 dark:bg-violet-950/30' },
  demo: { bg: 'bg-sky-500', gradient: 'from-sky-500 to-sky-600', text: 'text-sky-600', light: 'bg-sky-50 dark:bg-sky-950/30' },
  census_requested: { bg: 'bg-orange-500', gradient: 'from-orange-500 to-orange-600', text: 'text-orange-600', light: 'bg-orange-50 dark:bg-orange-950/30' },
  proposal_sent: { bg: 'bg-purple-500', gradient: 'from-purple-500 to-purple-600', text: 'text-purple-600', light: 'bg-purple-50 dark:bg-purple-950/30' },
  group_info: { bg: 'bg-indigo-500', gradient: 'from-indigo-500 to-indigo-600', text: 'text-indigo-600', light: 'bg-indigo-50 dark:bg-indigo-950/30' },
  agreement_signed: { bg: 'bg-pink-500', gradient: 'from-pink-500 to-pink-600', text: 'text-pink-600', light: 'bg-pink-50 dark:bg-pink-950/30' },
  implementation: { bg: 'bg-teal-500', gradient: 'from-teal-500 to-teal-600', text: 'text-teal-600', light: 'bg-teal-50 dark:bg-teal-950/30' },
  census_final: { bg: 'bg-cyan-500', gradient: 'from-cyan-500 to-cyan-600', text: 'text-cyan-600', light: 'bg-cyan-50 dark:bg-cyan-950/30' },
  go_live: { bg: 'bg-emerald-500', gradient: 'from-emerald-500 to-emerald-600', text: 'text-emerald-600', light: 'bg-emerald-50 dark:bg-emerald-950/30' },
  active: { bg: 'bg-green-500', gradient: 'from-green-500 to-green-600', text: 'text-green-600', light: 'bg-green-50 dark:bg-green-950/30' },
  bad_number: { bg: 'bg-rose-500', gradient: 'from-rose-500 to-rose-600', text: 'text-rose-600', light: 'bg-rose-50 dark:bg-rose-950/30' },
  lost: { bg: 'bg-red-500', gradient: 'from-red-500 to-red-600', text: 'text-red-600', light: 'bg-red-50 dark:bg-red-950/30' },
};

// Classification badge colors
const classificationColors: Record<string, string> = {
  individual_health: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  family_health: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300',
  medicare_advantage: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  medicare_supplement: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  dental_vision: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300',
  group_employer: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
  corporate_event: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300',
};

// Helper to format relative time
function getRelativeTime(date: string | Date | undefined): string {
  if (!date) return '';
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffDays > 30) return `${Math.floor(diffDays / 30)}mo ago`;
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  return 'Just now';
}

interface LeadCardProps {
  lead: Lead;
  isDragging?: boolean;
}

function LeadCard({ lead, isDragging }: LeadCardProps) {
  const router = useRouter();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const classification = lead.classification || lead.classificationLabel;
  const classificationLabel = LEAD_CLASSIFICATIONS.find(c => c.id === classification)?.name || lead.classificationLabel;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-pointer transition-all duration-200 border-l-4 ${
        isDragging
          ? 'shadow-xl ring-2 ring-primary scale-105'
          : 'hover:shadow-md hover:border-l-primary hover:-translate-y-0.5'
      } ${stageConfig[lead.status]?.bg ? `border-l-current` : 'border-l-gray-300'}`}
      onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
    >
      <CardContent className="p-4">
        {/* Header with drag handle and actions */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div
            className="cursor-grab active:cursor-grabbing p-1 -ml-2 -mt-1 rounded hover:bg-muted/50 transition-colors"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground/50" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-7 w-7 -mr-2 -mt-1">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <Phone className="mr-2 h-4 w-4" />
                Call
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <Mail className="mr-2 h-4 w-4" />
                Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Meeting
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Lead Info */}
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
            <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground font-semibold">
              {lead.firstName?.[0] || '?'}
              {lead.lastName?.[0] || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate">
              {lead.firstName} {lead.lastName}
            </h4>
            {lead.email && (
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                {lead.email}
              </p>
            )}
          </div>
        </div>

        {/* Classification Badge */}
        {classification && (
          <div className="mt-3">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${classificationColors[classification] || 'bg-gray-100 text-gray-700'}`}>
              {classificationLabel}
            </span>
          </div>
        )}

        {/* Value and Time */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          {lead.value ? (
            <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              <DollarSign className="h-4 w-4" />
              {lead.value.toLocaleString()}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">No value set</span>
          )}
          {lead.updatedAt && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {getRelativeTime(lead.updatedAt)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Last updated: {new Date(lead.updatedAt).toLocaleDateString()}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StageColumn({ stage }: { stage: PipelineStage }) {
  const { setNodeRef } = useDroppable({ id: stage.id });
  const config = stageConfig[stage.id] || { bg: 'bg-gray-500', gradient: 'from-gray-500 to-gray-600', text: 'text-gray-600', light: 'bg-gray-50 dark:bg-gray-950/30' };
  const probability = stage.probability ?? 0;
  const leadCount = (stage.leads ?? []).length;

  // Progress bar width based on probability
  const progressWidth = `${probability}%`;

  return (
    <div className="flex flex-col w-[280px] flex-shrink-0">
      {/* Enhanced Stage Header */}
      <div className={`rounded-t-xl overflow-hidden shadow-sm`}>
        {/* Gradient Header Bar */}
        <div className={`bg-gradient-to-r ${config.gradient} px-4 py-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-lg">{stage.name}</h3>
              <span className="bg-white/20 text-white text-sm font-semibold px-2 py-0.5 rounded-full">
                {leadCount}
              </span>
            </div>

            {/* Exit Criteria Info */}
            {stage.exitCriteria && stage.exitCriteria.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/10">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-sm">
                    <p className="font-medium mb-2">Exit Criteria</p>
                    <ul className="space-y-1">
                      {stage.exitCriteria.map((criteria, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-3 w-3 mt-0.5 text-green-500 flex-shrink-0" />
                          <span>{criteria}</span>
                        </li>
                      ))}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Probability Progress Bar */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-white/80 mb-1">
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                Win Probability
              </span>
              <span className="font-semibold">{probability}%</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: progressWidth }}
              />
            </div>
          </div>
        </div>

        {/* Value Summary */}
        <div className={`${config.light} px-4 py-2 border-b border-border/50`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className={`h-4 w-4 ${config.text}`} />
              <span className="text-sm font-semibold">
                ${(stage.totalValue || 0).toLocaleString()}
              </span>
            </div>
            {stage.weightedValue !== undefined && stage.weightedValue !== stage.totalValue && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 cursor-help">
                      <TrendingUp className="h-3 w-3" />
                      ${(stage.weightedValue || 0).toLocaleString()} weighted
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Weighted value = Total × {probability}% probability
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>

      {/* Cards Container — droppable target for drag-and-drop */}
      <div ref={setNodeRef} className={`flex-1 ${config.light} rounded-b-xl p-3 min-h-[450px] border border-t-0 border-border/30`}>
        <SortableContext
          items={(stage.leads ?? []).map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {(stage.leads ?? []).map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        </SortableContext>

        {/* Empty State */}
        {leadCount === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className={`w-12 h-12 rounded-full ${config.light} flex items-center justify-center mb-3`}>
              <User className={`h-6 w-6 ${config.text} opacity-50`} />
            </div>
            <p className="text-sm text-muted-foreground mb-2">No leads in this stage</p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/leads/new">
                <Plus className="mr-1 h-3 w-3" />
                Add Lead
              </Link>
            </Button>
          </div>
        )}

        {/* Add Lead Button (when there are leads) */}
        {leadCount > 0 && (
          <Button
            variant="ghost"
            className={`w-full mt-3 border border-dashed border-border/50 hover:border-primary/50 ${config.text} hover:bg-transparent`}
            asChild
          >
            <Link href="/dashboard/leads/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Lead
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const { stages, isLoading, error, fetchPipeline, moveLeadToStage } = usePipelineStore();
  const { updateLead } = useLeadsStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  // Load pipeline on mount
  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchPipeline();
    } finally {
      setIsRefreshing(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    // Find the lead being dragged
    for (const stage of (stages ?? [])) {
      const lead = (stage.leads ?? []).find((l) => l.id === active.id);
      if (lead) {
        setActiveLead(lead);
        break;
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setActiveLead(null);
      return;
    }

    const activeLeadId = active.id as string;
    const overId = over.id as string;

    // Find source stage and lead
    let sourceStage: PipelineStage | null = null;
    let draggedLead: Lead | null = null;

    for (const stage of (stages ?? [])) {
      const lead = (stage.leads ?? []).find((l) => l.id === activeLeadId);
      if (lead) {
        sourceStage = stage;
        draggedLead = lead;
        break;
      }
    }

    if (!sourceStage || !draggedLead) {
      setActiveId(null);
      setActiveLead(null);
      return;
    }

    // Find destination stage
    let destStage: PipelineStage | null = null;

    // Check if dropped on a stage
    for (const stage of (stages ?? [])) {
      if (stage.id === overId) {
        destStage = stage;
        break;
      }
      // Check if dropped on a lead in a stage
      const leadInStage = (stage.leads ?? []).find((l) => l.id === overId);
      if (leadInStage) {
        destStage = stage;
        break;
      }
    }

    if (!destStage) {
      setActiveId(null);
      setActiveLead(null);
      return;
    }

    // Move the lead if stage changed
    if (sourceStage.id !== destStage.id) {
      setIsMoving(true);

      // Optimistically update the local state
      moveLeadToStage(activeLeadId, sourceStage.id, destStage.id);

      try {
        // Persist to backend
        await updateLead(activeLeadId, { status: destStage.id as Lead['status'] });
        toast.success(`Moved to ${destStage.name}`);
      } catch (err) {
        console.error('Failed to update lead status:', err);
        toast.error('Failed to move lead. Please try again.');
        // Revert and refresh to ensure consistency
        moveLeadToStage(activeLeadId, destStage.id, sourceStage.id);
        fetchPipeline();
      } finally {
        setIsMoving(false);
      }
    }

    setActiveId(null);
    setActiveLead(null);
  };

  const totalPipelineValue = (stages ?? []).reduce(
    (sum, stage) => sum + (stage.totalValue || 0),
    0
  );
  const totalLeads = (stages ?? []).reduce((sum, stage) => sum + (stage.leads ?? []).length, 0);

  // Loading skeleton for pipeline
  if (isLoading && (stages ?? []).length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-60" />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="text-right">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-6 w-12" />
            </div>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-[300px] flex-shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-8" />
              </div>
              <div className="bg-muted/30 rounded-lg p-2 min-h-[500px]">
                {Array.from({ length: 2 }).map((_, j) => (
                  <Skeleton key={j} className="h-24 w-full mb-2" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Calculate weighted total
  const totalWeightedValue = (stages ?? []).reduce(
    (sum, stage) => sum + (stage.weightedValue || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 border border-border/50">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              Sales Pipeline
            </h1>
            <p className="text-muted-foreground mt-1">
              Drag and drop leads between stages to track progress
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="h-10 w-10"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button asChild size="lg" className="shadow-md">
              <Link href="/dashboard/leads/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Lead
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-border/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Value</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  ${totalPipelineValue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-border/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Weighted Value</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ${totalWeightedValue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-border/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Active Leads</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalLeads}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm flex items-center gap-2">
          <Info className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Moving indicator */}
      {isMoving && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg animate-pulse">
          <Loader2 className="h-4 w-4 animate-spin" />
          Moving lead...
        </div>
      )}

      {/* Pipeline Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          className="pb-6 -mx-4 md:-mx-6"
          style={{
            overflowX: 'scroll',
            overflowY: 'visible',
            scrollbarWidth: 'auto',
            WebkitOverflowScrolling: 'touch',
            paddingLeft: '1rem',
            paddingRight: '1rem',
          }}
        >
          <div className="flex gap-3" style={{ width: 'max-content' }}>
            {(stages ?? []).map((stage) => (
              <StageColumn key={stage.id} stage={stage} />
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeLead && <LeadCard lead={activeLead} isDragging />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
