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
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { aiAgentsApi } from '@/lib/api';

interface CreateAgentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const AGENT_TYPES = [
  { value: 'sales', label: 'Sales', description: 'Qualify leads and close deals' },
  { value: 'support', label: 'Support', description: 'Handle customer inquiries' },
  { value: 'booking', label: 'Booking', description: 'Manage reservations and availability' },
];

const PERSONAS = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'sales', label: 'Sales-focused' },
  { value: 'follow_up', label: 'Follow-up Specialist' },
  { value: 'appointment', label: 'Appointment Setter' },
  { value: 'boat_rental_receptionist', label: 'Boat Rental Receptionist' },
  { value: 'support', label: 'Support Agent' },
  { value: 'coach', label: 'Coach' },
  { value: 'win_back', label: 'Win-back Specialist' },
];

const LLM_OPTIONS = [
  { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet', description: 'Best quality, recommended' },
  { value: 'gpt-4o', label: 'GPT-4o', description: 'Fast and capable' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini', description: 'Budget-friendly' },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', description: 'Google alternative' },
];

const RESPONSE_STYLES = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'colorful', label: 'Colorful' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'executive', label: 'Executive' },
  { value: 'nerdy', label: 'Nerdy' },
  { value: 'visual', label: 'Visual' },
];

const TOTAL_STEPS = 4;

export function CreateAgentDialog({ isOpen, onClose, onCreated }: CreateAgentDialogProps) {
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'sales',
    description: '',
    persona: 'professional',
    llm: 'claude-3-5-sonnet',
    responseStyle: 'professional',
    voiceId: '',
    firstMessage: '',
    prompt: '',
  });

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async () => {
    if (!form.name) {
      toast.error('Agent name is required');
      return;
    }
    setIsCreating(true);
    try {
      await aiAgentsApi.create({
        name: form.name,
        type: form.type as any,
        description: form.description,
        isActive: true,
        settings: {
          tone: form.responseStyle as any,
          responseDelay: 0,
          autoRespond: true,
          requireApproval: false,
        },
      } as any);
      toast.success('AI Agent created successfully!');
      handleClose();
      onCreated();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create agent');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setForm({
      name: '',
      type: 'sales',
      description: '',
      persona: 'professional',
      llm: 'claude-3-5-sonnet',
      responseStyle: 'professional',
      voiceId: '',
      firstMessage: '',
      prompt: '',
    });
    onClose();
  };

  const canProceed = () => {
    if (step === 1) return !!form.name;
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Create AI Agent — Step {step} of {TOTAL_STEPS}
          </DialogTitle>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex gap-1">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i < step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <div className="py-4 space-y-4 min-h-[200px]">
          {/* Step 1: Basics */}
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="agent-name">Agent Name *</Label>
                <Input
                  id="agent-name"
                  placeholder="e.g., Booking Assistant, Sales Rep"
                  value={form.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <div className="grid gap-2">
                  {AGENT_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      className={`text-left p-3 rounded-lg border transition-colors ${
                        form.type === t.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted'
                      }`}
                      onClick={() => updateForm('type', t.value)}
                    >
                      <p className="font-medium text-sm">{t.label}</p>
                      <p className="text-xs text-muted-foreground">{t.description}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-desc">Description</Label>
                <Input
                  id="agent-desc"
                  placeholder="Brief description of what this agent does"
                  value={form.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                />
              </div>
            </>
          )}

          {/* Step 2: AI Config */}
          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>AI Model</Label>
                <div className="grid gap-2">
                  {LLM_OPTIONS.map((llm) => (
                    <button
                      key={llm.value}
                      type="button"
                      className={`text-left p-3 rounded-lg border transition-colors ${
                        form.llm === llm.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted'
                      }`}
                      onClick={() => updateForm('llm', llm.value)}
                    >
                      <p className="font-medium text-sm">{llm.label}</p>
                      <p className="text-xs text-muted-foreground">{llm.description}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Response Style</Label>
                <Select value={form.responseStyle} onValueChange={(val) => updateForm('responseStyle', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESPONSE_STYLES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Persona</Label>
                <Select value={form.persona} onValueChange={(val) => updateForm('persona', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERSONAS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Step 3: Voice (Optional) */}
          {step === 3 && (
            <>
              <p className="text-sm text-muted-foreground">
                Configure voice settings for phone-based agents. Skip this step for text-only agents.
              </p>
              <div className="space-y-2">
                <Label htmlFor="voice-id">ElevenLabs Voice ID (optional)</Label>
                <Input
                  id="voice-id"
                  placeholder="e.g., 21m00Tcm4TlvDq8ikWAM"
                  value={form.voiceId}
                  onChange={(e) => updateForm('voiceId', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to use the default voice. Voice IDs can be found in your ElevenLabs dashboard.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="first-msg">First Message / Greeting</Label>
                <Textarea
                  id="first-msg"
                  placeholder="e.g., Ahoy! Welcome to HealthShield! How can I help you today?"
                  value={form.firstMessage}
                  onChange={(e) => updateForm('firstMessage', e.target.value)}
                  rows={3}
                />
              </div>
            </>
          )}

          {/* Step 4: System Prompt */}
          {step === 4 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="system-prompt">System Prompt</Label>
                <Textarea
                  id="system-prompt"
                  placeholder="Describe how this agent should behave, what it should know, and how it should respond to customers..."
                  value={form.prompt}
                  onChange={(e) => updateForm('prompt', e.target.value)}
                  rows={8}
                />
                <p className="text-xs text-muted-foreground">
                  This is the core instruction set for your AI agent. Be specific about tone, knowledge boundaries, and escalation rules.
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {step < TOTAL_STEPS ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleCreate} disabled={isCreating || !form.name}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Agent'
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
