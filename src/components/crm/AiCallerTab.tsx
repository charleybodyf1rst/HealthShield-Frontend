'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Clock,
  User,
  Calendar,
  Plus,
  RefreshCw,
  Play,
  Pause,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { useHealthShieldCrmStore } from '@/stores/healthshield-crm-store';
import { cn } from '@/lib/utils';
import type { BoatCall, BoatCallType } from '@/types/boat-crm';
import { toast } from 'sonner';

const callTypeLabels: Record<BoatCallType, string> = {
  booking_confirmation: 'Booking Confirmation',
  reminder_24h: '24h Reminder',
  reminder_2h: '2h Reminder',
  weather_alert: 'Weather Alert',
  follow_up: 'Follow-up',
  review_request: 'Review Request',
  custom: 'Custom Call',
};

const statusColors: Record<string, string> = {
  scheduled: 'bg-orange-100 text-orange-700',
  queued: 'bg-amber-100 text-amber-700',
  dialing: 'bg-orange-100 text-orange-700',
  ringing: 'bg-orange-100 text-orange-700',
  in_progress: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-slate-100 text-slate-700',
  failed: 'bg-red-100 text-red-700',
  no_answer: 'bg-amber-100 text-amber-700',
  voicemail: 'bg-orange-50 text-orange-600',
  cancelled: 'bg-slate-100 text-slate-500',
};

function ActiveCallCard({ call }: { call: BoatCall }) {
  const [duration, setDuration] = useState(call.durationSeconds || 0);

  // Timer for active calls
  useState(() => {
    if (call.status === 'in_progress') {
      const interval = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border-l-4 border-l-orange-500 bg-orange-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full animate-pulse shadow-lg shadow-orange-500/25">
              <PhoneCall className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">
                {call.customerName || call.phoneNumber}
              </h4>
              <p className="text-sm text-slate-500">
                {callTypeLabels[call.type]} • {call.voice || 'Default Voice'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <Badge className={statusColors[call.status]}>
                {call.status.replace('_', ' ')}
              </Badge>
              <p className="text-lg font-mono font-bold text-emerald-600 mt-1">
                {formatDuration(duration)}
              </p>
            </div>
            <Button variant="destructive" size="sm" className="gap-1">
              <PhoneOff className="w-4 h-4" />
              End
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CallHistoryCard({ call }: { call: BoatCall }) {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
      <div className="flex items-center gap-4">
        <div className={cn(
          "p-2 rounded-lg",
          call.status === 'completed' ? "bg-emerald-100" :
            call.status === 'failed' ? "bg-red-100" : "bg-slate-100"
        )}>
          {call.status === 'completed' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          ) : call.status === 'failed' ? (
            <XCircle className="w-5 h-5 text-red-600" />
          ) : (
            <Phone className="w-5 h-5 text-slate-600" />
          )}
        </div>
        <div>
          <h4 className="font-medium text-slate-900">
            {call.customerName || call.phoneNumber}
          </h4>
          <p className="text-sm text-slate-500">
            {callTypeLabels[call.type]} • {formatDuration(call.durationSeconds)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge className={statusColors[call.status]}>
          {call.status.replace('_', ' ')}
        </Badge>
        <span className="text-sm text-slate-500">
          {new Date(call.createdAt).toLocaleString()}
        </span>
        {call.transcript && (
          <Button variant="ghost" size="sm">
            <FileText className="w-4 h-4" />
          </Button>
        )}
        {call.recordingUrl && (
          <Button variant="ghost" size="sm">
            <Download className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function ScheduleCallDialog() {
  const [open, setOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [callType, setCallType] = useState<BoatCallType>('booking_confirmation');
  const [scheduledFor, setScheduledFor] = useState('');

  const { scheduleCall, callsLoading } = useHealthShieldCrmStore();

  const handleSubmit = async () => {
    if (!phoneNumber) {
      toast.error('Phone number is required');
      return;
    }

    try {
      await scheduleCall(phoneNumber, callType, {
        customerName: customerName || undefined,
        scheduledFor: scheduledFor || undefined,
      });
      toast.success('Call scheduled successfully');
      setOpen(false);
      setPhoneNumber('');
      setCustomerName('');
    } catch (error) {
      toast.error('Failed to schedule call');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Schedule Call
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule AI Call</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              placeholder="+1 (555) 123-4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Customer Name</Label>
            <Input
              id="name"
              placeholder="John Smith"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Call Type</Label>
            <Select value={callType} onValueChange={(v) => setCallType(v as BoatCallType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(callTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="scheduled">Schedule For (optional)</Label>
            <Input
              id="scheduled"
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={callsLoading}
          >
            {callsLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Phone className="w-4 h-4 mr-2" />
            )}
            {scheduledFor ? 'Schedule Call' : 'Call Now'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AiCallerTab() {
  const {
    activeCalls,
    scheduledCalls,
    recentCalls,
    callsLoading,
    fetchCalls,
  } = useHealthShieldCrmStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">AI Caller</h2>
          <p className="text-slate-500">Manage automated customer calls</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => fetchCalls()}>
            <RefreshCw className={cn("w-4 h-4 mr-2", callsLoading && "animate-spin")} />
            Refresh
          </Button>
          <ScheduleCallDialog />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <PhoneCall className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Active Calls</p>
              <p className="text-xl font-bold">{activeCalls.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Scheduled</p>
              <p className="text-xl font-bold">{scheduledCalls.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Phone className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Today&apos;s Calls</p>
              <p className="text-xl font-bold">{recentCalls.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Success Rate</p>
              <p className="text-xl font-bold">87%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Calls */}
      {activeCalls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-emerald-500" />
              Active Calls
              <Badge className="bg-emerald-500 animate-pulse">
                {activeCalls.length} Live
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeCalls.map((call) => (
              <ActiveCallCard key={call.id} call={call} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Scheduled Calls */}
      {scheduledCalls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Scheduled Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scheduledCalls.map((call) => (
                <CallHistoryCard key={call.id} call={call} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-slate-500" />
            Recent Calls
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentCalls.length > 0 ? (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {recentCalls.map((call) => (
                  <CallHistoryCard key={call.id} call={call} />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Phone className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No recent calls</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
