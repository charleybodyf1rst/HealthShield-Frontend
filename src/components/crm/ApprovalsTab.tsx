'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  Calendar,
  Ship,
  RefreshCw,
  Shield,
  User,
} from 'lucide-react';
import { useHealthShieldCrmStore } from '@/stores/healthshield-crm-store';
import { cn } from '@/lib/utils';
import type { PendingApproval } from '@/types/boat-crm';
import { toast } from 'sonner';

const actionTypeIcons: Record<string, React.ReactNode> = {
  process_refund: <DollarSign className="w-5 h-5" />,
  reschedule_booking: <Calendar className="w-5 h-5" />,
  cancel_booking: <XCircle className="w-5 h-5" />,
  confirm_booking: <CheckCircle className="w-5 h-5" />,
  assign_captain: <User className="w-5 h-5" />,
  send_reminder: <Clock className="w-5 h-5" />,
  send_weather_alert: <AlertTriangle className="w-5 h-5" />,
  schedule_maintenance: <Ship className="w-5 h-5" />,
  process_payment: <DollarSign className="w-5 h-5" />,
};

const actionTypeLabels: Record<string, string> = {
  process_refund: 'Refund Request',
  reschedule_booking: 'Reschedule',
  cancel_booking: 'Cancellation',
  confirm_booking: 'Confirmation',
  assign_captain: 'Captain Assignment',
  send_reminder: 'Reminder',
  send_weather_alert: 'Weather Alert',
  schedule_maintenance: 'Maintenance',
  process_payment: 'Payment',
};

function ApprovalDetailCard({ approval, onApprove, onReject }: {
  approval: PendingApproval;
  onApprove: () => void;
  onReject: () => void;
}) {
  const riskStyles = {
    low: {
      badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      icon: 'text-emerald-500',
    },
    medium: {
      badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      icon: 'text-yellow-500',
    },
    high: {
      badge: 'bg-red-100 text-red-700 border-red-200',
      icon: 'text-red-500',
    },
  };

  const style = riskStyles[approval.risk];
  const icon = actionTypeIcons[approval.actionType] || <Shield className="w-5 h-5" />;
  const label = actionTypeLabels[approval.actionType] || approval.actionType;

  return (
    <Card className="border-l-4 border-l-yellow-400">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className={cn("p-3 rounded-xl bg-slate-100", style.icon)}>
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline">{label}</Badge>
                <Badge className={style.badge}>
                  {approval.risk} risk
                </Badge>
              </div>
              <h3 className="font-semibold text-lg text-slate-900">{approval.title}</h3>
              <p className="text-slate-500 mt-1">{approval.description}</p>
            </div>
          </div>
        </div>

        {/* Payload Details */}
        {approval.payload && Object.keys(approval.payload).length > 0 && (
          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-medium text-slate-700 mb-2">Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(approval.payload).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-slate-500 capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="font-medium text-slate-700">
                    {typeof value === 'number' && key.includes('amount')
                      ? `$${value.toLocaleString()}`
                      : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confidence & Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-slate-500">AI Confidence:</span>
              <span className={cn(
                "ml-2 font-semibold",
                approval.confidence >= 0.9 ? "text-emerald-600" :
                  approval.confidence >= 0.7 ? "text-yellow-600" : "text-red-600"
              )}>
                {Math.round(approval.confidence * 100)}%
              </span>
            </div>
            <div className="text-sm text-slate-500">
              <Clock className="w-4 h-4 inline mr-1" />
              {new Date(approval.createdAt).toLocaleTimeString()}
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onReject}
              className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </Button>
            <Button
              onClick={onApprove}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ApprovalsTab() {
  const {
    pendingApprovals,
    approvalsLoading,
    fetchPendingApprovals,
    handleApproval,
  } = useHealthShieldCrmStore();

  const onApprove = async (id: string) => {
    try {
      await handleApproval(id, true);
      toast.success('Action approved successfully');
    } catch (error) {
      toast.error('Failed to approve action');
    }
  };

  const onReject = async (id: string) => {
    try {
      await handleApproval(id, false);
      toast.success('Action rejected');
    } catch (error) {
      toast.error('Failed to reject action');
    }
  };

  // Group by risk level
  const highRisk = pendingApprovals.filter(a => a.risk === 'high');
  const mediumRisk = pendingApprovals.filter(a => a.risk === 'medium');
  const lowRisk = pendingApprovals.filter(a => a.risk === 'low');

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending</p>
              <p className="text-xl font-bold">{pendingApprovals.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">High Risk</p>
              <p className="text-xl font-bold text-red-600">{highRisk.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Shield className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Medium Risk</p>
              <p className="text-xl font-bold text-yellow-600">{mediumRisk.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Low Risk</p>
              <p className="text-xl font-bold text-emerald-600">{lowRisk.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approvals List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Pending Approvals
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => fetchPendingApprovals()}>
            <RefreshCw className={cn("w-4 h-4 mr-2", approvalsLoading && "animate-spin")} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {approvalsLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : pendingApprovals.length > 0 ? (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4 pr-4">
                {pendingApprovals.map((approval) => (
                  <ApprovalDetailCard
                    key={approval.id}
                    approval={approval}
                    onApprove={() => onApprove(approval.id)}
                    onReject={() => onReject(approval.id)}
                  />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-16">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-emerald-200" />
              <h3 className="text-xl font-semibold text-emerald-600 mb-2">All Clear!</h3>
              <p className="text-slate-500">No pending approvals at the moment</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
