'use client';

import { Handshake } from 'lucide-react';
import { TaggedLeadsList } from '@/components/dashboard/tagged-leads-list';

export default function HrStaffingLeadsPage() {
  return (
    <TaggedLeadsList
      tag="hr-staffing"
      title={
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Handshake className="h-6 w-6 text-cyan-400" />
          HR Staffing Leads
        </h1>
      }
      subtitle="HR staffing & recruiting firms across Texas — partnership outreach targets. We pay these firms a commission for referring HR clients to HealthShield."
      avatarClass="bg-gradient-to-br from-cyan-500 to-teal-500"
      emptyTitle="No HR staffing leads yet"
      emptySubtitle="Run the HrStaffingLeadsSeeder on the backend to populate the 97 researched firms."
    />
  );
}
