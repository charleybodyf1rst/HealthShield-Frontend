'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, Bell, Layers, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCampaignStore } from '@/stores/campaign-store';
import { communicationApi } from '@/lib/api';
import { toast } from 'sonner';
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
    color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/50',
    ring: 'ring-blue-500',
  },
  {
    type: 'sms',
    label: 'SMS',
    description: 'Text messages via Twilio',
    icon: MessageSquare,
    color: 'text-green-500 bg-green-50 dark:bg-green-950/50',
    ring: 'ring-green-500',
  },
  {
    type: 'push',
    label: 'Push Notification',
    description: 'Push notifications via OneSignal',
    icon: Bell,
    color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/50',
    ring: 'ring-purple-500',
  },
  {
    type: 'multi_channel',
    label: 'Multi-Channel',
    description: 'Email + SMS + Push combined',
    icon: Layers,
    color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50',
    ring: 'ring-indigo-500',
  },
];

export function CampaignSetupStep() {
  const { wizard, updateWizard } = useCampaignStore();
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingName, setIsGeneratingName] = useState(false);

  const handleAiDescription = async () => {
    if (!wizard.name.trim()) {
      toast.error('Enter a campaign name first');
      return;
    }
    setIsGeneratingDesc(true);
    try {
      const result = await communicationApi.aiGenerateDraft({
        purpose: `Write a brief 1-2 sentence campaign description for a ${wizard.type} campaign called "${wizard.name}". This is for a health insurance call center called HealthShield. Return ONLY the description, nothing else.`,
        tone: 'friendly',
      });
      updateWizard({ description: result.body.replace(/^["']|["']$/g, '').trim() });
    } catch {
      toast.error('Failed to generate description');
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleAiName = async () => {
    setIsGeneratingName(true);
    try {
      const result = await communicationApi.aiSuggestSubject({
        body: `Generate a catchy ${wizard.type} campaign name for a health insurance company called HealthShield. The campaign is about reaching potential customers about health insurance plans. Return just the name, max 60 characters.`,
      });
      if (result.subjects?.[0]) {
        updateWizard({ name: result.subjects[0] });
      }
    } catch {
      toast.error('Failed to generate name');
    } finally {
      setIsGeneratingName(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Campaign Name */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="campaign-name">
            Campaign Name <span className="text-red-500">*</span>
          </Label>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs h-7"
            onClick={handleAiName}
            disabled={isGeneratingName}
          >
            {isGeneratingName ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            Suggest Name
          </Button>
        </div>
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
        <div className="flex items-center justify-between">
          <Label htmlFor="campaign-description">Description (optional)</Label>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs h-7"
            onClick={handleAiDescription}
            disabled={isGeneratingDesc || !wizard.name.trim()}
          >
            {isGeneratingDesc ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            AI Description
          </Button>
        </div>
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
