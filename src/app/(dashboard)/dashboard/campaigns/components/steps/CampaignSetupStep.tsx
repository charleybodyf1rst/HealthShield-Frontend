'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageSquare, Bell, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCampaignStore } from '@/stores/campaign-store';
import type { CampaignType } from '@/types/campaign';

const TYPE_CARDS: Array<{
  type: CampaignType;
  label: string;
  description: string;
  icon: typeof Mail;
  color: string;
  ring: string;
}> = [
  {
    type: 'email',
    label: 'Email',
    description: 'Send emails via SendGrid',
    icon: Mail,
    color: 'text-blue-500 bg-blue-50',
    ring: 'ring-blue-500',
  },
  {
    type: 'sms',
    label: 'SMS',
    description: 'Text messages via Twilio',
    icon: MessageSquare,
    color: 'text-green-500 bg-green-50',
    ring: 'ring-green-500',
  },
  {
    type: 'push',
    label: 'Push Notification',
    description: 'Push notifications via OneSignal',
    icon: Bell,
    color: 'text-purple-500 bg-purple-50',
    ring: 'ring-purple-500',
  },
  {
    type: 'multi_channel',
    label: 'Multi-Channel',
    description: 'Email + SMS + Push combined',
    icon: Layers,
    color: 'text-indigo-500 bg-indigo-50',
    ring: 'ring-indigo-500',
  },
];

export function CampaignSetupStep() {
  const { wizard, updateWizard } = useCampaignStore();

  return (
    <div className="space-y-6">
      {/* Campaign Name */}
      <div className="space-y-2">
        <Label htmlFor="campaign-name">
          Campaign Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="campaign-name"
          placeholder="e.g., Spring Open Enrollment Outreach"
          value={wizard.name}
          onChange={(e) => updateWizard({ name: e.target.value })}
          maxLength={120}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="campaign-description">Description (optional)</Label>
        <Textarea
          id="campaign-description"
          placeholder="Brief description of this campaign's purpose..."
          value={wizard.description}
          onChange={(e) => updateWizard({ description: e.target.value })}
          rows={3}
        />
      </div>

      {/* Campaign Type */}
      <div className="space-y-3">
        <Label>Campaign Type</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TYPE_CARDS.map((card) => {
            const Icon = card.icon;
            const isSelected = wizard.type === card.type;
            return (
              <Card
                key={card.type}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  isSelected && `ring-2 ${card.ring}`
                )}
                onClick={() => updateWizard({ type: card.type })}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', card.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{card.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{card.description}</p>
                  </div>
                  <div
                    className={cn(
                      'mt-1 h-4 w-4 rounded-full border-2 transition-colors',
                      isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                    )}
                  >
                    {isSelected && (
                      <div className="h-full w-full flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Schedule */}
      <div className="space-y-3">
        <Label>Schedule</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="schedule"
              className="accent-primary h-4 w-4"
              checked={wizard.scheduleType === 'now'}
              onChange={() => updateWizard({ scheduleType: 'now', scheduledAt: null })}
            />
            <span className="text-sm font-medium">Send Now</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="schedule"
              className="accent-primary h-4 w-4"
              checked={wizard.scheduleType === 'later'}
              onChange={() => updateWizard({ scheduleType: 'later' })}
            />
            <span className="text-sm font-medium">Schedule for Later</span>
          </label>
        </div>
        {wizard.scheduleType === 'later' && (
          <Input
            type="datetime-local"
            value={wizard.scheduledAt || ''}
            onChange={(e) => updateWizard({ scheduledAt: e.target.value })}
            min={new Date().toISOString().slice(0, 16)}
            className="max-w-xs"
          />
        )}
      </div>
    </div>
  );
}
