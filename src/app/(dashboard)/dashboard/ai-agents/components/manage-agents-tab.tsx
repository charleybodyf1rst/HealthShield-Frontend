'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Bot,
  CheckCircle2,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import { aiAgentsApi } from '@/lib/api';
import type { AIAgent } from './types';
import { AgentConfigDialog } from './agent-config-dialog';

interface ManageAgentsTabProps {
  agents: AIAgent[];
  isLoading: boolean;
  onRefresh: () => void;
  onCreateClick: () => void;
}

function getAgentIcon(type: string) {
  switch (type) {
    case 'chat':
      return <Bot className="h-4 w-4" />;
    case 'voice':
      return <Phone className="h-4 w-4" />;
    case 'email':
      return <Mail className="h-4 w-4" />;
    case 'sms':
      return <MessageSquare className="h-4 w-4" />;
    default:
      return <Bot className="h-4 w-4" />;
  }
}

export function ManageAgentsTab({
  agents,
  isLoading,
  onRefresh,
  onCreateClick,
}: ManageAgentsTabProps) {
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [configAgent, setConfigAgent] = useState<AIAgent | null>(null);

  const handleToggle = async (agent: AIAgent) => {
    setTogglingId(agent.id);
    try {
      await aiAgentsApi.toggle(agent.id, !agent.isActive);
      toast.success(`${agent.name} ${agent.isActive ? 'paused' : 'activated'}`);
      onRefresh();
    } catch (error) {
      console.error('Toggle error:', error);
      toast.error('Failed to toggle agent');
    } finally {
      setTogglingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Bot className="h-16 w-16 mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No agents configured</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Create your first AI agent to automate sales calls, email outreach, and SMS follow-ups.
          </p>
          <Button onClick={onCreateClick}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Agent
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {agents.map((agent) => {
          const isActive = agent.isActive || (agent as any).status === 'active';
          return (
            <Card key={agent.id} className="relative overflow-hidden">
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  isActive ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        isActive
                          ? 'bg-gradient-to-br from-primary to-purple-600 text-white'
                          : 'bg-muted'
                      }`}
                    >
                      {getAgentIcon(agent.type)}
                    </div>
                    <div>
                      <CardTitle className="text-base">{agent.name}</CardTitle>
                      <Badge
                        variant={isActive ? 'default' : 'secondary'}
                        className="mt-1"
                      >
                        {isActive && <CheckCircle2 className="mr-1 h-3 w-3" />}
                        {isActive ? 'active' : 'inactive'}
                      </Badge>
                    </div>
                  </div>
                  <Switch
                    checked={isActive}
                    onCheckedChange={() => handleToggle(agent)}
                    disabled={togglingId === agent.id}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{agent.description}</p>
                <Separator className="my-4" />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Interactions</p>
                    <p className="font-semibold">
                      {(agent.stats?.totalInteractions ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Success</p>
                    <p className="font-semibold text-green-500">
                      {agent.stats?.successRate ?? 0}%
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setConfigAgent(agent)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Configure
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {configAgent && (
        <AgentConfigDialog
          agent={configAgent}
          isOpen={!!configAgent}
          onClose={() => setConfigAgent(null)}
          onSaved={() => {
            setConfigAgent(null);
            onRefresh();
          }}
          onDeleted={() => {
            setConfigAgent(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
