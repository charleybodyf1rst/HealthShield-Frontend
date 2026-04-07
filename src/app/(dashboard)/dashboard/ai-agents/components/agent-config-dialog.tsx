'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { aiAgentsApi, type AIAgent } from '@/lib/api';

interface AgentConfigDialogProps {
  agent: AIAgent;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}

export function AgentConfigDialog({
  agent,
  isOpen,
  onClose,
  onSaved,
  onDeleted,
}: AgentConfigDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [form, setForm] = useState({
    name: agent.name,
    description: agent.description,
    type: agent.type,
    tone: agent.settings?.tone || 'professional',
    autoRespond: agent.settings?.autoRespond ?? true,
    requireApproval: agent.settings?.requireApproval ?? false,
  });

  const updateForm = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.name) {
      toast.error('Agent name is required');
      return;
    }
    setIsSaving(true);
    try {
      await aiAgentsApi.update(agent.id, {
        name: form.name,
        description: form.description,
        type: form.type,
        settings: {
          tone: form.tone as any,
          responseDelay: agent.settings?.responseDelay ?? 0,
          autoRespond: form.autoRespond,
          requireApproval: form.requireApproval,
        },
      });
      toast.success('Agent updated');
      onSaved();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update agent');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await aiAgentsApi.delete(agent.id);
      toast.success(`${agent.name} deleted`);
      onDeleted();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete agent');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Configure: {agent.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="config-name">Name</Label>
            <Input
              id="config-name"
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="config-desc">Description</Label>
            <Textarea
              id="config-desc"
              value={form.description}
              onChange={(e) => updateForm('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={form.type} onValueChange={(val) => updateForm('type', val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chat">Chat</SelectItem>
                <SelectItem value="voice">Voice</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tone</Label>
            <Select value={form.tone} onValueChange={(val) => updateForm('tone', val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats (read-only) */}
          {agent.stats && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs font-medium text-muted-foreground mb-2">Performance</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Interactions</p>
                  <p className="font-semibold">{agent.stats.totalInteractions?.toLocaleString() ?? 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Success Rate</p>
                  <p className="font-semibold text-green-500">{agent.stats.successRate ?? 0}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Avg Response</p>
                  <p className="font-semibold">{agent.stats.avgResponseTime ?? 0}s</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {agent.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove this agent and all its configuration. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Agent'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
