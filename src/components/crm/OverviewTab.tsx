'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Shield,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  DollarSign,
  TrendingUp,
  Phone,
  RefreshCw,
  FileSignature,
} from 'lucide-react';
import { useHealthShieldCrmStore } from '@/stores/healthshield-crm-store';
import { cn } from '@/lib/utils';
import type { TodaySchedule, PendingApproval, CrmActivity } from '@/types/crm';

function ScheduleCard({ schedule }: { schedule: TodaySchedule }) {
  const waiversComplete = schedule.waiversRequired > 0
    ? schedule.waiversCollected >= schedule.waiversRequired
    : true;
  const waiversPartial = schedule.waiversCollected > 0 && schedule.waiversCollected < schedule.waiversRequired;

  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-xl border",
      schedule.status === 'in_progress'
        ? "bg-emerald-50 border-emerald-200"
        : schedule.status === 'completed'
          ? "bg-slate-50 border-slate-200 opacity-60"
          : "bg-white border-slate-200"
    )}>
      <div className="flex items-center gap-4">
        <div className="text-3xl">{schedule.serviceIcon}</div>
        <div>
          <h4 className="font-semibold text-slate-900">{schedule.serviceName}</h4>
          <p className="text-sm text-slate-500">{schedule.customerName}</p>
        </div>
      </div>
      <div className="text-right">
        <div className="flex items-center gap-2 text-slate-600">
          <Clock className="w-4 h-4" />
          <span className="font-medium">{schedule.time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Users className="w-4 h-4" />
          <span>{schedule.partySize} guests</span>
        </div>
      </div>
      {/* Waiver Status */}
      {schedule.waiversRequired > 0 && (
        <div className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium",
          waiversComplete
            ? "bg-emerald-100 text-emerald-700"
            : waiversPartial
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
        )}>
          <FileSignature className="w-3.5 h-3.5" />
          <span>{schedule.waiversCollected}/{schedule.waiversRequired}</span>
        </div>
      )}
      <Badge
        variant={
          schedule.status === 'in_progress'
            ? 'default'
            : schedule.status === 'completed'
              ? 'secondary'
              : 'outline'
        }
        className={cn(
          schedule.status === 'in_progress' && "bg-emerald-500"
        )}
      >
        {schedule.status === 'in_progress' ? 'On Trip' : schedule.status === 'completed' ? 'Done' : 'Upcoming'}
      </Badge>
    </div>
  );
}

function ApprovalCard({ approval, onApprove, onReject }: {
  approval: PendingApproval;
  onApprove: () => void;
  onReject: () => void;
}) {
  const riskColors = {
    low: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-slate-900">{approval.title}</h4>
          <p className="text-sm text-slate-500 mt-1">{approval.description}</p>
        </div>
        <Badge className={riskColors[approval.risk]}>
          {approval.risk} risk
        </Badge>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">
          Confidence: {Math.round(approval.confidence * 100)}%
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onReject} className="gap-1">
            <XCircle className="w-4 h-4" />
            Reject
          </Button>
          <Button size="sm" onClick={onApprove} className="gap-1 bg-emerald-600 hover:bg-emerald-700">
            <CheckCircle className="w-4 h-4" />
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ activity }: { activity: CrmActivity }) {
  const colorClasses = {
    green: 'bg-emerald-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    gray: 'bg-slate-400',
    orange: 'bg-orange-500',
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor(diff / 60000);

    if (hours > 24) return date.toLocaleDateString();
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="flex items-start gap-3 py-3">
      <div className={cn(
        "w-2 h-2 rounded-full mt-2",
        colorClasses[activity.color || 'gray']
      )} />
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900">{activity.title}</p>
        <p className="text-sm text-slate-500">{activity.description}</p>
      </div>
      <span className="text-xs text-slate-400">{formatTime(activity.timestamp)}</span>
    </div>
  );
}

export function OverviewTab() {
  const {
    todaySchedule,
    pendingApprovals,
    recentActivity,
    kpisLoading,
    handleApproval,
    fetchDashboardData,
  } = useHealthShieldCrmStore();

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Left Column - Schedule */}
      <div className="col-span-7 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Today&apos;s Schedule
              </CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={() => fetchDashboardData()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {kpisLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : todaySchedule.length > 0 ? (
              <div className="space-y-3">
                {todaySchedule.map((schedule) => (
                  <ScheduleCard key={schedule.id} schedule={schedule} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Ship className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No trips scheduled for today</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="divide-y divide-slate-100">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Approvals */}
      <div className="col-span-5">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Pending Approvals
              </span>
              {pendingApprovals.length > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {pendingApprovals.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-400px)]">
              {pendingApprovals.length > 0 ? (
                <div className="space-y-3">
                  {pendingApprovals.map((approval) => (
                    <ApprovalCard
                      key={approval.id}
                      approval={approval}
                      onApprove={() => handleApproval(approval.id, true)}
                      onReject={() => handleApproval(approval.id, false)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-200" />
                  <p className="font-medium text-emerald-600">All caught up!</p>
                  <p className="text-sm">No pending approvals</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
