'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Megaphone,
  Plus,
  RefreshCw,
  MoreHorizontal,
  Mail,
  MessageSquare,
  Bell,
  Smartphone,
  Send,
  Trash2,
  Edit,
  Eye,
  BarChart3,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
} from 'lucide-react';
import { campaignsApi, type Campaign, type CampaignCreateData } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

const campaignTypeIcons: Record<string, React.ReactNode> = {
  email: <Mail className="h-4 w-4" />,
  sms: <MessageSquare className="h-4 w-4" />,
  push: <Bell className="h-4 w-4" />,
  in_app: <Smartphone className="h-4 w-4" />,
};

const campaignTypeLabels: Record<string, string> = {
  email: 'Email',
  sms: 'SMS',
  push: 'Push Notification',
  in_app: 'In-App Message',
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500',
  active: 'bg-blue-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
};

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

interface CreateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function CreateCampaignDialog({ open, onOpenChange, onSuccess }: CreateCampaignDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CampaignCreateData>({
    name: '',
    type: 'email',
    subject: '',
    content: '',
    target_audience: 'all',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await campaignsApi.createCampaign(formData);
      toast.success('Campaign created successfully');
      onOpenChange(false);
      onSuccess();
      setFormData({
        name: '',
        type: 'email',
        subject: '',
        content: '',
        target_audience: 'all',
      });
    } catch (error) {
      console.error('Failed to create campaign:', error);
      toast.error('Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Set up a new marketing campaign to reach your audience.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Summer Sale Announcement"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Campaign Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: CampaignCreateData['type']) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger className="font-medium">
                    <SelectValue placeholder="Select campaign type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="push">Push Notification</SelectItem>
                    <SelectItem value="in_app">In-App Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="target">Target Audience</Label>
                <Select
                  value={formData.target_audience || 'all'}
                  onValueChange={(value) =>
                    setFormData({ ...formData, target_audience: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="new_leads">New Leads</SelectItem>
                    <SelectItem value="qualified">Qualified Leads</SelectItem>
                    <SelectItem value="customers">Existing Customers</SelectItem>
                    <SelectItem value="inactive">Inactive Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.type === 'email' && (
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Don't miss out on our biggest sale!"
                  value={formData.subject || ''}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="message">Message Content *</Label>
              <Textarea
                id="message"
                placeholder="Enter your campaign message..."
                rows={5}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Campaign
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CampaignStats({ campaigns }: { campaigns: Campaign[] }) {
  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === 'active').length,
    draft: campaigns.filter((c) => c.status === 'draft').length,
    completed: campaigns.filter((c) => c.status === 'completed').length,
    totalSent: campaigns.reduce((sum, c) => sum + c.sent_count, 0),
    totalOpened: campaigns.reduce((sum, c) => sum + c.opened_count, 0),
    totalClicked: campaigns.reduce((sum, c) => sum + c.clicked_count, 0),
  };

  const openRate = stats.totalSent > 0 ? ((stats.totalOpened / stats.totalSent) * 100).toFixed(1) : '0';
  const clickRate = stats.totalOpened > 0 ? ((stats.totalClicked / stats.totalOpened) * 100).toFixed(1) : '0';

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
          <Megaphone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            {stats.active} active, {stats.draft} drafts
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
          <Send className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSent.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Across all campaigns</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{openRate}%</div>
          <p className="text-xs text-muted-foreground">{stats.totalOpened.toLocaleString()} opened</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{clickRate}%</div>
          <p className="text-xs text-muted-foreground">{stats.totalClicked.toLocaleString()} clicked</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [sendingCampaignId, setSendingCampaignId] = useState<string | null>(null);
  const [deletingCampaignId, setDeletingCampaignId] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    try {
      setError(null);
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.type = typeFilter;

      const response = await campaignsApi.getCampaigns(params);
      setCampaigns(response.data?.data ?? []);
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
      setError('Failed to load campaigns. Please try again.');
      setCampaigns([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [statusFilter, typeFilter]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchCampaigns();
  };

  const handleSendCampaign = async (campaign: Campaign) => {
    if (campaign.status !== 'draft') {
      toast.error('Only draft campaigns can be sent');
      return;
    }

    setSendingCampaignId(campaign.id);
    try {
      const response = await campaignsApi.sendCampaign(campaign.id);
      toast.success(`Campaign sent to ${response.data?.recipients_count ?? 0} recipients`);
      fetchCampaigns();
    } catch (err) {
      console.error('Failed to send campaign:', err);
      toast.error('Failed to send campaign');
    } finally {
      setSendingCampaignId(null);
    }
  };

  const handleDeleteCampaign = async (campaign: Campaign) => {
    if (campaign.status === 'active') {
      toast.error('Cannot delete an active campaign');
      return;
    }

    setDeletingCampaignId(campaign.id);
    try {
      await campaignsApi.deleteCampaign(campaign.id);
      toast.success('Campaign deleted');
      fetchCampaigns();
    } catch (err) {
      console.error('Failed to delete campaign:', err);
      toast.error('Failed to delete campaign');
    } finally {
      setDeletingCampaignId(null);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-60" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">
            Create and manage your marketing campaigns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Stats */}
      <CampaignStats campaigns={campaigns} />

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Campaigns</CardTitle>
          <CardDescription>
            Filter and manage your marketing campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="status-filter" className="text-sm">Status:</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="type-filter" className="text-sm">Type:</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="push">Push</SelectItem>
                  <SelectItem value="in_app">In-App</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          {campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-muted rounded-full mb-4">
                <Megaphone className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">No campaigns yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first campaign to reach your audience.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Sent</TableHead>
                    <TableHead className="text-right">Opened</TableHead>
                    <TableHead className="text-right">Clicked</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          {campaign.subject && (
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {campaign.subject}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {campaignTypeIcons[campaign.type]}
                          <span className="text-sm">{campaignTypeLabels[campaign.type]}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`${statusColors[campaign.status]} text-white`}
                        >
                          {statusLabels[campaign.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {campaign.sent_count.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {campaign.opened_count.toLocaleString()}
                        {campaign.sent_count > 0 && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({((campaign.opened_count / campaign.sent_count) * 100).toFixed(0)}%)
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {campaign.clicked_count.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(campaign.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            {campaign.status === 'draft' && (
                              <DropdownMenuItem
                                onClick={() => handleSendCampaign(campaign)}
                                disabled={sendingCampaignId === campaign.id}
                              >
                                {sendingCampaignId === campaign.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Send className="mr-2 h-4 w-4" />
                                )}
                                Send Campaign
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteCampaign(campaign)}
                              disabled={
                                campaign.status === 'active' ||
                                deletingCampaignId === campaign.id
                              }
                            >
                              {deletingCampaignId === campaign.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="mr-2 h-4 w-4" />
                              )}
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Campaign Dialog */}
      <CreateCampaignDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchCampaigns}
      />
    </div>
  );
}