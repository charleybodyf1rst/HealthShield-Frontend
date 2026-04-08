'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Reply,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CommunicationLog } from '@/lib/api';

interface EmailThreadViewProps {
  emails: CommunicationLog[];
  isLoading: boolean;
  onReply: (email: CommunicationLog) => void;
}

function EmailMessage({ email, isLast }: { email: CommunicationLog; isLast: boolean }) {
  const [expanded, setExpanded] = useState(isLast);
  const isInbound = email.direction === 'inbound';
  const sender = isInbound ? (email.email_from || 'Unknown') : 'You';
  const initials = sender.split(/[@\s]/).slice(0, 2).map((s) => s[0]?.toUpperCase() || '').join('');

  return (
    <div className={cn('border rounded-lg', isLast ? 'border-border' : 'border-border/50')}>
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
      >
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{sender}</span>
            {isInbound ? (
              <ArrowDownLeft className="h-3 w-3 text-blue-500" />
            ) : (
              <ArrowUpRight className="h-3 w-3 text-green-500" />
            )}
          </div>
          {!expanded && (
            <p className="text-xs text-muted-foreground truncate">
              {email.content?.substring(0, 100)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-muted-foreground">
            {email.created_at ? new Date(email.created_at).toLocaleString() : ''}
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Body — expandable */}
      {expanded && (
        <div className="px-4 pb-4">
          <Separator className="mb-3" />
          <div className="text-xs text-muted-foreground mb-2 space-y-0.5">
            <div>From: {email.email_from || 'Unknown'}</div>
            <div>To: {email.email_to || 'Unknown'}</div>
            {email.email_cc && <div>CC: {email.email_cc}</div>}
          </div>
          <div
            className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: email.content_html || email.content?.replace(/\n/g, '<br>') || '',
            }}
          />
        </div>
      )}
    </div>
  );
}

export function EmailThreadView({ emails, isLoading, onReply }: EmailThreadViewProps) {
  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!emails.length) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select an email to view
      </div>
    );
  }

  const latestEmail = emails[emails.length - 1];
  const subject = emails[0]?.subject || '(No Subject)';

  return (
    <div className="flex flex-col h-full">
      {/* Subject header */}
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">{subject}</h2>
        <p className="text-sm text-muted-foreground">
          {emails.length} message{emails.length !== 1 ? 's' : ''} in thread
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {emails.map((email, i) => (
          <EmailMessage key={email.id} email={email} isLast={i === emails.length - 1} />
        ))}
      </div>

      {/* Reply bar */}
      <div className="border-t px-4 py-3 flex items-center gap-2">
        <Button onClick={() => onReply(latestEmail)} className="gap-2">
          <Reply className="h-4 w-4" />
          Reply
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => onReply(latestEmail)}>
          <Sparkles className="h-3.5 w-3.5" />
          AI Reply
        </Button>
      </div>
    </div>
  );
}
