'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, MailOpen, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CommunicationLog } from '@/lib/api';

function getRelativeTime(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}

interface EmailListItemProps {
  email: CommunicationLog;
  isSelected: boolean;
  onClick: () => void;
}

export function EmailListItem({ email, isSelected, onClick }: EmailListItemProps) {
  const isInbound = email.direction === 'inbound';
  const isUnread = !email.is_read && isInbound;
  const isDraft = email.status === 'draft';
  const displayName = isInbound
    ? email.email_from || email.lead?.name || 'Unknown'
    : email.email_to || 'No recipient';
  const initials = displayName
    .split(/[@\s]/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || '')
    .join('');

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-3 border-b border-border/50 hover:bg-muted/50 transition-colors flex gap-3',
        isSelected && 'bg-muted',
        isUnread && 'bg-primary/5'
      )}
    >
      {/* Unread dot */}
      <div className="flex-shrink-0 w-2 pt-2">
        {isUnread && <div className="h-2 w-2 rounded-full bg-primary" />}
      </div>

      {/* Avatar */}
      <Avatar className="h-9 w-9 flex-shrink-0">
        <AvatarFallback className="text-xs bg-muted">{initials}</AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={cn('text-sm truncate', isUnread && 'font-semibold')}>
            {displayName}
          </span>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {email.created_at ? getRelativeTime(email.created_at) : ''}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          {isDraft && (
            <span className="text-xs text-red-500 font-medium">[Draft]</span>
          )}
          <p className={cn('text-sm truncate', isUnread ? 'text-foreground' : 'text-muted-foreground')}>
            {email.subject || '(No Subject)'}
          </p>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {email.content?.substring(0, 80) || ''}
        </p>
      </div>

      {/* Direction icon */}
      <div className="flex-shrink-0 pt-1">
        {isInbound ? (
          <ArrowDownLeft className="h-3.5 w-3.5 text-blue-500" />
        ) : isDraft ? (
          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ArrowUpRight className="h-3.5 w-3.5 text-green-500" />
        )}
      </div>
    </button>
  );
}
