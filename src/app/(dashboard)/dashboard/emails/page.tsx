'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Inbox,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Send,
  FileEdit,
  Loader2,
} from 'lucide-react';
import { useEmailStore } from '@/stores/email-store';
import { EmailListItem } from '@/components/emails/email-list-item';
import { EmailThreadView } from '@/components/emails/email-thread-view';
import { EmailComposePanel } from '@/components/emails/email-compose-panel';
import type { CommunicationLog } from '@/lib/api';
import type { EmailTab } from '@/stores/email-store';

export default function EmailsPage() {
  const {
    emails,
    selectedEmail,
    threadEmails,
    activeTab,
    isLoading,
    isThreadLoading,
    composing,
    searchQuery,
    fetchEmails,
    selectEmail,
    setActiveTab,
    setSearchQuery,
    setComposing,
    markAsRead,
  } = useEmailStore();

  const [replyTo, setReplyTo] = useState<CommunicationLog | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchEmails();
    setIsRefreshing(false);
  };

  const handleSelectEmail = (email: CommunicationLog) => {
    selectEmail(email);
    if (!email.is_read && email.direction === 'inbound') {
      markAsRead(email.id);
    }
  };

  const handleReply = (email: CommunicationLog) => {
    setReplyTo(email);
    setComposing(true);
  };

  const handleCompose = () => {
    setReplyTo(null);
    setComposing(true);
  };

  const handleCloseCompose = () => {
    setComposing(false);
    setReplyTo(null);
  };

  const tabIcons: Record<EmailTab, typeof Inbox> = {
    inbox: Inbox,
    sent: Send,
    drafts: FileEdit,
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Left Panel: Email List */}
      <div className="w-[400px] border-r flex flex-col bg-background">
        {/* Header */}
        <div className="px-4 py-3 border-b space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email
            </h1>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button size="sm" onClick={handleCompose} className="gap-1.5">
                <Plus className="h-4 w-4" />
                Compose
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as EmailTab)}>
            <TabsList className="w-full">
              {(['inbox', 'sent', 'drafts'] as EmailTab[]).map((tab) => {
                const Icon = tabIcons[tab];
                return (
                  <TabsTrigger key={tab} value={tab} className="flex-1 gap-1.5 capitalize text-xs">
                    <Icon className="h-3.5 w-3.5" />
                    {tab}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Mail className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No emails</p>
              <p className="text-xs text-muted-foreground mt-1">
                {activeTab === 'inbox'
                  ? 'No received emails yet'
                  : activeTab === 'sent'
                    ? 'No sent emails yet'
                    : 'No drafts saved'}
              </p>
              {activeTab !== 'inbox' && (
                <Button size="sm" className="mt-4 gap-1.5" onClick={handleCompose}>
                  <Plus className="h-4 w-4" />
                  Compose
                </Button>
              )}
            </div>
          ) : (
            emails.map((email) => (
              <EmailListItem
                key={email.id}
                email={email}
                isSelected={selectedEmail?.id === email.id}
                onClick={() => handleSelectEmail(email)}
              />
            ))
          )}
        </div>
      </div>

      {/* Right Panel: Thread View or Compose */}
      <div className="flex-1 flex flex-col bg-background">
        {composing ? (
          <EmailComposePanel
            replyTo={replyTo}
            onClose={handleCloseCompose}
          />
        ) : selectedEmail ? (
          <EmailThreadView
            emails={threadEmails}
            isLoading={isThreadLoading}
            onReply={handleReply}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Select an email</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Choose an email from the list to view its contents, or compose a new one.
            </p>
            <Button className="mt-4 gap-1.5" onClick={handleCompose}>
              <Plus className="h-4 w-4" />
              Compose New Email
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
