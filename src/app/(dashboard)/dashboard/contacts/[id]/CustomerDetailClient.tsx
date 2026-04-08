'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  DollarSign,
  MessageSquare,
  PhoneCall,
  FileText,
  Clock,
  Plus,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { useHealthShieldCrmStore } from '@/stores/healthshield-crm-store';
import type { BoatCustomer as InsuranceCustomer, BoatInteraction as CustomerInteraction, InteractionType } from '@/types/boat-crm';

const interactionTypeIcons: Record<string, typeof Phone> = {
  call: PhoneCall,
  email: Mail,
  sms: MessageSquare,
  note: FileText,
  meeting: Calendar,
};

const interactionTypeColors: Record<string, string> = {
  call: 'bg-blue-100 text-blue-800',
  email: 'bg-purple-100 text-purple-800',
  sms: 'bg-green-100 text-green-800',
  note: 'bg-yellow-100 text-yellow-800',
  meeting: 'bg-orange-100 text-orange-800',
};

export default function CustomerDetailClient() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const {
    fetchCustomer,
    fetchInteractionsForCustomer,
    createInteraction,
    interactions,
    interactionsLoading,
  } = useHealthShieldCrmStore();

  const [customer, setCustomer] = useState<InsuranceCustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [interactionDialogOpen, setInteractionDialogOpen] = useState(false);
  const [savingInteraction, setSavingInteraction] = useState(false);
  const [interactionForm, setInteractionForm] = useState({
    type: 'note' as InteractionType,
    direction: 'outbound' as 'inbound' | 'outbound',
    subject: '',
    content: '',
    outcome: '' as string,
  });

  useEffect(() => {
    if (customerId && customerId !== '_') {
      loadCustomer();
    }
  }, [customerId]);

  const loadCustomer = async () => {
    setLoading(true);
    const data = await fetchCustomer(customerId);
    setCustomer(data);
    setLoading(false);
    await fetchInteractionsForCustomer(Number(customerId));
  };

  const handleCreateInteraction = async () => {
    if (!interactionForm.content.trim()) {
      toast.error('Please enter interaction details');
      return;
    }
    setSavingInteraction(true);
    try {
      await createInteraction({
        customerId: Number(customerId),
        type: interactionForm.type,
        direction: interactionForm.direction,
        subject: interactionForm.subject,
        content: interactionForm.content,
        outcome: (interactionForm.outcome || undefined) as Parameters<typeof createInteraction>[0]['outcome'],
      });
      toast.success('Interaction logged');
      setInteractionDialogOpen(false);
      setInteractionForm({ type: 'note', direction: 'outbound', subject: '', content: '', outcome: '' });
      await fetchInteractionsForCustomer(Number(customerId));
    } catch {
      toast.error('Failed to log interaction');
    } finally {
      setSavingInteraction(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-64 col-span-1" />
          <Skeleton className="h-64 col-span-2" />
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Customer not found</h3>
        <p className="text-muted-foreground mt-1">This customer may have been removed.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard/contacts')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contacts
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/contacts')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <User className="h-6 w-6 text-blue-600" />
              {customer.firstName} {customer.lastName}
            </h1>
            <p className="text-muted-foreground mt-1">Customer Profile</p>
          </div>
        </div>
        <Button onClick={() => setInteractionDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Log Interaction
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Customer Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {customer.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline text-sm truncate">
                  {customer.email}
                </a>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <a href={`tel:${customer.phone}`} className="text-blue-600 hover:underline text-sm">
                  {customer.phone}
                </a>
              </div>
            )}
            {customer.createdAt && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">
                  Customer since {new Date(customer.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}

            <div className="border-t pt-4 mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Total Enrollments
                </span>
                <span className="font-semibold">{customer.totalEnrollments}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Total Spend
                </span>
                <span className="font-semibold text-green-600">${customer.totalSpent.toLocaleString()}</span>
              </div>
              {customer.lastEnrollmentDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Last Enrollment
                  </span>
                  <span className="text-sm">{new Date(customer.lastEnrollmentDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {customer.insurancePlans && customer.insurancePlans.length > 0 && (
              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-muted-foreground mb-2">Insurance Plans</p>
                <div className="flex flex-wrap gap-1">
                  {customer.insurancePlans?.map((plan) => (
                    <Badge key={plan} variant="outline" className="text-xs">{plan}</Badge>
                  ))}
                </div>
              </div>
            )}

            {customer.notes && (
              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p className="text-sm bg-muted p-3 rounded-md">{customer.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interaction Timeline */}
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                    Interaction History
                  </CardTitle>
                  <CardDescription>{interactions.length} interaction(s)</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setInteractionDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Log
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {interactionsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : interactions.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No interactions yet</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => setInteractionDialogOpen(true)}>
                    Log First Interaction
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {interactions.map((interaction: CustomerInteraction) => {
                    const TypeIcon = interactionTypeIcons[interaction.type] || FileText;
                    const colorClass = interactionTypeColors[interaction.type] || 'bg-gray-100 text-gray-800';

                    return (
                      <div key={interaction.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
                          <TypeIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">{interaction.type}</Badge>
                            <Badge variant="outline" className="text-xs">
                              {interaction.direction === 'inbound' ? '← In' : '→ Out'}
                            </Badge>
                            {interaction.outcome && (
                              <Badge variant="outline" className="text-xs">
                                {interaction.outcome === 'booked' ? (
                                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                                ) : interaction.outcome === 'not_interested' ? (
                                  <XCircle className="h-3 w-3 mr-1 text-red-500" />
                                ) : (
                                  <AlertCircle className="h-3 w-3 mr-1 text-yellow-500" />
                                )}
                                {interaction.outcome.replace('_', ' ')}
                              </Badge>
                            )}
                          </div>
                          {interaction.subject && (
                            <p className="font-medium text-sm">{interaction.subject}</p>
                          )}
                          <p className="text-sm text-muted-foreground line-clamp-2">{interaction.content}</p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(interaction.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Log Interaction Dialog */}
      <Dialog open={interactionDialogOpen} onOpenChange={setInteractionDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Log Interaction</DialogTitle>
            <DialogDescription>
              Record a call, email, SMS, meeting, or note for this customer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={interactionForm.type} onValueChange={(v) => setInteractionForm({ ...interactionForm, type: v as InteractionType })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Phone Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Direction</label>
                <Select value={interactionForm.direction} onValueChange={(v) => setInteractionForm({ ...interactionForm, direction: v as 'inbound' | 'outbound' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="outbound">Outbound</SelectItem>
                    <SelectItem value="inbound">Inbound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                placeholder="Brief subject..."
                value={interactionForm.subject}
                onChange={(e) => setInteractionForm({ ...interactionForm, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Details *</label>
              <Textarea
                placeholder="What happened..."
                value={interactionForm.content}
                onChange={(e) => setInteractionForm({ ...interactionForm, content: e.target.value })}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Outcome</label>
              <Select value={interactionForm.outcome || 'none'} onValueChange={(v) => setInteractionForm({ ...interactionForm, outcome: v === 'none' ? '' : v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No outcome</SelectItem>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="callback_requested">Callback Requested</SelectItem>
                  <SelectItem value="not_interested">Not Interested</SelectItem>
                  <SelectItem value="left_message">Left Message</SelectItem>
                  <SelectItem value="no_response">No Response</SelectItem>
                  <SelectItem value="needs_info">Needs Info</SelectItem>
                  <SelectItem value="referred">Referred</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInteractionDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateInteraction} disabled={savingInteraction}>
              <Send className="h-4 w-4 mr-2" />
              {savingInteraction ? 'Saving...' : 'Log Interaction'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
