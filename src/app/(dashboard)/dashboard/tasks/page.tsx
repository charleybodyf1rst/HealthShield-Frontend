'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  Calendar,
  MoreHorizontal,
  Pencil,
  Trash2,
  GripVertical,
  Loader2,
  CheckCircle2,
  Clock,
  ClipboardList,
} from 'lucide-react';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Constants & Helpers
// ---------------------------------------------------------------------------

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://systemsf1rst-backend-887571186773.us-central1.run.app';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('healthshield-crm-auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.state?.tokens?.accessToken || null;
    }
  } catch {
    /* empty */
  }
  return null;
}

function getHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = {
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
  cover_image?: string | null;
}

// Store cover image URL in description as [cover:URL] prefix
function parseCoverFromDescription(desc: string | null): { cover: string | null; text: string | null } {
  if (!desc) return { cover: null, text: null };
  const match = desc.match(/^\[cover:(.*?)\]\s*([\s\S]*)$/);
  if (match) return { cover: match[1] || null, text: match[2] || null };
  return { cover: null, text: desc };
}

function encodeCoverInDescription(coverUrl: string | null, text: string | null): string {
  const parts: string[] = [];
  if (coverUrl) parts.push(`[cover:${coverUrl}]`);
  if (text) parts.push(text);
  return parts.join(' ');
}

type ColumnId = 'pending' | 'in_progress' | 'completed';

const COLUMN_IDS: ColumnId[] = ['pending', 'in_progress', 'completed'];

interface ColumnDef {
  id: ColumnId;
  label: string;
  gradient: string;
  icon: React.ReactNode;
}

const COLUMNS: ColumnDef[] = [
  {
    id: 'pending',
    label: 'TO DO',
    gradient: 'bg-gradient-to-r from-blue-600 to-blue-500',
    icon: <ClipboardList className="h-4 w-4" />,
  },
  {
    id: 'in_progress',
    label: 'IN PROGRESS',
    gradient: 'bg-gradient-to-r from-orange-500 to-amber-500',
    icon: <Clock className="h-4 w-4" />,
  },
  {
    id: 'completed',
    label: 'DONE',
    gradient: 'bg-gradient-to-r from-emerald-500 to-green-500',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
];

const PRIORITY_STYLES: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400 border border-red-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  low: 'bg-green-500/20 text-green-400 border border-green-500/30',
};

const CATEGORIES = [
  { label: 'Call', value: 'call' },
  { label: 'Email', value: 'email' },
  { label: 'Meeting', value: 'meeting' },
  { label: 'Follow-up', value: 'follow_up' },
  { label: 'Review', value: 'review' },
  { label: 'Other', value: 'other' },
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ---------------------------------------------------------------------------
// Droppable Column Wrapper
// ---------------------------------------------------------------------------

function DroppableColumn({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[500px] rounded-b-xl p-2 space-y-2 transition-all duration-200 ${
        isOver
          ? 'bg-white/[0.06] ring-2 ring-orange-500/40 ring-inset'
          : 'bg-white/[0.02]'
      }`}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sortable Task Card
// ---------------------------------------------------------------------------

function SortableCard({
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${
        isDragging ? 'scale-[1.02] shadow-2xl ring-2 ring-orange-500/50 z-50' : ''
      }`}
    >
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        dragAttributes={attributes}
        dragListeners={listeners}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Task Card (shared between sortable + overlay)
// ---------------------------------------------------------------------------

function TaskCard({
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
  const categoryLabel =
    CATEGORIES.find((c) => c.value === task.category)?.label || task.category;

  return (
    <div
      className={`group relative rounded-xl border border-white/10 overflow-hidden transition-all duration-200 ${
        isOverlay
          ? 'bg-white/10 shadow-2xl scale-105 rotate-1 border-orange-500/50'
          : 'bg-white/5 hover:bg-white/10 hover:-translate-y-0.5 hover:shadow-lg'
      }`}
    >
      {/* Cover image */}
      {task.cover_image && (
        <div className="w-full h-32 overflow-hidden">
          <img
            src={task.cover_image}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}

      {/* Card body */}
      <div className="p-3">
      {/* Top row: grip + title + menu */}
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 cursor-grab active:cursor-grabbing text-white/30 hover:text-white/60 shrink-0 touch-none"
          aria-label="Drag to reorder"
          {...(dragAttributes as React.HTMLAttributes<HTMLButtonElement>)}
          {...(dragListeners as React.HTMLAttributes<HTMLButtonElement>)}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <h4 className="text-sm font-medium text-white leading-tight flex-1 min-w-0">
          {task.title}
        </h4>

        {!isOverlay && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                title="Task actions"
                aria-label="Task actions"
                className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4 text-white/50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-36 bg-[#1a1a1a] border-white/10"
            >
              <DropdownMenuItem
                onClick={() => onEdit(task)}
                className="text-white/80 focus:text-white focus:bg-white/10"
              >
                <Pencil className="h-3.5 w-3.5 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(task.id)}
                className="text-red-400 focus:text-red-300 focus:bg-red-500/10"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-white/40 mt-1.5 line-clamp-2 pl-6">
          {task.description}
        </p>
      )}

      {/* Badges row */}
      <div className="flex items-center gap-1.5 flex-wrap mt-2.5 pl-6">
        <span
          className={`text-xs px-2 py-0.5 rounded-full capitalize ${
            PRIORITY_STYLES[task.priority] || ''
          }`}
        >
          {task.priority}
        </span>

        {task.category && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
            {categoryLabel}
          </span>
        )}

        {task.due_date && (
          <span className="text-xs flex items-center gap-1 ml-auto text-white/40">
            <Calendar className="h-3 w-3" />
            {formatDate(task.due_date)}
          </span>
        )}
      </div>
      </div>{/* close p-3 body */}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quick-Add Input
// ---------------------------------------------------------------------------

function QuickAddInput({
  columnId,
  onAdd,
}: {
  columnId: ColumnId;
  onAdd: (title: string, status: ColumnId) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onAdd(trimmed, columnId);
      setValue('');
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setValue('');
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white/30 hover:text-white/60 hover:bg-white/5 rounded-xl border border-dashed border-white/10 hover:border-white/20 transition-all"
      >
        <Plus className="h-4 w-4" />
        Add a task...
      </button>
    );
  }

  return (
    <div className="p-1">
      <input
        ref={inputRef}
        type="text"
        placeholder="Task title... (Enter to add, Esc to cancel)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSubmit}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/30 transition-all"
      />
    </div>
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
  onQuickAdd,
}: {
  column: ColumnDef;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onQuickAdd: (title: string, status: ColumnId) => void;
}) {
  const taskIds = tasks.map((t) => t.id);

  return (
    <div className="flex flex-col rounded-xl overflow-hidden border border-white/5">
      {/* Colored header */}
      <div
        className={`flex items-center justify-between px-4 py-3 ${column.gradient} rounded-t-xl`}
      >
        <div className="flex items-center gap-2 text-white">
          {column.icon}
          <span className="text-sm font-bold tracking-wide">
            {column.label}
          </span>
        </div>
        <span className="text-xs font-semibold text-white bg-white/20 px-2 py-0.5 rounded-full min-w-[24px] text-center">
          {tasks.length}
        </span>
      </div>

      {/* Droppable body with cards */}
      <DroppableColumn id={column.id}>
        <SortableContext
          items={taskIds}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-white/20">
            <ClipboardList className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">No tasks yet</p>
            <p className="text-xs mt-1 text-white/15">
              Drop a task here or click + to add
            </p>
          </div>
        )}

        <QuickAddInput columnId={column.id} onAdd={onQuickAdd} />
      </DroppableColumn>
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
    cover_image: '',
  });

  // DnD sensors - require 8px of movement before drag starts
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // ---------- API calls ----------

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/crm/todos`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const list: Task[] = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.todos)
            ? data.todos
            : Array.isArray(data)
              ? data
              : [];
        // Parse cover images from description
        const enriched = list.map((t: Task) => {
          const { cover, text } = parseCoverFromDescription(t.description);
          return { ...t, cover_image: cover, description: text };
        });
        setTasks(enriched);
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
    loadTasks();
  }, [loadTasks]);

  const apiCreateTask = async (body: Record<string, string>) => {
    const res = await fetch(`${API_BASE}/api/v1/crm/todos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return res;
  };

  const apiUpdateTask = async (id: number, body: Record<string, string>) => {
    const res = await fetch(`${API_BASE}/api/v1/crm/todos/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return res;
  };

  const apiDeleteTask = async (id: number) => {
    await fetch(`${API_BASE}/api/v1/crm/todos/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
  };

  // ---------- Task operations ----------

  const handleCreate = async () => {
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
      const descWithCover = encodeCoverInDescription(form.cover_image || null, form.description.trim() || null);
      if (descWithCover) body.description = descWithCover;
      if (form.category) body.category = form.category;
      if (form.due_date) body.due_date = form.due_date;

      const res = await apiCreateTask(body);
      if (res.ok) {
        toast.success('Task created');
        closeDialog();
        loadTasks();
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

  const handleUpdate = async () => {
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
      const descWithCover = encodeCoverInDescription(form.cover_image || null, form.description.trim() || null);
      if (descWithCover) body.description = descWithCover;
      if (form.category) body.category = form.category;
      if (form.due_date) body.due_date = form.due_date;

      const res = await apiUpdateTask(editingTask.id, body);
      if (res.ok) {
        toast.success('Task updated');
        closeDialog();
        loadTasks();
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

  const handleStatusChange = async (id: number, newStatus: ColumnId) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
    try {
      const res = await apiUpdateTask(id, { status: newStatus });
      if (res.ok) {
        toast.success('Task moved');
      } else {
        toast.error('Failed to move task');
        loadTasks();
      }
    } catch {
      toast.error('Network error');
      loadTasks();
    }
  };

  const handleDelete = async (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await apiDeleteTask(id);
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
      loadTasks();
    }
  };

  const handleQuickAdd = async (title: string, status: ColumnId) => {
    try {
      const res = await apiCreateTask({
        title,
        status,
        priority: 'medium',
      });
      if (res.ok) {
        toast.success('Task added');
        loadTasks();
      } else {
        toast.error('Failed to add task');
      }
    } catch {
      toast.error('Network error');
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
      cover_image: task.cover_image || '',
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

  const handleDragOver = (_event: DragOverEvent) => {
    // Visual feedback handled by useDroppable isOver state
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as number;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    let targetColumn: ColumnId | null = null;

    // Check if dropped directly on a column
    if (COLUMN_IDS.includes(over.id as ColumnId)) {
      targetColumn = over.id as ColumnId;
    } else {
      // Dropped on another task -- find that task's column
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) {
        targetColumn = overTask.status;
      }
    }

    if (targetColumn && targetColumn !== task.status) {
      handleStatusChange(taskId, targetColumn);
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
        <h1 className="text-2xl font-bold tracking-tight text-white">Tasks</h1>
        <button
          type="button"
          onClick={openCreateDialog}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          New Task
        </button>
      </div>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-white/30" />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                tasks={tasksByColumn[col.id]}
                onEdit={openEditDialog}
                onDelete={handleDelete}
                onQuickAdd={handleQuickAdd}
              />
            ))}
          </div>

          {/* Drag overlay -- floating copy of the card while dragging */}
          <DragOverlay dropAnimation={null}>
            {activeTask ? (
              <div className="w-[340px]">
                <TaskCard
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

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg bg-[#1a1a1a] border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white text-lg">
              {editingTask ? 'Edit Task' : 'New Task'}
            </DialogTitle>
            <DialogDescription className="text-white/50">
              {editingTask
                ? 'Update the task details below.'
                : 'Fill in the details to create a new task.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="task-title" className="text-white/70 text-sm">
                Title *
              </Label>
              <Input
                id="task-title"
                placeholder="e.g., Follow up with Marcus Williams"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder-white/30 focus:ring-orange-500/50 focus:border-orange-500/30"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="task-desc" className="text-white/70 text-sm">
                Description
              </Label>
              <Textarea
                id="task-desc"
                placeholder="Task details..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                className="bg-white/5 border-white/10 text-white placeholder-white/30 focus:ring-orange-500/50 focus:border-orange-500/30"
              />
            </div>

            {/* Priority + Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm({ ...form, priority: v })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10">
                    <SelectItem value="high" className="text-white focus:bg-white/10 focus:text-white">High</SelectItem>
                    <SelectItem value="medium" className="text-white focus:bg-white/10 focus:text-white">Medium</SelectItem>
                    <SelectItem value="low" className="text-white focus:bg-white/10 focus:text-white">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Category</Label>
                <Select
                  value={form.category || '_none'}
                  onValueChange={(v) =>
                    setForm({ ...form, category: v === '_none' ? '' : v })
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10">
                    <SelectItem value="_none" className="text-white focus:bg-white/10 focus:text-white">None</SelectItem>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value} className="text-white focus:bg-white/10 focus:text-white">
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Due date */}
            <div className="space-y-2">
              <Label htmlFor="task-due" className="text-white/70 text-sm">
                Due Date
              </Label>
              <Input
                id="task-due"
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="bg-white/5 border-white/10 text-white focus:ring-orange-500/50 focus:border-orange-500/30"
              />
            </div>

            {/* Cover Image URL */}
            <div className="space-y-2">
              <Label htmlFor="task-cover" className="text-white/70 text-sm">
                Cover Image URL
              </Label>
              <Input
                id="task-cover"
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={form.cover_image || ''}
                onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-orange-500/50 focus:border-orange-500/30"
              />
              {form.cover_image && (
                <div className="mt-2 rounded-lg overflow-hidden h-24">
                  <img src={form.cover_image} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={closeDialog}
              className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={editingTask ? handleUpdate : handleCreate}
              disabled={isSaving || !form.title.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
