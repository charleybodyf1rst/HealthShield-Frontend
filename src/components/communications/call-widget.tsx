'use client';

import { useState, useEffect } from 'react';
import { Phone, PhoneOff, X, Play, Pause, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { elevenLabsApi, aiCallerApi, type ElevenLabsVoice, type ScriptTemplate } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CallWidgetProps {
  leadId?: string;
  leadName?: string;
  phoneNumber?: string;
  onClose?: () => void;
  onCallEnd?: (logId: string, duration: number) => void;
}

type CallStatus = 'idle' | 'loading' | 'selecting' | 'generating' | 'ready' | 'calling' | 'completed';

export function CallWidget({
  leadId,
  leadName,
  phoneNumber,
  onClose,
  onCallEnd,
}: CallWidgetProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [status, setStatus] = useState<CallStatus>('idle');
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
  const [templates, setTemplates] = useState<ScriptTemplate[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>();
  const [selectedTemplate, setSelectedTemplate] = useState<string>();
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [elevenLabsConfigured, setElevenLabsConfigured] = useState(false);

  useEffect(() => {
    initializeVoiceOptions();
  }, []);

  const initializeVoiceOptions = async () => {
    setStatus('loading');
    try {
      // Check if ElevenLabs is configured
      const statusRes = await elevenLabsApi.getStatus();
      setElevenLabsConfigured(statusRes.data.configured);

      if (statusRes.data.configured) {
        // Fetch premium voices and script templates
        const [voicesRes, templatesRes] = await Promise.all([
          elevenLabsApi.getVoices({ use_case: 'sales' }),
          aiCallerApi.getScriptTemplates(),
        ]);

        setVoices(voicesRes.data.premium_voices || []);
        setTemplates(templatesRes.data.templates || []);
        setStatus('selecting');
      } else {
        // ElevenLabs not configured, use fallback
        setStatus('idle');
      }
    } catch (error) {
      console.error('Failed to load voice options:', error);
      toast.error('Failed to load voice options. Using fallback mode.');
      setStatus('idle');
    }
  };

  const handleGeneratePreview = async () => {
    if (!leadId || !selectedTemplate) {
      toast.error('Please select a template');
      return;
    }

    setStatus('generating');
    try {
      // Generate personalized script
      const scriptRes = await aiCallerApi.generateScript(
        selectedTemplate as any,
        leadId,
        { lead_name: leadName || 'there' }
      );
      setGeneratedScript(scriptRes.data.script);

      // Synthesize audio
      const audioRes = await elevenLabsApi.synthesize({
        text: scriptRes.data.script,
        voice_key: scriptRes.data.voice_key || selectedVoice,
        model: 'turbo_v2_5',
      });
      setAudioUrl(audioRes.data.audio_url);
      setStatus('ready');
      toast.success('Preview generated!');
    } catch (error) {
      console.error('Failed to generate preview:', error);
      toast.error('Failed to generate preview');
      setStatus('selecting');
    }
  };

  const handleInitiateCall = async () => {
    if (!leadId || !selectedTemplate) {
      toast.error('Please generate preview first');
      return;
    }

    setStatus('calling');
    try {
      const result = await aiCallerApi.initiateCall(
        leadId,
        selectedTemplate as any,
        { lead_name: leadName || '' }
      );

      // Call backend triggers Twilio call with ElevenLabs voice
      toast.success('Call initiated successfully!');
      onCallEnd?.(result.data.log_id, 0);
      setStatus('completed');

      // Close after 2 seconds
      setTimeout(() => {
        onClose?.();
      }, 2000);
    } catch (error) {
      console.error('Failed to initiate call:', error);
      toast.error('Failed to initiate call');
      setStatus('ready');
    }
  };

  const handleFallbackCall = () => {
    // Fallback to phone dialer if ElevenLabs not configured
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
      onClose?.();
    }
  };

  const handleClose = () => {
    onClose?.();
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="rounded-full h-14 w-14 shadow-lg bg-primary"
        >
          <Phone className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 bg-background border rounded-lg shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-2 h-2 rounded-full',
            status === 'calling' ? 'bg-green-500 animate-pulse' : 'bg-blue-500'
          )} />
          <span className="text-sm font-medium">
            {elevenLabsConfigured ? 'AI Voice Call' : 'Phone Call'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
          >
            <span className="text-xs">Minimize</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Contact Info */}
        {leadName && (
          <div className="text-center">
            <p className="font-semibold text-lg">{leadName}</p>
            <p className="text-muted-foreground text-sm">{phoneNumber}</p>
          </div>
        )}

        {/* Loading State */}
        {status === 'loading' && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Loading voice options...</p>
          </div>
        )}

        {/* ElevenLabs Voice Selection */}
        {elevenLabsConfigured && (status === 'selecting' || status === 'generating' || status === 'ready') && (
          <>
            {/* Voice Selection */}
            {voices.length > 0 && (
              <div>
                <label className="text-sm font-medium">Premium Voice</label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select voice (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        {voice.name} {voice.description && `- ${voice.description}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Script Template */}
            <div>
              <label className="text-sm font-medium">Script Template</label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.key} value={template.key}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Generate Preview Button */}
            {status === 'selecting' && (
              <Button
                onClick={handleGeneratePreview}
                disabled={!selectedTemplate || !leadId}
                className="w-full"
              >
                Generate Preview
              </Button>
            )}
          </>
        )}

        {/* Generating State */}
        {status === 'generating' && (
          <div className="text-center py-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Generating script and audio...</p>
          </div>
        )}

        {/* Ready to Call */}
        {status === 'ready' && (
          <>
            <div>
              <label className="text-sm font-medium">Generated Script</label>
              <Textarea
                value={generatedScript}
                readOnly
                rows={6}
                className="text-sm mt-1"
              />
            </div>

            {audioUrl && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <span className="text-sm text-muted-foreground">Preview audio</span>
                <audio
                  src={audioUrl}
                  autoPlay={isPlaying}
                  onEnded={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleInitiateCall}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                <Phone className="mr-2 h-4 w-4" />
                Initiate Call
              </Button>
              <Button
                onClick={() => setStatus('selecting')}
                variant="outline"
              >
                Edit
              </Button>
            </div>
          </>
        )}

        {/* Calling State */}
        {status === 'calling' && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-500" />
            <p className="mt-2 text-sm text-muted-foreground">Initiating call...</p>
          </div>
        )}

        {/* Completed State */}
        {status === 'completed' && (
          <div className="text-center py-8">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Phone className="h-6 w-6 text-green-600" />
            </div>
            <p className="mt-2 text-sm font-medium">Call initiated successfully!</p>
          </div>
        )}

        {/* Fallback Mode (ElevenLabs not configured) */}
        {!elevenLabsConfigured && status === 'idle' && (
          <div className="space-y-4">
            <div className="text-center">
              <Button
                onClick={handleFallbackCall}
                disabled={!phoneNumber}
                className="bg-green-500 hover:bg-green-600 rounded-full h-14 w-14"
              >
                <Phone className="h-6 w-6" />
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-4">
                Click to open phone dialer
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Floating Call Button for triggering calls
interface CallButtonProps {
  leadId: string;
  leadName: string;
  phoneNumber: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function CallButton({
  leadId,
  leadName,
  phoneNumber,
  variant = 'ghost',
  size = 'icon',
  className,
}: CallButtonProps) {
  const [showWidget, setShowWidget] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowWidget(true)}
        className={cn('text-green-600 hover:text-green-700 hover:bg-green-50', className)}
        title={`Call ${leadName}`}
      >
        <Phone className="h-4 w-4" />
      </Button>

      {showWidget && (
        <CallWidget
          leadId={leadId}
          leadName={leadName}
          phoneNumber={phoneNumber}
          onClose={() => setShowWidget(false)}
        />
      )}
    </>
  );
}
