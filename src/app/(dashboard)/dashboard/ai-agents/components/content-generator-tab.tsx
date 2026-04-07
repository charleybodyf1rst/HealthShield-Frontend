'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Copy,
  FileText,
  Loader2,
  Mail,
  MessageSquare,
  Pencil,
  Phone,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { aiAssistantApi, aiAgentsApi, communicationApi } from '@/lib/api';
import { EmailComposer } from '@/components/communications/email-composer';
import type { Lead } from '@/types/lead';
import type { GeneratedContent } from './types';

interface ContentGeneratorTabProps {
  leads: Lead[];
  selectedLeadId: string;
  setSelectedLeadId: (val: string) => void;
}

export function ContentGeneratorTab({
  leads,
  selectedLeadId,
  setSelectedLeadId,
}: ContentGeneratorTabProps) {
  const [purpose, setPurpose] = useState('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [editedSubject, setEditedSubject] = useState('');
  const [emailComposerOpen, setEmailComposerOpen] = useState(false);
  const [smsConfirmOpen, setSmsConfirmOpen] = useState(false);
  const [isSendingSms, setIsSendingSms] = useState(false);

  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  const handleGenerateEmail = async () => {
    if (!selectedLeadId || !purpose) {
      toast.error('Please select a lead and enter the email purpose');
      return;
    }
    setIsGenerating(true);
    try {
      const response = await aiAssistantApi.generateEmail(selectedLeadId, purpose, 'friendly');
      setGeneratedContent({
        type: 'email',
        subject: response.subject || `Follow-up: ${purpose}`,
        content: response.body || '',
      });
      setIsEditing(false);
      toast.success('Email draft generated!');
    } catch (error) {
      console.error('Email generation error:', error);
      toast.error('Failed to generate email');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateSMS = async () => {
    if (!selectedLeadId || !purpose) {
      toast.error('Please select a lead and enter the message purpose');
      return;
    }
    setIsGenerating(true);
    try {
      const response = await aiAssistantApi.generateSMS(selectedLeadId, purpose);
      setGeneratedContent({
        type: 'sms',
        content: response.message || '',
      });
      setIsEditing(false);
      toast.success('SMS draft generated!');
    } catch (error) {
      console.error('SMS generation error:', error);
      toast.error('Failed to generate SMS');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCallScript = async () => {
    if (!selectedLeadId || !purpose) {
      toast.error('Please select a lead and enter the call purpose');
      return;
    }
    setIsGenerating(true);
    try {
      const response = await aiAssistantApi.generateCallScript(selectedLeadId, purpose);
      setGeneratedContent({
        type: 'call_script',
        content: response.script || '',
        talkingPoints: response.talking_points,
      });
      setIsEditing(false);
      toast.success('Call script generated!');
    } catch (error) {
      console.error('Call script generation error:', error);
      toast.error('Failed to generate call script');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const startEditing = () => {
    if (!generatedContent) return;
    setEditedContent(generatedContent.content);
    setEditedSubject(generatedContent.subject || '');
    setIsEditing(true);
  };

  const saveEdits = () => {
    if (!generatedContent) return;
    setGeneratedContent({
      ...generatedContent,
      content: editedContent,
      subject: editedSubject || generatedContent.subject,
    });
    setIsEditing(false);
    toast.success('Content updated');
  };

  const handleSendEmail = () => {
    if (!selectedLead?.email) {
      toast.error('Selected lead has no email address');
      return;
    }
    setEmailComposerOpen(true);
  };

  const handleSendSMS = async () => {
    if (!selectedLead?.phone) {
      toast.error('Selected lead has no phone number');
      return;
    }
    setIsSendingSms(true);
    try {
      const content = isEditing ? editedContent : generatedContent?.content || '';
      await communicationApi.sendSMS({
        to: selectedLead.phone,
        body: content,
        leadId: selectedLeadId,
      });
      toast.success(`SMS sent to ${selectedLead.firstName}!`);
      setSmsConfirmOpen(false);
    } catch (error) {
      console.error('SMS send error:', error);
      toast.error('Failed to send SMS');
    } finally {
      setIsSendingSms(false);
    }
  };

  const handleInitiateCall = async () => {
    if (!selectedLeadId) {
      toast.error('Please select a lead first');
      return;
    }
    try {
      const script = isEditing ? editedContent : generatedContent?.content || '';
      await aiAgentsApi.initiateCall(selectedLeadId, '', script);
      toast.success('AI call initiated!');
    } catch (error) {
      console.error('Call initiation error:', error);
      toast.error('Failed to initiate call');
    }
  };

  const currentContent = isEditing ? editedContent : generatedContent?.content || '';
  const currentSubject = isEditing ? editedSubject : generatedContent?.subject || '';

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Generator Form */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Booking Content</CardTitle>
            <CardDescription>
              Select a lead and describe your goal to generate personalized content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Lead</label>
              <Select
                value={selectedLeadId || 'none'}
                onValueChange={(val) => setSelectedLeadId(val === 'none' ? '' : val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a lead for personalization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Choose a lead...</SelectItem>
                  {leads.map((lead) => (
                    <SelectItem
                      key={lead.id}
                      value={lead.id || `lead-${lead.firstName}-${lead.lastName}`}
                    >
                      {lead.firstName} {lead.lastName} - {lead.email || 'No email'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Purpose / Goal</label>
              <Textarea
                placeholder="e.g., Follow up after demo, Schedule discovery call, Address pricing concerns..."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={handleGenerateEmail}
                disabled={isGenerating || !selectedLeadId}
                className="w-full"
              >
                {isGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Email
              </Button>
              <Button
                variant="outline"
                onClick={handleGenerateSMS}
                disabled={isGenerating || !selectedLeadId}
                className="w-full"
              >
                {isGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <MessageSquare className="mr-2 h-4 w-4" />
                )}
                SMS
              </Button>
              <Button
                variant="outline"
                onClick={handleGenerateCallScript}
                disabled={isGenerating || !selectedLeadId}
                className="w-full"
              >
                {isGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Phone className="mr-2 h-4 w-4" />
                )}
                Call Script
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generated Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated Content</CardTitle>
                <CardDescription>
                  {generatedContent
                    ? `${generatedContent.type === 'email' ? 'Email' : generatedContent.type === 'sms' ? 'SMS' : 'Call Script'} ready to use`
                    : 'Content will appear here'}
                </CardDescription>
              </div>
              {generatedContent && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (isEditing ? saveEdits() : startEditing())}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    {isEditing ? 'Save' : 'Edit'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        currentSubject
                          ? `Subject: ${currentSubject}\n\n${currentContent}`
                          : currentContent
                      )
                    }
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {generatedContent ? (
              <div className="space-y-4">
                {generatedContent.type === 'email' && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">
                      Subject Line
                    </label>
                    {isEditing ? (
                      <input
                        className="w-full p-3 bg-muted rounded-lg text-sm font-medium border-0 focus:outline-none focus:ring-2 focus:ring-primary"
                        value={editedSubject}
                        onChange={(e) => setEditedSubject(e.target.value)}
                      />
                    ) : (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium">{generatedContent.subject}</p>
                      </div>
                    )}
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    {generatedContent.type === 'email'
                      ? 'Email Body'
                      : generatedContent.type === 'sms'
                        ? 'Message'
                        : 'Script'}
                  </label>
                  {isEditing ? (
                    <Textarea
                      className="min-h-[300px]"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                    />
                  ) : (
                    <ScrollArea className="h-[300px] p-4 bg-muted rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{generatedContent.content}</p>
                    </ScrollArea>
                  )}
                </div>
                {generatedContent.type === 'sms' && (
                  <p className="text-xs text-muted-foreground">
                    Character count: {currentContent.length}/160
                  </p>
                )}
                {generatedContent.talkingPoints && generatedContent.talkingPoints.length > 0 && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">
                      Talking Points
                    </label>
                    <ul className="list-disc list-inside space-y-1 p-3 bg-muted rounded-lg">
                      {generatedContent.talkingPoints.map((point, idx) => (
                        <li key={idx} className="text-sm">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 border-t">
                  {generatedContent.type === 'email' && (
                    <Button onClick={handleSendEmail} className="flex-1">
                      <Send className="mr-2 h-4 w-4" />
                      Send Email
                    </Button>
                  )}
                  {generatedContent.type === 'sms' && (
                    <Button onClick={() => setSmsConfirmOpen(true)} className="flex-1">
                      <Send className="mr-2 h-4 w-4" />
                      Send SMS
                    </Button>
                  )}
                  {generatedContent.type === 'call_script' && (
                    <Button onClick={handleInitiateCall} className="flex-1">
                      <Phone className="mr-2 h-4 w-4" />
                      Start AI Call
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-[350px] flex flex-col items-center justify-center text-center text-muted-foreground">
                <FileText className="h-12 w-12 mb-4 opacity-50" />
                <p>Select a lead and generate content</p>
                <p className="text-sm">AI will personalize the message based on lead data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Email Composer Dialog */}
      {selectedLead && (
        <EmailComposer
          leadId={selectedLeadId}
          leadName={`${selectedLead.firstName} ${selectedLead.lastName}`}
          leadEmail={selectedLead.email || ''}
          isOpen={emailComposerOpen}
          onClose={() => setEmailComposerOpen(false)}
          onSent={() => {
            setEmailComposerOpen(false);
            toast.success('Email sent successfully!');
          }}
          initialSubject={currentSubject}
          initialBody={currentContent}
        />
      )}

      {/* SMS Confirmation Dialog */}
      <Dialog open={smsConfirmOpen} onOpenChange={setSmsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send SMS</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Send this SMS to <strong>{selectedLead?.firstName} {selectedLead?.lastName}</strong> at{' '}
              <strong>{selectedLead?.phone || 'No phone'}</strong>?
            </p>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{currentContent}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              {currentContent.length}/160 characters
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSmsConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendSMS} disabled={isSendingSms || !selectedLead?.phone}>
              {isSendingSms ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send SMS
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
