'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { insuranceApi } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

export default function NewProgramPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employer_name: '',
    program_tier: '',
    monthly_pepm: '',
    total_employees: '',
    deductible_option: '',
    first_dollar_coverage: false,
    wellness_activities: '',
    notes: '',
  });

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await insuranceApi.createProgram({
        employer_name: formData.employer_name,
        program_tier: formData.program_tier,
        monthly_pepm: parseFloat(formData.monthly_pepm) || 0,
        total_employees: parseInt(formData.total_employees) || 0,
        deductible_option: formData.deductible_option || null,
        first_dollar_coverage: formData.first_dollar_coverage,
        wellness_activities: formData.wellness_activities
          ? formData.wellness_activities.split(',').map((s) => s.trim())
          : null,
        notes: formData.notes,
        status: 'active',
      });
      toast.success('Program created successfully');
      router.push('/dashboard/programs');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create program');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/programs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6" />
            Create Insurance Program
          </h1>
          <p className="text-muted-foreground text-sm">
            Set up a new health insurance program
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Program Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employer_name">Employer / Organization Name *</Label>
              <Input
                id="employer_name"
                value={formData.employer_name}
                onChange={(e) => updateField('employer_name', e.target.value)}
                placeholder="e.g., Acme Corporation"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="program_tier">Program Tier *</Label>
                <Select
                  value={formData.program_tier}
                  onValueChange={(v) => updateField('program_tier', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tier..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic ($25/mo PEPM)</SelectItem>
                    <SelectItem value="standard">Standard ($45/mo PEPM)</SelectItem>
                    <SelectItem value="premium">Premium ($65/mo PEPM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly_pepm">Monthly PEPM ($)</Label>
                <Input
                  id="monthly_pepm"
                  type="number"
                  value={formData.monthly_pepm}
                  onChange={(e) => updateField('monthly_pepm', e.target.value)}
                  placeholder="e.g., 45.00"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_employees">Total Employees</Label>
                <Input
                  id="total_employees"
                  type="number"
                  value={formData.total_employees}
                  onChange={(e) => updateField('total_employees', e.target.value)}
                  placeholder="e.g., 250"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deductible_option">Deductible Option</Label>
                <Select
                  value={formData.deductible_option}
                  onValueChange={(v) => updateField('deductible_option', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select deductible..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="500">$500</SelectItem>
                    <SelectItem value="1000">$1,000</SelectItem>
                    <SelectItem value="1500">$1,500</SelectItem>
                    <SelectItem value="2500">$2,500</SelectItem>
                    <SelectItem value="5000">$5,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wellness_activities">
                Wellness Activities (comma-separated)
              </Label>
              <Input
                id="wellness_activities"
                value={formData.wellness_activities}
                onChange={(e) =>
                  updateField('wellness_activities', e.target.value)
                }
                placeholder="e.g., gym membership, health screenings, mental health support"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Additional notes about this program..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/dashboard/programs">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Program'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}