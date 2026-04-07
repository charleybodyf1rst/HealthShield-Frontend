'use client';

/**
 * Projects Dashboard - Kanban-style Project Management
 * Trello-like board for tracking maintenance, marketing, and operations
 */

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FolderKanban,
  Search,
  Plus,
  MoreVertical,
  Calendar,
  Users,
  CheckSquare,
  MessageSquare,
  Paperclip,
  Clock,
  AlertCircle,
  ChevronRight,
  LayoutGrid,
  List,
  Wrench,
  Megaphone,
  Settings,
  UserPlus,
  DollarSign,
  ShieldCheck,
  GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type Project,
  type ProjectColumn,
  type ProjectCard,
  type ProjectStatus,
  type ProjectCategory,
  type CardPriority,
  PROJECT_TEMPLATES,
} from '@/types/project';

// Demo projects data
const demoProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Q2 Enrollment Campaign',
    description: 'Drive enrollment numbers for Q2 open enrollment period',
    category: 'maintenance',
    status: 'active',
    color: '#f59e0b',
    ownerId: 'emp-1',
    ownerName: 'Marcus Rivera',
    memberIds: ['emp-2', 'emp-3'],
    totalCards: 12,
    completedCards: 5,
    progressPercentage: 42,
    startDate: '2026-01-01',
    dueDate: '2026-03-15',
    columns: [
      {
        id: 'col-1',
        projectId: 'proj-1',
        name: 'To Do',
        order: 0,
        color: '#6b7280',
        cards: [
          {
            id: 'card-1',
            columnId: 'col-1',
            projectId: 'proj-1',
            title: 'Medicare Advantage plan review',
            description: 'Annual plan benefit review and updates',
            order: 0,
            priority: 'high',
            dueDate: '2026-01-20',
            programId: 'prog-medicare-adv',
            assignees: [{ id: 'emp-2', name: 'Jake Thompson', email: 'jake@healthshield.ai' }],
            checklistProgress: { completed: 2, total: 5 },
            commentCount: 3,
            createdAt: '2026-01-05T10:00:00Z',
            updatedAt: '2026-01-10T14:30:00Z',
          },
          {
            id: 'card-2',
            columnId: 'col-1',
            projectId: 'proj-1',
            title: 'Family Health plan compliance update',
            description: 'Update compliance documentation for new regulations',
            order: 1,
            priority: 'medium',
            dueDate: '2026-01-25',
            programId: 'prog-family-health',
            assignees: [{ id: 'emp-3', name: 'Sarah Chen', email: 'sarah@healthshield.ai' }],
            createdAt: '2026-01-06T09:00:00Z',
            updatedAt: '2026-01-06T09:00:00Z',
          },
        ],
        cardCount: 2,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-10T14:30:00Z',
      },
      {
        id: 'col-2',
        projectId: 'proj-1',
        name: 'In Progress',
        order: 1,
        color: '#3b82f6',
        cards: [
          {
            id: 'card-3',
            columnId: 'col-2',
            projectId: 'proj-1',
            title: 'Safety equipment audit',
            description: 'Verify all compliance documentation across programs',
            order: 0,
            priority: 'urgent',
            estimatedHours: 8,
            actualHours: 4,
            assignees: [
              { id: 'emp-1', name: 'Marcus Rivera', email: 'marcus@healthshield.ai' },
              { id: 'emp-2', name: 'Jake Thompson', email: 'jake@healthshield.ai' },
            ],
            checklistProgress: { completed: 8, total: 15 },
            attachmentCount: 2,
            createdAt: '2026-01-02T08:00:00Z',
            updatedAt: '2026-01-12T16:00:00Z',
          },
        ],
        cardCount: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-12T16:00:00Z',
      },
      {
        id: 'col-3',
        projectId: 'proj-1',
        name: 'Review',
        order: 2,
        color: '#8b5cf6',
        cards: [
          {
            id: 'card-4',
            columnId: 'col-3',
            projectId: 'proj-1',
            title: 'Update policy documents',
            description: 'Renew and file 2026 policy documentation',
            order: 0,
            priority: 'high',
            dueDate: '2026-01-15',
            attachmentCount: 5,
            createdAt: '2025-12-20T10:00:00Z',
            updatedAt: '2026-01-11T11:00:00Z',
          },
        ],
        cardCount: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-11T11:00:00Z',
      },
      {
        id: 'col-4',
        projectId: 'proj-1',
        name: 'Completed',
        order: 3,
        color: '#22c55e',
        cards: [
          {
            id: 'card-5',
            columnId: 'col-4',
            projectId: 'proj-1',
            title: 'Order updated compliance materials',
            order: 0,
            priority: 'medium',
            completedAt: '2026-01-08T15:00:00Z',
            createdAt: '2026-01-03T09:00:00Z',
            updatedAt: '2026-01-08T15:00:00Z',
          },
        ],
        cardCount: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-08T15:00:00Z',
      },
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-12T16:00:00Z',
  },
  {
    id: 'proj-2',
    name: 'Spring Marketing Campaign',
    description: 'Launch spring break promotional campaign',
    category: 'marketing',
    status: 'active',
    color: '#ec4899',
    ownerId: 'emp-4',
    ownerName: 'Ashley Williams',
    totalCards: 8,
    completedCards: 2,
    progressPercentage: 25,
    startDate: '2026-01-10',
    dueDate: '2026-02-28',
    columns: [],
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-12T10:00:00Z',
  },
  {
    id: 'proj-3',
    name: 'New Agent Onboarding',
    description: 'Onboard 3 new insurance agents for enrollment season',
    category: 'hr',
    status: 'active',
    color: '#06b6d4',
    ownerId: 'emp-1',
    ownerName: 'Marcus Rivera',
    totalCards: 15,
    completedCards: 6,
    progressPercentage: 40,
    dueDate: '2026-02-15',
    columns: [],
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-01-11T14:00:00Z',
  },
];

const categoryConfig: Record<ProjectCategory, { label: string; color: string; icon: typeof Wrench }> = {
  maintenance: { label: 'Maintenance', color: 'bg-amber-500', icon: Wrench },
  marketing: { label: 'Marketing', color: 'bg-pink-500', icon: Megaphone },
  operations: { label: 'Operations', color: 'bg-blue-500', icon: Settings },
  hr: { label: 'HR', color: 'bg-cyan-500', icon: UserPlus },
  finance: { label: 'Finance', color: 'bg-green-500', icon: DollarSign },
  general: { label: 'General', color: 'bg-gray-500', icon: FolderKanban },
};

const statusConfig: Record<ProjectStatus, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-green-500' },
  'on-hold': { label: 'On Hold', color: 'bg-yellow-500' },
  completed: { label: 'Completed', color: 'bg-blue-500' },
  archived: { label: 'Archived', color: 'bg-gray-500' },
};

const priorityConfig: Record<CardPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-gray-400' },
  medium: { label: 'Medium', color: 'bg-blue-500' },
  high: { label: 'High', color: 'bg-orange-500' },
  urgent: { label: 'Urgent', color: 'bg-red-500' },
};

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProject, setSelectedProject] = useState<Project | null>(demoProjects[0]);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    status: 'active',
    due_date: '',
  });

  const handleCreateProject = useCallback(async () => {
    if (!projectForm.name) {
      toast.error('Project name is required');
      return;
    }
    setCreatingProject(true);
    try {
      const response = await fetch('/api/v1/crm/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectForm.name,
          description: projectForm.description,
          status: projectForm.status,
          due_date: projectForm.due_date || undefined,
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create project');
      }
      toast.success('Project created successfully');
      setShowNewProjectDialog(false);
      setProjectForm({ name: '', description: '', status: 'active', due_date: '' });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create project');
    } finally {
      setCreatingProject(false);
    }
  }, [projectForm]);

  // Filter projects
  const filteredProjects = demoProjects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: demoProjects.length,
    active: demoProjects.filter(p => p.status === 'active').length,
    totalCards: demoProjects.reduce((acc, p) => acc + p.totalCards, 0),
    completedCards: demoProjects.reduce((acc, p) => acc + p.completedCards, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-purple-600" />
            Projects
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage projects with Kanban boards and task tracking
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new project
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="project-name">Project Name *</Label>
                  <Input
                    id="project-name"
                    placeholder="e.g., Q2 Enrollment Campaign"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="project-description">Description</Label>
                  <Textarea
                    id="project-description"
                    placeholder="Describe the project goals and scope..."
                    value={projectForm.description}
                    onChange={(e) => setProjectForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="project-status">Status</Label>
                    <Select
                      value={projectForm.status}
                      onValueChange={(val) => setProjectForm((f) => ({ ...f, status: val }))}
                    >
                      <SelectTrigger id="project-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="project-due-date">Due Date</Label>
                    <Input
                      id="project-due-date"
                      type="date"
                      value={projectForm.due_date}
                      onChange={(e) => setProjectForm((f) => ({ ...f, due_date: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Template suggestions */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3 text-muted-foreground">Or start from a template:</p>
                <div className="grid grid-cols-2 gap-3">
                  {PROJECT_TEMPLATES.map((template) => {
                    const CategoryIcon = categoryConfig[template.category].icon;
                    return (
                      <Card
                        key={template.id}
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => setProjectForm((f) => ({
                          ...f,
                          name: f.name || template.name,
                          description: f.description || template.description,
                        }))}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <CategoryIcon className="h-4 w-4" />
                            {template.name}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {template.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-1">
                            {template.columns.map((col) => (
                              <Badge key={col.name} variant="outline" className="text-xs">
                                {col.name}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewProjectDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateProject} disabled={creatingProject}>
                  {creatingProject ? 'Creating...' : 'Create Project'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Projects
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tasks
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCards}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedCards} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalCards > 0 ? Math.round((stats.completedCards / stats.totalCards) * 100) : 0}%
            </div>
            <Progress
              value={stats.totalCards > 0 ? (stats.completedCards / stats.totalCards) * 100 : 0}
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Due This Week
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">4</div>
            <p className="text-xs text-muted-foreground">
              2 urgent priority
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="operations">Operations</SelectItem>
            <SelectItem value="hr">HR</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Project List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-semibold text-lg">Projects</h2>
          {filteredProjects.map((project) => {
            const catConfig = categoryConfig[project.category];
            const CategoryIcon = catConfig.icon;
            const isSelected = selectedProject?.id === project.id;

            return (
              <Card
                key={project.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  isSelected && 'ring-2 ring-primary'
                )}
                onClick={() => setSelectedProject(project)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <CardTitle className="text-base">{project.name}</CardTitle>
                    </div>
                    <Badge className={cn('text-white text-xs', catConfig.color)}>
                      <CategoryIcon className="h-3 w-3 mr-1" />
                      {catConfig.label}
                    </Badge>
                  </div>
                  {project.description && (
                    <CardDescription className="text-xs line-clamp-2">
                      {project.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.progressPercentage}%</span>
                  </div>
                  <Progress value={project.progressPercentage} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{project.completedCards} / {project.totalCards} tasks</span>
                    {project.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(project.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredProjects.length === 0 && (
            <div className="text-center py-8">
              <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No projects found</h3>
              <p className="text-muted-foreground mt-1">
                Try adjusting your filters
              </p>
            </div>
          )}
        </div>

        {/* Kanban Board */}
        <div className="lg:col-span-2">
          {selectedProject ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedProject.color }}
                  />
                  {selectedProject.name}
                </h2>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Column
                </Button>
              </div>

              {/* Board Columns */}
              <div className="flex gap-4 overflow-x-auto pb-4">
                {selectedProject.columns.map((column) => (
                  <div
                    key={column.id}
                    className="flex-shrink-0 w-72 bg-muted/50 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: column.color }}
                        />
                        <h3 className="font-medium text-sm">{column.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {column.cardCount}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {column.cards.map((card) => (
                        <Card key={card.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-3 space-y-2">
                            {/* Priority indicator */}
                            {card.priority && (
                              <div className="flex items-center gap-1">
                                <div
                                  className={cn(
                                    'w-2 h-2 rounded-full',
                                    priorityConfig[card.priority].color
                                  )}
                                />
                                <span className="text-xs text-muted-foreground">
                                  {priorityConfig[card.priority].label}
                                </span>
                              </div>
                            )}

                            {/* Card title */}
                            <h4 className="font-medium text-sm">{card.title}</h4>

                            {/* Card description */}
                            {card.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {card.description}
                              </p>
                            )}

                            {/* Program reference */}
                            {card.programId && (
                              <Badge variant="outline" className="text-xs">
                                <ShieldCheck className="h-3 w-3 mr-1" />
                                {card.programId.replace('prog-', '').replace(/-/g, ' ')}
                              </Badge>
                            )}

                            {/* Card metadata */}
                            <div className="flex items-center justify-between pt-2">
                              <div className="flex items-center gap-2">
                                {card.dueDate && (
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(card.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                )}
                                {card.checklistProgress && (
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <CheckSquare className="h-3 w-3" />
                                    {card.checklistProgress.completed}/{card.checklistProgress.total}
                                  </span>
                                )}
                                {card.commentCount && card.commentCount > 0 && (
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <MessageSquare className="h-3 w-3" />
                                    {card.commentCount}
                                  </span>
                                )}
                                {card.attachmentCount && card.attachmentCount > 0 && (
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Paperclip className="h-3 w-3" />
                                    {card.attachmentCount}
                                  </span>
                                )}
                              </div>

                              {/* Assignees */}
                              {card.assignees && card.assignees.length > 0 && (
                                <div className="flex -space-x-2">
                                  {card.assignees.slice(0, 3).map((assignee) => (
                                    <Avatar key={assignee.id} className="h-6 w-6 border-2 border-background">
                                      <AvatarImage src={assignee.photo} />
                                      <AvatarFallback className="text-xs">
                                        {assignee.name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                  {card.assignees.length > 3 && (
                                    <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                      <span className="text-xs">+{card.assignees.length - 3}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {/* Add card button */}
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-muted-foreground hover:text-foreground"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add a card
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Add column placeholder */}
                {selectedProject.columns.length === 0 && (
                  <div className="flex-shrink-0 w-72 border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground">
                    <Plus className="h-8 w-8 mb-2" />
                    <p className="text-sm">Add your first column</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
              <div className="text-center">
                <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Select a project</h3>
                <p className="text-muted-foreground mt-1">
                  Choose a project from the list to view its board
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
