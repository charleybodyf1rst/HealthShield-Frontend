'use client';

import { CalendarDays } from 'lucide-react';
import { HrEventsTab } from '@/components/crm/HrEventsTab';

export default function HrEventsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-amber-400" />
            HR Events
          </h1>
          <p className="text-sm text-white/50 mt-1 max-w-2xl">
            Upcoming TX HR conferences, seminars, and expos — booth and attendance planning.
            Grouped by priority (Must Attend / Worth Evaluating / Skip). Filter by city or
            event type to narrow the list.
          </p>
        </div>
      </div>

      <HrEventsTab />
    </div>
  );
}
