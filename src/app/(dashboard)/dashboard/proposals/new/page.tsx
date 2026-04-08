'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { insuranceApi } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

export default function NewProposalPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    leadId: '',
    leadName: '',
    planType: '',
    premium: '',
    notes: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await insuranceApi.createProposal({
        lead_id: formData.leadId,
        lead_name: formData.leadName,
        plan_type: formData.planType,
        premium: parseFloat(formData.premium) || 0,
        notes: formData.notes,
      });
      toast.success('Proposal created successfully');
      router.push('/dashboard/proposals');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create proposal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/proposals">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create Proposal</h1>
          <p className="text-muted-foreground text-sm">Create a new insurance proposal for a lead</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Proposal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leadName">Lead Name</Label>
                <Input id="leadName" value={formData.leadName} onChange={(e) => updateField('leadName', e.target.value)} placeholder="e.g., John Smith" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leadId">Lead ID (optional)</Label>
                <Input id="leadId" value={formData.leadId} onChange={(e) => updateField('leadId', e.target.value)} placeholder="e.g., 123" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="planType">Plan Type</Label>
                <Select value={formData.planType} onValueChange={(v) => updateField('planType', v)}>
                  <SelectTrigger><SelectValue placeholder="Select plan type..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual_health">Individual Health</SelectItem>
                    <SelectItem value="family_health">Family Health</SelectItem>
                    <SelectItem value="medicare_advantage">Medicare Advantage</SelectItem>
                    <SelectItem value="medicare_supplement">Medicare Supplement</SelectItem>
                    <SelectItem value="dental_vision">Dental & Vision</SelectItem>
                    <SelectItem value="group_health">Group / Employer</SelectItem>
                    <SelectItem value="life_insurance">Life Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="premium">Monthly Premium ($)</Label>
                <Input id="premium" type="number" value={formData.premium} onChange={(e) => updateField('premium', e.target.value)} placeholder="e.g., 299" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={formData.notes} onChange={(e) => updateField('notes', e.target.value)} placeholder="Additional notes about this proposal..." rows={4} />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/dashboard/proposals">
                <Button variant="outline" type="button">Cancel</Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : 'Create Proposal'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
