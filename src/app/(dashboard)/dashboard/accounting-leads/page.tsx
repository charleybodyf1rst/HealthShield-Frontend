'use client';

import { Calculator } from 'lucide-react';
import { TaggedLeadsList } from '@/components/dashboard/tagged-leads-list';

export default function AccountingLeadsPage() {
  return (
    <TaggedLeadsList
      tag="accounting"
      title={
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Calculator className="h-6 w-6 text-emerald-400" />
          Accounting Firms
        </h1>
      }
      subtitle="Texas business CPAs (audit, business tax, advisory) — channel partners for B1 Corporate Wellness. No personal tax preparers."
      avatarClass="bg-gradient-to-br from-emerald-500 to-green-600"
      emptyTitle="No accounting leads yet"
      emptySubtitle="Run the AccountingLeadsSeeder on the backend to populate the curated Texas business CPA list."
    />
  );
}
