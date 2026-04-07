'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ClipboardList,
  Plus,
  RefreshCw,
  CheckCircle,
  Clock,
  Circle,
  Play,
  Trash2,
  Calendar,
  AlertTriangle,
  Filter,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string | null;
  category: string | null;
  assigned_to: string | null;
  completed_at: string | null;
  created_at: string;
}

const priorityConfig = {
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertTriangle },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
  low: { label: 'Low', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Circle },
};

const statusConfig = {
  pending: { label: 'To Do', color: 'bg-slate-100 text-slate-700', icon: Circle },
  in_progress: { label: 'In Progress', color: 'bg-orange-100 text-orange-700', icon: Play },
  completed: { label: 'Done', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500', icon: Trash2 },
};

// Categories mapped to backend-accepted values (DB enum constraint)
const CATEGORIES = [
  { label: 'Follow Up', value: 'follow_up' },
  { label: 'Call', value: 'call' },
  { label: 'Email', value: 'email' },
  { label: 'Meeting', value: 'meeting' },
  { label: 'Check-in', value: 'check_in' },
  { label: 'Other', value: 'other' },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Create dialog
  const [showCreate, setShowCreate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    due_date: '',
    category: '',
    assigned_to: '',
  });

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/crm/todos`, { headers: authHeaders() });
      if (response.ok) {
        const data = await response.json();
        setTasks(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []);
      }
    } catch { /* silent */ }
    setIsLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);

  const createTask = async () => {
    if (!form.title) { toast.error('Title is required'); return; }
    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/crm/todos`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      if (response.ok) {
        toast.success('Task created');
        setShowCreate(false);
        setForm({ title: '', description: '', priority: 'medium', due_date: '', category: '', assigned_to: '' });
        fetchTasks();
      } else {
        const err = await response.json().catch(() => ({ message: 'Failed' }));
        toast.error(err.message || 'Failed to create task');
      }
    } catch { toast.error('Network error'); }
    finally { setIsSaving(false); }
  };

  const updateTaskStatus = async (id: number, action: 'complete' | 'start') => {
    try {
      await fetch(`${API_URL}/api/v1/crm/todos/${id}/${action}`, { method: 'POST', headers: authHeaders() });
      toast.success(action === 'complete' ? 'Task completed!' : 'Task started');
      fetchTasks();
    } catch { toast.error('Failed to update task'); }
  };

  const deleteTask = async (id: number) => {
    try {
      await fetch(`${API_URL}/api/v1/crm/todos/${id}`, { method: 'DELETE', headers: authHeaders() });
      toast.success('Task deleted');
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch { toast.error('Failed to delete task'); }
  };

  // Filtered tasks
  const filtered = tasks.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q);
    }
    return true;
  });

  // Stats
  const totalTasks = tasks.length;
  const todoCount = tasks.filter(t => t.status === 'pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  // Group by status for columns
  const columns = [
    { key: 'pending', label: 'To Do', tasks: filtered.filter(t => t.status === 'pending') },
    { key: 'in_progress', label: 'In Progress', tasks: filtered.filter(t => t.status === 'in_progress') },
    { key: 'completed', label: 'Done', tasks: filtered.filter(t => t.status === 'completed') },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/25">
              <ClipboardList className="h-5 w-5 text-white" />
            </div>
            Tasks
          </h1>
          <p className="text-muted-foreground mt-1">Manage your team tasks and to-dos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchTasks} disabled={isLoading}>
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          </Button>
          <Button onClick={() => setShowCreate(true)} className="btn-premium">
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="stat-card-orange">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ClipboardList className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-xl font-bold">{totalTasks}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card-orange">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Circle className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">To Do</p>
              <p className="text-xl font-bold">{todoCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card-orange">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Play className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-xl font-bold text-orange-600">{inProgressCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card-orange">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-xl font-bold text-emerald-600">{completedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Done</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Columns */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {columns.map((col) => (
            <div key={col.key} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">{col.label}</h3>
                <Badge variant="secondary" className="text-xs">{col.tasks.length}</Badge>
              </div>
              <div className="space-y-2 min-h-[200px]">
                {col.tasks.map((task) => {
                  const pCfg = priorityConfig[task.priority] || priorityConfig.medium;
                  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
                  return (
                    <Card key={task.id} className={cn('group hover:shadow-md transition-all', isOverdue && 'border-red-300')}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm leading-tight flex-1">{task.title}</h4>
                          <button
                            type="button"
                            onClick={() => deleteTask(task.id)}
                            className="hidden group-hover:block p-1 rounded hover:bg-red-100"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={cn('text-[10px]', pCfg.color)}>{pCfg.label}</Badge>
                          {task.category && (
                            <Badge variant="outline" className="text-[10px]">{task.category}</Badge>
                          )}
                          {task.due_date && (
                            <span className={cn('text-[10px] flex items-center gap-0.5', isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground')}>
                              <Calendar className="w-3 h-3" />
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {/* Action buttons */}
                        <div className="flex items-center gap-1 mt-2 pt-2 border-t">
                          {task.status === 'pending' && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => updateTaskStatus(task.id, 'start')}>
                              <Play className="w-3 h-3 mr-1" /> Start
                            </Button>
                          )}
                          {(task.status === 'pending' || task.status === 'in_progress') && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-emerald-600" onClick={() => updateTaskStatus(task.id, 'complete')}>
                              <CheckCircle className="w-3 h-3 mr-1" /> Done
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {col.tasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Task Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-orange-500" />
              New Task
            </DialogTitle>
            <DialogDescription>Create a new task for your team.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input placeholder="e.g., Follow up with Johnson booking" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Task details..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as Task['priority'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category || '_none'} onValueChange={(v) => setForm({ ...form, category: v === '_none' ? '' : v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">None</SelectItem>
                    {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Assigned To</Label>
                <Input placeholder="Team member name" value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="button" onClick={createTask} disabled={isSaving || !form.title}>
              {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              {isSaving ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
