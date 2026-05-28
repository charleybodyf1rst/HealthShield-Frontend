'use client';

import { Calculator } from 'lucide-react';
import { NamedPipelineKanban } from '@/components/crm/NamedPipelineKanban';

export default function AccountingPipelinePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Calculator className="h-6 w-6 text-emerald-400" />
            Accounting Pipeline
          </h1>
          <p className="text-sm text-white/50 mt-1 max-w-2xl">
            6-stage kanban for Texas business CPA partnership outreach: Researched → Contacted →
            Responded → Negotiating → Signed / Not Interested.
          </p>
        </div>
      </div>

      <NamedPipelineKanban
        pipelineSlug="accounting"
        leadTag="accounting"
        displayName="Accounting"
        seederName="AccountingPipelineStagesSeeder"
      />
    </div>
  );
}
