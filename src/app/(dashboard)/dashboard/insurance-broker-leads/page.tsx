'use client';

import { Briefcase } from 'lucide-react';
import { TaggedLeadsList } from '@/components/dashboard/tagged-leads-list';

export default function InsuranceBrokerLeadsPage() {
  return (
    <TaggedLeadsList
      tag="insurance-broker"
      title={
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-indigo-400" />
          Insurance Broker Leads
        </h1>
      }
      subtitle="Independent insurance brokerages across Texas with commercial / group-benefits practices. Partnership outreach targets — 10% of first 12 months’ revenue, paid quarterly."
      avatarClass="bg-gradient-to-br from-indigo-500 to-violet-500"
      emptyTitle="No insurance broker leads yet"
      emptySubtitle="Run the InsuranceBrokerLeadsSeeder on the backend to populate the ~150 researched firms."
    />
  );
}
