'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Plus, RefreshCw, Settings, Sparkles, Target } from 'lucide-react';
import { toast } from 'sonner';
import { aiAgentsApi, aiAssistantApi, leadsApi, type AIAgent, type NextBestAction } from '@/lib/api';
import type { Lead } from '@/types/lead';
import type { ChatMessage } from './components/types';
import { AIChatTab } from './components/ai-chat-tab';
import { ContentGeneratorTab } from './components/content-generator-tab';
import { NextBestActionsTab } from './components/next-best-actions-tab';
import { ManageAgentsTab } from './components/manage-agents-tab';
import { CreateAgentDialog } from './components/create-agent-dialog';

export default function AIAgentsPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hello! I'm your AI Insurance Assistant powered by Claude. I can help you with:\n\n\u2022 **Policy management - Check coverage and manage enrollments\n\u2022 **Lead qualification** - Analyze leads and suggest next actions\n\u2022 **Email drafting** - Create personalized follow-up emails\n\u2022 **Call scripts** - Generate talking points for sales calls\n\u2022 **SMS messages** - Write brief, effective text messages\n\u2022 **Pipeline analysis** - Identify bottlenecks and opportunities\n\nHow can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [nextActions, setNextActions] = useState<NextBestAction[]>([]);
  const [isLoadingActions, setIsLoadingActions] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Fetch leads
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await leadsApi.getAll({ limit: 50 });
        const leadsData = (response.data?.data || []) as Lead[];
        setLeads(leadsData);
      } catch (error) {
        console.error('Failed to fetch leads:', error);
      }
    };
    fetchLeads();
  }, []);

  // Fetch agents
  const fetchAgents = useCallback(async () => {
    setAgentsLoading(true);
    try {
      const data = await aiAgentsApi.getAll();
      const agentsList = data?.agents;
      if (Array.isArray(agentsList)) {
        setAgents(agentsList);
      }
    } catch {
      setAgents([]);
    } finally {
      setAgentsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Fetch next best actions
  const fetchNextActions = useCallback(async () => {
    setIsLoadingActions(true);
    try {
      const response = await aiAssistantApi.getNextBestActions(10);
      setNextActions(response.actions || []);
    } catch (error) {
      console.error('Failed to fetch next actions:', error);
      setNextActions([]);
    } finally {
      setIsLoadingActions(false);
    }
  }, []);

  useEffect(() => {
    fetchNextActions();
  }, [fetchNextActions]);

  // Chat handler
  const handleSendMessage = async (message?: string) => {
    const messageText = message || inputMessage;
    if (!messageText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await aiAgentsApi.chat(selectedLeadId || '', messageText);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          response?.data?.response ||
          'I apologize, but I could not process your request. Please try again.',
        timestamp: new Date(),
        suggestedActions: response?.data?.suggestedActions || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'I apologize, but I encountered an error processing your request. Please try again in a moment.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast.error('Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetHelp = (action: NextBestAction) => {
    setSelectedLeadId(action.leadId);
    handleSendMessage(`Help me ${action.action.toLowerCase()} for ${action.leadName}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Insurance Assistant</h1>
          <p className="text-muted-foreground">Powered by Claude AI, ElevenLabs & Twilio</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchNextActions} disabled={isLoadingActions}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingActions ? 'animate-spin' : ''}`} />
            Refresh Actions
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Agent
          </Button>
        </div>
      </div>

      <CreateAgentDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreated={fetchAgents}
      />

      <Tabs defaultValue="assistant" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assistant">
            <Bot className="mr-2 h-4 w-4" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="generate">
            <Sparkles className="mr-2 h-4 w-4" />
            Content Generator
          </TabsTrigger>
          <TabsTrigger value="actions">
            <Target className="mr-2 h-4 w-4" />
            Next Best Actions
          </TabsTrigger>
          <TabsTrigger value="agents">
            <Settings className="mr-2 h-4 w-4" />
            Manage Agents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assistant" className="space-y-4">
          <AIChatTab
            messages={messages}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            isLoading={isLoading}
            leads={leads}
            selectedLeadId={selectedLeadId}
            setSelectedLeadId={setSelectedLeadId}
            onSendMessage={handleSendMessage}
          />
        </TabsContent>

        <TabsContent value="generate" className="space-y-4">
          <ContentGeneratorTab
            leads={leads}
            selectedLeadId={selectedLeadId}
            setSelectedLeadId={setSelectedLeadId}
          />
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <NextBestActionsTab
            actions={nextActions}
            isLoading={isLoadingActions}
            onRefresh={fetchNextActions}
            onGetHelp={handleGetHelp}
          />
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <ManageAgentsTab
            agents={agents}
            isLoading={agentsLoading}
            onRefresh={fetchAgents}
            onCreateClick={() => setCreateDialogOpen(true)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
