'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UnifiedInbox } from '@/components/communications/unified-inbox';
import { CallWidget } from '@/components/communications/call-widget';
import { SmsPanel } from '@/components/communications/sms-panel';
import type { InboxItem } from '@/types/communication';

export default function InboxPage() {
  const router = useRouter();
  const [callLead, setCallLead] = useState<{ id: string; name: string; phone: string } | null>(null);
  const [smsLead, setSmsLead] = useState<{ id: string; name: string; phone: string } | null>(null);

  const handleSelectItem = (item: InboxItem) => {
    // Navigate to lead detail page if lead exists
    if (item.lead) {
      router.push(`/dashboard/leads/${item.lead.id}`);
    }
  };

  const handleCallLead = (leadId: string, phone: string) => {
    // For now we don't have the lead name, so we'll use "Lead"
    setCallLead({ id: leadId, name: 'Lead', phone });
  };

  const handleSmsLead = (leadId: string, phone: string) => {
    setSmsLead({ id: leadId, name: 'Lead', phone });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
        <p className="text-muted-foreground">
          View and manage all your communications in one place
        </p>
      </div>

      {/* Unified Inbox */}
      <Card className="h-[calc(100vh-200px)]">
        <CardContent className="p-0 h-full">
          <UnifiedInbox
            onSelectItem={handleSelectItem}
            onCallLead={handleCallLead}
            onSmsLead={handleSmsLead}
          />
        </CardContent>
      </Card>

      {/* Call Widget */}
      {callLead && (
        <CallWidget
          leadId={callLead.id}
          leadName={callLead.name}
          phoneNumber={callLead.phone}
          onClose={() => setCallLead(null)}
        />
      )}

      {/* SMS Panel */}
      {smsLead && (
        <SmsPanel
          leadId={smsLead.id}
          leadName={smsLead.name}
          leadPhone={smsLead.phone}
          isOpen={true}
          onClose={() => setSmsLead(null)}
        />
      )}
    </div>
  );
}
