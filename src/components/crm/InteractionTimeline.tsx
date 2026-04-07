'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MessageSquare,
  Mail,
  Phone,
  Voicemail,
  FileText,
  Users,
  MapPin,
  Plus,
  Clock,
  Bot,
  User,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
} from 'lucide-react';
import { useHealthShieldCrmStore } from '@/stores/healthshield-crm-store';
import { cn } from '@/lib/utils';
import type { BoatInteraction, InteractionType, InteractionOutcome } from '@/types/boat-crm';

const typeIcons: Record<InteractionType, React.ReactNode> = {
  sms: <MessageSquare className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  call: <Phone className="w-4 h-4" />,
  voicemail: <Voicemail className="w-4 h-4" />,
  note: <FileText className="w-4 h-4" />,
  meeting: <Users className="w-4 h-4" />,
  site_visit: <MapPin className="w-4 h-4" />,
};

const typeColors: Record<InteractionType, string> = {
  sms: 'bg-blue-100 text-blue-600',
  email: 'bg-purple-100 text-purple-600',
  call: 'bg-green-100 text-green-600',
  voicemail: 'bg-orange-100 text-orange-600',
  note: 'bg-gray-100 text-gray-600',
  meeting: 'bg-cyan-100 text-cyan-600',
  site_visit: 'bg-pink-100 text-pink-600',
};

const outcomeColors: Record<InteractionOutcome, string> = {
  interested: 'bg-green-100 text-green-700',
  callback_requested: 'bg-blue-100 text-blue-700',
  not_interested: 'bg-red-100 text-red-700',
  left_message: 'bg-yellow-100 text-yellow-700',
  no_response: 'bg-gray-100 text-gray-700',
  booked: 'bg-emerald-100 text-emerald-700',
  needs_info: 'bg-purple-100 text-purple-700',
  referred: 'bg-cyan-100 text-cyan-700',
};

interface InteractionTimelineProps {
  interactions: BoatInteraction[];
  loading?: boolean;
  leadId?: number;
  customerId?: number;
}

export function InteractionTimeline({
  interactions,
  loading,
  leadId,
  customerId,
}: InteractionTimelineProps) {
  const [showNewDialog, setShowNewDialog] = useState(false);

  const { createInteraction } = useHealthShieldCrmStore();

  if (loading) {
    return (
      <div className="p-4 text-center text-slate-500 text-sm">
        Loading interactions...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Interaction Button */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Log Interaction
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log New Interaction</DialogTitle>
          </DialogHeader>
          <NewInteractionForm
            leadId={leadId}
            customerId={customerId}
            onSubmit={async (data) => {
              await createInteraction(data);
              setShowNewDialog(false);
            }}
            onCancel={() => setShowNewDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Timeline */}
      {interactions.length === 0 ? (
        <div className="p-4 text-center text-slate-400 text-sm border border-dashed rounded-lg">
          No interactions yet
        </div>
      ) : (
        <div className="space-y-3">
          {interactions.map((interaction) => (
            <InteractionItem key={interaction.id} interaction={interaction} />
          ))}
        </div>
      )}
    </div>
  );
}

function InteractionItem({ interaction }: { interaction: BoatInteraction }) {
  const [expanded, setExpanded] = useState(false);

  const isInbound = interaction.direction === 'inbound';
  const isAiAgent = interaction.channel === 'ai_agent';

  return (
    <div
      className={cn(
        'p-3 rounded-lg border cursor-pointer transition-colors hover:bg-slate-50',
        isInbound ? 'border-l-4 border-l-blue-400' : 'border-l-4 border-l-green-400'
      )}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Type Icon */}
          <div className={cn('p-1.5 rounded', typeColors[interaction.type])}>
            {typeIcons[interaction.type]}
          </div>

          {/* Direction & Type Label */}
          <div>
            <div className="flex items-center gap-1.5">
              {isInbound ? (
                <ArrowDownLeft className="w-3 h-3 text-blue-500" />
              ) : (
                <ArrowUpRight className="w-3 h-3 text-green-500" />
              )}
              <span className="font-medium text-sm capitalize">
                {interaction.type.replace('_', ' ')}
              </span>
              {isAiAgent && (
                <Badge variant="outline" className="text-xs py-0 px-1">
                  <Bot className="w-3 h-3 mr-1" />
                  AI
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <Clock className="w-3 h-3" />
              {new Date(interaction.interactionAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Outcome Badge */}
        {interaction.outcome && (
          <Badge className={cn('text-xs', outcomeColors[interaction.outcome])}>
            {interaction.outcome.replace('_', ' ')}
          </Badge>
        )}
      </div>

      {/* Subject (for emails) */}
      {interaction.subject && (
        <p className="text-sm font-medium text-slate-700 mt-2">
          {interaction.subject}
        </p>
      )}

      {/* Content Preview */}
      {interaction.content && (
        <p className={cn(
          'text-sm text-slate-600 mt-2',
          !expanded && 'line-clamp-2'
        )}>
          {interaction.content}
        </p>
      )}

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-3 pt-3 border-t space-y-2 text-sm">
          {/* Call Details */}
          {interaction.type === 'call' && (
            <>
              {interaction.durationSeconds && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-3 h-3" />
                  Duration: {formatDuration(interaction.durationSeconds)}
                </div>
              )}
              {interaction.callStatus && (
                <div className="text-slate-600">
                  Call Status: <span className="capitalize">{interaction.callStatus.replace('_', ' ')}</span>
                </div>
              )}
              {interaction.recordingUrl && (
                <a
                  href={interaction.recordingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3 h-3" />
                  Listen to Recording
                </a>
              )}
            </>
          )}

          {/* Transcript */}
          {interaction.transcript && (
            <div>
              <p className="font-medium text-slate-700 mb-1">Transcript:</p>
              <p className="text-slate-600 whitespace-pre-wrap text-xs bg-slate-50 p-2 rounded max-h-40 overflow-auto">
                {interaction.transcript}
              </p>
            </div>
          )}

          {/* Contact Info */}
          {(interaction.fromAddress || interaction.toAddress) && (
            <div className="text-slate-500 text-xs">
              {interaction.fromAddress && <span>From: {interaction.fromAddress}</span>}
              {interaction.fromAddress && interaction.toAddress && <span> → </span>}
              {interaction.toAddress && <span>To: {interaction.toAddress}</span>}
            </div>
          )}

          {/* Outcome Notes */}
          {interaction.outcomeNotes && (
            <div className="text-slate-600">
              <span className="font-medium">Notes:</span> {interaction.outcomeNotes}
            </div>
          )}

          {/* Follow Up */}
          {interaction.followUpAt && (
            <div className="text-orange-600">
              <Clock className="w-3 h-3 inline mr-1" />
              Follow up: {new Date(interaction.followUpAt).toLocaleString()}
            </div>
          )}

          {/* Created By */}
          {interaction.createdByUser && (
            <div className="flex items-center gap-1 text-slate-400 text-xs">
              <User className="w-3 h-3" />
              Logged by {interaction.createdByUser.name}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NewInteractionForm({
  leadId,
  customerId,
  onSubmit,
  onCancel,
}: {
  leadId?: number;
  customerId?: number;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    type: 'note' as InteractionType,
    direction: 'outbound' as 'inbound' | 'outbound',
    subject: '',
    content: '',
    outcome: '' as InteractionOutcome | '',
    followUpAt: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        leadId,
        customerId,
        type: formData.type,
        direction: formData.direction,
        subject: formData.subject || undefined,
        content: formData.content,
        outcome: formData.outcome || undefined,
        followUpAt: formData.followUpAt || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Type *</label>
          <Select
            value={formData.type}
            onValueChange={(v) => setFormData({ ...formData, type: v as InteractionType })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="note">Note</SelectItem>
              <SelectItem value="call">Phone Call</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="voicemail">Voicemail</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="site_visit">Site Visit</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Direction</label>
          <Select
            value={formData.direction}
            onValueChange={(v) => setFormData({ ...formData, direction: v as 'inbound' | 'outbound' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="outbound">Outbound (You contacted them)</SelectItem>
              <SelectItem value="inbound">Inbound (They contacted you)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.type === 'email' && (
        <div>
          <label className="text-sm font-medium">Subject</label>
          <Input
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          />
        </div>
      )}

      <div>
        <label className="text-sm font-medium">Content / Notes *</label>
        <textarea
          className="w-full px-3 py-2 border rounded-md text-sm min-h-[100px]"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          required
          placeholder="What happened in this interaction?"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Outcome</label>
          <Select
            value={formData.outcome}
            onValueChange={(v) => setFormData({ ...formData, outcome: v as InteractionOutcome })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="interested">Interested</SelectItem>
              <SelectItem value="callback_requested">Callback Requested</SelectItem>
              <SelectItem value="left_message">Left Message</SelectItem>
              <SelectItem value="no_response">No Response</SelectItem>
              <SelectItem value="needs_info">Needs More Info</SelectItem>
              <SelectItem value="booked">Booked!</SelectItem>
              <SelectItem value="not_interested">Not Interested</SelectItem>
              <SelectItem value="referred">Referred</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Follow Up Date</label>
          <Input
            type="datetime-local"
            value={formData.followUpAt}
            onChange={(e) => setFormData({ ...formData, followUpAt: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Log Interaction'}
        </Button>
      </div>
    </form>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}
