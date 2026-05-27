'use client';

import { Handshake } from 'lucide-react';
import { HrEventsTab } from '@/components/crm/HrEventsTab';

export default function BusinessNetworkingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Handshake className="h-6 w-6 text-cyan-400" />
            Business Networking
          </h1>
          <p className="text-sm text-white/50 mt-1 max-w-2xl">
            Rotary clubs, Chambers of Commerce, BNI chapters, and business luncheons across
            TX — chances to meet 20+ employee company owners face-to-face. Grouped by
            priority. Filter by city or event type to narrow the list.
          </p>
        </div>
      </div>

      <HrEventsTab tag="business-networking" budgetLabel="Total must-attend event budget" />
    </div>
  );
}
