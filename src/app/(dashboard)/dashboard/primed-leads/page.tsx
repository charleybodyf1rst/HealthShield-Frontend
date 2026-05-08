'use client';

import { Sparkles } from 'lucide-react';
import { TaggedLeadsList } from '@/components/dashboard/tagged-leads-list';

export default function PrimedLeadsPage() {
  return (
    <TaggedLeadsList
      tag="primed"
      title={
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-orange-400" />
          Primed Leads
        </h1>
      }
      subtitle="Your highest-fit leads — Austin SMBs (15–200 employees) with working contact info, national-chain satellites filtered out. List view; the same data as Primed Pipeline but in a sortable table."
      avatarClass="bg-gradient-to-br from-orange-500 to-amber-500"
      emptyTitle="No primed leads"
      emptySubtitle="Run the build-primed-pipeline route to tag qualifying Austin SMBs."
    />
  );
}
