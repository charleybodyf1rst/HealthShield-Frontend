'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  XCircle,
  Send,
  Save,
  PartyPopper,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCampaignStore } from '@/stores/campaign-store';
import { CAMPAIGN_TYPE_CONFIG } from '@/types/campaign';

interface ChecklistItem {
  label: string;
  passed: boolean;
}

export function CampaignConfirmStep() {
  const router = useRouter();
  const { wizard, createCampaign, sendCampaign, isSending, isLoading } =
    useCampaignStore();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [successState, setSuccessState] = useState<{
    sent: boolean;
    recipientCount: number;
    campaignId: string;
  } | null>(null);

  const typeConfig = CAMPAIGN_TYPE_CONFIG[wizard.type];

  const getContentForType = (): string => {
    if (wizard.type === 'sms') return wizard.content || wizard.smsContent;
    if (wizard.type === 'push') return wizard.pushBody;
    return wizard.content;
  };

  const checklist: ChecklistItem[] = [
    { label: 'Campaign name set', passed: wizard.name.trim().length > 0 },
    { label: 'Campaign type selected', passed: !!wizard.type },
    { label: 'Audience configured (count > 0)', passed: wizard.audienceCount > 0 },
    { label: 'Content written', passed: getContentForType().trim().length > 0 },
    ...(wizard.type === 'email' || wizard.type === 'multi_channel'
      ? [{ label: 'Subject line set', passed: wizard.subject.trim().length > 0 }]
      : []),
  ];

  const allPassed = checklist.every((item) => item.passed);

  const buildCampaignData = (status: 'draft' | 'active') => {
    const data: Record<string, unknown> = {
      name: wizard.name,
      type: wizard.type,
      description: wizard.description || undefined,
      content: getContentForType(),
      target_audience: wizard.audience,
      template_id: wizard.templateId || undefined,
    };
    if (wizard.type === 'email' || wizard.type === 'multi_channel') {
      data.subject = wizard.subject;
    }
    if (wizard.scheduleType === 'later' && wizard.scheduledAt) {
      data.scheduled_at = wizard.scheduledAt;
    }
    if (wizard.type === 'multi_channel') {
      data.metadata = {
        sms_content: wizard.smsContent,
        push_title: wizard.pushTitle,
        push_body: wizard.pushBody,
      };
    }
    if (wizard.hasVariantB) {
      data.metadata = {
        ...(data.metadata as Record<string, unknown> || {}),
        ab_testing: {
          enabled: true,
          variant_b_subject: wizard.variantBSubject,
          variant_b_content: wizard.variantBContent,
          split_percentage: wizard.splitPercentage,
        },
      };
    }
    return data;
  };

  const handleSaveAsDraft = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await createCampaign(buildCampaignData('draft') as any);
      toast.success('Campaign saved as draft');
      router.push('/dashboard/campaigns');
    } catch {
      toast.error('Failed to save campaign');
    }
  };

  const handleSendCampaign = async () => {
    setShowConfirmDialog(false);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const campaign = await createCampaign(buildCampaignData('active') as any);
      await sendCampaign(campaign.id);
      setSuccessState({
        sent: true,
        recipientCount: wizard.audienceCount,
        campaignId: campaign.id,
      });
      toast.success('Campaign sent successfully!');
    } catch {
      toast.error('Failed to send campaign');
    }
  };

  // -- Success State --
  if (successState) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
        <div className="relative">
          <div className="absolute -inset-4 bg-green-100 rounded-full animate-ping opacity-30" />
          <PartyPopper className="h-16 w-16 text-green-500 relative" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Campaign Sent!</h2>
          <p className="text-muted-foreground">
            Campaign sent to{' '}
            <span className="font-semibold text-foreground">
              {successState.recipientCount.toLocaleString()}
            </span>{' '}
            recipients
          </p>
        </div>
        <Button
          onClick={() =>
            router.push(`/dashboard/campaigns/${successState.campaignId}`)
          }
        >
          View Campaign Details
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pre-Send Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {checklist.map((item, i) => (
            <div
              key={i}
              className={cn(
                'flex items-center gap-3 rounded-lg p-2.5 text-sm',
                item.passed ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              )}
            >
              {item.passed ? (
                <CheckCircle2 className="h-4.5 w-4.5 text-green-600 shrink-0" />
              ) : (
                <XCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />
              )}
              <span>{item.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Campaign Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{wizard.name || '---'}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Type</span>
            <Badge className={cn(typeConfig.color, 'text-white text-xs')}>
              {typeConfig.label}
            </Badge>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Recipients</span>
            <span className="font-medium">
              {wizard.audienceCount.toLocaleString()}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Scheduled</span>
            <span className="font-medium">
              {wizard.scheduleType === 'now'
                ? 'Send immediately'
                : wizard.scheduledAt
                  ? new Date(wizard.scheduledAt).toLocaleString()
                  : 'Not set'}
            </span>
          </div>
          {wizard.hasVariantB && (
            <>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">A/B Split</span>
                <span className="font-medium">
                  {wizard.splitPercentage}% / {100 - wizard.splitPercentage}%
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between pt-2">
        <Button
          variant="outline"
          onClick={handleSaveAsDraft}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save as Draft
        </Button>
        <Button
          onClick={() => setShowConfirmDialog(true)}
          disabled={!allPassed || isSending}
          className="gap-2"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Send Campaign
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Send</DialogTitle>
            <DialogDescription>
              You are about to send &ldquo;{wizard.name}&rdquo; to{' '}
              <strong>{wizard.audienceCount.toLocaleString()}</strong> recipients
              {wizard.scheduleType === 'now'
                ? ' immediately'
                : ` scheduled for ${wizard.scheduledAt ? new Date(wizard.scheduledAt).toLocaleString() : 'later'}`}
              . This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSendCampaign} disabled={isSending}>
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Confirm & Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
