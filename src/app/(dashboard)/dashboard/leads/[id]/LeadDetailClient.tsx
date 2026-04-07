'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useHealthShieldCrmStore } from '@/stores/healthshield-crm-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Edit,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Send,
  User,
} from 'lucide-react';
import { LEAD_STATUSES, LEAD_SOURCES } from '@/lib/constants';
import { format as fnsFormat, formatDistanceToNow as fnsDistanceToNow } from 'date-fns';
import type { Lead, LeadActivity } from '@/types/lead';

function safeFormat(dateStr: string | undefined | null, fmt: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return fnsFormat(d, fmt);
  } catch {
    return '-';
  }
}

function safeDistanceToNow(dateStr: string | undefined | null, opts?: { addSuffix?: boolean }): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return fnsDistanceToNow(d, opts);
  } catch {
    return '-';
  }
}
import { CallButton } from '@/components/communications/call-widget';
import { SmsButton } from '@/components/communications/sms-panel';
import { EmailButton } from '@/components/communications/email-composer';
import { CommunicationTimeline } from '@/components/communications/communication-timeline';

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  contacted: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  qualified: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  proposal: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  negotiation: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  won: 'bg-green-500/10 text-green-500 border-green-500/20',
  lost: 'bg-red-500/10 text-red-500 border-red-500/20',
};

// Default empty lead (shown while loading)
const emptyLead: Lead = {
  id: '0',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  status: 'new',
  source: 'website',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function LeadDetailClient() {
  const router = useRouter();
  const params = useParams();
  const { fetchLead, updateLead } = useHealthShieldCrmStore();
  const [lead, setLead] = useState<Lead>(emptyLead);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);

  // Tasks state
  interface LeadTask {
    id: string;
    title: string;
    description?: string;
    type: string;
    priority: 'low' | 'medium' | 'high';
    dueAt?: string;
    completed: boolean;
    completedAt?: string;
  }
  const [tasks, setTasks] = useState<LeadTask[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', type: 'follow_up', priority: 'medium' as 'low' | 'medium' | 'high', dueAt: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', phone: '', notes: '', value: 0 });
  const [isSaving, setIsSaving] = useState(false);

  const loadLead = useCallback(async () => {
    const id = params?.id;
    if (!id) return;
    setLoading(true);
    try {
      const data = await fetchLead(Number(id));
      if (data) {
        setLead({
          id: String(data.id),
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          status: data.status as Lead['status'],
          source: data.source as Lead['source'],
          value: data.budgetMax || data.budgetMin || undefined,
          notes: data.notes || undefined,
          lastContactedAt: data.lastContactAt || undefined,
          nextFollowUpAt: data.nextFollowUpAt || undefined,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
        // Map interactions to activities
        if (data.interactions?.length) {
          setActivities(
            data.interactions.map((i) => ({
              id: String(i.id),
              leadId: String(data.id),
              type: (i.type === 'sms' ? 'note' : i.type) as LeadActivity['type'],
              title: i.subject || `${i.type} - ${i.direction || 'outbound'}`,
              description: i.outcomeNotes || i.content || undefined,
              outcome: i.outcome || undefined,
              duration: i.durationSeconds ? Math.round(i.durationSeconds / 60) : undefined,
              createdBy: String(i.createdBy || i.userId || ''),
              createdByUser: i.createdByUser ? { id: String(i.createdByUser.id), firstName: i.createdByUser.name, lastName: '' } : undefined,
              createdAt: i.interactionAt,
              updatedAt: i.interactionAt,
            }))
          );
        }
      }
    } catch {
      // Error already handled in store
    } finally {
      setLoading(false);
    }
  }, [params?.id, fetchLead]);

  useEffect(() => {
    loadLead();
  }, [loadLead]);

  const handleStatusChange = async (newStatus: string) => {
    setLead((prev) => ({ ...prev, status: newStatus as Lead['status'] }));
    try {
      await updateLead(Number(lead.id), { status: newStatus as Lead['status'] });
    } catch {
      // Revert on failure
      loadLead();
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const newActivity: LeadActivity = {
      id: Date.now().toString(),
      leadId: lead.id,
      type: 'note',
      title: 'Note added',
      description: newNote,
      createdBy: 'user1',
      createdByUser: {
        id: 'user1',
        firstName: 'You',
        lastName: '',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setActivities((prev) => [newActivity, ...prev]);
    setNewNote('');
  };

  const activityIcon = (type: LeadActivity['type']) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'meeting':
        return <Calendar className="h-4 w-4" />;
      case 'note':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (!lead.id || lead.id === '0') {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">Lead not found.</p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {lead.firstName[0]}
                {lead.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {lead.firstName} {lead.lastName}
              </h1>
              {lead.email && (
                <p className="text-muted-foreground">{lead.email}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {/* Click-to-Call Button */}
          {lead.phone && (
            <CallButton
              leadId={lead.id}
              leadName={`${lead.firstName} ${lead.lastName}`}
              phoneNumber={lead.phone}
              variant="outline"
              size="default"
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            />
          )}
          {/* Click-to-SMS Button */}
          {lead.phone && (
            <SmsButton
              leadId={lead.id}
              leadName={`${lead.firstName} ${lead.lastName}`}
              leadPhone={lead.phone}
              variant="outline"
              size="default"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            />
          )}
          {/* Click-to-Email Button */}
          <EmailButton
            leadId={lead.id}
            leadName={`${lead.firstName} ${lead.lastName}`}
            leadEmail={lead.email}
            variant="outline"
            size="default"
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
          />
          <Button
            size="sm"
            variant={isEditing ? 'default' : 'outline'}
            onClick={() => {
              if (isEditing) {
                // Save changes
                setIsSaving(true);
                updateLead(lead.id, {
                  firstName: editForm.firstName,
                  lastName: editForm.lastName,
                  email: editForm.email,
                  phone: editForm.phone,
                  notes: editForm.notes,
                } as Record<string, unknown>).then(() => {
                  setLead((prev) => ({ ...prev, ...editForm }));
                  setIsEditing(false);
                }).catch(() => {
                  // stay in edit mode on error
                }).finally(() => setIsSaving(false));
              } else {
                setEditForm({
                  firstName: lead.firstName,
                  lastName: lead.lastName,
                  email: lead.email,
                  phone: lead.phone || '',
                  notes: lead.notes || '',
                  value: lead.value || 0,
                });
                setIsEditing(true);
              }
            }}
            disabled={isSaving}
          >
            <Edit className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
          </Button>
          {isEditing && (
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status & Quick Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <Select value={lead.status} onValueChange={handleStatusChange}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEAD_STATUSES.map((status) => (
                          <SelectItem key={status.id} value={status.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-2 w-2 rounded-full ${status.color}`}
                              />
                              {status.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator orientation="vertical" className="h-12 hidden sm:block" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Deal Value
                    </p>
                    <p className="text-xl font-bold">
                      ${lead.value?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Follow-up
                  </Button>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Log Activity
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="communications">
            <TabsList>
              <TabsTrigger value="communications">Communications</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>

            <TabsContent value="communications" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>Communication History</span>
                    <div className="flex gap-2">
                      {lead.phone && (
                        <CallButton
                          leadId={lead.id}
                          leadName={`${lead.firstName} ${lead.lastName}`}
                          phoneNumber={lead.phone}
                          variant="ghost"
                          size="sm"
                        />
                      )}
                      {lead.phone && (
                        <SmsButton
                          leadId={lead.id}
                          leadName={`${lead.firstName} ${lead.lastName}`}
                          leadPhone={lead.phone}
                          variant="ghost"
                          size="sm"
                        />
                      )}
                      <EmailButton
                        leadId={lead.id}
                        leadName={`${lead.firstName} ${lead.lastName}`}
                        leadEmail={lead.email}
                        variant="ghost"
                        size="sm"
                      />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CommunicationTimeline
                    leadId={lead.id}
                    maxHeight="500px"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-4 space-y-4">
              {/* Add Note */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex gap-3">
                    <Textarea
                      placeholder="Add a note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="flex-1"
                      rows={2}
                    />
                    <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Timeline */}
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <Card key={activity.id}>
                    <CardContent className="pt-4">
                      <div className="flex gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          {activityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{activity.title}</p>
                            <span className="text-sm text-muted-foreground">
                              {safeDistanceToNow(activity.createdAt, {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                          {activity.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                          )}
                          {activity.outcome && (
                            <p className="mt-2 text-sm">
                              <span className="font-medium">Outcome:</span>{' '}
                              {activity.outcome}
                            </p>
                          )}
                          <p className="mt-2 text-xs text-muted-foreground">
                            by {activity.createdByUser?.firstName}{' '}
                            {activity.createdByUser?.lastName}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">
                    {lead.notes || 'No notes yet.'}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Tasks</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => setShowTaskForm(!showTaskForm)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {showTaskForm ? 'Cancel' : 'Create Task'}
                  </Button>
                </CardHeader>
                <CardContent>
                  {showTaskForm && (
                    <div className="mb-4 space-y-3 rounded-lg border p-4 bg-muted/30">
                      <input
                        className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                        placeholder="Task title *"
                        value={taskForm.title}
                        onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                      />
                      <Textarea
                        placeholder="Description (optional)"
                        value={taskForm.description}
                        onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                        rows={2}
                      />
                      <div className="flex flex-wrap gap-3">
                        <Select value={taskForm.type} onValueChange={(v) => setTaskForm({ ...taskForm, type: v })}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="follow_up">Follow Up</SelectItem>
                            <SelectItem value="call">Call</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="meeting">Meeting</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={taskForm.priority} onValueChange={(v) => setTaskForm({ ...taskForm, priority: v as 'low' | 'medium' | 'high' })}>
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <input
                          type="date"
                          title="Due date"
                          placeholder="Due date"
                          className="rounded-md border px-3 py-2 text-sm bg-background"
                          value={taskForm.dueAt}
                          onChange={(e) => setTaskForm({ ...taskForm, dueAt: e.target.value })}
                        />
                      </div>
                      <Button
                        size="sm"
                        disabled={!taskForm.title.trim()}
                        onClick={() => {
                          const newTask: LeadTask = {
                            id: String(Date.now()),
                            title: taskForm.title,
                            description: taskForm.description || undefined,
                            type: taskForm.type,
                            priority: taskForm.priority,
                            dueAt: taskForm.dueAt || undefined,
                            completed: false,
                          };
                          setTasks((prev) => [newTask, ...prev]);
                          setTaskForm({ title: '', description: '', type: 'follow_up', priority: 'medium', dueAt: '' });
                          setShowTaskForm(false);
                        }}
                      >
                        Add Task
                      </Button>
                    </div>
                  )}
                  {tasks.length === 0 && !showTaskForm ? (
                    <p className="text-center text-muted-foreground py-4">
                      No tasks scheduled. Click &quot;Create Task&quot; to add one.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`flex items-start gap-3 rounded-lg border p-3 ${task.completed ? 'opacity-50' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={task.completed}
                            title={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
                            className="mt-1 h-4 w-4 rounded"
                            onChange={() =>
                              setTasks((prev) =>
                                prev.map((t) =>
                                  t.id === task.id
                                    ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : undefined }
                                    : t
                                )
                              )
                            }
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${task.completed ? 'line-through' : ''}`}>
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
                            )}
                            <div className="flex flex-wrap gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{task.type.replace('_', ' ')}</Badge>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  task.priority === 'high'
                                    ? 'border-red-300 text-red-600'
                                    : task.priority === 'medium'
                                    ? 'border-yellow-300 text-yellow-600'
                                    : 'border-gray-300 text-gray-600'
                                }`}
                              >
                                {task.priority}
                              </Badge>
                              {task.dueAt && (
                                <span className="text-xs text-muted-foreground">
                                  Due: {safeFormat(task.dueAt, 'MMM d, yyyy')}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
                            onClick={() => setTasks((prev) => prev.filter((t) => t.id !== task.id))}
                          >
                            &times;
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="rounded-md border px-3 py-2 text-sm bg-background"
                      placeholder="First name"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    />
                    <input
                      className="rounded-md border px-3 py-2 text-sm bg-background"
                      placeholder="Last name"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <input
                      className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                      placeholder="Email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <input
                      className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                      placeholder="Phone"
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                  </div>
                  <Textarea
                    placeholder="Notes"
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-sm hover:underline"
                    >
                      {lead.email}
                    </a>
                  </div>
                  {lead.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`tel:${lead.phone}`}
                        className="text-sm hover:underline"
                      >
                        {lead.phone}
                      </a>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Lead Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Lead Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Source</p>
                <p className="text-sm font-medium">
                  {LEAD_SOURCES.find((s) => s.id === lead.source)?.name ||
                    lead.source}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm font-medium">
                  {safeFormat(lead.createdAt, 'MMM d, yyyy')}
                </p>
              </div>
              {lead.lastContactedAt && (
                <div>
                  <p className="text-xs text-muted-foreground">Last Contact</p>
                  <p className="text-sm font-medium">
                    {safeDistanceToNow(lead.lastContactedAt, {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              )}
              {lead.nextFollowUpAt && (
                <div>
                  <p className="text-xs text-muted-foreground">Next Follow-up</p>
                  <p className="text-sm font-medium">
                    {safeFormat(lead.nextFollowUpAt, 'MMM d, yyyy')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          {lead.tags && lead.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {lead.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
