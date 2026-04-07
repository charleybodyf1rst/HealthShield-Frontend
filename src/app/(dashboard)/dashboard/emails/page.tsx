'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
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
  Eye,
  Inbox,
  Mail,
  MailOpen,
  Plus,
  Reply,
  Search,
  Send,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { inboxApi, communicationApi } from '@/lib/api';
import type { CommunicationLog } from '@/lib/api';

const filters = ['All', 'Sent', 'Received', 'Drafts', 'Templates'] as const;

function EmailSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-4 rounded-lg border">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-full" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

export default function EmailsPage() {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [emails, setEmails] = useState<CommunicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [composeOpen, setComposeOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [composeForm, setComposeForm] = useState({ to: '', subject: '', body: '' });

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await inboxApi.getInbox({ type: 'email' });
      const data = response.data;
      setEmails(data.communications ?? []);
      setUnreadCount(data.unread_count ?? 0);
    } catch {
      toast.error('Failed to load emails');
      setEmails([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const handleSendEmail = async () => {
    if (!composeForm.to || !composeForm.subject || !composeForm.body) {
      toast.error('Please fill in all fields');
      return;
    }

    setSending(true);
    try {
      await communicationApi.sendEmail({
        to: composeForm.to,
        subject: composeForm.subject,
        body: composeForm.body,
      });
      toast.success('Email sent successfully');
      setComposeOpen(false);
      setComposeForm({ to: '', subject: '', body: '' });
      // Refresh the list
      fetchEmails();
    } catch {
      toast.error('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const handleMarkAsRead = async (email: CommunicationLog) => {
    if (email.is_read) return;
    try {
      await inboxApi.markAsRead(email.id);
      setEmails((prev) =>
        prev.map((e) => (e.id === email.id ? { ...e, is_read: true } : e))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Silently fail - not critical
    }
  };

  // Derive stats from real data
  const sentCount = emails.filter((e) => e.direction === 'outbound').length;
  const receivedCount = emails.filter((e) => e.direction === 'inbound').length;
  const readCount = emails.filter((e) => e.is_read).length;
  const openRate = emails.length > 0 ? Math.round((readCount / emails.length) * 100) : 0;

  const emailStats = [
    {
      title: 'Sent',
      value: String(sentCount),
      icon: Send,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Received',
      value: String(receivedCount),
      icon: Inbox,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Open Rate',
      value: `${openRate}%`,
      icon: Eye,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Unread',
      value: String(unreadCount),
      icon: Reply,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  // Filter emails
  const filteredEmails = emails.filter((email) => {
    // Filter by type
    if (activeFilter === 'Sent') return email.direction === 'outbound';
    if (activeFilter === 'Received') return email.direction === 'inbound';
    if (activeFilter === 'Drafts') return false;
    if (activeFilter === 'Templates') return false;

    return true;
  }).filter((email) => {
    // Filter by search
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      email.from?.toLowerCase().includes(q) ||
      email.to?.toLowerCase().includes(q) ||
      email.subject?.toLowerCase().includes(q) ||
      email.content?.toLowerCase().includes(q)
    );
  });

  const getDisplayName = (email: CommunicationLog): string => {
    if (email.direction === 'outbound') return 'You';
    return email.lead?.name || email.from || 'Unknown';
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const formatTime = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-background p-6 border">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Email Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage customer communications and follow-ups for your insurance call center.
            </p>
          </div>
          <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Compose Email
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Compose Email</DialogTitle>
                <DialogDescription>
                  Send an email to a customer or lead.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="email-to" className="text-sm font-medium">
                    To
                  </label>
                  <input
                    id="email-to"
                    type="email"
                    placeholder="recipient@example.com"
                    value={composeForm.to}
                    onChange={(e) =>
                      setComposeForm((prev) => ({ ...prev, to: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email-subject" className="text-sm font-medium">
                    Subject
                  </label>
                  <input
                    id="email-subject"
                    type="text"
                    placeholder="Email subject"
                    value={composeForm.subject}
                    onChange={(e) =>
                      setComposeForm((prev) => ({ ...prev, subject: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email-body" className="text-sm font-medium">
                    Body
                  </label>
                  <textarea
                    id="email-body"
                    placeholder="Write your email..."
                    rows={6}
                    value={composeForm.body}
                    onChange={(e) =>
                      setComposeForm((prev) => ({ ...prev, body: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setComposeOpen(false)}
                  disabled={sending}
                >
                  Cancel
                </Button>
                <Button onClick={handleSendEmail} disabled={sending}>
                  {sending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Email
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {emailStats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            {/* Filter Tabs */}
            <div className="flex gap-1">
              {filters.map((filter) => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              {activeFilter === 'All' ? 'All Emails' : activeFilter}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {loading ? '...' : `${filteredEmails.length} email${filteredEmails.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <EmailSkeleton />
          ) : filteredEmails.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No emails found</p>
              <p className="text-sm mt-1">
                {activeFilter !== 'All'
                  ? `No emails in the "${activeFilter}" category.`
                  : searchQuery
                    ? 'Try adjusting your search query.'
                    : 'Your inbox is empty. Compose an email to get started.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEmails.map((email) => {
                const displayName = getDisplayName(email);
                const isRead = email.is_read;
                const isSent = email.direction === 'outbound';

                return (
                  <div
                    key={email.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                      !isRead ? 'bg-primary/5 border-primary/20' : 'border-border'
                    }`}
                    onClick={() => handleMarkAsRead(email)}
                  >
                    <Avatar className="h-10 w-10 mt-0.5">
                      <AvatarFallback
                        className={`text-xs ${
                          isSent
                            ? 'bg-blue-500/10 text-blue-500'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-sm ${!isRead ? 'font-semibold' : 'font-medium'}`}>
                          {displayName}
                        </span>
                        {!isRead && (
                          <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 text-xs">
                            New
                          </Badge>
                        )}
                        {isSent && (
                          <Badge variant="secondary" className="text-xs">
                            Sent
                          </Badge>
                        )}
                      </div>
                      <p className={`text-sm truncate ${!isRead ? 'font-medium' : ''}`}>
                        {email.subject || '(No subject)'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {isSent ? `To: ${email.to}` : email.content}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {formatTime(email.created_at)}
                      </span>
                      {!isRead ? (
                        <Mail className="h-3.5 w-3.5 text-blue-500" />
                      ) : (
                        <MailOpen className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
