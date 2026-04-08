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
    employer_name: '',
    contact_name: '',
    contact_email: '',
    employee_count: '',
    proposed_tier: '',
    proposed_pepm: '',
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
        employer_name: formData.employer_name,
        contact_name: formData.contact_name || undefined,
        contact_email: formData.contact_email || undefined,
        employee_count: parseInt(formData.employee_count) || 1,
        proposed_tier: formData.proposed_tier,
        proposed_pepm: parseFloat(formData.proposed_pepm) || undefined,
        notes: formData.notes || undefined,
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
            <div className="space-y-2">
              <Label htmlFor="employer_name">Employer / Organization Name *</Label>
              <Input id="employer_name" value={formData.employer_name} onChange={(e) => updateField('employer_name', e.target.value)} placeholder="e.g., Acme Corporation" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_name">Contact Name</Label>
                <Input id="contact_name" value={formData.contact_name} onChange={(e) => updateField('contact_name', e.target.value)} placeholder="e.g., John Smith" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input id="contact_email" type="email" value={formData.contact_email} onChange={(e) => updateField('contact_email', e.target.value)} placeholder="e.g., john@acme.com" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="proposed_tier">Proposed Tier *</Label>
                <Select value={formData.proposed_tier} onValueChange={(v) => updateField('proposed_tier', v)}>
                  <SelectTrigger><SelectValue placeholder="Select tier..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic ($25/mo PEPM)</SelectItem>
                    <SelectItem value="standard">Standard ($45/mo PEPM)</SelectItem>
                    <SelectItem value="premium">Premium ($65/mo PEPM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee_count">Employee Count *</Label>
                <Input id="employee_count" type="number" value={formData.employee_count} onChange={(e) => updateField('employee_count', e.target.value)} placeholder="e.g., 50" required />
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
