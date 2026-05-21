'use client';

import { Map as MapIcon } from 'lucide-react';
import { MapTab } from '@/components/crm/MapTab';

export default function LeadMapPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <MapIcon className="h-6 w-6 text-blue-400" />
            Lead Map
          </h1>
          <p className="text-sm text-white/50 mt-1 max-w-2xl">
            Geographic view of CRM leads. Filter by status, priority, or tag to focus the
            map on a specific cohort.
          </p>
        </div>
      </div>

      <MapTab />
    </div>
  );
}
