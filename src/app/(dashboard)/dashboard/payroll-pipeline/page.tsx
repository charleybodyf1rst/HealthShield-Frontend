'use client';

import { DollarSign } from 'lucide-react';
import { NamedPipelineKanban } from '@/components/crm/NamedPipelineKanban';

export default function PayrollPipelinePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-indigo-400" />
            Payroll Pipeline
          </h1>
          <p className="text-sm text-white/50 mt-1 max-w-2xl">
            6-stage kanban for Texas payroll partnership outreach: Researched → Contacted →
            Responded → Negotiating → Signed / Not Interested.
          </p>
        </div>
      </div>

      <NamedPipelineKanban
        pipelineSlug="payroll"
        leadTag="payroll"
        displayName="Payroll"
        seederName="PayrollPipelineStagesSeeder"
      />
    </div>
  );
}
