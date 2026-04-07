'use client';

import { useState } from 'react';
import {
  FileText,
  Mic,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  ListTodo,
  Phone,
  StickyNote,
  Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

// --- Sample Data ---

interface ActionItem {
  id: string;
  description: string;
  assignee: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  completed: boolean;
  meetingId: string;
}

interface MeetingNote {
  id: string;
  title: string;
  date: string;
  duration: string;
  type: 'Meeting' | 'Call' | 'Note';
  participants: string[];
  actionItemsCount: number;
  completedItemsCount: number;
  summary: string;
}

const sampleMeetings: MeetingNote[] = [
  {
    id: '1',
    title: 'Q2 Medicare Advantage Expansion Planning',
    date: '2026-03-20',
    duration: '45 min',
    type: 'Meeting',
    participants: ['Ken B.', 'Sarah M.', 'Jake T.', 'Lisa R.'],
    actionItemsCount: 6,
    completedItemsCount: 4,
    summary:
      'Discussed adding 3 new Medicare Advantage plans for enrollment season. Reviewed carrier quotes and compliance requirements. Agreed on timeline for onboarding and agent training.',
  },
  {
    id: '2',
    title: 'Carrier Partnership Call',
    date: '2026-03-19',
    duration: '22 min',
    type: 'Call',
    participants: ['Ken B.', 'Tom Garcia'],
    actionItemsCount: 4,
    completedItemsCount: 2,
    summary:
      'Negotiated commission rates for the upcoming enrollment period. Tom offered a 15% increase for volume commitment. Need to review contract terms before signing.',
  },
  {
    id: '3',
    title: 'Compliance Protocol Update',
    date: '2026-03-18',
    duration: '1h 10 min',
    type: 'Meeting',
    participants: ['Ken B.', 'Sarah M.', 'Dan R.', 'Mike L.', 'Amy W.'],
    actionItemsCount: 8,
    completedItemsCount: 6,
    summary:
      'Reviewed CMS compliance updates. Updated documentation procedures for all plan types. Scheduled mandatory agent refresher training for April.',
  },
  {
    id: '4',
    title: 'Policy Portfolio Review',
    date: '2026-03-17',
    duration: '18 min',
    type: 'Call',
    participants: ['Ken B.', 'Patricia Wells'],
    actionItemsCount: 3,
    completedItemsCount: 2,
    summary:
      'Annual policy portfolio review with updated program metrics. New coverage tier options presented. Waiting on final premium quotes by end of week.',
  },
  {
    id: '5',
    title: 'Summer Marketing Strategy Notes',
    date: '2026-03-16',
    duration: '—',
    type: 'Note',
    participants: ['Ken B.'],
    actionItemsCount: 7,
    completedItemsCount: 5,
    summary:
      'Brainstormed social media campaign ideas for open enrollment launch. Key themes: family coverage, preventive care, employer plans. Consider influencer partnerships.',
  },
];

const sampleActionItems: ActionItem[] = [
  {
    id: 'a1',
    description: 'Get final quotes from Aetna and Blue Cross carriers',
    assignee: 'Ken B.',
    priority: 'High',
    dueDate: '2026-03-25',
    completed: false,
    meetingId: '1',
  },
  {
    id: 'a2',
    description: 'Review carrier partnership contract with legal',
    assignee: 'Ken B.',
    priority: 'High',
    dueDate: '2026-03-24',
    completed: false,
    meetingId: '2',
  },
  {
    id: 'a3',
    description: 'Schedule agent compliance refresher training for April',
    assignee: 'Sarah M.',
    priority: 'Medium',
    dueDate: '2026-03-28',
    completed: false,
    meetingId: '3',
  },
  {
    id: 'a4',
    description: 'Upload updated compliance procedure docs to shared drive',
    assignee: 'Dan R.',
    priority: 'Medium',
    dueDate: '2026-03-22',
    completed: true,
    meetingId: '3',
  },
  {
    id: 'a5',
    description: 'Send policy portfolio review spreadsheet to compliance team',
    assignee: 'Ken B.',
    priority: 'High',
    dueDate: '2026-03-21',
    completed: true,
    meetingId: '4',
  },
  {
    id: 'a6',
    description: 'Draft social media content calendar for June launch',
    assignee: 'Lisa R.',
    priority: 'Medium',
    dueDate: '2026-03-30',
    completed: false,
    meetingId: '5',
  },
  {
    id: 'a7',
    description: 'Contact 3 local influencers for health insurance outreach campaigns',
    assignee: 'Jake T.',
    priority: 'Low',
    dueDate: '2026-04-05',
    completed: false,
    meetingId: '5',
  },
  {
    id: 'a8',
    description: 'Order updated compliance documentation for expanded programs',
    assignee: 'Mike L.',
    priority: 'High',
    dueDate: '2026-03-26',
    completed: false,
    meetingId: '3',
  },
];

// --- Helper ---

function priorityVariant(priority: 'High' | 'Medium' | 'Low') {
  switch (priority) {
    case 'High':
      return 'destructive' as const;
    case 'Medium':
      return 'default' as const;
    case 'Low':
      return 'secondary' as const;
  }
}

function typeIcon(type: 'Meeting' | 'Call' | 'Note') {
  switch (type) {
    case 'Meeting':
      return <Video className="h-3.5 w-3.5" />;
    case 'Call':
      return <Phone className="h-3.5 w-3.5" />;
    case 'Note':
      return <StickyNote className="h-3.5 w-3.5" />;
  }
}

function typeBadgeVariant(type: 'Meeting' | 'Call' | 'Note') {
  switch (type) {
    case 'Meeting':
      return 'default' as const;
    case 'Call':
      return 'secondary' as const;
    case 'Note':
      return 'outline' as const;
  }
}

// --- Page ---

export default function AiNotesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null);
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [actionItems, setActionItems] = useState<ActionItem[]>(sampleActionItems);

  // Record meeting form
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<string>('Meeting');
  const [newParticipants, setNewParticipants] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Filter meetings
  const filteredMeetings = sampleMeetings.filter((m) => {
    const matchesSearch =
      !searchQuery ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'meetings' && m.type === 'Meeting') ||
      (activeTab === 'calls' && m.type === 'Call') ||
      (activeTab === 'notes' && m.type === 'Note');
    return matchesSearch && matchesTab;
  });

  const totalCompleted = sampleActionItems.filter((a) => a.completed).length;
  const totalPending = sampleActionItems.length - totalCompleted;

  function handleToggleActionItem(id: string) {
    setActionItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
    const item = actionItems.find((a) => a.id === id);
    if (item && !item.completed) {
      toast.success('Action item completed');
    }
  }

  function handleConvertToTask(item: ActionItem) {
    toast.success(`"${item.description}" converted to task`);
  }

  function handleStartRecording() {
    if (!newTitle.trim()) {
      toast.error('Please enter a meeting title');
      return;
    }
    toast.success('Recording started for: ' + newTitle);
    setRecordDialogOpen(false);
    setNewTitle('');
    setNewType('Meeting');
    setNewParticipants('');
    setNewNotes('');
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Notes</h1>
          <p className="text-muted-foreground">
            Meeting transcriptions, notes, and AI-extracted action items
          </p>
        </div>
        <Button onClick={() => setRecordDialogOpen(true)}>
          <Mic className="mr-2 h-4 w-4" />
          Record Meeting
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Action Items</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">Across all meetings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">19</div>
            <p className="text-xs text-muted-foreground">67.9% completion rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">9</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search meetings, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="calls">Phone Calls</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Meeting List */}
      <div className="space-y-3">
        {filteredMeetings.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No meetings found matching your filters.</p>
            </CardContent>
          </Card>
        )}
        {filteredMeetings.map((meeting) => {
          const isExpanded = expandedMeeting === meeting.id;
          const meetingActions = actionItems.filter(
            (a) => a.meetingId === meeting.id
          );
          const completedCount = meetingActions.filter((a) => a.completed).length;

          return (
            <Card
              key={meeting.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() =>
                setExpandedMeeting(isExpanded ? null : meeting.id)
              }
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{meeting.title}</h3>
                      <Badge variant={typeBadgeVariant(meeting.type)} className="shrink-0 gap-1">
                        {typeIcon(meeting.type)}
                        {meeting.type}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(meeting.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {meeting.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {meeting.participants.length} participant
                        {meeting.participants.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right text-sm">
                      <span className="font-medium">
                        {completedCount}/{meeting.actionItemsCount}
                      </span>
                      <p className="text-xs text-muted-foreground">actions</p>
                    </div>
                    <div className="h-8 w-8 rounded-full border-2 border-muted flex items-center justify-center">
                      <ChevronRight
                        className={`h-4 w-4 text-muted-foreground transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 border-t pt-4 space-y-3" onClick={(e) => e.stopPropagation()}>
                    <div>
                      <h4 className="text-sm font-medium mb-1">Summary</h4>
                      <p className="text-sm text-muted-foreground">{meeting.summary}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">Participants</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {meeting.participants.map((p) => (
                          <Badge key={p} variant="outline" className="text-xs">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {meetingActions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Action Items</h4>
                        <div className="space-y-2">
                          {meetingActions.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 rounded-md border p-2.5"
                            >
                              <Checkbox
                                checked={item.completed}
                                onCheckedChange={() =>
                                  handleToggleActionItem(item.id)
                                }
                              />
                              <span
                                className={`flex-1 text-sm ${
                                  item.completed
                                    ? 'line-through text-muted-foreground'
                                    : ''
                                }`}
                              >
                                {item.description}
                              </span>
                              <Badge variant={priorityVariant(item.priority)} className="text-xs">
                                {item.priority}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action Items Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">All Action Items</h2>
          <Badge variant="outline" className="text-sm">
            {actionItems.filter((a) => !a.completed).length} pending
          </Badge>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {actionItems.map((item) => {
                const meeting = sampleMeetings.find(
                  (m) => m.id === item.meetingId
                );
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 px-4 py-3"
                  >
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => handleToggleActionItem(item.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${
                          item.completed
                            ? 'line-through text-muted-foreground'
                            : ''
                        }`}
                      >
                        {item.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                        <span>Assignee: {item.assignee}</span>
                        <span>Due: {new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        {meeting && (
                          <span className="truncate">From: {meeting.title}</span>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={priorityVariant(item.priority)}
                      className="shrink-0 text-xs"
                    >
                      {item.priority}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 text-xs gap-1"
                      onClick={() => handleConvertToTask(item)}
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      Convert to Task
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Record Meeting Dialog */}
      <Dialog open={recordDialogOpen} onOpenChange={setRecordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Meeting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="meeting-title">Title</Label>
              <Input
                id="meeting-title"
                placeholder="e.g. Weekly Team Standup"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meeting-type">Type</Label>
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger id="meeting-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Meeting">Meeting</SelectItem>
                  <SelectItem value="Phone Call">Phone Call</SelectItem>
                  <SelectItem value="Note">Note</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="meeting-participants">Participants</Label>
              <Input
                id="meeting-participants"
                placeholder="e.g. Ken B., Sarah M."
                value={newParticipants}
                onChange={(e) => setNewParticipants(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meeting-notes">Notes</Label>
              <Textarea
                id="meeting-notes"
                placeholder="Add any pre-meeting notes or agenda items..."
                rows={4}
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRecordDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleStartRecording}>
              <Mic className="mr-2 h-4 w-4" />
              Start Recording
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
