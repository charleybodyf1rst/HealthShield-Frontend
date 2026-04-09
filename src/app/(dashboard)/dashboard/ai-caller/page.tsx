'use client';

import { useEffect, useState } from 'react';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bot,
  Volume2,
  Loader2,
  Search,
  Filter,
  PhoneOutgoing,
  X,
  Zap,
  MessageSquare,
  Sparkles,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AiCallerPanel, VoiceSelector, VoicePlayer, ConversationalAiPanel } from '@/components/voice';
import { CallFlowTree } from '@/components/voice/call-flow-tree';
import { CallEventLog } from '@/components/voice/call-event-log';
import { useCallFlowStore } from '@/stores/call-flow-store';
import { useEventLogStore } from '@/stores/call-event-log-store';
import {
  aiCallerApi,
  elevenLabsApi,
  conversationalAiApi,
  leadsApi,
  communicationApi,
  type AiCallStats,
  type ElevenLabsVoice,
  type ConversationalStats,
  type ConversationalCallResult,
} from '@/lib/api';
import type { Lead } from '@/types/lead';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useUser } from '@/stores/auth-store';

type CallerMode = 'scripted' | 'conversational';

// Insurance AI Agent Personas — each agent is direct and asks the caller questions
const INSURANCE_PERSONAS = [
  {
    id: 'health_insurance',
    name: 'Health Insurance',
    description: 'Sarah helps callers find the right health plan — asks about current coverage, family size, budget',
    icon: '🏥',
    voice: 'Sarah',
    voiceId: 'EXAVITQu4vr4xnSDxMaL',
    color: 'from-blue-500 to-blue-600',
    borderColor: 'border-blue-500/30',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-600',
    firstMessage: "Hi! This is Sarah from HealthShield. I'm calling to help you find the right health insurance plan. Do you currently have any health coverage, or are you looking for something new?",
    questions: [
      'Find them a health plan based on their needs',
      'Compare Bronze, Silver, Gold and Platinum tiers',
      'Help a family of 4 find affordable coverage',
      'Explain deductibles, copays and out-of-pocket max',
      'Check if their doctor is in our network',
      'Walk them through open enrollment',
    ],
  },
  {
    id: 'auto_insurance',
    name: 'Auto Insurance',
    description: 'Rachel helps callers get auto coverage — asks about vehicles, driving history, bundling',
    icon: '🚗',
    voice: 'Rachel',
    voiceId: '21m00Tcm4TlvDq8ikWAM',
    color: 'from-violet-500 to-violet-600',
    borderColor: 'border-violet-500/30',
    bgColor: 'bg-violet-500/10',
    textColor: 'text-violet-600',
    firstMessage: "Hey there! This is Rachel from HealthShield Insurance. I'm reaching out about auto insurance today. What kind of vehicle are you looking to insure, and do you currently have coverage?",
    questions: [
      'Get them a quote for full coverage auto',
      'Help them bundle auto + home for savings',
      'Explain liability vs comprehensive coverage',
      'Add a teen driver to their policy',
      'Help them switch from their current provider',
      'Set up roadside assistance and rental car coverage',
    ],
  },
  {
    id: 'dental_insurance',
    name: 'Dental Insurance',
    description: 'Emily helps callers with dental plans — asks about dental needs, family, preventive care',
    icon: '🦷',
    voice: 'Emily',
    voiceId: 'MF3mGyEYCl7XYWbV9V6O',
    color: 'from-cyan-500 to-cyan-600',
    borderColor: 'border-cyan-500/30',
    bgColor: 'bg-cyan-500/10',
    textColor: 'text-cyan-600',
    firstMessage: "Hi! This is Emily from HealthShield. I'm calling about dental insurance options for you. When was your last dental checkup, and are you looking for coverage for just yourself or your whole family?",
    questions: [
      'Find them a dental plan with cleanings included',
      'Explain what preventive vs major dental covers',
      'Help them add dental to their health plan',
      'Compare individual vs family dental coverage',
      'Check if their dentist is in-network',
      'Walk through orthodontic coverage for kids',
    ],
  },
  {
    id: 'life_insurance',
    name: 'Life Insurance',
    description: 'Josh helps callers protect their family — asks about dependents, coverage amount, term length',
    icon: '💚',
    voice: 'Josh',
    voiceId: 'TxGEqnHWrfWFTfGW9XjX',
    color: 'from-rose-500 to-rose-600',
    borderColor: 'border-rose-500/30',
    bgColor: 'bg-rose-500/10',
    textColor: 'text-rose-600',
    firstMessage: "Hi, this is Josh from HealthShield. I'm reaching out about life insurance. Do you currently have any life insurance coverage, and do you have any dependents you'd like to protect?",
    questions: [
      'Help them choose between term and whole life',
      'Calculate how much coverage they need',
      'Get a quote for a 20-year term policy',
      'Explain beneficiary options and payout',
      'Help a new parent get their first policy',
      'Compare rates for different coverage amounts',
    ],
  },
  {
    id: 'insurance_claims',
    name: 'Claims Agent',
    description: 'Adam helps callers file and track claims — asks what happened, guides through the process',
    icon: '📋',
    voice: 'Adam',
    color: 'from-amber-500 to-amber-600',
    borderColor: 'border-amber-500/30',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-600',
    firstMessage: "Hi, this is Adam from HealthShield Claims. I understand you may need to file a claim or check on one. Can you tell me what happened and what type of claim you need help with?",
    questions: [
      'Walk them through filing a health claim',
      'Help with a car accident claim step by step',
      'Check the status of an existing claim',
      'Explain what documents they need to submit',
      'Help them appeal a denied claim',
      'Guide them through a home damage claim',
      'Process a prescription reimbursement',
      'Explain how long processing takes',
    ],
  },
];

export default function AiCallerPage() {
  // Current user (for Call Me mode)
  const authUser = useUser();

  // Mode selection
  const [callerMode, setCallerMode] = useState<CallerMode>('conversational');

  // Stats
  const [stats, setStats] = useState<AiCallStats | null>(null);
  const [convStats, setConvStats] = useState<ConversationalStats | null>(null);

  // Voices and leads
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Loading and config states
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isConvConfigured, setIsConvConfigured] = useState(false);
  const [usageInfo, setUsageInfo] = useState<{
    character_count: number;
    character_limit: number;
    remaining: number;
    usage_percentage: number;
  } | null>(null);

  // Insurance persona selection
  const [selectedPersona, setSelectedPersona] = useState<string>('insurance_sales');

  // Manual phone entry state
  const [manualPhone, setManualPhone] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualCallMode, setManualCallMode] = useState(false);

  // Auto-start call trigger (set by quick question buttons)
  const [autoStartCall, setAutoStartCall] = useState(false);

  // SMS & Email state
  const [smsMessage, setSmsMessage] = useState('');
  const [sendingSms, setSendingSms] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [commMode, setCommMode] = useState<'call' | 'sms' | 'email'>('call');

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Check service status for both services
        const [statusRes, convStatusRes, voicesRes, statsRes, usageRes, leadsRes] = await Promise.all([
          aiCallerApi.getStatus().catch(() => ({ data: { configured: false } })),
          conversationalAiApi.getStatus().catch(() => ({ data: { configured: false } })),
          elevenLabsApi.getVoices().catch(() => ({ data: { premium_voices: [] } })),
          aiCallerApi.getCallStats().catch(() => ({ data: null })),
          elevenLabsApi.getUsage().catch(() => ({ data: { subscription: null } })),
          leadsApi.getAll({ limit: 300 } as any).catch(() => ({ data: { data: [] } })),
        ]);

        setIsConfigured(statusRes.data.configured);
        setIsConvConfigured(convStatusRes.data.configured);
        setVoices(voicesRes.data.premium_voices || []);
        setStats(statsRes.data);
        setUsageInfo(usageRes.data.subscription);
        const leadsData = leadsRes.data?.data || leadsRes.data?.leads || leadsRes.data || [];
        setLeads(Array.isArray(leadsData) ? leadsData : []);

        // If conversational is configured, fetch its stats
        if (convStatusRes.data.configured) {
          try {
            const convStatsRes = await conversationalAiApi.getStats();
            setConvStats(convStatsRes.data);
          } catch {
            // Ignore stats errors
          }
        }
      } catch (error) {
        console.error('Failed to fetch AI Caller data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter leads by search query
  const filteredLeads = (leads ?? []).filter((lead) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      lead.firstName?.toLowerCase().includes(query) ||
      lead.lastName?.toLowerCase().includes(query) ||
      lead.email?.toLowerCase().includes(query) ||
      lead.phone?.includes(query)
    );
  });

  const handleCallInitiated = (result: { logId: string; audioUrl: string }) => {
    // Refresh stats
    aiCallerApi.getCallStats().then((res) => setStats(res.data));
  };

  const handleConvCallStarted = (result: ConversationalCallResult) => {
    // Refresh conversational stats
    conversationalAiApi.getStats().then((res) => setConvStats(res.data)).catch(() => {});
  };

  const handleConvCallEnded = (conversationId: string) => {
    // Refresh conversational stats
    conversationalAiApi.getStats().then((res) => setConvStats(res.data)).catch(() => {});
  };

  // Handle lead selection - clears manual mode
  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setManualCallMode(false);
  };

  // Handle manual call mode activation
  const handleUseManualPhone = () => {
    setSelectedLead(null);
    setManualCallMode(true);
  };

  // Clear both modes
  const handleClearSelection = () => {
    setSelectedLead(null);
    setManualCallMode(false);
  };

  // SMS handler
  const handleSendSms = async () => {
    const phoneNumber = manualPhone || selectedLead?.phone || authUser?.phone;
    if (!phoneNumber || !smsMessage.trim()) {
      toast.error('Phone number and message are required');
      return;
    }
    setSendingSms(true);
    try {
      const formatted = phoneNumber.replace(/[^+\d]/g, '');
      const to = formatted.startsWith('+') ? formatted : '+1' + formatted.replace(/^1/, '');
      await communicationApi.sendSMS({ to, body: smsMessage.trim(), leadId: selectedLead?.id || '' });
      toast.success('SMS sent successfully');
      setSmsMessage('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send SMS');
    } finally {
      setSendingSms(false);
    }
  };

  // Email handler
  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error('Subject and body are required');
      return;
    }
    setSendingEmail(true);
    try {
      const to = selectedLead?.email || '';
      await communicationApi.sendEmail({ to, subject: emailSubject.trim(), body: emailBody.trim(), leadId: selectedLead?.id });
      toast.success('Email sent successfully');
      setEmailSubject('');
      setEmailBody('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const neitherConfigured = !isConfigured && !isConvConfigured;

  if (neitherConfigured) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              AI Caller Not Configured
            </CardTitle>
            <CardDescription>
              The AI Caller requires ElevenLabs and Twilio to be configured.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please contact your administrator to set up the following:
            </p>
            <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground space-y-1">
              <li>ElevenLabs API key for premium voice synthesis</li>
              <li>ElevenLabs Agent ID and Phone Number ID for conversational AI</li>
              <li>Twilio Account SID, Auth Token, and phone number</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/25">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="text-foreground font-bold">AI Caller</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered outbound calling with premium ElevenLabs voices
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/dashboard/ai-caller/history">
            <Button variant="outline" size="sm" className="gap-2">
              <Clock className="h-4 w-4" />
              Call History
            </Button>
          </a>
          {isConvConfigured && (
            <Badge variant="default" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
              <Zap className="h-3 w-3 mr-1" />
              Real-Time AI Active
            </Badge>
          )}
          {isConfigured && (
            <Badge variant="secondary">
              Scripted Calls Active
            </Badge>
          )}
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <Tabs value={callerMode} onValueChange={(v) => setCallerMode(v as CallerMode)} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="conversational" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Real-Time AI
            {isConvConfigured && <Badge variant="secondary" className="ml-1 text-xs">Premium</Badge>}
            {!isConvConfigured && <Badge variant="outline" className="ml-1 text-xs text-muted-foreground">Setup</Badge>}
          </TabsTrigger>
          <TabsTrigger value="scripted" className="gap-2">
            <Volume2 className="h-4 w-4" />
            Scripted Calls
            {!isConfigured && <Badge variant="outline" className="ml-1 text-xs text-muted-foreground">Setup</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* Stats Cards - Dynamic based on mode */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {callerMode === 'conversational' ? (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Conversations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    <span className="text-2xl font-bold">{convStats?.total_calls || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Duration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-500" />
                    <span className="text-2xl font-bold">
                      {convStats?.avg_duration_seconds
                        ? `${Math.floor(convStats.avg_duration_seconds / 60)}:${String(Math.floor(convStats.avg_duration_seconds % 60)).padStart(2, '0')}`
                        : '0:00'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span className="text-2xl font-bold">{convStats?.success_rate || 0}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Positive Sentiment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-400" />
                    <span className="text-2xl font-bold">{convStats?.positive_sentiment || 0}%</span>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Calls
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-blue-500" />
                    <span className="text-2xl font-bold">{stats?.total_calls || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-2xl font-bold">{stats?.completed || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{stats?.success_rate || 0}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Voice Credits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5 text-blue-400" />
                    <span className="text-2xl font-bold">
                      {usageInfo ? Math.round(100 - usageInfo.usage_percentage) : 0}%
                    </span>
                  </div>
                  {usageInfo && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {(usageInfo?.remaining ?? 0).toLocaleString()} characters left
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Insurance AI Agent Personas */}
        {callerMode === 'conversational' && (
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold">Choose Your AI Agent</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {INSURANCE_PERSONAS.map((persona) => (
                <Card
                  key={persona.id}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md',
                    selectedPersona === persona.id
                      ? `${persona.borderColor} border-2 ${persona.bgColor}`
                      : 'hover:border-muted-foreground/30'
                  )}
                  onClick={() => setSelectedPersona(persona.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn('h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-xl', persona.color)}>
                          {persona.icon}
                        </div>
                        <div>
                          <CardTitle className="text-base">{persona.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">Voice: {persona.voice}</p>
                        </div>
                      </div>
                      {selectedPersona === persona.id && (
                        <CheckCircle2 className={cn('h-5 w-5', persona.textColor)} />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3">{persona.description}</p>
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quick Questions</p>
                      {persona.questions.map((q, i) => (
                        <button
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPersona(persona.id);
                            if (authUser?.phone) {
                              setManualPhone(authUser.phone);
                              setManualName(`${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() || 'Me');
                              setSelectedLead(null);
                              setManualCallMode(true);
                              // Reset then trigger auto-start so the panel initiates the call immediately
                              setAutoStartCall(false);
                              setTimeout(() => setAutoStartCall(true), 100);
                              toast.success(`Starting ${persona.voice} call about: "${q}"`);
                            } else {
                              toast.info(`Topic: "${q}" — Enter a phone number to start the call`);
                            }
                          }}
                          className={cn(
                            'w-full text-left text-xs px-3 py-1.5 rounded-md transition-colors',
                            'bg-muted/50 hover:bg-muted text-foreground/80 hover:text-foreground'
                          )}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Lead Selection */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Lead</CardTitle>
                <CardDescription>
                  Choose a lead to call with AI voice
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search leads..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="max-h-[400px] overflow-y-auto space-y-2">
                  {filteredLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => handleSelectLead(lead)}
                      className={cn(
                        'p-3 rounded-lg border cursor-pointer transition-colors',
                        selectedLead?.id === lead.id && !manualCallMode
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {lead.firstName} {lead.lastName}
                          </p>
                          {lead.phone && (
                            <p className="text-sm text-muted-foreground">
                              {lead.phone}
                            </p>
                          )}
                        </div>
                        {!lead.phone && (
                          <Badge variant="secondary" className="text-xs">
                            No phone
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}

                  {filteredLeads.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No leads found
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Communication Mode Toggle */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">Communication Mode</h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={commMode === 'call' ? 'default' : 'outline'}
                    onClick={() => setCommMode('call')}
                    className="w-full"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Call
                  </Button>
                  <Button
                    variant={commMode === 'sms' ? 'default' : 'outline'}
                    onClick={() => setCommMode('sms')}
                    className="w-full"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Text
                  </Button>
                  <Button
                    variant={commMode === 'email' ? 'default' : 'outline'}
                    onClick={() => setCommMode('email')}
                    className="w-full"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Call Me - AI calls the logged-in user's phone */}
            {commMode === 'call' && authUser?.phone && (
              <Card className={cn(
                manualCallMode && manualPhone === authUser.phone && 'border-primary bg-primary/5'
              )}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PhoneCall className="h-5 w-5 text-green-500" />
                    Call Me
                  </CardTitle>
                  <CardDescription>
                    Have the AI assistant call your phone
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your number: <span className="font-medium text-foreground">{authUser.phone}</span>
                  </p>
                  <Button
                    onClick={() => {
                      setManualPhone(authUser.phone!);
                      setManualName(`${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() || 'Me');
                      setSelectedLead(null);
                      setManualCallMode(true);
                    }}
                    className="w-full"
                    variant={manualCallMode && manualPhone === authUser.phone ? 'secondary' : 'default'}
                  >
                    {manualCallMode && manualPhone === authUser.phone ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Ready — Start Call Above
                      </>
                    ) : (
                      <>
                        <PhoneCall className="h-4 w-4 mr-2" />
                        Call My Phone
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Call - Manual Phone Entry */}
            {commMode === 'call' && (
              <Card className={cn(manualCallMode && !(authUser?.phone && manualPhone === authUser.phone) && 'border-primary')}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PhoneOutgoing className="h-5 w-5" />
                    Quick Call
                  </CardTitle>
                  <CardDescription>
                    Enter a phone number for an ad-hoc AI call
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="manualPhone">Phone Number</Label>
                    <Input
                      id="manualPhone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manualName">Caller Name (optional)</Label>
                    <Input
                      id="manualName"
                      placeholder="Enter name..."
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleUseManualPhone}
                    disabled={!manualPhone.trim()}
                    className="w-full"
                    variant={manualCallMode ? 'secondary' : 'default'}
                  >
                    {manualCallMode ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Using This Number
                      </>
                    ) : (
                      <>
                        <Phone className="h-4 w-4 mr-2" />
                        Use This Number
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* SMS Panel */}
            {commMode === 'sms' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                    Send Text Message
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">To</label>
                    <Input value={manualPhone || selectedLead?.phone || authUser?.phone || ''} readOnly className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Message</label>
                    <textarea
                      value={smsMessage}
                      onChange={(e) => setSmsMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="w-full mt-1 p-3 border rounded-lg resize-none h-32 text-sm"
                      maxLength={1600}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{smsMessage.length}/1600 characters</p>
                  </div>
                  <Button onClick={handleSendSms} disabled={sendingSms || !smsMessage.trim()} className="w-full">
                    {sendingSms ? 'Sending...' : 'Send Text Message'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Email Panel */}
            {commMode === 'email' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-500" />
                    Send Email
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">To</label>
                    <Input value={selectedLead?.email || 'Select a lead with email'} readOnly className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Subject</label>
                    <Input
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Email subject..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Body</label>
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Write your email..."
                      className="w-full mt-1 p-3 border rounded-lg resize-none h-40 text-sm"
                    />
                  </div>
                  <Button onClick={handleSendEmail} disabled={sendingEmail || !emailSubject.trim() || !emailBody.trim()} className="w-full">
                    {sendingEmail ? 'Sending...' : 'Send Email'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Available Voices Preview (for scripted mode) */}
            {callerMode === 'scripted' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Volume2 className="h-5 w-5" />
                    Premium Voices
                  </CardTitle>
                  <CardDescription>
                    {(voices ?? []).length} ElevenLabs voices available
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(voices ?? []).slice(0, 5).map((voice) => (
                      <div
                        key={voice.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Volume2 className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{voice.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {voice.gender} - {voice.accent}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {voice.use_case}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Conversational AI Features (for conversational mode) */}
            {callerMode === 'conversational' && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Real-Time AI Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Sub-100ms response latency
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Natural conversation flow
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      GPT-4 powered responses
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Interruption handling
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Live transcription
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Sentiment analysis
                    </li>
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* AI Caller Panel - Dynamic based on mode */}
          <div className="lg:col-span-2">
            <TabsContent value="conversational" className="mt-0">
              {!isConvConfigured ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                      Real-Time AI Not Configured
                    </CardTitle>
                    <CardDescription>
                      Configure ElevenLabs Conversational AI to enable real-time voice calls with GPT-4 intelligence.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Please contact your administrator to set up the following:
                    </p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li>ElevenLabs API key</li>
                      <li>ElevenLabs Agent ID for conversational AI</li>
                      <li>ElevenLabs Phone Number ID</li>
                    </ul>
                  </CardContent>
                </Card>
              ) : (selectedLead || manualCallMode) ? (
                <ConversationalAiPanel
                  leadId={selectedLead?.id}
                  leadName={manualCallMode ? (manualName || 'Manual Call') : `${selectedLead?.firstName} ${selectedLead?.lastName}`}
                  leadPhone={manualCallMode ? manualPhone : selectedLead?.phone}
                  leadEmail={selectedLead?.email}
                  leadSource={selectedLead?.source}
                  leadNotes={selectedLead?.notes}
                  persona={selectedPersona}
                  customFirstMessage={INSURANCE_PERSONAS.find((p) => p.id === selectedPersona)?.firstMessage}
                  defaultVoiceId={INSURANCE_PERSONAS.find((p) => p.id === selectedPersona)?.voiceId}
                  autoStart={autoStartCall}
                  onCallStarted={(result) => {
                    setAutoStartCall(false);
                    handleConvCallStarted(result);
                  }}
                  onCallEnded={handleConvCallEnded}
                />
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Select a Lead or Enter Phone</h3>
                    <p className="text-muted-foreground mt-1 max-w-md">
                      Choose a lead from the list or enter a phone number to start a real-time AI conversation
                    </p>
                    <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                      <Zap className="h-4 w-4 text-primary" />
                      <span>Powered by ElevenLabs + GPT-4</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="scripted" className="mt-0">
              {!isConfigured ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                      Scripted Calls Not Configured
                    </CardTitle>
                    <CardDescription>
                      Configure ElevenLabs and Twilio to enable scripted AI-powered calls.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Please contact your administrator to set up the following:
                    </p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li>ElevenLabs API key for voice synthesis</li>
                      <li>Twilio Account SID and Auth Token</li>
                      <li>Twilio Phone Number</li>
                    </ul>
                  </CardContent>
                </Card>
              ) : (selectedLead || manualCallMode) ? (
                <AiCallerPanel
                  leadId={selectedLead?.id}
                  leadName={manualCallMode ? (manualName || 'Manual Call') : `${selectedLead?.firstName} ${selectedLead?.lastName}`}
                  leadPhone={manualCallMode ? manualPhone : selectedLead?.phone}
                  onCallInitiated={handleCallInitiated}
                />
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Select a Lead or Enter Phone</h3>
                    <p className="text-muted-foreground mt-1">
                      Choose a lead from the list or enter a phone number for a quick call
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </div>
        </div>

        {/* Call Stats by Template (Scripted mode) */}
        {callerMode === 'scripted' && stats?.by_template && Object.keys(stats.by_template).length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Calls by Template</CardTitle>
              <CardDescription>
                Breakdown of AI calls by script template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(stats.by_template).map(([template, count]) => (
                  <div
                    key={template}
                    className="p-4 rounded-lg bg-muted/50 text-center"
                  >
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {template.replace(/_/g, ' ')}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Conversation Stats by Persona (Conversational mode) */}
        {callerMode === 'conversational' && convStats?.by_persona && Object.keys(convStats.by_persona).length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Conversations by Persona</CardTitle>
              <CardDescription>
                Breakdown of AI conversations by agent persona
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {Object.entries(convStats.by_persona).map(([persona, count]) => (
                  <div
                    key={persona}
                    className="p-4 rounded-lg bg-muted/50 text-center"
                  >
                    <p className="text-2xl font-bold">{count as number}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {persona.replace(/_/g, ' ')}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </Tabs>

      {/* AI Caller Diagnostics — Call Flow Tree + Event Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Call Flow Pipeline
            </CardTitle>
            <CardDescription>
              Real-time 10-stage pipeline — see exactly where calls succeed or fail
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CallFlowTree />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Event Log
            </CardTitle>
            <CardDescription>
              Real-time diagnostic events, transcripts, and tool execution logs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CallEventLog />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
