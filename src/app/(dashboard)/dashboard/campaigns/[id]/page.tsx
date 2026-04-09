'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Bell,
  Calendar,
  CheckCircle,
  Copy,
  Eye,
  Layers,
  Loader2,
  Mail,
  MessageSquare,
  MousePointerClick,
  Send,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCampaignStore } from '@/stores/campaign-store';
import { CAMPAIGN_STATUS_CONFIG, CAMPAIGN_TYPE_CONFIG } from '@/types/campaign';
import type { CampaignStatus, CampaignType } from '@/types/campaign';

const typeIcons: Record<string, typeof Mail> = {
  email: Mail,
  sms: MessageSquare,
  push: Bell,
  multi_channel: Layers,
};

function MetricCard({ label, value, rate, icon: Icon, color }: {
  label: string;
  value: number;
  rate?: number;
  icon: typeof Mail;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value.toLocaleString()}</p>
            {rate !== undefined && (
              <p className={`text-sm font-medium mt-0.5 ${color}`}>{rate.toFixed(1)}%</p>
            )}
          </div>
          <div className={`h-12 w-12 rounded-full flex items-center justify-center bg-muted`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { selectedCampaign: campaign, isLoading, fetchCampaignById, sendCampaign, deleteCampaign } = useCampaignStore();

  useEffect(() => {
    if (params?.id) {
      fetchCampaignById(params.id as string);
    }
  }, [params?.id, fetchCampaignById]);

  const handleSend = async () => {
    if (!campaign) return;
    try {
      await sendCampaign(campaign.id);
      toast.success('Campaign sent');
      fetchCampaignById(campaign.id);
    } catch {
      toast.error('Failed to send campaign');
    }
  };

  const handleDelete = async () => {
    if (!campaign) return;
    try {
      await deleteCampaign(campaign.id);
      toast.success('Campaign deleted');
      router.push('/dashboard/campaigns');
    } catch {
      toast.error('Failed to delete campaign');
    }
  };

  if (isLoading || !campaign) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const statusConfig = CAMPAIGN_STATUS_CONFIG[campaign.status as CampaignStatus] || CAMPAIGN_STATUS_CONFIG.draft;
  const typeConfig = CAMPAIGN_TYPE_CONFIG[campaign.type as CampaignType] || CAMPAIGN_TYPE_CONFIG.email;
  const TypeIcon = typeIcons[campaign.type] || Mail;
  const openRate = campaign.sent_count > 0 ? (campaign.opened_count / campaign.sent_count) * 100 : 0;
  const clickRate = campaign.opened_count > 0 ? (campaign.clicked_count / campaign.opened_count) * 100 : 0;
  const conversionRate = campaign.sent_count > 0 ? (campaign.conversion_count / campaign.sent_count) * 100 : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/campaigns')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{campaign.name}</h1>
              <Badge className={statusConfig.color}>
                <div className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotColor} mr-1.5`} />
                {statusConfig.label}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <TypeIcon className="h-3 w-3" />
                {typeConfig.label}
              </Badge>
            </div>
            {campaign.description && (
              <p className="text-sm text-muted-foreground mt-1">{campaign.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Created {new Date(campaign.created_at).toLocaleDateString()}
              </span>
              {campaign.sent_at && (
                <span className="flex items-center gap-1">
                  <Send className="h-3 w-3" />
                  Sent {new Date(campaign.sent_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {campaign.status === 'draft' && (
            <Button onClick={handleSend} className="gap-1.5">
              <Send className="h-4 w-4" />
              Send Now
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={() => toast.info('Duplicate not yet implemented')}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="text-red-500 hover:text-red-600" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Delivered" value={campaign.delivered_count} rate={campaign.sent_count > 0 ? (campaign.delivered_count / campaign.sent_count) * 100 : 0} icon={Send} color="text-blue-500" />
        <MetricCard label="Opened" value={campaign.opened_count} rate={openRate} icon={Eye} color="text-green-500" />
        <MetricCard label="Clicked" value={campaign.clicked_count} rate={clickRate} icon={MousePointerClick} color="text-purple-500" />
        <MetricCard label="Converted" value={campaign.conversion_count} rate={conversionRate} icon={TrendingUp} color="text-orange-500" />
      </div>

      {/* Content Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Campaign Content</CardTitle>
        </CardHeader>
        <CardContent>
          {campaign.subject && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-1">Subject</p>
              <p className="font-medium">{campaign.subject}</p>
            </div>
          )}
          <Separator className="mb-4" />
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {campaign.content ? (
              <div className="whitespace-pre-wrap text-sm">{campaign.content}</div>
            ) : (
              <p className="text-muted-foreground text-sm">No content</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recipients summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Recipients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{campaign.total_recipients}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{campaign.sent_count}</p>
              <p className="text-xs text-muted-foreground">Sent</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{campaign.bounced_count}</p>
              <p className="text-xs text-muted-foreground">Bounced</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{campaign.unsubscribed_count}</p>
              <p className="text-xs text-muted-foreground">Unsubscribed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">${campaign.conversion_value.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Revenue</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
