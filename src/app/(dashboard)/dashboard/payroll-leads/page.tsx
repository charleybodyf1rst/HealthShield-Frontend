'use client';

import { DollarSign } from 'lucide-react';
import { TaggedLeadsList } from '@/components/dashboard/tagged-leads-list';

export default function PayrollLeadsPage() {
  return (
    <TaggedLeadsList
      tag="payroll"
      title={
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-indigo-400" />
          Payroll Companies
        </h1>
      }
      subtitle="Texas payroll & PEO firms — channel partners for B1 Corporate Wellness. We pay these firms a commission for referring SMB clients."
      avatarClass="bg-gradient-to-br from-indigo-500 to-blue-500"
      emptyTitle="No payroll leads yet"
      emptySubtitle="Run the PayrollLeadsSeeder on the backend to populate the curated Texas firm list."
    />
  );
}
