'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  Mail,
  MessageSquare,
  Phone,
  Clock,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Plus,
  Settings2,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Bell,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://systemsf1rst-backend-887571186773.us-central1.run.app';

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('healthshield-crm-auth');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed?.state?.tokens?.accessToken || null;
    } catch { return null; }
  }
  return null;
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  channel: 'email' | 'sms' | 'voice';
  is_active: boolean;
  offset_minutes: number | null;
  template_subject?: string;
  template_body?: string;
  stats?: {
    sent: number;
    delivered: number;
    failed: number;
  };
}

interface NotificationLog {
  id: string;
  automation_name: string;
  channel: string;
  recipient: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  sent_at: string;
  error_message?: string;
}

const TRIGGER_LABELS: Record<string, string> = {
  enrollment_created: 'Enrollment Created',
  enrollment_confirmed: 'Enrollment Confirmed',
  before_appointment: 'Before Appointment',
  appointment_start: 'Appointment Start (Check-in)',
  after_appointment: 'After Appointment',
  booking_cancelled: 'Enrollment Cancelled',
};

const CHANNEL_ICONS: Record<string, typeof Mail> = {
  email: Mail,
  sms: MessageSquare,
  voice: Phone,
};

const CHANNEL_COLORS: Record<string, string> = {
  email: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  sms: 'bg-green-500/20 text-green-400 border-green-500/30',
  voice: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

// Default automations to show if backend hasn't been initialized
const DEFAULT_AUTOMATIONS: Automation[] = [
  {
    id: '1',
    name: 'Enrollment Confirmation Email',
    description: 'Send confirmation email with enrollment details, plan information, and next steps',
    trigger: 'enrollment_created',
    channel: 'email',
    is_active: true,
    offset_minutes: 0,
    stats: { sent: 0, delivered: 0, failed: 0 },
  },
  {
    id: '2',
    name: 'Enrollment Confirmation SMS',
    description: 'Text confirmation with date, time, plan details, and confirmation code',
    trigger: 'enrollment_created',
    channel: 'sms',
    is_active: true,
    offset_minutes: 0,
    stats: { sent: 0, delivered: 0, failed: 0 },
  },
  {
    id: '3',
    name: 'Consent Form SMS',
    description: 'Send digital consent form signing link to customer via SMS',
    trigger: 'enrollment_confirmed',
    channel: 'sms',
    is_active: true,
    offset_minutes: 5,
    stats: { sent: 0, delivered: 0, failed: 0 },
  },
  {
    id: '4',
    name: '3-Day Reminder',
    description: 'Reminder SMS sent 3 days before the appointment with office directions and preparation info',
    trigger: 'before_appointment',
    channel: 'sms',
    is_active: true,
    offset_minutes: -4320,
    stats: { sent: 0, delivered: 0, failed: 0 },
  },
  {
    id: '5',
    name: 'Day-Of Morning Reminder',
    description: 'Good morning SMS on the day of the appointment with office directions and check-in info',
    trigger: 'before_appointment',
    channel: 'sms',
    is_active: true,
    offset_minutes: -480,
    stats: { sent: 0, delivered: 0, failed: 0 },
  },
  {
    id: '6',
    name: 'Agent Assignment SMS',
    description: 'Notify customer when their insurance agent has been assigned',
    trigger: 'enrollment_confirmed',
    channel: 'sms',
    is_active: true,
    offset_minutes: 0,
    stats: { sent: 0, delivered: 0, failed: 0 },
  },
  {
    id: '7',
    name: 'Post-Consultation Review Request',
    description: 'Send review request with Google Reviews link 2 hours after consultation ends',
    trigger: 'after_appointment',
    channel: 'sms',
    is_active: true,
    offset_minutes: 120,
    stats: { sent: 0, delivered: 0, failed: 0 },
  },
  {
    id: '8',
    name: 'Post-Consultation Follow-Up Email',
    description: 'Thank you email with plan summary, review link, and referral incentive',
    trigger: 'after_appointment',
    channel: 'email',
    is_active: true,
    offset_minutes: 120,
    stats: { sent: 0, delivered: 0, failed: 0 },
  },
  {
    id: '9',
    name: 'Lead Welcome SMS',
    description: 'Auto-text new leads from website contact form with plan overview',
    trigger: 'enrollment_created',
    channel: 'sms',
    is_active: false,
    offset_minutes: 0,
    stats: { sent: 0, delivered: 0, failed: 0 },
  },
  {
    id: '10',
    name: 'Lead Follow-Up Email (Day 1)',
    description: 'Welcome email with plan comparison guide and consultation scheduling link',
    trigger: 'enrollment_created',
    channel: 'email',
    is_active: false,
    offset_minutes: 1440,
    stats: { sent: 0, delivered: 0, failed: 0 },
  },
];

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>(DEFAULT_AUTOMATIONS);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'automations' | 'logs'>('automations');

  // CRUD dialog state
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', trigger: 'enrollment_created', channel: 'sms' as 'email' | 'sms' | 'voice', offset_minutes: 0, template_body: '' });
  const [isSaving, setIsSaving] = useState(false);

  const fetchAutomations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/crm/automations`, { headers: authHeaders() });
      if (response.ok) {
        const data = await response.json();
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          setAutomations(data.data);
        }
      }
    } catch {
      // Use defaults on error
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/crm/automations/logs?limit=20`, { headers: authHeaders() });
      if (response.ok) {
        const data = await response.json();
        setLogs(Array.isArray(data.data) ? data.data : []);
      }
    } catch { /* Ignore */ }
  };

  useEffect(() => {
    fetchAutomations();
    fetchLogs();
  }, []);

  const toggleAutomation = async (id: string) => {
    setAutomations((prev) => prev.map((a) => (a.id === id ? { ...a, is_active: !a.is_active } : a)));
    try {
      await fetch(`${API_URL}/api/v1/crm/automations/${id}/toggle`, { method: 'POST', headers: authHeaders() });
    } catch {
      setAutomations((prev) => prev.map((a) => (a.id === id ? { ...a, is_active: !a.is_active } : a)));
    }
  };

  const initializeDefaults = async () => {
    setIsLoading(true);
    try {
      await fetch(`${API_URL}/api/v1/crm/automations/initialize-defaults`, { method: 'POST', headers: authHeaders() });
      await fetchAutomations();
      toast.success('Default automations initialized');
    } catch {
      toast.error('Failed to initialize defaults');
    } finally {
      setIsLoading(false);
    }
  };

  // CRUD: Create or Update
  const saveAutomation = async () => {
    setIsSaving(true);
    try {
      const url = editingAutomation
        ? `${API_URL}/api/v1/crm/automations/${editingAutomation.id}`
        : `${API_URL}/api/v1/crm/automations`;
      const method = editingAutomation ? 'PUT' : 'POST';
      const response = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(formData) });
      if (response.ok) {
        toast.success(editingAutomation ? 'Automation updated' : 'Automation created');
        setShowCreateDialog(false);
        setEditingAutomation(null);
        await fetchAutomations();
      } else {
        const err = await response.json().catch(() => ({ message: 'Failed to save' }));
        toast.error(err.message || 'Failed to save automation');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setIsSaving(false);
    }
  };

  // CRUD: Delete
  const deleteAutomation = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/crm/automations/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (response.ok) {
        toast.success('Automation deleted');
        setAutomations((prev) => prev.filter((a) => a.id !== id));
        setDeleteConfirmId(null);
      } else {
        toast.error('Failed to delete');
      }
    } catch {
      toast.error('Network error');
    }
  };

  const openCreateDialog = () => {
    setEditingAutomation(null);
    setFormData({ name: '', description: '', trigger: 'enrollment_created', channel: 'sms', offset_minutes: 0, template_body: '' });
    setShowCreateDialog(true);
  };

  const openEditDialog = (automation: Automation) => {
    setEditingAutomation(automation);
    setFormData({
      name: automation.name,
      description: automation.description,
      trigger: automation.trigger,
      channel: automation.channel,
      offset_minutes: automation.offset_minutes || 0,
      template_body: automation.template_body || '',
    });
    setShowCreateDialog(true);
  };

  // Test send state
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [testChannel, setTestChannel] = useState<'sms' | 'email'>('sms');
  const [testTo, setTestTo] = useState('');
  const [testSubject, setTestSubject] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const sendTestNotification = async () => {
    if (!testTo || !testMessage) return;
    setTestSending(true);
    setTestResult(null);
    try {
      const body: Record<string, string> = { channel: testChannel, to: testTo, message: testMessage };
      if (testChannel === 'email') body.subject = testSubject || 'HealthShield Test';
      const response = await fetch(`${API_URL}/api/v1/crm/automations/send-test`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const data = await response.json();
      setTestResult({ success: data.success, message: data.message || (data.success ? 'Sent!' : 'Failed to send') });
      if (data.success) fetchLogs();
    } catch {
      setTestResult({ success: false, message: 'Network error' });
    } finally {
      setTestSending(false);
    }
  };

  const activeCount = automations.filter((a) => a.is_active).length;
  const totalSent = automations.reduce((acc, a) => acc + (a.stats?.sent || 0), 0);
  const totalFailed = automations.reduce((acc, a) => acc + (a.stats?.failed || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="h-6 w-6 text-blue-500" />
            Automations & Workflows
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage automated SMS, email, and voice notifications for enrollments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => { fetchAutomations(); fetchLogs(); }} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" onClick={() => setShowTestPanel(!showTestPanel)}>
            <Send className="h-4 w-4 mr-2" />
            Send Test
          </Button>
          <Button variant="outline" onClick={initializeDefaults} disabled={isLoading}>
            Initialize Defaults
          </Button>
          <Button onClick={openCreateDialog} className="btn-premium">
            <Plus className="h-4 w-4 mr-2" />
            Create Automation
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Workflows</CardTitle>
            <Settings2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{automations.length}</div>
            <p className="text-xs text-muted-foreground">{activeCount} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Messages Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSent}</div>
            <p className="text-xs text-muted-foreground">SMS + Email + Voice</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Delivery Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalSent > 0 ? `${Math.round(((totalSent - totalFailed) / totalSent) * 100)}%` : '—'}
            </div>
            <p className="text-xs text-muted-foreground">{totalFailed} failed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Channels</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                <Mail className="h-3 w-3 mr-1" /> Email
              </Badge>
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                <MessageSquare className="h-3 w-3 mr-1" /> SMS
              </Badge>
              <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                <Phone className="h-3 w-3 mr-1" /> Voice
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Send Panel */}
      {showTestPanel && (
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Send className="h-4 w-4 text-blue-500" />
              Send Test Notification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={testChannel === 'sms' ? 'default' : 'outline'}
                onClick={() => setTestChannel('sms')}
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1" /> SMS
              </Button>
              <Button
                size="sm"
                variant={testChannel === 'email' ? 'default' : 'outline'}
                onClick={() => setTestChannel('email')}
              >
                <Mail className="h-3.5 w-3.5 mr-1" /> Email
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                placeholder={testChannel === 'sms' ? 'Phone number (+1...)' : 'Email address'}
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
              />
              {testChannel === 'email' && (
                <Input
                  placeholder="Subject"
                  value={testSubject}
                  onChange={(e) => setTestSubject(e.target.value)}
                />
              )}
            </div>
            <Textarea
              placeholder="Message..."
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              rows={3}
            />
            <div className="flex items-center gap-3">
              <Button onClick={sendTestNotification} disabled={testSending || !testTo || !testMessage} size="sm">
                {testSending ? <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1" />}
                {testSending ? 'Sending...' : 'Send Test'}
              </Button>
              {testResult && (
                <span className={`text-sm ${testResult.success ? 'text-green-500' : 'text-red-500'}`}>
                  {testResult.success ? <CheckCircle2 className="h-4 w-4 inline mr-1" /> : <XCircle className="h-4 w-4 inline mr-1" />}
                  {testResult.message}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab Nav */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('automations')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'automations'
              ? 'border-blue-500 text-blue-500'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Workflows ({automations.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'logs'
              ? 'border-blue-500 text-blue-500'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Notification Log ({logs.length})
        </button>
      </div>

      {/* Automations List */}
      {activeTab === 'automations' && (
        <div className="space-y-3">
          {automations.map((automation) => {
            const ChannelIcon = CHANNEL_ICONS[automation.channel] || Mail;
            return (
              <Card key={automation.id} className={`transition-all ${!automation.is_active ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Channel Badge */}
                      <Badge variant="outline" className={CHANNEL_COLORS[automation.channel]}>
                        <ChannelIcon className="h-3.5 w-3.5 mr-1" />
                        {automation.channel.toUpperCase()}
                      </Badge>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm">{automation.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{automation.description}</p>
                      </div>

                      {/* Trigger */}
                      <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{TRIGGER_LABELS[automation.trigger] || automation.trigger}</span>
                        {automation.offset_minutes && automation.offset_minutes !== 0 && (
                          <span className="text-blue-500">
                            ({automation.offset_minutes > 0 ? '+' : ''}{automation.offset_minutes >= 60 || automation.offset_minutes <= -60
                              ? `${Math.round(automation.offset_minutes / 60)}h`
                              : `${automation.offset_minutes}m`})
                          </span>
                        )}
                      </div>

                      {/* Stats */}
                      {automation.stats && automation.stats.sent > 0 && (
                        <div className="hidden lg:flex items-center gap-3 text-xs">
                          <span className="text-green-400">{automation.stats.delivered} delivered</span>
                          {automation.stats.failed > 0 && (
                            <span className="text-red-400">{automation.stats.failed} failed</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 ml-4">
                      <button
                        type="button"
                        onClick={() => openEditDialog(automation)}
                        className="p-1.5 rounded-md hover:bg-accent transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(automation.id)}
                        className="p-1.5 rounded-md hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleAutomation(automation.id)}
                        className="p-1 rounded-md hover:bg-accent transition-colors"
                        title={automation.is_active ? 'Disable' : 'Enable'}
                      >
                        {automation.is_active ? (
                          <ToggleRight className="h-7 w-7 text-green-500" />
                        ) : (
                          <ToggleLeft className="h-7 w-7 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Notification Logs */}
      {activeTab === 'logs' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Notifications</CardTitle>
            <CardDescription>Latest SMS, email, and voice notifications sent</CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-sm">No notifications sent yet.</p>
                <p className="text-xs mt-1">Notifications will appear here once enrollments start coming in.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {log.status === 'delivered' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      {log.status === 'sent' && <Send className="h-4 w-4 text-blue-500" />}
                      {log.status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                      {log.status === 'pending' && <AlertTriangle className="h-4 w-4 text-blue-500" />}
                      <div>
                        <p className="text-sm font-medium">{log.automation_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.channel} to {log.recipient}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className={
                          log.status === 'delivered'
                            ? 'bg-green-500/10 text-green-400'
                            : log.status === 'failed'
                              ? 'bg-red-500/10 text-red-400'
                              : 'bg-yellow-500/10 text-yellow-400'
                        }
                      >
                        {log.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {log.sent_at ? new Date(log.sent_at).toLocaleString() : '—'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Automation Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAutomation ? 'Edit Automation' : 'Create Automation'}</DialogTitle>
            <DialogDescription>
              {editingAutomation ? 'Update this automation workflow.' : 'Set up a new automated notification for enrollments.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="auto-name">Name</Label>
              <Input id="auto-name" placeholder="e.g., Enrollment Confirmation SMS" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auto-desc">Description</Label>
              <Textarea id="auto-desc" placeholder="What does this automation do?" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Trigger</Label>
                <Select value={formData.trigger} onValueChange={(v) => setFormData({ ...formData, trigger: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TRIGGER_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Channel</Label>
                <Select value={formData.channel} onValueChange={(v) => setFormData({ ...formData, channel: v as 'email' | 'sms' | 'voice' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="voice">Voice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="auto-offset">Timing Offset (minutes)</Label>
              <Input id="auto-offset" type="number" placeholder="0 = immediate, -60 = 1h before, 120 = 2h after" value={formData.offset_minutes} onChange={(e) => setFormData({ ...formData, offset_minutes: parseInt(e.target.value) || 0 })} />
              <p className="text-xs text-muted-foreground">Negative = before trigger, Positive = after trigger, 0 = immediate</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="auto-template">Message Template</Label>
              <Textarea id="auto-template" placeholder="Hi {customer_name}, your enrollment {enrollment_number} is confirmed..." value={formData.template_body} onChange={(e) => setFormData({ ...formData, template_body: e.target.value })} rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button type="button" onClick={saveAutomation} disabled={isSaving || !formData.name}>
              {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
              {editingAutomation ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Automation</DialogTitle>
            <DialogDescription>
              Are you sure? This automation and its notification history will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={() => deleteConfirmId && deleteAutomation(deleteConfirmId)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
