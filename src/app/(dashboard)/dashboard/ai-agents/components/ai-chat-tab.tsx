'use client';

import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bot,
  Brain,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Send,
  Target,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react';
import type { Lead } from '@/types/lead';
import type { ChatMessage, QuickAction } from './types';

interface AIChatTabProps {
  messages: ChatMessage[];
  inputMessage: string;
  setInputMessage: (val: string) => void;
  isLoading: boolean;
  leads: Lead[];
  selectedLeadId: string;
  setSelectedLeadId: (val: string) => void;
  onSendMessage: (message?: string) => void;
}

function getQuickActions(selectedLead?: Lead): QuickAction[] {
  const name = selectedLead ? `${selectedLead.firstName} ${selectedLead.lastName}` : '';
  return [
    {
      id: '1',
      label: selectedLead ? `Draft follow-up email for ${selectedLead.firstName}` : 'Draft follow-up email',
      icon: Mail,
      prompt: selectedLead
        ? `Draft a follow-up email for ${name} (${selectedLead.email || 'no email on file'})`
        : 'Draft a follow-up email for a lead who inquired about health insurance plans',
    },
    {
      id: '2',
      label: 'Get next best actions',
      icon: Target,
      prompt: selectedLead
        ? `What are the best next actions for ${name}?`
        : 'What are my top priority actions for today?',
    },
    {
      id: '3',
      label: 'Analyze my pipeline',
      icon: TrendingUp,
      prompt: 'Analyze my current pipeline and identify bottlenecks',
    },
    {
      id: '4',
      label: 'Generate call script',
      icon: Phone,
      prompt: selectedLead
        ? `Create a call script for a discovery call with ${name}`
        : 'Create a call script for a discovery call with a new lead',
    },
    {
      id: '5',
      label: selectedLead ? `Draft SMS for ${selectedLead.firstName}` : 'Draft SMS message',
      icon: MessageSquare,
      prompt: selectedLead
        ? `Write a brief follow-up SMS for ${name}`
        : 'Write a brief follow-up SMS for a lead who missed our call',
    },
    {
      id: '6',
      label: 'Objection handling',
      icon: Brain,
      prompt: 'How should I handle the "too expensive" objection?',
    },
  ];
}

export function AIChatTab({
  messages,
  inputMessage,
  setInputMessage,
  isLoading,
  leads,
  selectedLeadId,
  setSelectedLeadId,
  onSendMessage,
}: AIChatTabProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedLead = leads.find((l) => l.id === selectedLeadId);
  const quickActions = getQuickActions(selectedLead);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Chat Interface */}
      <Card className="lg:col-span-2">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">Booking Assistant</CardTitle>
              <p className="text-sm text-muted-foreground">
                Claude AI - Always learning from your interactions
              </p>
            </div>
            <Select
              value={selectedLeadId || 'none'}
              onValueChange={(val) => setSelectedLeadId(val === 'none' ? '' : val)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select lead for context" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No lead selected</SelectItem>
                {leads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.firstName} {lead.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[450px] p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex flex-col gap-2 max-w-[80%]">
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.suggestedActions && message.suggestedActions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {message.suggestedActions.map((action, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => onSendMessage(`Help me: ${action.action}`)}
                          >
                            {action.action}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-muted">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Ask about bookings, availability, customers..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSendMessage();
                  }
                }}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={() => onSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Sidebar */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => onSendMessage(action.prompt)}
                disabled={isLoading}
              >
                <action.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">{action.label}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
