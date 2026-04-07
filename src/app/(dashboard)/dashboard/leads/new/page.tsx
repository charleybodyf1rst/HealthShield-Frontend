'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { LEAD_SOURCES } from '@/lib/constants';
import { useLeadsStore } from '@/stores/leads-store';
import { toast } from 'sonner';
// Insurance plan options for lead creation
const fleetBoats = [
  { id: '1', name: 'Individual Health', slug: 'individual' },
  { id: '2', name: 'Family Health', slug: 'family' },
  { id: '3', name: 'Medicare Advantage', slug: 'medicare-advantage' },
  { id: '4', name: 'Medicare Supplement', slug: 'medicare-supplement' },
  { id: '5', name: 'Dental & Vision', slug: 'dental-vision' },
  { id: '6', name: 'Group / Employer', slug: 'group' },
];
import type { CreateLeadData } from '@/types/lead';

export default function NewLeadPage() {
  const router = useRouter();
  const { createLead } = useLeadsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateLeadData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    source: 'website',
    value: undefined,
    notes: '',
    rental_date: '',
    rental_time: '',
    boatName: undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createLead(formData);
      toast.success('Lead created successfully!');
      router.push('/dashboard/leads');
    } catch (error) {
      console.error('Failed to create lead:', error);
      toast.error('Failed to create lead. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof CreateLeadData, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Lead</h1>
          <p className="text-muted-foreground">
            Enter the lead's information below
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => updateField('phone', e.target.value)}
                required
              />
            </div>

            <div className="flex items-start gap-2 pt-2">
              <Checkbox id="sms_consent" className="mt-0.5" />
              <label htmlFor="sms_consent" className="text-sm text-muted-foreground leading-snug">
                I agree to receive SMS text messages from HealthShield including booking
                confirmations, reminders, and service updates. Message and data rates may apply.
                Message frequency varies. Reply STOP to cancel, HELP for help. View our{' '}
                <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">Privacy Policy</a>{' '}
                and{' '}
                <a href="/terms" target="_blank" className="text-blue-600 hover:underline">Terms of Service</a>.
              </label>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Lead Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source">Lead Source *</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => updateField('source', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_SOURCES.map((source) => (
                      <SelectItem key={source.id} value={source.id}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="boat">Boat</Label>
                <Select
                  value={formData.boatName || 'none'}
                  onValueChange={(value) => updateField('boatName', value === 'none' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select boat..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No boat selected</SelectItem>
                    {fleetBoats.map((boat) => (
                      <SelectItem key={boat.slug} value={boat.name}>
                        <div className="flex items-center gap-2">
                          <span>{boat.emoji}</span>
                          {boat.name} ({boat.capacity} guests)
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rental_date">Rental Date</Label>
                <Input
                  id="rental_date"
                  type="date"
                  value={formData.rental_date || ''}
                  onChange={(e) => updateField('rental_date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rental_time">Rental Time Slot</Label>
                <Select
                  value={formData.rental_time || 'none'}
                  onValueChange={(value) => updateField('rental_time', value === 'none' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time slot..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No time selected</SelectItem>
                    <SelectItem value="09:00-3hr">9:00 AM - 12:00 PM (3 hours)</SelectItem>
                    <SelectItem value="09:00-4hr">9:00 AM - 1:00 PM (4 hours)</SelectItem>
                    <SelectItem value="10:00-3hr">10:00 AM - 1:00 PM (3 hours)</SelectItem>
                    <SelectItem value="10:00-4hr">10:00 AM - 2:00 PM (4 hours)</SelectItem>
                    <SelectItem value="10:00-5hr">10:00 AM - 3:00 PM (5 hours)</SelectItem>
                    <SelectItem value="10:00-6hr">10:00 AM - 4:00 PM (6 hours)</SelectItem>
                    <SelectItem value="11:00-3hr">11:00 AM - 2:00 PM (3 hours)</SelectItem>
                    <SelectItem value="11:00-4hr">11:00 AM - 3:00 PM (4 hours)</SelectItem>
                    <SelectItem value="11:00-5hr">11:00 AM - 4:00 PM (5 hours)</SelectItem>
                    <SelectItem value="11:00-6hr">11:00 AM - 5:00 PM (6 hours)</SelectItem>
                    <SelectItem value="12:00-3hr">12:00 PM - 3:00 PM (3 hours)</SelectItem>
                    <SelectItem value="12:00-4hr">12:00 PM - 4:00 PM (4 hours)</SelectItem>
                    <SelectItem value="12:00-5hr">12:00 PM - 5:00 PM (5 hours)</SelectItem>
                    <SelectItem value="13:00-4hr">1:00 PM - 5:00 PM (4 hours)</SelectItem>
                    <SelectItem value="13:00-5hr">1:00 PM - 6:00 PM (5 hours)</SelectItem>
                    <SelectItem value="14:00-3hr">2:00 PM - 5:00 PM (3 hours)</SelectItem>
                    <SelectItem value="14:00-4hr">2:00 PM - 6:00 PM (4 hours)</SelectItem>
                    <SelectItem value="15:00-3hr">3:00 PM - 6:00 PM (3 hours)</SelectItem>
                    <SelectItem value="15:00-4hr">3:00 PM - 7:00 PM (4 hours)</SelectItem>
                    <SelectItem value="16:00-3hr">4:00 PM - 7:00 PM (3 hours)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Deal Value ($)</Label>
              <Input
                id="value"
                type="number"
                min="0"
                step="100"
                value={formData.value || ''}
                onChange={(e) =>
                  updateField(
                    'value',
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={4}
                value={formData.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Add any additional notes about this lead..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Lead'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
