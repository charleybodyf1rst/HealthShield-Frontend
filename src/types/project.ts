// Project/Kanban Management Types for Boat Rental CRM

export type ProjectStatus = 'active' | 'on-hold' | 'completed' | 'archived';
export type ProjectCategory = 'maintenance' | 'marketing' | 'operations' | 'hr' | 'finance' | 'general';
export type CardPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Project {
  id: string;
  name: string;
  description?: string;
  category: ProjectCategory;
  status: ProjectStatus;

  // Metadata
  color?: string;
  icon?: string;

  // Team
  ownerId: string;
  ownerName?: string;
  memberIds?: string[];

  // Progress
  totalCards: number;
  completedCards: number;
  progressPercentage: number;

  // Dates
  startDate?: string;
  dueDate?: string;

  // Columns
  columns: ProjectColumn[];

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface ProjectColumn {
  id: string;
  projectId: string;
  name: string;
  order: number;
  color?: string;
  limit?: number; // WIP limit

  // Cards
  cards: ProjectCard[];
  cardCount: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCard {
  id: string;
  columnId: string;
  projectId: string;
  title: string;
  description?: string;
  order: number;

  // Details
  priority: CardPriority;
  labels?: CardLabel[];
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;

  // Assignment
  assigneeIds?: string[];
  assignees?: CardAssignee[];

  // Related entities
  boatId?: string;
  employeeId?: string;
  bookingId?: string;

  // Attachments
  attachments?: CardAttachment[];
  attachmentCount?: number;

  // Checklists
  checklists?: CardChecklist[];
  checklistProgress?: {
    completed: number;
    total: number;
  };

  // Comments
  comments?: CardComment[];
  commentCount?: number;

  // Activity
  activities?: CardActivity[];

  // Timestamps
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CardLabel {
  id: string;
  name: string;
  color: string;
}

export interface CardAssignee {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

export interface CardAttachment {
  id: string;
  cardId: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface CardChecklist {
  id: string;
  cardId: string;
  name: string;
  items: ChecklistItem[];
  completedItems: number;
  totalItems: number;
}

export interface ChecklistItem {
  id: string;
  checklistId: string;
  text: string;
  completed: boolean;
  assigneeId?: string;
  dueDate?: string;
  completedAt?: string;
  completedBy?: string;
}

export interface CardComment {
  id: string;
  cardId: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  mentions?: string[];
  attachments?: CardAttachment[];
  createdAt: string;
  updatedAt?: string;
  editedAt?: string;
}

export interface CardActivity {
  id: string;
  cardId: string;
  actorId: string;
  actorName: string;
  action: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

// Project Templates
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: ProjectCategory;
  columns: {
    name: string;
    order: number;
  }[];
  sampleCards?: {
    title: string;
    columnIndex: number;
  }[];
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'maintenance',
    name: 'Boat Maintenance',
    description: 'Track boat maintenance and repairs',
    category: 'maintenance',
    columns: [
      { name: 'To Do', order: 0 },
      { name: 'Scheduled', order: 1 },
      { name: 'In Progress', order: 2 },
      { name: 'Completed', order: 3 },
    ],
    sampleCards: [
      { title: 'Engine oil change', columnIndex: 0 },
      { title: 'Safety inspection', columnIndex: 0 },
      { title: 'Hull cleaning', columnIndex: 0 },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing Campaign',
    description: 'Plan and execute marketing campaigns',
    category: 'marketing',
    columns: [
      { name: 'Ideas', order: 0 },
      { name: 'Planning', order: 1 },
      { name: 'In Progress', order: 2 },
      { name: 'Review', order: 3 },
      { name: 'Published', order: 4 },
    ],
  },
  {
    id: 'onboarding',
    name: 'Employee Onboarding',
    description: 'Onboard new team members',
    category: 'hr',
    columns: [
      { name: 'Pre-Start', order: 0 },
      { name: 'Week 1', order: 1 },
      { name: 'Week 2', order: 2 },
      { name: 'Completed', order: 3 },
    ],
    sampleCards: [
      { title: 'Background check', columnIndex: 0 },
      { title: 'USCG license verification', columnIndex: 0 },
      { title: 'Safety training', columnIndex: 1 },
      { title: 'Boat familiarization', columnIndex: 1 },
    ],
  },
  {
    id: 'operations',
    name: 'Operations Planning',
    description: 'Manage day-to-day operations',
    category: 'operations',
    columns: [
      { name: 'Backlog', order: 0 },
      { name: 'This Week', order: 1 },
      { name: 'In Progress', order: 2 },
      { name: 'Done', order: 3 },
    ],
  },
];

// API Request/Response Types
export interface ProjectFilters {
  status?: ProjectStatus;
  category?: ProjectCategory;
  ownerId?: string;
  search?: string;
  sort?: 'name' | 'createdAt' | 'updatedAt' | 'dueDate';
  order?: 'asc' | 'desc';
}

export interface CreateProjectData {
  name: string;
  description?: string;
  category: ProjectCategory;
  ownerId: string;
  startDate?: string;
  dueDate?: string;
  templateId?: string;
  memberIds?: string[];
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  category?: ProjectCategory;
  status?: ProjectStatus;
  startDate?: string;
  dueDate?: string;
  memberIds?: string[];
}

export interface CreateColumnData {
  name: string;
  color?: string;
  limit?: number;
}

export interface CreateCardData {
  title: string;
  description?: string;
  priority?: CardPriority;
  dueDate?: string;
  estimatedHours?: number;
  assigneeIds?: string[];
  labels?: string[];
  boatId?: string;
  employeeId?: string;
  bookingId?: string;
}

export interface UpdateCardData {
  title?: string;
  description?: string;
  priority?: CardPriority;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  assigneeIds?: string[];
  labels?: string[];
}

export interface MoveCardData {
  columnId: string;
  order: number;
}

export interface CreateChecklistData {
  name: string;
}

export interface AddChecklistItemData {
  text: string;
  assigneeId?: string;
  dueDate?: string;
}

export interface AddCommentData {
  content: string;
  mentions?: string[];
  attachmentIds?: string[];
}
