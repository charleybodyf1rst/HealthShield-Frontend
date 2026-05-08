'use client';

/**
 * Shared stage-by-stage pipeline board.
 *
 * Used by /dashboard/primed-pipeline and /dashboard/personal-pipeline (and
 * potentially the main /dashboard/pipeline) to render a horizontal Kanban
 * grouped by lead status — same column structure as the main pipeline so all
 * three pipelines look consistent.
 *
 * Pure render component: it doesn't fetch. Caller passes in the leads list.
 */

import Link from 'next/link';
import {
  Building2,
  Users,
  Phone,
  Mail,
  ArrowUpRight,
} from 'lucide-react';
import type { Lead } from '@/types/lead';
import { LEAD_STATUSES } from '@/lib/constants';

// Tailwind gradient + accent for each stage. Mirrors the colors used on the
// main Pipeline page so everything stays visually consistent.
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

function LeadCard({ lead, accentClass }: { lead: Lead; accentClass: string }) {
  const initials = `${(lead.firstName || '?')[0]}${(lead.lastName || '')[0] || ''}`.toUpperCase();
  return (
    <Link
      href={`/dashboard/leads/${lead.id}`}
      className="block group rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] transition-colors p-2.5 space-y-1.5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
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
    </Link>
  );
}

export interface PipelineBoardProps {
  leads: Lead[];
  /** Hide stages that have zero leads. Default: true. */
  hideEmptyStages?: boolean;
  /** Optional accent color for avatar circles. Default: orange/amber gradient. */
  accentClass?: string;
}

export function PipelineBoard({ leads, hideEmptyStages = true, accentClass = 'bg-gradient-to-br from-orange-500 to-amber-500' }: PipelineBoardProps) {
  // Group by status
  const byStage: Record<string, Lead[]> = {};
  for (const lead of leads) {
    const s = lead.status || 'new';
    (byStage[s] = byStage[s] || []).push(lead);
  }

  // Use the canonical LEAD_STATUSES order. Always show 'new' even if empty
  // so the user has somewhere to drop fresh leads.
  const stagesToRender = LEAD_STATUSES.filter(
    (s) => s.id === 'new' || !hideEmptyStages || (byStage[s.id] && byStage[s.id].length > 0)
  );

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {stagesToRender.map((stage) => {
        const stageLeads = byStage[stage.id] || [];
        const styles = stageStyles[stage.id] || { gradient: 'from-gray-500 to-gray-600', light: 'bg-gray-50 dark:bg-gray-950/30' };
        const totalValue = stageLeads.reduce((sum, l) => sum + (l.value || 0), 0);
        return (
          <div key={stage.id} className="flex flex-col w-[280px] flex-shrink-0 rounded-xl overflow-hidden border border-white/5">
            <div className={`bg-gradient-to-r ${styles.gradient} px-3 py-2.5`}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm uppercase tracking-wide">{stage.name}</h3>
                <span className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full min-w-[24px] text-center">
                  {stageLeads.length}
                </span>
              </div>
              {totalValue > 0 && (
                <p className="text-xs text-white/80 mt-0.5">${totalValue.toLocaleString()}</p>
              )}
            </div>
            <div className={`flex-1 p-2 space-y-2 min-h-[200px] ${styles.light}`}>
              {stageLeads.length === 0 ? (
                <p className="text-center text-white/20 text-xs py-6">No leads</p>
              ) : (
                stageLeads.map((l) => (
                  <LeadCard key={l.id} lead={l} accentClass={accentClass} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
