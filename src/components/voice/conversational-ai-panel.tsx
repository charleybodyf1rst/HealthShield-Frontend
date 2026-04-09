'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Bot,
  Loader2,
  Sparkles,
  FileText,
  Settings2,
  MessageSquare,
  BarChart3,
  Clock,
  User,
  Volume2,
  Mic,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
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
import { Input } from '@/components/ui/input';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  conversationalAiApi,
  type ConversationalPersona,
  type ConversationalLlm,
  type ConversationalPersonaInfo,
  type ConversationalLlmOption,
  type ConversationalCallResult,
  type ConversationalCallStatus,
  type ConversationalTranscript,
  type ConversationalAnalytics,
} from '@/lib/api';

interface ConversationalAiPanelProps {
  leadId?: string;
  leadName?: string;
  leadPhone?: string;
  leadEmail?: string;
  leadSource?: string;
  leadNotes?: string;
  persona?: string;
  customFirstMessage?: string;
  defaultVoiceId?: string;
  autoStart?: boolean;
  onCallStarted?: (result: ConversationalCallResult) => void;
  onCallEnded?: (conversationId: string) => void;
  className?: string;
}

type CallState = 'idle' | 'connecting' | 'ringing' | 'in_progress' | 'completed' | 'failed';

export function ConversationalAiPanel({
  leadId,
  leadName,
  leadPhone,
  leadEmail,
  leadSource,
  leadNotes,
  persona: parentPersona,
  customFirstMessage: parentFirstMessage,
  defaultVoiceId: parentVoiceId,
  autoStart,
  onCallStarted,
  onCallEnded,
  className,
}: ConversationalAiPanelProps) {
  // Configuration state
  const [personas, setPersonas] = useState<ConversationalPersonaInfo[]>([]);
  const [llmOptions, setLlmOptions] = useState<ConversationalLlmOption[]>([]);
  const [defaultLlm, setDefaultLlm] = useState<ConversationalLlm>('gpt-4o');
  const [isConfigured, setIsConfigured] = useState(false);

  // Call configuration
  const [selectedPersona, setSelectedPersona] = useState<ConversationalPersona>((parentPersona as ConversationalPersona) || 'insurance_sales');
  // Sync persona and voice from parent when they change
  useEffect(() => {
    if (parentPersona) setSelectedPersona(parentPersona as ConversationalPersona);
  }, [parentPersona]);
  useEffect(() => {
    if (parentVoiceId) setSelectedVoiceId(parentVoiceId);
  }, [parentVoiceId]);

  const [selectedLlm, setSelectedLlm] = useState<ConversationalLlm>('gpt-4o');
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(parentVoiceId || '');
  const [customPrompt, setCustomPrompt] = useState('');
  const [firstMessage, setFirstMessage] = useState('');
  const [manualPhone, setManualPhone] = useState('');

  // Call state
  const [callState, setCallState] = useState<CallState>('idle');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [callSid, setCallSid] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<ConversationalCallStatus | null>(null);
  const [transcript, setTranscript] = useState<ConversationalTranscript | null>(null);

  // Diagnostic log — shows call pipeline stages
  const [diagLog, setDiagLog] = useState<Array<{ time: string; stage: string; status: 'ok' | 'error' | 'pending'; detail: string }>>([]);
  const addDiag = (stage: string, status: 'ok' | 'error' | 'pending', detail: string) => {
    setDiagLog((prev) => [...prev, { time: new Date().toLocaleTimeString(), stage, status, detail }]);
  };
  const [analytics, setAnalytics] = useState<ConversationalAnalytics | null>(null);
  const [callDuration, setCallDuration] = useState(0);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isInitiatingCall, setIsInitiatingCall] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Polling ref
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const durationRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch configuration on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        const [statusRes, personasRes, llmRes] = await Promise.all([
          conversationalAiApi.getStatus(),
          conversationalAiApi.getPersonas(),
          conversationalAiApi.getLlmOptions(),
        ]);

        setIsConfigured(statusRes.data.configured);
        setPersonas(personasRes.data.personas);
        setLlmOptions(llmRes.data.options);
        setDefaultLlm(llmRes.data.default as ConversationalLlm);
        setSelectedLlm(llmRes.data.default as ConversationalLlm);
      } catch (err) {
        console.error('Failed to fetch conversational AI config:', err);
        setError('Failed to load AI configuration');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (durationRef.current) clearInterval(durationRef.current);
    };
  }, []);

  // Poll for call status when active
  const startPolling = useCallback((convId: string) => {
    // Guard: don't poll with null/undefined conversation ID
    if (!convId || convId === 'null' || convId === 'undefined') {
      console.warn('Cannot poll: no valid conversation ID');
      return;
    }
    if (pollingRef.current) clearInterval(pollingRef.current);

    let errorCount = 0;
    pollingRef.current = setInterval(async () => {
      try {
        const [statusRes, transcriptRes] = await Promise.all([
          conversationalAiApi.getCallStatus(convId),
          conversationalAiApi.getTranscript(convId).catch(() => null),
        ]);

        errorCount = 0; // Reset on success

        if (statusRes.data.success) {
          setCallStatus(statusRes.data);

          // Update call state based on status
          const status = statusRes.data.status as string;
          if (status === 'completed' || status === 'done' || status === 'failed') {
            setCallState(status === 'done' ? 'completed' : (status as CallState));
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (durationRef.current) clearInterval(durationRef.current);

            // Fetch final analytics
            try {
              const analyticsRes = await conversationalAiApi.getAnalytics(convId);
              if (analyticsRes.data.success) {
                setAnalytics(analyticsRes.data);
              }
            } catch {
              // Analytics might not be available immediately
            }

            onCallEnded?.(convId);
          } else if (status === 'in_progress') {
            setCallState('in_progress');
          } else if (status === 'ringing') {
            setCallState('ringing');
          }
        }

        if (transcriptRes?.data?.success) {
          setTranscript(transcriptRes.data);
        }
      } catch (err) {
        errorCount++;
        // Stop polling after 3 consecutive errors (call probably ended)
        if (errorCount >= 3) {
          console.warn('Stopping call polling after 3 consecutive errors');
          if (pollingRef.current) clearInterval(pollingRef.current);
          if (durationRef.current) clearInterval(durationRef.current);
          setCallState('completed');
          onCallEnded?.(convId);
        }
      }
    }, 2000); // Poll every 2 seconds
  }, [onCallEnded]);

  // Start duration timer
  const startDurationTimer = useCallback(() => {
    if (durationRef.current) clearInterval(durationRef.current);
    setCallDuration(0);

    durationRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  }, []);

  const handleInitiateCall = async () => {
    const phone = manualPhone || leadPhone;
    if (!phone) {
      setError('Please enter a phone number or select a lead with a phone number');
      return;
    }

    try {
      setIsInitiatingCall(true);
      setError(null);
      setCallState('connecting');
      setTranscript(null);
      setAnalytics(null);
      setCallStatus(null);
      setDiagLog([]);
      addDiag('Initiation', 'pending', `Calling ${phone} with persona ${selectedPersona}`);

      const context: Record<string, string> = {};
      if (leadName) context.lead_name = leadName;
      if (leadEmail) context.lead_email = leadEmail;
      if (leadSource) context.lead_source = leadSource;
      if (leadNotes) context.lead_notes = leadNotes.substring(0, 500);

      addDiag('API Request', 'pending', `POST /conversational-ai/call → persona=${selectedPersona}, voice=${selectedVoiceId || 'default'}, llm=${selectedLlm}`);
      const response = await conversationalAiApi.initiateCall({
        lead_id: leadId,
        phone,
        voice_provider: 'elevenlabs',
        voice_id: selectedVoiceId || undefined,
        persona: selectedPersona,
        llm: selectedLlm,
        custom_prompt: customPrompt || undefined,
        first_message: firstMessage || parentFirstMessage || undefined,
        context: Object.keys(context).length > 0 ? context : undefined,
      });

      addDiag('API Response', response.data.success ? 'ok' : 'error', JSON.stringify({
        success: response.data.success,
        conversation_id: response.data.conversation_id,
        call_sid: response.data.call_sid,
        status: response.data.status,
        provider: response.data.provider,
      }));

      if (response.data.success) {
        const trackingId = response.data.conversation_id || response.data.call_sid || null;
        setConversationId(trackingId);
        setCallSid(response.data.call_sid || null);
        setCallState('ringing');

        addDiag('Call Placed', 'ok', `Tracking: ${trackingId} | Twilio SID: ${response.data.call_sid}`);

        if (trackingId) {
          addDiag('Polling', 'pending', `Starting poll for ${trackingId}`);
          startPolling(trackingId);
        } else {
          addDiag('Polling', 'error', 'No tracking ID — cannot poll status');
        }
        startDurationTimer();
        onCallStarted?.(response.data);
      } else {
        addDiag('Call Failed', 'error', response.data.message || 'Unknown error');
        throw new Error('Failed to initiate call');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      addDiag('Exception', 'error', errMsg);
      console.error('Failed to initiate conversational AI call:', err);
      setError('Failed to initiate call. Please check the configuration and try again.');
      setCallState('failed');
    } finally {
      setIsInitiatingCall(false);
    }
  };

  // Auto-start call when autoStart prop is true (triggered by quick question buttons)
  const autoStartedRef = useRef(false);
  useEffect(() => {
    if (autoStart && !autoStartedRef.current && !isLoading && isConfigured && callState === 'idle' && (leadPhone || manualPhone)) {
      autoStartedRef.current = true;
      handleInitiateCall();
    }
  }, [autoStart, isLoading, isConfigured, callState, leadPhone, manualPhone]);

  const handleEndCall = () => {
    // In a real implementation, you'd call an API to end the call
    // For now, we just stop polling and update state
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (durationRef.current) clearInterval(durationRef.current);
    setCallState('completed');
    if (conversationId) {
      onCallEnded?.(conversationId);
    }
  };

  const handleNewCall = () => {
    setCallState('idle');
    setConversationId(null);
    setCallStatus(null);
    setTranscript(null);
    setAnalytics(null);
    setCallDuration(0);
    setError(null);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallStateIcon = () => {
    switch (callState) {
      case 'connecting':
        return <Loader2 className="h-5 w-5 animate-spin text-yellow-500" />;
      case 'ringing':
        return <Phone className="h-5 w-5 animate-pulse text-yellow-500" />;
      case 'in_progress':
        return <PhoneCall className="h-5 w-5 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Phone className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getCallStateBadge = () => {
    switch (callState) {
      case 'connecting':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">Connecting...</Badge>;
      case 'ringing':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">Ringing...</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600">Completed</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600">Failed</Badge>;
      default:
        return <Badge variant="outline">Ready</Badge>;
    }
  };

  const selectedPersonaData = personas.find((p) => p.key === selectedPersona);
  const selectedLlmData = llmOptions.find((l) => l.key === selectedLlm);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!isConfigured) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <AlertCircle className="h-12 w-12 text-yellow-500" />
          <div className="text-center">
            <h3 className="font-semibold">Conversational AI Not Configured</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Please configure ElevenLabs API key and phone number in the backend settings.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle>Real-Time AI Caller</CardTitle>
          </div>
          {getCallStateBadge()}
        </div>
        <CardDescription>
          Have natural phone conversations powered by GPT-4 with sub-100ms latency
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Error message */}
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Active Call View */}
        {callState !== 'idle' && (
          <div className="space-y-4">
            {/* Call Status Card */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getCallStateIcon()}
                  <div>
                    <p className="font-medium">{leadName || 'Unknown Caller'}</p>
                    <p className="text-sm text-muted-foreground">{manualPhone || leadPhone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-mono font-bold">{formatDuration(callDuration)}</p>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
              </div>

              {/* Voice Activity Indicator */}
              {callState === 'in_progress' && (
                <div className="flex items-center gap-2 p-2 bg-background rounded-lg">
                  <Volume2 className="h-4 w-4 text-green-500" />
                  <div className="flex-1">
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-full bg-green-500 animate-pulse" />
                    </div>
                  </div>
                  <Mic className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Live Transcript */}
            {transcript && transcript.transcript && transcript.transcript.length > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Live Transcript
                </Label>
                <ScrollArea className="h-48 w-full rounded-lg border p-3">
                  <div className="space-y-3">
                    {transcript.transcript.map((msg, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          'flex gap-2',
                          msg.role === 'agent' ? 'justify-start' : 'justify-end'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                            msg.role === 'agent'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-foreground'
                          )}
                        >
                          <p className="font-medium text-xs mb-1">
                            {msg.role === 'agent' ? 'AI Agent' : 'Lead'}
                          </p>
                          <p>{(msg as Record<string, unknown>).original_message as string || (msg as Record<string, unknown>).message as string || msg.text || ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Call Analytics (shown after call) */}
            {callState === 'completed' && analytics && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Call Analytics
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-lg font-semibold">
                      {analytics.duration_seconds
                        ? `${Math.floor(analytics.duration_seconds / 60)}:${String(Math.floor(analytics.duration_seconds % 60)).padStart(2, '0')}`
                        : '0:00'}
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Turns</p>
                    <p className="text-lg font-semibold">{analytics.turns || 0}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Sentiment</p>
                    <p className="text-lg font-semibold capitalize">{analytics.sentiment || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Outcome</p>
                    <p className="text-lg font-semibold capitalize">{analytics.outcome || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Configuration View */}
        {callState === 'idle' && (
          <Tabs defaultValue="setup" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="setup">
                <Settings2 className="h-4 w-4 mr-2" />
                Call Setup
              </TabsTrigger>
              <TabsTrigger value="advanced">
                <Sparkles className="h-4 w-4 mr-2" />
                Advanced
              </TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-4 mt-4">
              {/* Phone Number */}
              <div className="space-y-2">
                <Label>Phone Number</Label>
                {leadPhone ? (
                  <div className="flex items-center gap-2">
                    <Input value={leadPhone} disabled className="flex-1" />
                    <Badge variant="secondary">From Lead</Badge>
                  </div>
                ) : (
                  <Input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                  />
                )}
              </div>

              {/* Lead Info */}
              {leadName && (
                <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{leadName}</p>
                    {leadEmail && <p className="text-sm text-muted-foreground">{leadEmail}</p>}
                  </div>
                </div>
              )}

              {/* Persona selector */}
              <div className="space-y-2">
                <Label>AI Agent Persona</Label>
                <Select
                  value={selectedPersona}
                  onValueChange={(v) => setSelectedPersona(v as ConversationalPersona)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a persona" />
                  </SelectTrigger>
                  <SelectContent>
                    {personas.filter((p) => p.key.startsWith('insurance_')).map((persona) => (
                      <SelectItem key={persona.key} value={persona.key}>
                        <div className="flex items-center gap-2">
                          <span>{persona.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPersonaData && (
                  <p className="text-xs text-muted-foreground">
                    {selectedPersonaData.description}
                  </p>
                )}
              </div>

              {/* AI Model — locked to GPT-4o + ElevenLabs */}
              <div className="space-y-2">
                <Label>AI Model</Label>
                <div className="flex items-center gap-2 p-2.5 border rounded-md bg-muted/30">
                  <span className="text-sm font-medium">GPT-4o</span>
                  <Badge variant="secondary" className="text-xs">Recommended</Badge>
                  <span className="text-xs text-muted-foreground">+ ElevenLabs Voices</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Most capable — best for complex insurance conversations
                </p>
              </div>

              {/* ElevenLabs Voice Selector */}
              <div className="space-y-2">
                <Label>ElevenLabs Voice</Label>
                <Select
                  value={selectedVoiceId || 'default'}
                  onValueChange={(v) => setSelectedVoiceId(v === 'default' ? '' : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Use persona default voice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">
                      <span>Default (persona voice)</span>
                    </SelectItem>
                    <SelectItem value="EXAVITQu4vr4xnSDxMaL">
                      <span>Sarah — Professional, friendly</span>
                    </SelectItem>
                    <SelectItem value="29vD33N1CtxCmqQRPOHJ">
                      <span>Drew — Calm, reassuring</span>
                    </SelectItem>
                    <SelectItem value="pNInz6obpgDQGcFmaJgB">
                      <span>Adam — Professional, efficient</span>
                    </SelectItem>
                    <SelectItem value="21m00Tcm4TlvDq8ikWAM">
                      <span>Rachel — Clear, professional</span>
                    </SelectItem>
                    <SelectItem value="TxGEqnHWrfWFTfGW9XjX">
                      <span>Josh — Warm, conversational</span>
                    </SelectItem>
                    <SelectItem value="ErXwobaYiN019PkySvjV">
                      <span>Antoni — Well-rounded, expressive</span>
                    </SelectItem>
                    <SelectItem value="MF3mGyEYCl7XYWbV9V6O">
                      <span>Emily — Calm, professional</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {selectedVoiceId ? 'Custom voice override' : 'Each persona has a matched default voice'}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 mt-4">
              {/* First Message */}
              <div className="space-y-2">
                <Label>Custom First Message</Label>
                <Textarea
                  value={firstMessage}
                  onChange={(e) => setFirstMessage(e.target.value)}
                  placeholder="Hi! This is Sarah from HealthShield. How are you doing today?"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  Customize what the AI says when the call is answered (optional)
                </p>
              </div>

              {/* Custom Prompt */}
              <div className="space-y-2">
                <Label>Additional Instructions</Label>
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Focus on their fitness goals and mention our current promotion..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Add specific instructions for this call (optional)
                </p>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {callState === 'idle' ? (
          <Button
            onClick={handleInitiateCall}
            disabled={isInitiatingCall || (!leadPhone && !manualPhone)}
            className="flex-1"
            size="lg"
          >
            {isInitiatingCall ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <PhoneCall className="h-4 w-4 mr-2" />
            )}
            Start AI Call
          </Button>
        ) : callState === 'in_progress' || callState === 'ringing' || callState === 'connecting' ? (
          <Button
            onClick={handleEndCall}
            variant="destructive"
            className="flex-1"
            size="lg"
          >
            <PhoneOff className="h-4 w-4 mr-2" />
            End Call
          </Button>
        ) : (
          <Button
            onClick={handleNewCall}
            className="flex-1"
            size="lg"
          >
            <Phone className="h-4 w-4 mr-2" />
            New Call
          </Button>
        )}
      </CardFooter>

      {/* Call Diagnostic Tree — shows pipeline stages */}
      {diagLog.length > 0 && (
        <div className="border-t px-6 py-4">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Call Pipeline Diagnostics
          </h4>
          <div className="space-y-1 font-mono text-xs">
            {diagLog.map((entry, i) => (
              <div key={i} className={`flex items-start gap-2 p-1.5 rounded ${
                entry.status === 'ok' ? 'bg-emerald-500/10 text-emerald-400' :
                entry.status === 'error' ? 'bg-red-500/10 text-red-400' :
                'bg-amber-500/10 text-amber-400'
              }`}>
                <span className="opacity-50 shrink-0">{entry.time}</span>
                <span className={`shrink-0 ${
                  entry.status === 'ok' ? 'text-emerald-500' :
                  entry.status === 'error' ? 'text-red-500' :
                  'text-amber-500'
                }`}>
                  {entry.status === 'ok' ? '✓' : entry.status === 'error' ? '✗' : '⏳'}
                </span>
                <span className="font-semibold shrink-0">{entry.stage}</span>
                <span className="opacity-70 break-all">{entry.detail}</span>
              </div>
            ))}
          </div>
          {conversationId && (
            <div className="mt-2 text-xs text-muted-foreground">
              Conversation: <code className="bg-muted px-1 py-0.5 rounded">{conversationId}</code>
              {callSid && callSid !== conversationId && (
                <> | Twilio SID: <code className="bg-muted px-1 py-0.5 rounded">{callSid}</code></>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
