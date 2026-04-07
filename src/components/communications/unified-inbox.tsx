'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Inbox,
  Phone,
  MessageSquare,
  Mail,
  CheckCircle2,
  XCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInboxStore } from '@/stores/communications-store';
import type { InboxItem } from '@/types/communication';
import { cn } from '@/lib/utils';

interface UnifiedInboxProps {
  onSelectItem?: (item: InboxItem) => void;
  onCallLead?: (leadId: string, phone: string) => void;
  onSmsLead?: (leadId: string, phone: string) => void;
}

export function UnifiedInbox({
  onSelectItem,
  onCallLead,
  onSmsLead,
}: UnifiedInboxProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'sms' | 'call' | 'email'>('all');

  const {
    items,
    unreadCount,
    isLoading,
    filters,
    fetchInbox,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    setFilters,
  } = useInboxStore();

  // Initial fetch
  useEffect(() => {
    fetchInbox();
    fetchUnreadCount();
  }, [fetchInbox, fetchUnreadCount]);

  // Refetch when tab changes
  useEffect(() => {
    setFilters({
      ...filters,
      type: activeTab === 'all' ? undefined : activeTab,
    });
  }, [activeTab]);

  const handleItemClick = async (item: InboxItem) => {
    if (!item.isRead) {
      await markAsRead(item.id);
    }
    onSelectItem?.(item);
  };

  const handleRefresh = () => {
    fetchInbox();
    fetchUnreadCount();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      default:
        return <Inbox className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'completed':
      case 'received':
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case 'failed':
        return <XCircle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  const getDirectionIcon = (direction: string) => {
    return direction === 'inbound' ? (
      <ArrowDownLeft className="h-3 w-3 text-blue-500" />
    ) : (
      <ArrowUpRight className="h-3 w-3 text-green-500" />
    );
  };

  const truncateContent = (content: string, maxLength = 60) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="flex flex-col h-full border rounded-lg bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Inbox className="h-5 w-5" />
          <h2 className="font-semibold">Inbox</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-1">
              {unreadCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col">
        <div className="px-4 pt-2 border-b">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value="sms" className="text-xs">
              <MessageSquare className="h-3 w-3 mr-1" />
              SMS
            </TabsTrigger>
            <TabsTrigger value="call" className="text-xs">
              <Phone className="h-3 w-3 mr-1" />
              Calls
            </TabsTrigger>
            <TabsTrigger value="email" className="text-xs">
              <Mail className="h-3 w-3 mr-1" />
              Email
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="flex-1 mt-0">
          <ScrollArea className="h-[calc(100vh-300px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Inbox className="h-12 w-12 mb-2 opacity-50" />
                <p className="text-sm">No messages</p>
              </div>
            ) : (
              <div className="divide-y">
                {items.map((item) => (
                  <InboxItemRow
                    key={item.id}
                    item={item}
                    onClick={() => handleItemClick(item)}
                    onCall={onCallLead}
                    onSms={onSmsLead}
                    getTypeIcon={getTypeIcon}
                    getStatusIcon={getStatusIcon}
                    getDirectionIcon={getDirectionIcon}
                    truncateContent={truncateContent}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface InboxItemRowProps {
  item: InboxItem;
  onClick: () => void;
  onCall?: (leadId: string, phone: string) => void;
  onSms?: (leadId: string, phone: string) => void;
  getTypeIcon: (type: string) => React.ReactNode;
  getStatusIcon: (status: string) => React.ReactNode;
  getDirectionIcon: (direction: string) => React.ReactNode;
  truncateContent: (content: string, maxLength?: number) => string;
}

function InboxItemRow({
  item,
  onClick,
  onCall,
  onSms,
  getTypeIcon,
  getStatusIcon,
  getDirectionIcon,
  truncateContent,
}: InboxItemRowProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors',
        !item.isRead && 'bg-primary/5'
      )}
      onClick={onClick}
    >
      {/* Type Icon */}
      <div
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-full shrink-0',
          item.type === 'sms' && 'bg-blue-100 text-blue-600',
          item.type === 'call' && 'bg-green-100 text-green-600',
          item.type === 'email' && 'bg-purple-100 text-purple-600'
        )}
      >
        {getTypeIcon(item.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {/* Unread indicator */}
          {!item.isRead && (
            <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
          )}

          {/* Lead name or "Unknown" */}
          <span className={cn('font-medium text-sm truncate', !item.isRead && 'font-semibold')}>
            {item.lead?.name || 'Unknown Contact'}
          </span>

          {/* Direction & Status icons */}
          <div className="flex items-center gap-1 ml-auto shrink-0">
            {getDirectionIcon(item.direction)}
            {getStatusIcon(item.status)}
          </div>
        </div>

        {/* Content preview */}
        <p className="text-sm text-muted-foreground truncate mt-0.5">
          {truncateContent(item.content)}
        </p>

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
        </p>
      </div>

      {/* Quick actions */}
      {item.lead && (
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {item.lead.phone && onCall && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={() => onCall(item.lead!.id, item.lead!.phone!)}
            >
              <Phone className="h-3.5 w-3.5" />
            </Button>
          )}
          {item.lead.phone && onSms && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => onSms(item.lead!.id, item.lead!.phone!)}
            >
              <MessageSquare className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
