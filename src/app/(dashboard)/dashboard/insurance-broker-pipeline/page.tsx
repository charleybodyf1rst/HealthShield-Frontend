'use client';

import { Briefcase } from 'lucide-react';
import { NamedPipelineKanban } from '@/components/crm/NamedPipelineKanban';

export default function InsuranceBrokerPipelinePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-indigo-400" />
            Insurance Broker Pipeline
          </h1>
          <p className="text-sm text-white/50 mt-1 max-w-2xl">
            6-stage kanban for insurance broker partnership outreach: Researched → Contacted →
            Responded → Negotiating → Signed / Not Interested. Same 10% / 12-month / quarterly
            terms as the HR Staffing program. Drag a card between stages or use the &quot;Move&quot;
            dropdown.
          </p>
        </div>
      </div>

      <NamedPipelineKanban
        pipelineSlug="insurance-broker"
        leadTag="insurance-broker"
        displayName="Insurance Broker"
        seederName="InsuranceBrokerPipelineStagesSeeder"
      />
    </div>
  );
}
