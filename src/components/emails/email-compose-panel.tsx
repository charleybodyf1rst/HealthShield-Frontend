'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Send, Save, Loader2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { EmailAiAssist } from './email-ai-assist';
import { toast } from 'sonner';
import { useEmailStore } from '@/stores/email-store';
import type { CommunicationLog } from '@/lib/api';

const TEMPLATES = [
  { id: 'custom', name: 'Custom', subject: '', body: '' },
  {
    id: 'intro',
    name: 'Introduction',
    subject: 'Introduction from HealthShield',
    body: 'Hi {name},\n\nI wanted to reach out and introduce myself. I am your dedicated insurance specialist at HealthShield.\n\nI would love to schedule a quick call to discuss how we can help you find the right health insurance plan for your needs.\n\nBest regards',
  },
  {
    id: 'followup',
    name: 'Follow Up',
    subject: 'Following up on your inquiry',
    body: 'Hi {name},\n\nI wanted to follow up on our recent conversation about your health insurance options.\n\nDo you have any questions I can help with? I am available for a call at your convenience.\n\nBest regards',
  },
  {
    id: 'quote',
    name: 'Quote / Pricing',
    subject: 'Your Health Insurance Quote',
    body: 'Hi {name},\n\nThank you for your interest in our health insurance plans. Based on our conversation, I have prepared a quote for you.\n\nPlease review the attached information and let me know if you have any questions.\n\nBest regards',
  },
  {
    id: 'reminder',
    name: 'Appointment Reminder',
    subject: 'Upcoming Appointment Reminder',
    body: 'Hi {name},\n\nThis is a friendly reminder about your upcoming appointment with HealthShield.\n\nPlease let me know if you need to reschedule.\n\nBest regards',
  },
];

interface EmailComposePanelProps {
  replyTo?: CommunicationLog | null;
  onClose: () => void;
  leadId?: string;
  leadEmail?: string;
  leadName?: string;
}

export function EmailComposePanel({
  replyTo,
  onClose,
  leadId,
  leadEmail,
  leadName,
}: EmailComposePanelProps) {
  const { sendEmail, saveDraft, isSending } = useEmailStore();
  const [to, setTo] = useState(replyTo?.email_from || leadEmail || '');
  const [subject, setSubject] = useState(
    replyTo ? `Re: ${replyTo.subject || ''}` : ''
  );
  const [body, setBody] = useState(
    replyTo
      ? `\n\n---\nOn ${new Date(replyTo.created_at || '').toLocaleString()}, ${replyTo.email_from} wrote:\n> ${replyTo.content?.replace(/\n/g, '\n> ') || ''}`
      : ''
  );
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleTemplateChange = (templateId: string) => {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (template && templateId !== 'custom') {
      const name = leadName || '{name}';
      setSubject(template.subject);
      setBody(template.body.replace(/\{name\}/g, name));
    }
  };

  const handleSend = async () => {
    if (!to.trim()) {
      toast.error('Please enter a recipient');
      return;
    }
    if (!subject.trim() || !body.trim()) {
      toast.error('Please enter a subject and message');
      return;
    }
    try {
      await sendEmail({
        to: to.trim(),
        subject: subject.trim(),
        body: body.trim(),
        leadId,
        cc: cc || undefined,
        bcc: bcc || undefined,
      });
      toast.success('Email sent');
      onClose();
    } catch {
      toast.error('Failed to send email');
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await saveDraft({
        emailTo: to || undefined,
        subject: subject || undefined,
        content: body || undefined,
        leadId,
      });
      toast.success('Draft saved');
      onClose();
    } catch {
      toast.error('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b">
        <h2 className="text-lg font-semibold">
          {replyTo ? 'Reply' : 'New Email'}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Template selector */}
        {!replyTo && (
          <div>
            <Label className="text-xs text-muted-foreground">Template</Label>
            <Select onValueChange={handleTemplateChange}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choose a template..." />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* To */}
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="email-to" className="text-xs text-muted-foreground">To</Label>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6 px-2"
              onClick={() => setShowCcBcc(!showCcBcc)}
            >
              CC/BCC {showCcBcc ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
            </Button>
          </div>
          <Input
            id="email-to"
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="recipient@example.com"
            className="mt-1"
          />
        </div>

        {/* CC / BCC */}
        {showCcBcc && (
          <>
            <div>
              <Label className="text-xs text-muted-foreground">CC</Label>
              <Input value={cc} onChange={(e) => setCc(e.target.value)} placeholder="cc@example.com" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">BCC</Label>
              <Input value={bcc} onChange={(e) => setBcc(e.target.value)} placeholder="bcc@example.com" className="mt-1" />
            </div>
          </>
        )}

        {/* Subject */}
        <div>
          <Label htmlFor="email-subject" className="text-xs text-muted-foreground">Subject</Label>
          <Input
            id="email-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject..."
            className="mt-1"
          />
        </div>

        <Separator />

        {/* AI Assist toolbar */}
        <EmailAiAssist
          leadId={leadId}
          currentBody={body}
          onDraftGenerated={(s, b) => {
            setSubject(s);
            setBody(b);
          }}
          onSubjectSuggested={(s) => setSubject(s)}
          onToneImproved={(b) => setBody(b)}
        />

        {/* Body */}
        <div>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your email..."
            className="min-h-[250px] resize-y font-mono text-sm"
          />
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/30">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSaveDraft}
          disabled={isSaving || isSending}
          className="gap-1.5"
        >
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save Draft
        </Button>
        <Button onClick={handleSend} disabled={isSending || isSaving} className="gap-1.5">
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send
        </Button>
      </div>
    </div>
  );
}
