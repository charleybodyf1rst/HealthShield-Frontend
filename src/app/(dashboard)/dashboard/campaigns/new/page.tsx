'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCampaignStore } from '@/stores/campaign-store';
import { CampaignSetupStep } from '../components/steps/CampaignSetupStep';
import { CampaignAudienceStep } from '../components/steps/CampaignAudienceStep';
import { CampaignContentStep } from '../components/steps/CampaignContentStep';
import { CampaignPreviewStep } from '../components/steps/CampaignPreviewStep';
import { CampaignConfirmStep } from '../components/steps/CampaignConfirmStep';

const STEPS = [
  { number: 1, label: 'Setup' },
  { number: 2, label: 'Audience' },
  { number: 3, label: 'Content' },
  { number: 4, label: 'Preview' },
  { number: 5, label: 'Confirm' },
] as const;

export default function NewCampaignPage() {
  const router = useRouter();
  const { wizard, setWizardStep, resetWizard } = useCampaignStore();
  const currentStep = wizard.step;
  const progressValue = (currentStep / STEPS.length) * 100;

  useEffect(() => {
    resetWizard();
  }, [resetWizard]);

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return wizard.name.trim().length > 0;
      case 2:
        return true;
      case 3:
        if (wizard.type === 'email') return wizard.subject.trim().length > 0 && wizard.content.trim().length > 0;
        if (wizard.type === 'sms') return wizard.content.trim().length > 0;
        if (wizard.type === 'push') return wizard.pushTitle.trim().length > 0 && wizard.pushBody.trim().length > 0;
        if (wizard.type === 'multi_channel') return wizard.content.trim().length > 0;
        return wizard.content.trim().length > 0;
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length && canProceed()) {
      setWizardStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setWizardStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CampaignSetupStep />;
      case 2:
        return <CampaignAudienceStep />;
      case 3:
        return <CampaignContentStep />;
      case 4:
        return <CampaignPreviewStep />;
      case 5:
        return <CampaignConfirmStep />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard/campaigns')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Campaigns
        </Button>
        <h1 className="text-2xl font-bold">Create Campaign</h1>
      </div>

      {/* Progress Bar */}
      <div className="space-y-3">
        <Progress value={progressValue} className="h-2" />
        <div className="flex justify-between">
          {STEPS.map((step) => (
            <button
              key={step.number}
              onClick={() => {
                if (step.number < currentStep) setWizardStep(step.number);
              }}
              className={cn(
                'flex items-center gap-2 text-sm font-medium transition-colors',
                step.number === currentStep && 'text-primary',
                step.number < currentStep && 'text-primary cursor-pointer hover:underline',
                step.number > currentStep && 'text-muted-foreground'
              )}
            >
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold border-2',
                  step.number === currentStep && 'border-primary bg-primary text-primary-foreground',
                  step.number < currentStep && 'border-primary bg-primary/10 text-primary',
                  step.number > currentStep && 'border-muted-foreground/30 text-muted-foreground'
                )}
              >
                {step.number < currentStep ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  step.number
                )}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[500px]">{renderStep()}</div>

      {/* Navigation */}
      {currentStep < 5 && (
        <div className="flex justify-between border-t pt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="gap-2"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
