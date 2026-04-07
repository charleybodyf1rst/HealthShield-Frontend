'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot, Loader2, RefreshCw, Target } from 'lucide-react';
import type { NextBestAction } from './types';

interface NextBestActionsTabProps {
  actions: NextBestAction[];
  isLoading: boolean;
  onRefresh: () => void;
  onGetHelp: (action: NextBestAction) => void;
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high':
      return 'text-red-500';
    case 'medium':
      return 'text-yellow-500';
    default:
      return 'text-green-500';
  }
}

export function NextBestActionsTab({
  actions,
  isLoading,
  onRefresh,
  onGetHelp,
}: NextBestActionsTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Next Best Actions</CardTitle>
            <CardDescription>
              AI-recommended actions for your leads based on engagement and pipeline stage
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : actions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No actions recommended</p>
            <p className="text-sm">Great job! You are caught up on all your leads.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {actions.map((item, index) => (
              <div
                key={item.leadId}
                className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{item.leadName}</span>
                    <Badge variant="outline" className={getPriorityColor(item.priority)}>
                      {item.priority}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {item.type}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-primary">{item.action}</p>
                  <p className="text-sm text-muted-foreground mt-1">{item.reason}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onGetHelp(item)}>
                    <Bot className="mr-2 h-4 w-4" />
                    Get Help
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
