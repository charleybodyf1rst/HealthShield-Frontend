'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Monitor, Smartphone, Bell, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCampaignStore } from '@/stores/campaign-store';
import { communicationApi } from '@/lib/api';
import { CAMPAIGN_TYPE_CONFIG } from '@/types/campaign';

type DeviceMode = 'desktop' | 'mobile';

export function CampaignPreviewStep() {
  const { wizard, updateWizard } = useCampaignStore();
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [isGeneratingVariant, setIsGeneratingVariant] = useState(false);

  const typeConfig = CAMPAIGN_TYPE_CONFIG[wizard.type];

  const getContentPreview = () => {
    if (wizard.type === 'sms') return wizard.content || wizard.smsContent;
    if (wizard.type === 'push') return wizard.pushBody;
    return wizard.content;
  };

  // -- Email Preview --
  const renderEmailPreview = () => {
    const emailHtml = wizard.contentHtml || wizard.content;
    const wrappedHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 16px; border-radius: 8px 8px 0 0; border-bottom: 2px solid #e9ecef;">
          <div style="font-size: 12px; color: #6c757d;">From: HealthShield <noreply@healthshield.com></div>
          <div style="font-size: 12px; color: #6c757d;">Subject: <strong>${wizard.subject || '(No subject)'}</strong></div>
        </div>
        <div style="background: white; padding: 24px; border: 1px solid #e9ecef; border-top: none; border-radius: 0 0 8px 8px;">
          ${emailHtml.replace(/\n/g, '<br/>')}
        </div>
      </div>
    `;

    return (
      <div
        className={cn(
          'border rounded-lg bg-white overflow-hidden',
          deviceMode === 'mobile' ? 'max-w-[375px] mx-auto' : 'w-full'
        )}
      >
        {/* Browser chrome */}
        <div className="bg-gray-100 border-b px-3 py-2 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-white rounded text-xs text-muted-foreground px-3 py-1 truncate">
            mail.healthshield.com
          </div>
        </div>
        <div
          className="p-4 min-h-[300px] text-sm"
          dangerouslySetInnerHTML={{ __html: wrappedHtml }}
        />
      </div>
    );
  };

  // -- SMS Preview --
  const renderSmsPreview = () => {
    const content = wizard.content || wizard.smsContent || '(No content)';
    return (
      <div className={cn('max-w-[375px] mx-auto')}>
        {/* Phone frame */}
        <div className="border-2 border-gray-300 rounded-[2rem] bg-gray-50 overflow-hidden">
          {/* Status bar */}
          <div className="bg-gray-800 text-white text-xs px-4 py-1 flex justify-between">
            <span>9:41</span>
            <span>HealthShield</span>
            <span>100%</span>
          </div>
          {/* Messages area */}
          <div className="p-4 min-h-[350px] flex flex-col justify-end bg-white">
            <div className="bg-blue-500 text-white px-4 py-2.5 rounded-2xl rounded-br-md max-w-[80%] self-end text-sm">
              {content}
            </div>
            <p className="text-[10px] text-muted-foreground text-right mt-1">
              {wizard.scheduleType === 'now' ? 'Now' : wizard.scheduledAt || 'Scheduled'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // -- Push Preview --
  const renderPushPreview = () => (
    <div className="max-w-[375px] mx-auto">
      <div className="border rounded-xl bg-white shadow-lg p-4 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 shrink-0">
          <Bell className="h-5 w-5 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">
            {wizard.pushTitle || '(No title)'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-3">
            {wizard.pushBody || '(No content)'}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">now</p>
        </div>
      </div>
    </div>
  );

  // -- Device preview --
  const renderDevicePreview = () => {
    if (wizard.type === 'sms') return renderSmsPreview();
    if (wizard.type === 'push') return renderPushPreview();
    return renderEmailPreview();
  };

  // -- Summary Card --
  const renderSummary = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Campaign Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Name</span>
          <span className="font-medium">{wizard.name || '(Unnamed)'}</span>
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
          <span className="text-muted-foreground">Audience</span>
          <span className="font-medium">{wizard.audienceCount.toLocaleString()} recipients</span>
        </div>
        <Separator />
        <div className="flex justify-between">
          <span className="text-muted-foreground">Schedule</span>
          <span className="font-medium">
            {wizard.scheduleType === 'now'
              ? 'Immediately'
              : wizard.scheduledAt
                ? new Date(wizard.scheduledAt).toLocaleString()
                : 'Not set'}
          </span>
        </div>
        {wizard.subject && (
          <>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subject</span>
              <span className="font-medium truncate max-w-[200px]">{wizard.subject}</span>
            </div>
          </>
        )}
        <Separator />
        <div>
          <span className="text-muted-foreground">Content Preview</span>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-3">
            {(getContentPreview() || '').slice(0, 100)}
            {(getContentPreview() || '').length > 100 ? '...' : ''}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Device Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Preview</h3>
            {wizard.type === 'email' && (
              <div className="flex gap-1 border rounded-lg p-0.5">
                <Button
                  variant={deviceMode === 'desktop' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => setDeviceMode('desktop')}
                >
                  <Monitor className="h-3.5 w-3.5 mr-1" />
                  Desktop
                </Button>
                <Button
                  variant={deviceMode === 'mobile' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => setDeviceMode('mobile')}
                >
                  <Smartphone className="h-3.5 w-3.5 mr-1" />
                  Mobile
                </Button>
              </div>
            )}
          </div>
          {renderDevicePreview()}
        </div>

        {/* Right: Summary + A/B */}
        <div className="space-y-4">
          {renderSummary()}

          {/* A/B Testing */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">A/B Testing</CardTitle>
                <Switch
                  checked={wizard.hasVariantB}
                  onCheckedChange={(checked) => updateWizard({ hasVariantB: checked })}
                />
              </div>
            </CardHeader>
            {wizard.hasVariantB && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Split Percentage</Label>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-medium w-20">
                      A: {wizard.splitPercentage}%
                    </span>
                    <Slider
                      value={[wizard.splitPercentage]}
                      onValueChange={([val]) => updateWizard({ splitPercentage: val })}
                      min={10}
                      max={90}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-xs font-medium w-20 text-right">
                      B: {100 - wizard.splitPercentage}%
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  {/* Variant A */}
                  <div className="space-y-2 p-3 rounded-lg border bg-muted/30">
                    <Label className="text-xs font-medium">Variant A (Original)</Label>
                    <p className="text-xs text-muted-foreground truncate">
                      {wizard.subject || wizard.pushTitle || '(No subject)'}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {(getContentPreview() || '').slice(0, 80)}
                    </p>
                  </div>
                  {/* Variant B */}
                  <div className="space-y-2 p-3 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium">Variant B</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs h-6 px-2"
                        disabled={isGeneratingVariant}
                        onClick={async () => {
                          setIsGeneratingVariant(true);
                          try {
                            const result = await communicationApi.aiImproveTone({
                              body: wizard.content,
                              targetTone: 'friendly',
                            });
                            const subjects = await communicationApi.aiSuggestSubject({ body: result.body });
                            updateWizard({
                              variantBContent: result.body,
                              variantBSubject: subjects.subjects?.[0] || wizard.subject + ' (v2)',
                            });
                          } catch { /* ignore */ } finally {
                            setIsGeneratingVariant(false);
                          }
                        }}
                      >
                        {isGeneratingVariant ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                        AI Generate
                      </Button>
                    </div>
                    <Input
                      placeholder="Alt subject..."
                      value={wizard.variantBSubject}
                      onChange={(e) => updateWizard({ variantBSubject: e.target.value })}
                      className="h-7 text-xs"
                    />
                    <Textarea
                      placeholder="Alt content..."
                      value={wizard.variantBContent}
                      onChange={(e) => updateWizard({ variantBContent: e.target.value })}
                      rows={3}
                      className="text-xs"
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
