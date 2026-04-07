'use client';

import { useEffect, useState } from 'react';
import {
  Phone,
  PhoneCall,
  Voicemail,
  Bot,
  Loader2,
  Sparkles,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VoiceSelector } from './voice-selector';
import { VoicePlayer } from './voice-player';
import {
  aiCallerApi,
  elevenLabsApi,
  type ScriptTemplate,
  type ScriptTemplateKey,
  type ElevenLabsVoice,
} from '@/lib/api';

interface AiCallerPanelProps {
  leadId?: string;
  leadName?: string;
  leadPhone?: string;
  onCallInitiated?: (result: { logId: string; audioUrl: string }) => void;
  className?: string;
}

export function AiCallerPanel({
  leadId,
  leadName,
  leadPhone,
  onCallInitiated,
  className,
}: AiCallerPanelProps) {
  const [templates, setTemplates] = useState<ScriptTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ScriptTemplateKey | ''>('');
  const [selectedVoice, setSelectedVoice] = useState<ElevenLabsVoice | null>(null);
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [customVariables, setCustomVariables] = useState<Record<string, string>>({});
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInitiatingCall, setIsInitiatingCall] = useState(false);
  const [isGeneratingVoicemail, setIsGeneratingVoicemail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch templates on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        const response = await aiCallerApi.getScriptTemplates();
        setTemplates(response.data.templates);
        if (response.data.templates.length > 0) {
          setSelectedTemplate(response.data.templates[0].key);
        }
      } catch (err) {
        console.error('Failed to fetch templates:', err);
        setError('Failed to load script templates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleGenerateScript = async () => {
    if (!selectedTemplate) return;

    try {
      setIsGenerating(true);
      setError(null);
      setAudioUrl(null);

      const response = await aiCallerApi.generateScript(
        selectedTemplate,
        leadId,
        customVariables
      );

      if (response.data.success) {
        setGeneratedScript(response.data.script);
      }
    } catch (err) {
      console.error('Failed to generate script:', err);
      setError('Failed to generate script');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewVoice = async () => {
    if (!generatedScript || !selectedVoice) return;

    try {
      setIsGenerating(true);
      setError(null);

      const response = await elevenLabsApi.synthesize({
        text: generatedScript,
        voice_id: selectedVoice.id,
      });

      setAudioUrl(response.data.audio_url);
    } catch (err) {
      console.error('Failed to synthesize voice:', err);
      setError('Failed to generate voice preview');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInitiateCall = async () => {
    if (!selectedTemplate || !leadPhone) return;

    try {
      setIsInitiatingCall(true);
      setError(null);

      const response = await aiCallerApi.initiateCall(
        leadId || '',
        selectedTemplate,
        customVariables,
        leadPhone
      );

      if (response.data.success) {
        setAudioUrl(response.data.audio_url);
        setGeneratedScript(response.data.script);
        onCallInitiated?.({
          logId: response.data.log_id,
          audioUrl: response.data.audio_url,
        });
      }
    } catch (err) {
      console.error('Failed to initiate call:', err);
      setError('Failed to initiate AI call');
    } finally {
      setIsInitiatingCall(false);
    }
  };

  const handleGenerateVoicemail = async () => {
    if (!selectedTemplate || !leadPhone) return;

    try {
      setIsGeneratingVoicemail(true);
      setError(null);

      const response = await aiCallerApi.generateVoicemail(
        leadId || '',
        selectedTemplate,
        customVariables
      );

      if (response.data.success) {
        setAudioUrl(response.data.audio_url);
        setGeneratedScript(response.data.script);
      }
    } catch (err) {
      console.error('Failed to generate voicemail:', err);
      setError('Failed to generate voicemail');
    } finally {
      setIsGeneratingVoicemail(false);
    }
  };

  const selectedTemplateData = templates.find((t) => t.key === selectedTemplate);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <CardTitle>AI Caller</CardTitle>
        </div>
        <CardDescription>
          Generate personalized calls using AI and premium voices
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Lead Info */}
        {(leadName || leadPhone) && (
          <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              {leadName && <p className="font-medium">{leadName}</p>}
              {leadPhone && (
                <p className="text-sm text-muted-foreground">{leadPhone}</p>
              )}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
            {error}
          </div>
        )}

        <Tabs defaultValue="template" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="template">
              <FileText className="h-4 w-4 mr-2" />
              Script Templates
            </TabsTrigger>
            <TabsTrigger value="custom">
              <Sparkles className="h-4 w-4 mr-2" />
              Custom Script
            </TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="space-y-4 mt-4">
            {/* Template selector */}
            <div className="space-y-2">
              <Label>Script Template</Label>
              <Select
                value={selectedTemplate}
                onValueChange={(v) => setSelectedTemplate(v as ScriptTemplateKey)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.key} value={template.key}>
                      <div className="flex items-center gap-2">
                        <span>{template.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTemplateData && (
                <p className="text-xs text-muted-foreground">
                  {selectedTemplateData.description}
                </p>
              )}
            </div>

            {/* Voice selector */}
            <div className="space-y-2">
              <Label>Voice</Label>
              <VoiceSelector
                value={selectedVoice?.id}
                onValueChange={(id, voice) => setSelectedVoice(voice)}
                useCase={selectedTemplateData?.voice_key === 'josh' ? 'fitness' : 'sales'}
              />
            </div>

            {/* Generate button */}
            <Button
              onClick={handleGenerateScript}
              disabled={!selectedTemplate || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate Personalized Script
            </Button>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4 mt-4">
            {/* Custom script textarea */}
            <div className="space-y-2">
              <Label>Custom Script</Label>
              <Textarea
                value={generatedScript}
                onChange={(e) => setGeneratedScript(e.target.value)}
                placeholder="Enter your custom script here..."
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Write your own script or modify the generated one
              </p>
            </div>

            {/* Voice selector */}
            <div className="space-y-2">
              <Label>Voice</Label>
              <VoiceSelector
                value={selectedVoice?.id}
                onValueChange={(id, voice) => setSelectedVoice(voice)}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Generated script preview */}
        {generatedScript && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Generated Script</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerateScript}
                disabled={isGenerating}
              >
                <RefreshCw className={cn('h-4 w-4 mr-1', isGenerating && 'animate-spin')} />
                Regenerate
              </Button>
            </div>
            <div className="p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">
              {generatedScript}
            </div>
          </div>
        )}

        {/* Voice preview */}
        {generatedScript && selectedVoice && (
          <div className="space-y-2">
            <Label>Voice Preview</Label>
            {audioUrl ? (
              <VoicePlayer
                audioUrl={audioUrl}
                title="Generated Audio"
                subtitle={`Voice: ${selectedVoice.name}`}
              />
            ) : (
              <Button
                variant="outline"
                onClick={handlePreviewVoice}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <PhoneCall className="h-4 w-4 mr-2" />
                )}
                Generate Voice Preview
              </Button>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          onClick={handleGenerateVoicemail}
          variant="outline"
          disabled={!selectedTemplate || isGeneratingVoicemail || !leadPhone}
          className="flex-1"
        >
          {isGeneratingVoicemail ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Voicemail className="h-4 w-4 mr-2" />
          )}
          Generate Voicemail
        </Button>
        <Button
          onClick={handleInitiateCall}
          disabled={!selectedTemplate || isInitiatingCall || !leadPhone}
          className="flex-1"
        >
          {isInitiatingCall ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <PhoneCall className="h-4 w-4 mr-2" />
          )}
          Initiate AI Call
        </Button>
      </CardFooter>
    </Card>
  );
}
