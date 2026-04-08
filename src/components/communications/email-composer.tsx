'use client';

import { useState } from 'react';
import { Mail, Send, X, Paperclip, Loader2, Bold, Italic, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { communicationApi } from '@/lib/api';
import { cn } from '@/lib/utils';

interface EmailComposerProps {
  leadId: string;
  leadName: string;
  leadEmail: string;
  isOpen: boolean;
  onClose: () => void;
  onSent?: (logId: string) => void;
  initialSubject?: string;
  initialBody?: string;
}

// Email templates
const EMAIL_TEMPLATES = [
  { id: 'custom', name: 'Custom Email', subject: 'HealthShield - Your Inquiry', body: '' },
  {
    id: 'intro',
    name: 'Introduction',
    subject: 'Welcome to HealthShield - Your Adventure Starts Here',
    body: `Hi {name},

Thank you for your interest in HealthShield! We're excited to help you plan your next water adventure.

I'd love to schedule a quick call to learn more about your trip and show you how we can make it unforgettable.

Would you be available for a 15-minute chat this week?

Best regards,
{rep_name}
HealthShield Team`,
  },
  {
    id: 'follow_up',
    name: 'Follow Up',
    subject: 'Following Up - HealthShield',
    body: `Hi {name},

I wanted to follow up on our recent conversation. Have you had a chance to think about getting started with your fitness program?

I'm here to answer any questions you might have. Let me know when you'd like to chat!

Best,
{rep_name}`,
  },
  {
    id: 'pricing',
    name: 'Pricing Info',
    subject: 'HealthShield - Booking Options',
    body: `Hi {name},

As requested, here's an overview of our plan options:

- Individual Plan: Flexible health coverage for individuals
- Standard Plan: AI calling with dedicated agent included
- Comprehensive Plan: Full coverage with wellness benefits included

I'd be happy to discuss which option would be the best fit for your group.

Would you like to schedule a call to go over the details?

Best regards,
{rep_name}`,
  },
  {
    id: 'appointment',
    name: 'Appointment Reminder',
    subject: 'Reminder: Your Booking with HealthShield',
    body: `Hi {name},

This is a friendly reminder about your upcoming appointment with us.

Please let me know if you need to reschedule or have any questions before we meet.

Looking forward to seeing you!

Best,
{rep_name}`,
  },
];

export function EmailComposer({
  leadId,
  leadName,
  leadEmail,
  isOpen,
  onClose,
  onSent,
  initialSubject,
  initialBody,
}: EmailComposerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(initialBody ? 'custom' : 'custom');
  const [subject, setSubject] = useState(initialSubject || '');
  const [body, setBody] = useState(initialBody || '');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = EMAIL_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      // Replace placeholders with actual values
      const processedSubject = template.subject;
      const processedBody = template.body
        .replace(/{name}/g, leadName.split(' ')[0])
        .replace(/{rep_name}/g, 'Your Sales Rep'); // TODO: Get from auth

      setSubject(processedSubject);
      setBody(processedBody);
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      setError('Please enter a subject and message');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      await communicationApi.sendEmail({
        to: leadEmail,
        subject: subject.trim(),
        body: body.trim(),
        leadId,
      });

      onSent?.();
      handleClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send email';
      setError(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setSelectedTemplate('custom');
    setSubject('');
    setBody('');
    setError(null);
    onClose();
  };

  const insertFormatting = (before: string, after: string) => {
    const textarea = document.getElementById('email-body') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = body.substring(start, end);
    const newText = body.substring(0, start) + before + selectedText + after + body.substring(end);
    setBody(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            New Email to {leadName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Template Selector */}
          <div className="space-y-2">
            <Label>Template</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {EMAIL_TEMPLATES.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* To Field */}
          <div className="space-y-2">
            <Label>To</Label>
            <Input value={leadEmail} disabled className="bg-muted" />
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="email-subject">Subject</Label>
            <Input
              id="email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject..."
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-body">Message</Label>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => insertFormatting('**', '**')}
                  title="Bold"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => insertFormatting('_', '_')}
                  title="Italic"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => insertFormatting('[', '](url)')}
                  title="Link"
                >
                  <Link2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <textarea
              id="email-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message..."
              className="w-full min-h-[200px] rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            />
            <p className="text-xs text-muted-foreground">
              Use {'{name}'} for recipient name, {'{rep_name}'} for your name
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="ghost" onClick={handleClose} disabled={isSending}>
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled={isSending}>
              <Paperclip className="h-4 w-4 mr-2" />
              Attach
            </Button>
            <Button onClick={handleSend} disabled={isSending || !subject.trim() || !body.trim()}>
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Email Button for triggering the composer
interface EmailButtonProps {
  leadId: string;
  leadName: string;
  leadEmail: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
}

export function EmailButton({
  leadId,
  leadName,
  leadEmail,
  variant = 'ghost',
  size = 'icon',
  className,
  disabled = false,
}: EmailButtonProps) {
  const [showComposer, setShowComposer] = useState(false);

  if (!leadEmail) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn('text-muted-foreground cursor-not-allowed', className)}
        disabled
        title="No email address"
      >
        <Mail className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowComposer(true)}
        className={cn('text-purple-600 hover:text-purple-700 hover:bg-purple-50', className)}
        title={`Email ${leadName}`}
        disabled={disabled}
      >
        <Mail className="h-4 w-4" />
      </Button>

      <EmailComposer
        leadId={leadId}
        leadName={leadName}
        leadEmail={leadEmail}
        isOpen={showComposer}
        onClose={() => setShowComposer(false)}
      />
    </>
  );
}
