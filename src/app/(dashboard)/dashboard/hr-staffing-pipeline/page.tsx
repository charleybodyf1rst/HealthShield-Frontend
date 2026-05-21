'use client';

import { Handshake } from 'lucide-react';
import { NamedPipelineKanban } from '@/components/crm/NamedPipelineKanban';

export default function HrStaffingPipelinePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Handshake className="h-6 w-6 text-cyan-400" />
            HR Staffing Pipeline
          </h1>
          <p className="text-sm text-white/50 mt-1 max-w-2xl">
            6-stage kanban for HR staffing partnership outreach: Researched → Contacted →
            Responded → Negotiating → Signed / Not Interested. Drag a lead between stages
            or use the &quot;Move&quot; dropdown on each card.
          </p>
        </div>
      </div>

      <NamedPipelineKanban
        pipelineSlug="hr-staffing"
        leadTag="hr-staffing"
        displayName="HR Staffing"
        seederName="HrStaffingPipelineStagesSeeder"
      />
    </div>
  );
}
