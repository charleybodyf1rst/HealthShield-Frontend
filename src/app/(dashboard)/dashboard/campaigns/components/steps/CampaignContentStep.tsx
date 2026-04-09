'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sparkles,
  Lightbulb,
  PenLine,
  ChevronDown,
  LayoutTemplate,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCampaignStore } from '@/stores/campaign-store';

const VARIABLES = [
  '{{first_name}}',
  '{{last_name}}',
  '{{company}}',
  '{{email}}',
] as const;

const TONE_OPTIONS = ['Formal', 'Friendly', 'Urgent', 'Empathetic'] as const;

export function CampaignContentStep() {
  const {
    wizard,
    updateWizard,
    templates,
    fetchTemplates,
    isGenerating,
    aiGenerateDraft,
    aiSuggestSubjects,
    aiImproveTone,
  } = useCampaignStore();

  const [showTemplates, setShowTemplates] = useState(false);
  const [aiPurpose, setAiPurpose] = useState('');
  const [suggestedSubjects, setSuggestedSubjects] = useState<string[]>([]);
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false);
  const [multiTab, setMultiTab] = useState<string>('email');
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const smsRef = useRef<HTMLTextAreaElement>(null);
  const pushBodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const getActiveTextarea = (): HTMLTextAreaElement | null => {
    if (wizard.type === 'sms') return smsRef.current;
    if (wizard.type === 'push') return pushBodyRef.current;
    if (wizard.type === 'multi_channel') {
      if (multiTab === 'sms') return smsRef.current;
      if (multiTab === 'push') return pushBodyRef.current;
    }
    return bodyRef.current;
  };

  const insertVariable = (variable: string) => {
    const textarea = getActiveTextarea();
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = textarea.value;
    const newValue = currentValue.slice(0, start) + variable + currentValue.slice(end);

    // Determine which field to update
    if (wizard.type === 'sms' || (wizard.type === 'multi_channel' && multiTab === 'sms')) {
      updateWizard({ smsContent: newValue });
    } else if (wizard.type === 'push' || (wizard.type === 'multi_channel' && multiTab === 'push')) {
      updateWizard({ pushBody: newValue });
    } else {
      updateWizard({ content: newValue });
    }

    // Restore cursor position
    requestAnimationFrame(() => {
      textarea.focus();
      const newPos = start + variable.length;
      textarea.setSelectionRange(newPos, newPos);
    });
  };

  const handleAiDraft = async () => {
    if (!aiPurpose.trim()) {
      toast.error('Please enter a purpose for the AI draft');
      return;
    }
    try {
      const result = await aiGenerateDraft(aiPurpose);
      updateWizard({ subject: result.subject, content: result.body });
      toast.success('AI draft generated');
    } catch {
      toast.error('Failed to generate AI draft');
    }
  };

  const handleSuggestSubjects = async () => {
    if (!wizard.content.trim()) {
      toast.error('Write some content first so AI can suggest subjects');
      return;
    }
    try {
      const subjects = await aiSuggestSubjects(wizard.content);
      setSuggestedSubjects(subjects);
      setShowSubjectSuggestions(true);
    } catch {
      toast.error('Failed to suggest subjects');
    }
  };

  const handleImproveTone = async (tone: string) => {
    const currentContent =
      wizard.type === 'sms' ? wizard.smsContent || wizard.content : wizard.content;
    if (!currentContent.trim()) {
      toast.error('Write some content first');
      return;
    }
    try {
      const improved = await aiImproveTone(currentContent, tone);
      if (wizard.type === 'sms') {
        updateWizard({ smsContent: improved });
      } else {
        updateWizard({ content: improved });
      }
      toast.success(`Tone adjusted to ${tone}`);
    } catch {
      toast.error('Failed to improve tone');
    }
  };

  const applyTemplate = (template: { subject: string; body: string }) => {
    updateWizard({ subject: template.subject, content: template.body });
    setShowTemplates(false);
    toast.success('Template applied');
  };

  // -- AI Toolbar --
  const renderAiToolbar = () => (
    <div className="flex flex-wrap gap-2 py-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5" disabled={isGenerating}>
            <Sparkles className="h-3.5 w-3.5" />
            AI Draft
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-3">
            <Label className="text-sm font-medium">What is this campaign about?</Label>
            <Textarea
              placeholder="e.g., Remind leads about open enrollment deadline..."
              value={aiPurpose}
              onChange={(e) => setAiPurpose(e.target.value)}
              rows={3}
            />
            <Button size="sm" onClick={handleAiDraft} disabled={isGenerating} className="w-full">
              {isGenerating ? 'Generating...' : 'Generate Draft'}
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={handleSuggestSubjects}
        disabled={isGenerating}
      >
        <Lightbulb className="h-3.5 w-3.5" />
        Suggest Subject
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5" disabled={isGenerating}>
            <PenLine className="h-3.5 w-3.5" />
            Improve Tone
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {TONE_OPTIONS.map((tone) => (
            <DropdownMenuItem key={tone} onClick={() => handleImproveTone(tone)}>
              {tone}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {isGenerating && <Skeleton className="h-8 w-24" />}
    </div>
  );

  // -- Variable badges row --
  const renderVariableBadges = () => (
    <div className="flex flex-wrap gap-1.5">
      <span className="text-xs text-muted-foreground mr-1 self-center">Insert:</span>
      {VARIABLES.map((v) => (
        <Badge
          key={v}
          variant="secondary"
          className="cursor-pointer hover:bg-primary/10 text-xs"
          onClick={() => insertVariable(v)}
        >
          {v}
        </Badge>
      ))}
    </div>
  );

  // -- Subject suggestions overlay --
  const renderSubjectSuggestions = () =>
    showSubjectSuggestions &&
    suggestedSubjects.length > 0 && (
      <Card className="border-primary/30">
        <CardContent className="p-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Pick a subject:</p>
          {suggestedSubjects.map((s, i) => (
            <button
              key={i}
              className="flex items-center gap-2 w-full text-left p-2 rounded hover:bg-muted text-sm"
              onClick={() => {
                updateWizard({ subject: s });
                setShowSubjectSuggestions(false);
              }}
            >
              <Check className="h-3.5 w-3.5 text-primary shrink-0" />
              {s}
            </button>
          ))}
        </CardContent>
      </Card>
    );

  // -- Email content --
  const renderEmailContent = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="subject">Subject Line</Label>
        <Input
          id="subject"
          placeholder="e.g., Don't miss your enrollment deadline!"
          value={wizard.subject}
          onChange={(e) => updateWizard({ subject: e.target.value })}
        />
      </div>
      {renderSubjectSuggestions()}
      {renderAiToolbar()}
      {renderVariableBadges()}
      <div className="space-y-2">
        <Label htmlFor="body">Email Body</Label>
        <Textarea
          id="body"
          ref={bodyRef}
          placeholder="Write your email content here..."
          value={wizard.content}
          onChange={(e) => updateWizard({ content: e.target.value })}
          rows={12}
          className="font-mono text-sm"
        />
      </div>
    </div>
  );

  // -- SMS content --
  const renderSmsContent = (standalone = true) => {
    const value = wizard.type === 'multi_channel' ? wizard.smsContent : wizard.content;
    const charCount = value.length;
    return (
      <div className="space-y-4">
        {standalone && renderAiToolbar()}
        {renderVariableBadges()}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="sms-body">SMS Message</Label>
            <span
              className={cn(
                'text-xs',
                charCount > 160 ? 'text-red-500 font-medium' : 'text-muted-foreground'
              )}
            >
              {charCount}/160
            </span>
          </div>
          <Textarea
            id="sms-body"
            ref={smsRef}
            placeholder="Write your SMS message..."
            value={value}
            onChange={(e) => {
              if (wizard.type === 'multi_channel') {
                updateWizard({ smsContent: e.target.value });
              } else {
                updateWizard({ content: e.target.value });
              }
            }}
            rows={4}
          />
        </div>
      </div>
    );
  };

  // -- Push content --
  const renderPushContent = (standalone = true) => (
    <div className="space-y-4">
      {standalone && renderAiToolbar()}
      <div className="space-y-2">
        <Label htmlFor="push-title">Notification Title</Label>
        <Input
          id="push-title"
          placeholder="e.g., Important Health Update"
          value={wizard.pushTitle}
          onChange={(e) => updateWizard({ pushTitle: e.target.value })}
          maxLength={65}
        />
      </div>
      {renderVariableBadges()}
      <div className="space-y-2">
        <Label htmlFor="push-body">Notification Body</Label>
        <Textarea
          id="push-body"
          ref={pushBodyRef}
          placeholder="Short notification message..."
          value={wizard.pushBody}
          onChange={(e) => updateWizard({ pushBody: e.target.value })}
          rows={3}
        />
      </div>
    </div>
  );

  // -- Multi-channel content --
  const renderMultiChannelContent = () => (
    <div className="space-y-4">
      {renderAiToolbar()}
      <Tabs value={multiTab} onValueChange={setMultiTab}>
        <TabsList>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="push">Push</TabsTrigger>
        </TabsList>
        <TabsContent value="email" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="mc-subject">Subject Line</Label>
            <Input
              id="mc-subject"
              placeholder="Email subject..."
              value={wizard.subject}
              onChange={(e) => updateWizard({ subject: e.target.value })}
            />
          </div>
          {renderSubjectSuggestions()}
          {renderVariableBadges()}
          <div className="space-y-2">
            <Label htmlFor="mc-body">Email Body</Label>
            <Textarea
              id="mc-body"
              ref={bodyRef}
              placeholder="Write your email content..."
              value={wizard.content}
              onChange={(e) => updateWizard({ content: e.target.value })}
              rows={10}
              className="font-mono text-sm"
            />
          </div>
        </TabsContent>
        <TabsContent value="sms" className="mt-4">
          {renderSmsContent(false)}
        </TabsContent>
        <TabsContent value="push" className="mt-4">
          {renderPushContent(false)}
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Template Browser */}
      <Collapsible open={showTemplates} onOpenChange={setShowTemplates}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="gap-2 w-full justify-between">
            <span className="flex items-center gap-2">
              <LayoutTemplate className="h-4 w-4" />
              Browse Templates
            </span>
            <ChevronDown
              className={cn('h-4 w-4 transition-transform', showTemplates && 'rotate-180')}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          {templates.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No templates available
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {templates.map((t) => (
                <Card
                  key={t.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => applyTemplate(t)}
                >
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-sm">{t.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {t.subject}
                    </p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {t.category}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Content Editor */}
      <Card>
        <CardContent className="p-6">
          {wizard.type === 'email' && renderEmailContent()}
          {wizard.type === 'sms' && renderSmsContent()}
          {wizard.type === 'push' && renderPushContent()}
          {wizard.type === 'multi_channel' && renderMultiChannelContent()}
          {!['email', 'sms', 'push', 'multi_channel'].includes(wizard.type) &&
            renderEmailContent()}
        </CardContent>
      </Card>
    </div>
  );
}
