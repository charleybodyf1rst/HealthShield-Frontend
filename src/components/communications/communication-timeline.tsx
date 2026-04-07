'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow, format as fnsFormat } from 'date-fns';

function safeFormat(dateStr: string | undefined | null, fmt: string, fallback = '-'): string {
  if (!dateStr) return fallback;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return fallback;
    return fnsFormat(d, fmt);
  } catch {
    return fallback;
  }
}
import {
  Phone,
  MessageSquare,
  Mail,
  StickyNote,
  Play,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { communicationsApi, voiceApi } from '@/lib/api';
import type { CommunicationLog } from '@/lib/api';
import { cn } from '@/lib/utils';

interface CommunicationTimelineProps {
  leadId: string;
  maxHeight?: string;
  onPlayRecording?: (url: string) => void;
}

export function CommunicationTimeline({
  leadId,
  maxHeight = '400px',
  onPlayRecording,
}: CommunicationTimelineProps) {
  const [communications, setCommunications] = useState<CommunicationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await communicationsApi.getHistory(leadId, { limit: 50 });
        if (response.status === 200) {
          setCommunications(response.data.communications);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load history';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    if (leadId) {
      fetchHistory();
    }
  }, [leadId]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'note':
        return <StickyNote className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sms':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'call':
        return 'bg-green-100 text-green-600 border-green-200';
      case 'email':
        return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'note':
        return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'completed':
      case 'received':
        return (
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
            <XCircle className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        );
      case 'pending':
      case 'queued':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
            <Clock className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">{status}</Badge>
        );
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Group communications by date
  const groupedByDate = communications.reduce((groups, comm) => {
    const date = safeFormat(comm.created_at, 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(comm);
    return groups;
  }, {} as Record<string, CommunicationLog[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{error}</p>
      </div>
    );
  }

  if (communications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <MessageSquare className="h-12 w-12 mb-2 opacity-50" />
        <p className="text-sm">No communication history</p>
      </div>
    );
  }

  return (
    <ScrollArea style={{ maxHeight }} className="pr-4">
      <div className="space-y-6">
        {Object.entries(groupedByDate).map(([date, comms]) => (
          <div key={date}>
            {/* Date Header */}
            <div className="sticky top-0 bg-background py-2 z-10">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-medium text-muted-foreground">
                  {safeFormat(date, 'EEEE, MMMM d, yyyy')}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
            </div>

            {/* Communications for this date */}
            <div className="space-y-4 mt-3">
              {comms.map((comm, index) => (
                <TimelineItem
                  key={comm.id}
                  communication={comm}
                  isLast={index === comms.length - 1}
                  getTypeIcon={getTypeIcon}
                  getTypeColor={getTypeColor}
                  getStatusBadge={getStatusBadge}
                  formatDuration={formatDuration}
                  onPlayRecording={onPlayRecording}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

interface TimelineItemProps {
  communication: CommunicationLog;
  isLast: boolean;
  getTypeIcon: (type: string) => React.ReactNode;
  getTypeColor: (type: string) => string;
  getStatusBadge: (status: string) => React.ReactNode;
  formatDuration: (seconds: number) => string;
  onPlayRecording?: (url: string) => void;
}

function TimelineItem({
  communication,
  isLast,
  getTypeIcon,
  getTypeColor,
  getStatusBadge,
  formatDuration,
  onPlayRecording,
}: TimelineItemProps) {
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [loadingRecording, setLoadingRecording] = useState(false);

  const handlePlayRecording = async () => {
    if (recordingUrl) {
      onPlayRecording?.(recordingUrl);
      return;
    }

    setLoadingRecording(true);
    try {
      const response = await voiceApi.getRecording(communication.id);
      if (response.data.recording_url) {
        setRecordingUrl(response.data.recording_url);
        onPlayRecording?.(response.data.recording_url);
      }
    } catch {
      // Recording not available
    } finally {
      setLoadingRecording(false);
    }
  };

  const isCall = communication.type === 'call';
  const hasRecording = isCall && communication.status === 'completed';

  return (
    <div className="flex gap-3">
      {/* Timeline line and icon */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-full border-2',
            getTypeColor(communication.type)
          )}
        >
          {getTypeIcon(communication.type)}
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-border mt-2" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Direction */}
          <div className="flex items-center gap-1 text-xs">
            {communication.direction === 'inbound' ? (
              <>
                <ArrowDownLeft className="h-3 w-3 text-blue-500" />
                <span>Received</span>
              </>
            ) : (
              <>
                <ArrowUpRight className="h-3 w-3 text-green-500" />
                <span>Sent</span>
              </>
            )}
          </div>

          {/* User who sent */}
          {communication.user && (
            <span className="text-xs text-muted-foreground">
              by {communication.user.name}
            </span>
          )}

          {/* Status Badge */}
          {getStatusBadge(communication.status)}

          {/* Timestamp */}
          <span className="text-xs text-muted-foreground ml-auto">
            {safeFormat(communication.created_at, 'h:mm a')}
          </span>
        </div>

        {/* Subject (for emails) */}
        {communication.subject && (
          <p className="font-medium text-sm mt-1">{communication.subject}</p>
        )}

        {/* Content */}
        <div className="mt-2 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm whitespace-pre-wrap">{communication.content}</p>
        </div>

        {/* Call Recording */}
        {hasRecording && (
          <div className="mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayRecording}
              disabled={loadingRecording}
            >
              {loadingRecording ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Play className="h-3 w-3 mr-1" />
              )}
              Play Recording
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
