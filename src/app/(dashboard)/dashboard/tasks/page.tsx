'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  closestCorners,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  RefreshCw,
  Calendar,
  MoreHorizontal,
  Pencil,
  Trash2,
  GripVertical,
  Loader2,
  Inbox,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Constants & Helpers
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://systemsf1rst-backend-887571186773.us-central1.run.app';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('healthshield-crm-auth');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed?.state?.tokens?.accessToken || null;
    } catch {
      return null;
    }
  }
  return null;
}

function apiHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Organization-ID': '12',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  category: string | null;
  created_at: string;
}

type ColumnId = 'pending' | 'in_progress' | 'completed';

interface ColumnDef {
  id: ColumnId;
  label: string;
  borderClass: string;
  headerBg: string;
  dotColor: string;
}

const COLUMNS: ColumnDef[] = [
  {
    id: 'pending',
    label: 'TO DO',
    borderClass: 'border-blue-500/30',
    headerBg: 'bg-blue-500/10',
    dotColor: 'bg-blue-500',
  },
  {
    id: 'in_progress',
    label: 'IN PROGRESS',
    borderClass: 'border-orange-500/30',
    headerBg: 'bg-orange-500/10',
    dotColor: 'bg-orange-500',
  },
  {
    id: 'completed',
    label: 'DONE',
    borderClass: 'border-green-500/30',
    headerBg: 'bg-green-500/10',
    dotColor: 'bg-green-500',
  },
];

const PRIORITY_STYLES: Record<string, string> = {
  high: 'bg-red-500/15 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/15 text-green-400 border-green-500/30',
};

const CATEGORY_STYLES = 'bg-muted text-muted-foreground border-border';

const CATEGORIES = [
  { label: 'Email', value: 'email' },
  { label: 'Call', value: 'call' },
  { label: 'Meeting', value: 'meeting' },
  { label: 'Follow-up', value: 'follow_up' },
  { label: 'Other', value: 'other' },
];

// ---------------------------------------------------------------------------
// Sortable Task Card
// ---------------------------------------------------------------------------

function SortableTaskCard({
  task,
  onEdit,
  onDelete,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && 'opacity-40')}
    >
      <TaskCardContent
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        dragAttributes={attributes}
        dragListeners={listeners}
      />
    </div>
  );
}

function TaskCardContent({
  task,
  onEdit,
  onDelete,
  dragAttributes,
  dragListeners,
  isOverlay = false,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  dragAttributes?: Record<string, unknown>;
  dragListeners?: Record<string, unknown>;
  isOverlay?: boolean;
}) {
  const isOverdue =
    task.due_date &&
    new Date(task.due_date) < new Date() &&
    task.status !== 'completed';

  const categoryLabel =
    CATEGORIES.find((c) => c.value === task.category)?.label || task.category;

  return (
    <Card
      className={cn(
        'group transition-all cursor-default',
        isOverlay
          ? 'shadow-2xl rotate-2 scale-105 border-orange-500/50'
          : 'hover:shadow-md',
        isOverdue && !isOverlay && 'border-red-500/40'
      )}
    >
      <CardContent className="p-3">
        {/* Top row: drag handle + title + menu */}
        <div className="flex items-start gap-2">
          <button
            type="button"
            className="mt-0.5 cursor-grab text-muted-foreground/50 hover:text-muted-foreground shrink-0"
            {...(dragAttributes as React.HTMLAttributes<HTMLButtonElement>)}
            {...(dragListeners as React.HTMLAttributes<HTMLButtonElement>)}
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <h4 className="font-semibold text-sm leading-tight flex-1 min-w-0 truncate">
            {task.title}
          </h4>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                title="Task actions"
                aria-label="Task actions"
                className="shrink-0 p-1 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Pencil className="h-3.5 w-3.5 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(task.id)}
                className="text-red-500 focus:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description preview */}
        {task.description && (
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 pl-6">
            {task.description}
          </p>
        )}

        {/* Badges row */}
        <div className="flex items-center gap-1.5 flex-wrap mt-2.5 pl-6">
          <Badge
            variant="outline"
            className={cn('text-[10px] capitalize', PRIORITY_STYLES[task.priority])}
          >
            {task.priority}
          </Badge>

          {task.category && (
            <Badge
              variant="outline"
              className={cn('text-[10px] capitalize', CATEGORY_STYLES)}
            >
              {categoryLabel}
            </Badge>
          )}

          {task.due_date && (
            <span
              className={cn(
                'text-[10px] flex items-center gap-0.5 ml-auto',
                isOverdue
                  ? 'text-red-400 font-medium'
                  : 'text-muted-foreground'
              )}
            >
              <Calendar className="h-3 w-3" />
              {new Date(task.due_date).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Kanban Column
// ---------------------------------------------------------------------------

function KanbanColumn({
  column,
  tasks,
  onEdit,
  onDelete,
}: {
  column: ColumnDef;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}) {
  const taskIds = tasks.map((t) => t.id);

  return (
    <div className="flex flex-col min-h-0">
      {/* Column header */}
      <div
        className={cn(
          'flex items-center justify-between px-3 py-2.5 rounded-t-lg border-b-2',
          column.headerBg,
          column.borderClass
        )}
      >
        <div className="flex items-center gap-2">
          <div className={cn('h-2.5 w-2.5 rounded-full', column.dotColor)} />
          <span className="text-xs font-bold tracking-wider text-foreground">
            {column.label}
          </span>
        </div>
        <Badge
          variant="secondary"
          className="text-[10px] h-5 min-w-[20px] justify-center"
        >
          {tasks.length}
        </Badge>
      </div>

      {/* Cards area */}
      <div className="flex-1 bg-muted/30 rounded-b-lg p-2 space-y-2 min-h-[300px]">
        <SortableContext
          items={taskIds}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Inbox className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-xs">No tasks</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: '',
    due_date: '',
  });

  // DnD sensors - require 8px of movement before drag starts (prevents accidental drags)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // ---------- API calls ----------

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/crm/todos`, {
        headers: apiHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const list: Task[] = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];
        setTasks(list);
      } else {
        toast.error('Failed to load tasks');
      }
    } catch {
      toast.error('Network error loading tasks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    setIsSaving(true);
    try {
      const body: Record<string, string> = {
        title: form.title.trim(),
        priority: form.priority,
        status: 'pending',
      };
      if (form.description.trim()) body.description = form.description.trim();
      if (form.category) body.category = form.category;
      if (form.due_date) body.due_date = form.due_date;

      const res = await fetch(`${API_URL}/api/v1/crm/todos`, {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success('Task created');
        closeDialog();
        fetchTasks();
      } else {
        const err = await res.json().catch(() => ({ message: 'Failed' }));
        toast.error(err.message || 'Failed to create task');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setIsSaving(false);
    }
  };

  const updateTask = async () => {
    if (!editingTask || !form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    setIsSaving(true);
    try {
      const body: Record<string, string> = {
        title: form.title.trim(),
        priority: form.priority,
      };
      if (form.description.trim()) body.description = form.description.trim();
      if (form.category) body.category = form.category;
      if (form.due_date) body.due_date = form.due_date;

      const res = await fetch(`${API_URL}/api/v1/crm/todos/${editingTask.id}`, {
        method: 'PUT',
        headers: apiHeaders(),
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success('Task updated');
        closeDialog();
        fetchTasks();
      } else {
        const err = await res.json().catch(() => ({ message: 'Failed' }));
        toast.error(err.message || 'Failed to update task');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setIsSaving(false);
    }
  };

  const updateTaskStatus = async (id: number, newStatus: ColumnId) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await fetch(`${API_URL}/api/v1/crm/todos/${id}`, {
        method: 'PUT',
        headers: apiHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success('Task moved');
      } else {
        toast.error('Failed to update task');
        fetchTasks(); // revert
      }
    } catch {
      toast.error('Network error');
      fetchTasks(); // revert
    }
  };

  const deleteTask = async (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      const res = await fetch(`${API_URL}/api/v1/crm/todos/${id}`, {
        method: 'DELETE',
        headers: apiHeaders(),
      });
      if (res.ok) {
        toast.success('Task deleted');
      } else {
        toast.error('Failed to delete task');
        fetchTasks();
      }
    } catch {
      toast.error('Network error');
      fetchTasks();
    }
  };

  // ---------- Dialog helpers ----------

  const openCreateDialog = () => {
    setEditingTask(null);
    setForm({
      title: '',
      description: '',
      priority: 'medium',
      category: '',
      due_date: '',
    });
    setDialogOpen(true);
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      category: task.category || '',
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingTask(null);
  };

  // ---------- DnD handlers ----------

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as number;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Determine which column the task was dropped on.
    // `over.id` could be a task id or a column id (if dropped on empty area).
    let targetColumn: ColumnId | null = null;

    // Check if dropped over a column directly
    const columnIds: ColumnId[] = ['pending', 'in_progress', 'completed'];
    if (columnIds.includes(over.id as ColumnId)) {
      targetColumn = over.id as ColumnId;
    } else {
      // Dropped over another task - find that task's column
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) {
        targetColumn = overTask.status as ColumnId;
      }
    }

    if (targetColumn && targetColumn !== task.status) {
      updateTaskStatus(taskId, targetColumn);
    }
  };

  // ---------- Derived data ----------

  const tasksByColumn: Record<ColumnId, Task[]> = {
    pending: tasks.filter((t) => t.status === 'pending'),
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    completed: tasks.filter((t) => t.status === 'completed'),
  };

  // ---------- Render ----------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchTasks}
            disabled={isLoading}
          >
            <RefreshCw
              className={cn('h-4 w-4', isLoading && 'animate-spin')}
            />
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                tasks={tasksByColumn[col.id]}
                onEdit={openEditDialog}
                onDelete={deleteTask}
              />
            ))}
          </div>

          {/* Drag overlay - shows a floating copy of the card while dragging */}
          <DragOverlay>
            {activeTask ? (
              <div className="w-[340px]">
                <TaskCardContent
                  task={activeTask}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  isOverlay
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Create / Edit Task Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? 'Edit Task' : 'New Task'}
            </DialogTitle>
            <DialogDescription>
              {editingTask
                ? 'Update the task details below.'
                : 'Fill in the details to create a new task.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="task-title">Title *</Label>
              <Input
                id="task-title"
                placeholder="e.g., Follow up with Johnson enrollment"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="task-desc">Description</Label>
              <Textarea
                id="task-desc"
                placeholder="Task details..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
              />
            </div>

            {/* Priority + Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm({ ...form, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.category || '_none'}
                  onValueChange={(v) =>
                    setForm({ ...form, category: v === '_none' ? '' : v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">None</SelectItem>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Due date */}
            <div className="space-y-2">
              <Label htmlFor="task-due">Due Date</Label>
              <Input
                id="task-due"
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              onClick={editingTask ? updateTask : createTask}
              disabled={isSaving || !form.title.trim()}
            >
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingTask ? 'Save Changes' : 'Create Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
