/**
 * HealthShield - Trello-Style Task Management System
 *
 * Kanban board for:
 * - Daily operations tasks
 * - Boat maintenance tracking
 * - Marketing campaigns
 * - Customer follow-ups
 * - Team assignments
 */

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  assigneeId?: string;
  assigneeName?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  tags: string[];
  checklist?: ChecklistItem[];
  attachments?: TaskAttachment[];
  comments?: TaskComment[];
  boatSlug?: string;
  bookingId?: string;
  recurrence?: TaskRecurrence;
}

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskCategory =
  | 'operations'
  | 'maintenance'
  | 'marketing'
  | 'customer'
  | 'finance'
  | 'admin'
  | 'hr';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface TaskComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
}

export interface TaskRecurrence {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endDate?: Date;
}

export interface TaskBoard {
  id: string;
  name: string;
  description?: string;
  columns: TaskColumn[];
  createdAt: Date;
}

export interface TaskColumn {
  id: string;
  name: string;
  status: TaskStatus;
  color: string;
  limit?: number;
  taskIds: string[];
}

// Default board configuration
export const defaultTaskBoard: TaskBoard = {
  id: 'main-board',
  name: 'Operations Board',
  description: 'Main task board for HealthShield operations',
  columns: [
    {
      id: 'col-backlog',
      name: 'Backlog',
      status: 'backlog',
      color: '#6B7280',
      taskIds: [],
    },
    {
      id: 'col-todo',
      name: 'To Do',
      status: 'todo',
      color: '#3B82F6',
      limit: 10,
      taskIds: [],
    },
    {
      id: 'col-progress',
      name: 'In Progress',
      status: 'in_progress',
      color: '#F59E0B',
      limit: 5,
      taskIds: [],
    },
    {
      id: 'col-review',
      name: 'Review',
      status: 'review',
      color: '#8B5CF6',
      limit: 5,
      taskIds: [],
    },
    {
      id: 'col-done',
      name: 'Done',
      status: 'done',
      color: '#10B981',
      taskIds: [],
    },
  ],
  createdAt: new Date(),
};

// Pre-defined task templates
export const taskTemplates: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Daily Operations
  {
    title: 'Morning Boat Inspection',
    description: 'Check all boats before first trip of the day',
    status: 'todo',
    priority: 'high',
    category: 'operations',
    tags: ['daily', 'safety'],
    checklist: [
      { id: 'c1', text: 'Check fuel levels', completed: false },
      { id: 'c2', text: 'Inspect safety equipment', completed: false },
      { id: 'c3', text: 'Test sound system', completed: false },
      { id: 'c4', text: 'Verify coolers have ice', completed: false },
      { id: 'c5', text: 'Check lily pads condition', completed: false },
    ],
    recurrence: {
      frequency: 'daily',
      interval: 1,
    },
  },
  {
    title: 'End of Day Cleanup',
    description: 'Clean and secure all boats after last trip',
    status: 'todo',
    priority: 'high',
    category: 'operations',
    tags: ['daily', 'cleaning'],
    checklist: [
      { id: 'c1', text: 'Trash removed from all boats', completed: false },
      { id: 'c2', text: 'Coolers emptied and cleaned', completed: false },
      { id: 'c3', text: 'Seats wiped down', completed: false },
      { id: 'c4', text: 'Equipment secured', completed: false },
      { id: 'c5', text: 'Boats tied properly', completed: false },
    ],
    recurrence: {
      frequency: 'daily',
      interval: 1,
    },
  },

  // Weekly Tasks
  {
    title: 'Weekly Social Media Content',
    description: 'Post engaging content across all platforms',
    status: 'todo',
    priority: 'medium',
    category: 'marketing',
    tags: ['weekly', 'social-media'],
    checklist: [
      { id: 'c1', text: 'Instagram post (photo or reel)', completed: false },
      { id: 'c2', text: 'Facebook post', completed: false },
      { id: 'c3', text: 'Respond to all comments/DMs', completed: false },
      { id: 'c4', text: 'Share customer photos (with permission)', completed: false },
    ],
    recurrence: {
      frequency: 'weekly',
      interval: 1,
      daysOfWeek: [6], // Saturday
    },
  },
  {
    title: 'Review Week\'s Bookings',
    description: 'Prepare for upcoming week - confirm all bookings and assign captains',
    status: 'todo',
    priority: 'high',
    category: 'operations',
    tags: ['weekly', 'planning'],
    checklist: [
      { id: 'c1', text: 'Review all upcoming bookings', completed: false },
      { id: 'c2', text: 'Send confirmation to customers', completed: false },
      { id: 'c3', text: 'Assign captains to each trip', completed: false },
      { id: 'c4', text: 'Check for special requests', completed: false },
      { id: 'c5', text: 'Verify payment status', completed: false },
    ],
    recurrence: {
      frequency: 'weekly',
      interval: 1,
      daysOfWeek: [0], // Sunday
    },
  },

  // Monthly Tasks
  {
    title: 'Monthly Boat Deep Clean',
    description: 'Thorough cleaning of all boats',
    status: 'todo',
    priority: 'medium',
    category: 'maintenance',
    tags: ['monthly', 'cleaning'],
    checklist: [
      { id: 'c1', text: 'Hull cleaning', completed: false },
      { id: 'c2', text: 'Deck scrubbing', completed: false },
      { id: 'c3', text: 'Upholstery deep clean', completed: false },
      { id: 'c4', text: 'Windows/windshield', completed: false },
      { id: 'c5', text: 'Canvas and covers', completed: false },
    ],
    recurrence: {
      frequency: 'monthly',
      interval: 1,
      dayOfMonth: 1,
    },
  },
  {
    title: 'Monthly Financial Review',
    description: 'Review revenue, expenses, and profitability',
    status: 'todo',
    priority: 'high',
    category: 'finance',
    tags: ['monthly', 'accounting'],
    checklist: [
      { id: 'c1', text: 'Reconcile bank statements', completed: false },
      { id: 'c2', text: 'Review all expenses', completed: false },
      { id: 'c3', text: 'Check revenue vs goal', completed: false },
      { id: 'c4', text: 'Update financial dashboard', completed: false },
      { id: 'c5', text: 'Send to accountant if needed', completed: false },
    ],
    recurrence: {
      frequency: 'monthly',
      interval: 1,
      dayOfMonth: 5,
    },
  },
  {
    title: 'Review & Request Customer Reviews',
    description: 'Follow up with recent customers for Google/Yelp reviews',
    status: 'todo',
    priority: 'medium',
    category: 'marketing',
    tags: ['monthly', 'reviews'],
    checklist: [
      { id: 'c1', text: 'Check current rating on Google', completed: false },
      { id: 'c2', text: 'Send review requests to happy customers', completed: false },
      { id: 'c3', text: 'Respond to any new reviews', completed: false },
      { id: 'c4', text: 'Address any negative feedback', completed: false },
    ],
    recurrence: {
      frequency: 'monthly',
      interval: 1,
      dayOfMonth: 15,
    },
  },

  // Seasonal Tasks
  {
    title: 'Pre-Season Boat Prep',
    description: 'Get all boats ready for peak season (April)',
    status: 'backlog',
    priority: 'high',
    category: 'maintenance',
    tags: ['seasonal', 'spring'],
    checklist: [
      { id: 'c1', text: 'Full engine service for all boats', completed: false },
      { id: 'c2', text: 'Replace worn safety equipment', completed: false },
      { id: 'c3', text: 'Update sound systems if needed', completed: false },
      { id: 'c4', text: 'New lily pads/floats', completed: false },
      { id: 'c5', text: 'Professional photo shoot', completed: false },
      { id: 'c6', text: 'Update website pricing', completed: false },
    ],
  },
  {
    title: 'End of Season Winterization',
    description: 'Prepare boats for off-season (October)',
    status: 'backlog',
    priority: 'high',
    category: 'maintenance',
    tags: ['seasonal', 'winter'],
    checklist: [
      { id: 'c1', text: 'Engine winterization', completed: false },
      { id: 'c2', text: 'Drain all water systems', completed: false },
      { id: 'c3', text: 'Cover all boats', completed: false },
      { id: 'c4', text: 'Store removable equipment', completed: false },
      { id: 'c5', text: 'Document any repairs needed', completed: false },
    ],
  },
];

// Sample active tasks
export const sampleTasks: Task[] = [
  {
    id: 'task-001',
    title: 'Follow up with Johnson wedding inquiry',
    description: 'Potential 25-person bachelorette party for June 15th',
    status: 'in_progress',
    priority: 'high',
    category: 'customer',
    assigneeId: 'captain-jason',
    assigneeName: 'Captain Jason',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    tags: ['lead', 'wedding', 'king-kong'],
    comments: [
      {
        id: 'com-1',
        authorId: 'captain-jason',
        authorName: 'Captain Jason',
        content: 'Called and left voicemail. Will try again tomorrow.',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
    ],
  },
  {
    id: 'task-002',
    title: 'King Kong speaker replacement',
    description: 'Left rear speaker is crackling - need to replace',
    status: 'todo',
    priority: 'medium',
    category: 'maintenance',
    boatSlug: 'king-kong',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    tags: ['maintenance', 'audio', 'king-kong'],
    checklist: [
      { id: 'c1', text: 'Order replacement speaker', completed: true },
      { id: 'c2', text: 'Schedule installation', completed: false },
      { id: 'c3', text: 'Test after installation', completed: false },
    ],
  },
  {
    id: 'task-003',
    title: 'Post Memorial Day weekend photos',
    description: 'Got great customer photos from Memorial Day - share on social',
    status: 'todo',
    priority: 'low',
    category: 'marketing',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    tags: ['social-media', 'photos', 'memorial-day'],
    attachments: [
      {
        id: 'att-1',
        name: 'memorial-day-group.jpg',
        url: '/attachments/memorial-day-group.jpg',
        type: 'image/jpeg',
        size: 2500000,
      },
    ],
  },
  {
    id: 'task-004',
    title: 'Renew dock permit',
    description: 'Annual dock permit expires June 30',
    status: 'backlog',
    priority: 'high',
    category: 'admin',
    dueDate: new Date('2024-06-30'),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    tags: ['permit', 'legal', 'annual'],
  },
];

// Task management functions
export function filterTasks(
  tasks: Task[],
  filters: {
    status?: TaskStatus;
    priority?: TaskPriority;
    category?: TaskCategory;
    assigneeId?: string;
    boatSlug?: string;
    dueBefore?: Date;
    tags?: string[];
  }
): Task[] {
  return tasks.filter((task) => {
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.category && task.category !== filters.category) return false;
    if (filters.assigneeId && task.assigneeId !== filters.assigneeId) return false;
    if (filters.boatSlug && task.boatSlug !== filters.boatSlug) return false;
    if (filters.dueBefore && task.dueDate && task.dueDate > filters.dueBefore) return false;
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some((t) => task.tags.includes(t));
      if (!hasMatchingTag) return false;
    }
    return true;
  });
}

export function sortTasks(
  tasks: Task[],
  sortBy: 'priority' | 'dueDate' | 'createdAt' | 'updatedAt',
  order: 'asc' | 'desc' = 'desc'
): Task[] {
  const priorityOrder: Record<TaskPriority, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  return [...tasks].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'priority':
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) comparison = 0;
        else if (!a.dueDate) comparison = 1;
        else if (!b.dueDate) comparison = -1;
        else comparison = a.dueDate.getTime() - b.dueDate.getTime();
        break;
      case 'createdAt':
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
        break;
      case 'updatedAt':
        comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
        break;
    }

    return order === 'asc' ? comparison : -comparison;
  });
}

export function getOverdueTasks(tasks: Task[]): Task[] {
  const now = new Date();
  return tasks.filter(
    (t) => t.dueDate && t.dueDate < now && t.status !== 'done'
  );
}

export function getTasksDueToday(tasks: Task[]): Task[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return tasks.filter(
    (t) => t.dueDate && t.dueDate >= today && t.dueDate < tomorrow && t.status !== 'done'
  );
}

export function calculateTaskCompletion(task: Task): number {
  if (!task.checklist || task.checklist.length === 0) {
    return task.status === 'done' ? 100 : 0;
  }
  const completed = task.checklist.filter((item) => item.completed).length;
  return Math.round((completed / task.checklist.length) * 100);
}

export function getPriorityColor(priority: TaskPriority): string {
  const colors: Record<TaskPriority, string> = {
    low: '#6B7280',
    medium: '#3B82F6',
    high: '#F59E0B',
    urgent: '#EF4444',
  };
  return colors[priority];
}

export function getCategoryIcon(category: TaskCategory): string {
  const icons: Record<TaskCategory, string> = {
    operations: '⚙️',
    maintenance: '🔧',
    marketing: '📣',
    customer: '👥',
    finance: '💰',
    admin: '📋',
    hr: '👔',
  };
  return icons[category];
}
