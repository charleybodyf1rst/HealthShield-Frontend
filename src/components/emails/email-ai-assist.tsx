'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Wand2, Type, Loader2, Check, RotateCcw } from 'lucide-react';
import { communicationApi } from '@/lib/api';

interface EmailAiAssistProps {
  leadId?: string;
  currentBody: string;
  onDraftGenerated: (subject: string, body: string) => void;
  onSubjectSuggested: (subject: string) => void;
  onToneImproved: (body: string) => void;
}

export function EmailAiAssist({
  leadId,
  currentBody,
  onDraftGenerated,
  onSubjectSuggested,
  onToneImproved,
}: EmailAiAssistProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [purpose, setPurpose] = useState('');
  const [suggestedSubjects, setSuggestedSubjects] = useState<string[]>([]);
  const [showSubjects, setShowSubjects] = useState(false);

  const handleGenerateDraft = async () => {
    if (!purpose.trim()) return;
    setIsGenerating(true);
    try {
      const result = await communicationApi.aiGenerateDraft({
        leadId,
        purpose: purpose.trim(),
        tone: 'friendly',
      });
      onDraftGenerated(result.subject, result.body);
      setPurpose('');
    } catch {
      // Error handled by caller
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestSubject = async () => {
    if (!currentBody.trim()) return;
    setIsGenerating(true);
    setShowSubjects(true);
    try {
      const result = await communicationApi.aiSuggestSubject({ body: currentBody });
      setSuggestedSubjects(result.subjects || []);
    } catch {
      setSuggestedSubjects([]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImproveTone = async (tone: string) => {
    if (!currentBody.trim()) return;
    setIsGenerating(true);
    try {
      const result = await communicationApi.aiImproveTone({
        body: currentBody,
        targetTone: tone,
      });
      onToneImproved(result.body);
    } catch {
      // Error handled by caller
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Generate Draft */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" disabled={isGenerating}>
            {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            AI Draft
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-3">
            <div>
              <Label className="text-xs">What is this email about?</Label>
              <Input
                placeholder="e.g. Follow up on insurance quote"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="mt-1 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateDraft()}
              />
            </div>
            <Button
              size="sm"
              className="w-full gap-1.5"
              onClick={handleGenerateDraft}
              disabled={!purpose.trim() || isGenerating}
            >
              {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Generate
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Suggest Subject */}
      <Popover open={showSubjects} onOpenChange={setShowSubjects}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-8"
            disabled={isGenerating || !currentBody.trim()}
            onClick={handleSuggestSubject}
          >
            <Type className="h-3.5 w-3.5" />
            Suggest Subject
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="start">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Pick a subject line:</p>
            {isGenerating ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              suggestedSubjects.map((subject, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left text-xs h-auto py-2 px-3"
                  onClick={() => {
                    onSubjectSuggested(subject);
                    setShowSubjects(false);
                  }}
                >
                  <Check className="h-3 w-3 mr-2 flex-shrink-0" />
                  <span className="truncate">{subject}</span>
                </Button>
              ))
            )}
            {!isGenerating && suggestedSubjects.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 text-xs"
                onClick={handleSuggestSubject}
              >
                <RotateCcw className="h-3 w-3" />
                Regenerate
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Improve Tone */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-8"
            disabled={isGenerating || !currentBody.trim()}
          >
            <Wand2 className="h-3.5 w-3.5" />
            Tone
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => handleImproveTone('formal')}>
            Make more formal
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleImproveTone('friendly')}>
            Make more friendly
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleImproveTone('urgent')}>
            Make more urgent
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleImproveTone('empathetic')}>
            Make more empathetic
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
