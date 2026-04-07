'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Phone, Clock, Play, Pause, Bot, User, Search,
  ArrowLeft, Volume2, ChevronDown, ChevronUp, Loader2,
  PhoneIncoming, PhoneOutgoing, FileText,
} from 'lucide-react';
import { conversationalAiApi } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

interface Conversation {
  conversation_id: string;
  phone_number?: string;
  status: string;
  created_at: string;
  duration?: number;
  direction?: string;
  lead_name?: string;
}

interface TranscriptTurn {
  role: string;
  message: string;
  text?: string;
  timestamp?: number;
  turn_number?: number;
  speaker?: string;
  confidence?: number;
  sentiment?: string;
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

const statusColors: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  no_answer: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  voicemail: 'bg-purple-100 text-purple-700',
};

export default function CallHistoryPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    setIsLoadingList(true);
    try {
      const res = await conversationalAiApi.getConversations();
      const data = res.data || res.conversations || res || [];
      setConversations(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error('Failed to load call history');
      setConversations([]);
    } finally {
      setIsLoadingList(false);
    }
  }

  async function selectConversation(id: string) {
    setSelectedId(id);
    setIsLoadingDetail(true);
    setTranscript([]);
    setRecordingUrl(null);
    setAnalytics(null);

    try {
      const [transcriptRes, recordingRes] = await Promise.allSettled([
        conversationalAiApi.getCallTranscript(id),
        conversationalAiApi.getCallRecording(id),
      ]);

      if (transcriptRes.status === 'fulfilled') {
        const t = transcriptRes.value?.data?.transcript || transcriptRes.value?.transcript || [];
        setTranscript(Array.isArray(t) ? t : []);
      }

      if (recordingRes.status === 'fulfilled') {
        const url = recordingRes.value?.data?.audio_url || recordingRes.value?.audio_url || recordingRes.value?.data?.recording_url || null;
        setRecordingUrl(url);
      }

      // Load analytics in background
      try {
        const analyticsRes = await conversationalAiApi.getCallAnalytics(id);
        setAnalytics(analyticsRes?.data || analyticsRes || null);
      } catch { /* analytics optional */ }
    } catch (err: any) {
      toast.error('Failed to load call details');
    } finally {
      setIsLoadingDetail(false);
      setTimeout(() => transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
    }
  }

  function togglePlayback() {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }

  const filtered = conversations.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.phone_number || '').includes(q) ||
      (c.lead_name || '').toLowerCase().includes(q) ||
      (c.status || '').toLowerCase().includes(q)
    );
  });

  const selectedConv = conversations.find((c) => c.conversation_id === selectedId);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/ai-caller">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Call History</h1>
            <p className="text-muted-foreground text-sm">Review past AI calls, recordings, and transcripts</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-sm">
          {conversations.length} calls
        </Badge>
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Left Panel — Call List */}
        <div className="w-full lg:w-[400px] border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by phone or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoadingList ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Phone className="h-8 w-8 mb-2 opacity-40" />
                <p>No call history yet</p>
              </div>
            ) : (
              filtered.map((conv) => (
                <button
                  key={conv.conversation_id}
                  type="button"
                  onClick={() => selectConversation(conv.conversation_id)}
                  className={`w-full text-left p-4 border-b hover:bg-muted/50 transition-colors ${
                    selectedId === conv.conversation_id ? 'bg-muted border-l-2 border-l-primary' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {conv.direction === 'inbound' ? (
                        <PhoneIncoming className="h-4 w-4 text-blue-500" />
                      ) : (
                        <PhoneOutgoing className="h-4 w-4 text-green-500" />
                      )}
                      <span className="font-medium text-sm">
                        {conv.lead_name || conv.phone_number || 'Unknown'}
                      </span>
                    </div>
                    <Badge className={`text-xs ${statusColors[conv.status] || 'bg-gray-100 text-gray-700'}`}>
                      {conv.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{formatDate(conv.created_at)}</span>
                    <span>{formatTime(conv.created_at)}</span>
                    {conv.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(conv.duration)}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Panel — Call Detail */}
        <div className="flex-1 overflow-y-auto">
          {!selectedId ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <FileText className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-lg font-medium">Select a call to view details</p>
              <p className="text-sm">Choose a call from the list to see the recording and transcript</p>
            </div>
          ) : isLoadingDetail ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Call Info Header */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">
                        {selectedConv?.lead_name || selectedConv?.phone_number || 'Call Details'}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {selectedConv ? `${formatDate(selectedConv.created_at)} at ${formatTime(selectedConv.created_at)}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {selectedConv?.duration && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {formatDuration(selectedConv.duration)}
                        </div>
                      )}
                      <Badge className={statusColors[selectedConv?.status || ''] || 'bg-gray-100'}>
                        {selectedConv?.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Audio Player */}
              {recordingUrl && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      Recording
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={togglePlayback}
                        className="h-10 w-10 rounded-full"
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <audio
                        ref={audioRef}
                        src={recordingUrl}
                        onEnded={() => setIsPlaying(false)}
                        className="flex-1"
                        controls
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Transcript */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Transcript ({transcript.length} turns)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  {transcript.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No transcript available</p>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                      {transcript.map((turn, i) => {
                        const isAgent = (turn.role || turn.speaker) === 'agent' || (turn.role || turn.speaker) === 'assistant';
                        return (
                          <div key={i} className={`flex gap-3 ${isAgent ? '' : 'flex-row-reverse'}`}>
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isAgent ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {isAgent ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                            </div>
                            <div className={`max-w-[75%] ${isAgent ? '' : 'text-right'}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-muted-foreground">
                                  {isAgent ? 'AI Agent' : 'Customer'}
                                </span>
                                {turn.timestamp !== undefined && (
                                  <span className="text-xs text-muted-foreground/60">
                                    {formatDuration(Math.round(turn.timestamp))}
                                  </span>
                                )}
                                {turn.sentiment && (
                                  <Badge variant="outline" className="text-xs py-0">
                                    {turn.sentiment}
                                  </Badge>
                                )}
                              </div>
                              <div className={`rounded-xl px-4 py-2 text-sm ${
                                isAgent
                                  ? 'bg-blue-50 text-blue-900 rounded-tl-sm'
                                  : 'bg-gray-100 text-gray-900 rounded-tr-sm'
                              }`}>
                                {turn.message || turn.text}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={transcriptEndRef} />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Analytics (Collapsible) */}
              {analytics && (
                <Card>
                  <CardHeader
                    className="pb-3 cursor-pointer"
                    onClick={() => setShowAnalytics(!showAnalytics)}
                  >
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Call Analytics
                      </span>
                      {showAnalytics ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </CardTitle>
                  </CardHeader>
                  {showAnalytics && (
                    <CardContent className="pb-4">
                      <div className="grid grid-cols-2 gap-4">
                        {analytics.summary && (
                          <div className="col-span-2">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Summary</p>
                            <p className="text-sm">{analytics.summary}</p>
                          </div>
                        )}
                        {analytics.duration && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Duration</p>
                            <p className="text-lg font-semibold">{formatDuration(analytics.duration)}</p>
                          </div>
                        )}
                        {analytics.sentiment && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Overall Sentiment</p>
                            <p className="text-lg font-semibold capitalize">{analytics.sentiment}</p>
                          </div>
                        )}
                        {analytics.outcome && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Outcome</p>
                            <p className="text-lg font-semibold capitalize">{analytics.outcome}</p>
                          </div>
                        )}
                        {analytics.topics && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Topics</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(Array.isArray(analytics.topics) ? analytics.topics : []).map((t: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-xs">{t}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}