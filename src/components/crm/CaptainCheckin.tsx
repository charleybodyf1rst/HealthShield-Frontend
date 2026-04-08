'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  CheckCircle,
  Circle,
  Clock,
  Users,
  FileCheck,
  UserPlus,
  UserCircle,
  PenTool,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  Phone,
  Mail,
  Baby,
} from 'lucide-react';
import { useHealthShieldCrmStore } from '@/stores/healthshield-crm-store';
import { SignaturePad } from './SignaturePad';
import { ClientConsentCard } from './ClientConsentCard';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { AppointmentConsentStatus, ClientConsentStatus, ConsentSignatureData } from '@/types/crm';

interface AgentCheckinProps {
  initialBooking?: AppointmentConsentStatus | null;
  onBack: () => void;
}

type Step = 'select' | 'passengers' | 'headcount' | 'depart';

export function AgentCheckin({ initialBooking, onBack }: AgentCheckinProps) {
  const [currentStep, setCurrentStep] = useState<Step>(initialBooking ? 'passengers' : 'select');
  const [selectedBooking, setSelectedBooking] = useState<AppointmentConsentStatus | null>(initialBooking || null);
  const [headCount, setHeadCount] = useState<number>(0);
  const [headCountNotes, setHeadCountNotes] = useState('');
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [signingPassenger, setSigningPassenger] = useState<ClientConsentStatus | null>(null);
  const [showAddPassengerDialog, setShowAddPassengerDialog] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForceDialog, setShowForceDialog] = useState(false);
  const [agentVerified, setAgentVerified] = useState<Record<number, boolean>>({});

  // Form state for signature collection
  const [signatureForm, setSignatureForm] = useState<Partial<ConsentSignatureData>>({
    acknowledgedRisks: false,
    acknowledgedRules: false,
    signatureType: 'drawn',
  });

  // Form state for adding new passenger
  const [newPassengerForm, setNewPassengerForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    isMinor: false,
  });

  const {
    todayConsentStatus,
    consentsLoading,
    fetchTodayConsents,
    fetchAppointmentConsents,
    sendConsentReminder,
    addWalkupPassenger,
    collectSignature,
    recordHeadCount,
    approveDeparture,
  } = useHealthShieldCrmStore();

  useEffect(() => {
    if (!initialBooking) {
      fetchTodayConsents();
    }
  }, [fetchTodayConsents, initialBooking]);

  useEffect(() => {
    if (selectedBooking) {
      setHeadCount(selectedBooking.consentsRequired);
    }
  }, [selectedBooking]);

  const handleSelectBooking = async (bookingId: number) => {
    const booking = await fetchAppointmentConsents(bookingId);
    if (booking) {
      setSelectedBooking(booking);
      setCurrentStep('passengers');
    }
  };

  const handleSendReminder = async (passengerId: number) => {
    if (!selectedBooking) return;
    try {
      await sendConsentReminder(selectedBooking.bookingId, passengerId);
      toast.success('Reminder sent');
      // Refresh booking data
      const updated = await fetchAppointmentConsents(selectedBooking.bookingId);
      if (updated) setSelectedBooking(updated);
    } catch {
      toast.error('Failed to send reminder');
    }
  };

  const handleOpenSignature = (passenger: ClientConsentStatus) => {
    setSigningPassenger(passenger);
    setSignatureForm({
      fullName: passenger.fullName,
      email: passenger.email || '',
      phone: passenger.phone || '',
      acknowledgedRisks: false,
      acknowledgedRules: false,
      signatureType: 'drawn',
      isMinor: passenger.isMinor,
    });
    setSignatureData(null);
    setShowSignatureDialog(true);
  };

  const handleSubmitSignature = async () => {
    if (!selectedBooking || !signingPassenger || !signatureData) return;

    if (!signatureForm.emergencyContactName || !signatureForm.emergencyContactPhone) {
      toast.error('Emergency contact required');
      return;
    }

    if (!signatureForm.acknowledgedRisks || !signatureForm.acknowledgedRules) {
      toast.error('You must acknowledge risks and rules');
      return;
    }

    setIsSubmitting(true);
    try {
      await collectSignature(selectedBooking.bookingId, signingPassenger.id, {
        fullName: signatureForm.fullName || signingPassenger.fullName,
        email: signatureForm.email,
        phone: signatureForm.phone,
        dateOfBirth: signatureForm.dateOfBirth,
        emergencyContactName: signatureForm.emergencyContactName!,
        emergencyContactPhone: signatureForm.emergencyContactPhone!,
        medicalConditions: signatureForm.medicalConditions,
        acknowledgedRisks: true,
        acknowledgedRules: true,
        signatureData: signatureData,
        signatureType: 'drawn',
        isMinor: signatureForm.isMinor,
        guardianName: signatureForm.guardianName,
        guardianRelationship: signatureForm.guardianRelationship,
      });

      toast.success('Consent signed successfully');
      setShowSignatureDialog(false);

      // Refresh booking data
      const updated = await fetchAppointmentConsents(selectedBooking.bookingId);
      if (updated) setSelectedBooking(updated);
    } catch {
      toast.error('Failed to save signature');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPassenger = async () => {
    if (!selectedBooking || !newPassengerForm.fullName.trim()) return;

    setIsSubmitting(true);
    try {
      await addWalkupPassenger(selectedBooking.bookingId, {
        fullName: newPassengerForm.fullName,
        email: newPassengerForm.email || undefined,
        phone: newPassengerForm.phone || undefined,
        isMinor: newPassengerForm.isMinor,
      });

      toast.success('Client added');
      setShowAddPassengerDialog(false);
      setNewPassengerForm({ fullName: '', email: '', phone: '', isMinor: false });

      // Refresh booking data
      const updated = await fetchAppointmentConsents(selectedBooking.bookingId);
      if (updated) setSelectedBooking(updated);
    } catch {
      toast.error('Failed to add client');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordHeadCount = async () => {
    if (!selectedBooking) return;

    setIsSubmitting(true);
    try {
      const result = await recordHeadCount(selectedBooking.bookingId, headCount, headCountNotes);

      if (result.discrepancy > 0) {
        toast.warning(`${result.discrepancy} clients still need consent forms`);
      } else {
        toast.success('Head count recorded');
      }

      setCurrentStep('depart');
    } catch {
      toast.error('Failed to record head count');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveDeparture = async (forceDepart = false) => {
    if (!selectedBooking) return;

    const allSigned = selectedBooking.consentsCollected >= selectedBooking.consentsRequired;

    // If consents missing and not forcing, show confirmation dialog
    if (!allSigned && !forceDepart) {
      setShowForceDialog(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await approveDeparture(selectedBooking.bookingId, forceDepart);
      if (forceDepart && !allSigned) {
        toast.warning('Enrollment approved - Manager has been notified of missing consent forms');
      } else {
        toast.success('Enrollment approved! Processing complete.');
      }
      setShowForceDialog(false);
      onBack();
    } catch {
      toast.error('Failed to approve enrollment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAgentVerified = (passengerId: number) => {
    setAgentVerified(prev => ({
      ...prev,
      [passengerId]: !prev[passengerId],
    }));
  };

  const unsignedPassengers = selectedBooking?.passengers.filter(p => !p.consentSigned) || [];
  const missingCount = unsignedPassengers.length;

  const progress = selectedBooking
    ? (selectedBooking.consentsCollected / selectedBooking.consentsRequired) * 100
    : 0;

  // Step 1: Select Booking
  if (currentStep === 'select') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Agent Check-in</h2>
            <p className="text-slate-500">Select a booking to begin consent verification</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-500" />
              Today&apos;s Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {consentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : todayConsentStatus.length > 0 ? (
              <div className="space-y-3">
                {todayConsentStatus.map((booking) => (
                  <button
                    key={booking.bookingId}
                    onClick={() => handleSelectBooking(booking.bookingId)}
                    className={cn(
                      'w-full p-4 rounded-lg border text-left transition-all hover:shadow-md',
                      booking.status === 'complete'
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-white border-slate-200 hover:border-blue-300'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'p-3 rounded-xl',
                          booking.status === 'complete' ? 'bg-emerald-100' : 'bg-slate-100'
                        )}>
                          <FileCheck className={cn(
                            'w-6 h-6',
                            booking.status === 'complete' ? 'text-emerald-600' : 'text-slate-500'
                          )} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{booking.serviceName}</h3>
                          <p className="text-slate-500">{booking.customerName}</p>
                          <p className="text-sm text-slate-400">{booking.startTime}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={cn(
                            booking.status === 'complete'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-yellow-100 text-yellow-700'
                          )}
                        >
                          {booking.consentsCollected}/{booking.consentsRequired} consents
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                No appointments for today
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Steps 2-4 require a selected booking
  if (!selectedBooking) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{selectedBooking.serviceName}</h2>
            <p className="text-slate-500">{selectedBooking.customerName} • {selectedBooking.startTime}</p>
          </div>
        </div>
        <Badge
          className={cn(
            'text-lg px-4 py-2',
            selectedBooking.status === 'complete'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-yellow-100 text-yellow-700'
          )}
        >
          {selectedBooking.consentsCollected}/{selectedBooking.consentsRequired} Consents
        </Badge>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Consent Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress
            value={progress}
            className={cn(
              'h-3',
              progress === 100 ? '[&>div]:bg-emerald-500' : '[&>div]:bg-blue-500'
            )}
          />
        </CardContent>
      </Card>

      {/* Step Navigation */}
      <div className="flex items-center justify-center gap-4">
        {['passengers', 'headcount', 'depart'].map((step, index) => (
          <div key={step} className="flex items-center">
            <button
              onClick={() => setCurrentStep(step as Step)}
              disabled={step === 'depart' && selectedBooking.status !== 'complete'}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                currentStep === step
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <span className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium',
                currentStep === step ? 'bg-blue-600 text-white' : 'bg-slate-200'
              )}>
                {index + 1}
              </span>
              <span className="capitalize">{step === 'headcount' ? 'Head Count' : step}</span>
            </button>
            {index < 2 && <div className="w-8 h-px bg-slate-200 mx-2" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {currentStep === 'passengers' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Client Checklist
              </CardTitle>
              <CardDescription>
                Verify all clients have signed their consent forms
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => setShowAddPassengerDialog(true)}
              className="gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add Client
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3 pr-4">
                {selectedBooking.passengers.map((passenger) => {
                  const isVerified = agentVerified[passenger.id] || false;
                  return (
                    <div
                      key={passenger.id}
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-xl border-2 transition-all',
                        isVerified
                          ? 'bg-emerald-50 border-emerald-300'
                          : passenger.consentSigned
                            ? 'bg-yellow-50 border-yellow-300'
                            : 'bg-red-50 border-red-300'
                      )}
                    >
                      {/* Photo */}
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
                        {passenger.photoUrl ? (
                          <img
                            src={passenger.photoUrl}
                            alt={passenger.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserCircle className="w-full h-full text-slate-400" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-lg truncate">{passenger.fullName}</p>
                        <div className="flex items-center gap-2 text-sm">
                          {passenger.consentSigned ? (
                            <span className="text-emerald-600 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Consent Signed
                            </span>
                          ) : (
                            <span className="text-red-600 flex items-center gap-1">
                              <AlertTriangle className="w-4 h-4" />
                              Consent Missing
                            </span>
                          )}
                          {passenger.isMinor && (
                            <Badge variant="outline" className="text-xs">
                              <Baby className="w-3 h-3 mr-1" />
                              Minor
                            </Badge>
                          )}
                        </div>
                        {!passenger.consentSigned && (
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendReminder(passenger.id)}
                              className="text-xs"
                            >
                              Send Reminder
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleOpenSignature(passenger)}
                              className="text-xs"
                            >
                              Sign Now
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Agent Check-off Button */}
                      <Button
                        variant={isVerified ? 'default' : 'outline'}
                        size="lg"
                        onClick={() => toggleAgentVerified(passenger.id)}
                        className={cn(
                          'w-20 h-20 flex-shrink-0 p-0',
                          isVerified && 'bg-emerald-600 hover:bg-emerald-700'
                        )}
                      >
                        {isVerified ? (
                          <CheckCircle className="w-10 h-10" />
                        ) : (
                          <Circle className="w-10 h-10" />
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="mt-6 pt-4 border-t flex justify-end">
              <Button
                onClick={() => setCurrentStep('headcount')}
                className="gap-2"
              >
                Continue to Head Count
                <Users className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'headcount' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Record Head Count
            </CardTitle>
            <CardDescription>
              Verify all clients present for the enrollment session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-slate-50">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-slate-500">Expected</p>
                  <p className="text-3xl font-bold">{selectedBooking.consentsRequired}</p>
                </CardContent>
              </Card>
              <Card className="bg-emerald-50">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-emerald-600">Consents Signed</p>
                  <p className="text-3xl font-bold text-emerald-700">
                    {selectedBooking.consentsCollected}
                  </p>
                </CardContent>
              </Card>
              <Card className={cn(
                headCount !== selectedBooking.consentsRequired ? 'bg-yellow-50' : 'bg-blue-50'
              )}>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-slate-500">Actual Count</p>
                  <Input
                    type="number"
                    value={headCount}
                    onChange={(e) => setHeadCount(parseInt(e.target.value) || 0)}
                    className="text-3xl font-bold text-center h-auto py-0 border-0 bg-transparent"
                    min={1}
                    max={100}
                  />
                </CardContent>
              </Card>
            </div>

            {headCount !== selectedBooking.consentsRequired && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Head count mismatch</p>
                  <p className="text-sm text-yellow-700">
                    Expected {selectedBooking.consentsRequired} clients, counted {headCount}.
                    {headCount > selectedBooking.consentsCollected && (
                      <span className="block mt-1">
                        {headCount - selectedBooking.consentsCollected} clients need to sign consent forms.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={headCountNotes}
                onChange={(e) => setHeadCountNotes(e.target.value)}
                placeholder="Any notes about the head count..."
                className="mt-1"
              />
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setCurrentStep('passengers')}>
                Back to Clients
              </Button>
              <Button
                onClick={handleRecordHeadCount}
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Record Head Count
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'depart' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Enrollment Approval
            </CardTitle>
            <CardDescription>
              Final check before completing enrollment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Clients</p>
                <p className="text-2xl font-bold">{headCount}</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg">
                <p className="text-sm text-emerald-600">Consents Signed</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {selectedBooking.consentsCollected}
                </p>
              </div>
            </div>

            {selectedBooking.status === 'complete' ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-emerald-700">All Clear!</h3>
                <p className="text-emerald-600">All consent forms collected. Ready to proceed.</p>
              </div>
            ) : (
              <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-yellow-700">Missing Consent Forms</h3>
                <p className="text-yellow-600 mb-4">
                  {missingCount} client{missingCount > 1 ? 's' : ''} still need to sign consent forms
                </p>
                <div className="flex justify-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('passengers')}
                  >
                    Collect Consent Forms
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowForceDialog(true)}
                  >
                    Proceed Anyway
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setCurrentStep('headcount')}>
                Back to Head Count
              </Button>
              <Button
                onClick={() => handleApproveDeparture(false)}
                disabled={isSubmitting}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                Approve Enrollment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Signature Dialog */}
      <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PenTool className="w-5 h-5" />
              Collect Consent Signature
            </DialogTitle>
            <DialogDescription>
              {signingPassenger?.fullName} - Sign consent form on agent&apos;s device
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sig-name">Full Name</Label>
                <Input
                  id="sig-name"
                  value={signatureForm.fullName || ''}
                  onChange={(e) => setSignatureForm(prev => ({ ...prev, fullName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="sig-dob">Date of Birth</Label>
                <Input
                  id="sig-dob"
                  type="date"
                  value={signatureForm.dateOfBirth || ''}
                  onChange={(e) => setSignatureForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sig-email">Email</Label>
                <Input
                  id="sig-email"
                  type="email"
                  value={signatureForm.email || ''}
                  onChange={(e) => setSignatureForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="sig-phone">Phone</Label>
                <Input
                  id="sig-phone"
                  type="tel"
                  value={signatureForm.phone || ''}
                  onChange={(e) => setSignatureForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sig-emergency-name">Emergency Contact Name *</Label>
                <Input
                  id="sig-emergency-name"
                  value={signatureForm.emergencyContactName || ''}
                  onChange={(e) => setSignatureForm(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="sig-emergency-phone">Emergency Contact Phone *</Label>
                <Input
                  id="sig-emergency-phone"
                  type="tel"
                  value={signatureForm.emergencyContactPhone || ''}
                  onChange={(e) => setSignatureForm(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="sig-medical">Medical Conditions (optional)</Label>
              <Textarea
                id="sig-medical"
                value={signatureForm.medicalConditions || ''}
                onChange={(e) => setSignatureForm(prev => ({ ...prev, medicalConditions: e.target.value }))}
                placeholder="Any allergies, conditions, or medications..."
              />
            </div>

            {signingPassenger?.isMinor && (
              <div className="p-4 bg-blue-50 rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-blue-700">
                  <Baby className="w-5 h-5" />
                  <span className="font-medium">Minor - Guardian Information Required</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sig-guardian">Guardian Name *</Label>
                    <Input
                      id="sig-guardian"
                      value={signatureForm.guardianName || ''}
                      onChange={(e) => setSignatureForm(prev => ({ ...prev, guardianName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sig-relationship">Relationship *</Label>
                    <Select
                      value={signatureForm.guardianRelationship || ''}
                      onValueChange={(v) => setSignatureForm(prev => ({ ...prev, guardianRelationship: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="guardian">Legal Guardian</SelectItem>
                        <SelectItem value="grandparent">Grandparent</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="ack-risks"
                  checked={signatureForm.acknowledgedRisks}
                  onCheckedChange={(checked) => setSignatureForm(prev => ({ ...prev, acknowledgedRisks: !!checked }))}
                />
                <Label htmlFor="ack-risks" className="text-sm leading-tight cursor-pointer">
                  I acknowledge that I have reviewed the insurance terms, conditions, and disclosures. I understand the coverage details and limitations.
                </Label>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="ack-rules"
                  checked={signatureForm.acknowledgedRules}
                  onCheckedChange={(checked) => setSignatureForm(prev => ({ ...prev, acknowledgedRules: !!checked }))}
                />
                <Label htmlFor="ack-rules" className="text-sm leading-tight cursor-pointer">
                  I agree to provide accurate information and comply with all policy terms, enrollment requirements, and regulatory guidelines.
                </Label>
              </div>
            </div>

            <SignaturePad
              onSignatureChange={setSignatureData}
              label="Signature"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignatureDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitSignature}
              disabled={isSubmitting || !signatureData}
              className="gap-2"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Submit Consent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Client Dialog */}
      <Dialog open={showAddPassengerDialog} onOpenChange={setShowAddPassengerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Add Walk-in Client
            </DialogTitle>
            <DialogDescription>
              Add a client who wasn&apos;t on the original appointment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="new-name">Full Name *</Label>
              <Input
                id="new-name"
                value={newPassengerForm.fullName}
                onChange={(e) => setNewPassengerForm(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="new-email">Email</Label>
              <Input
                id="new-email"
                type="email"
                value={newPassengerForm.email}
                onChange={(e) => setNewPassengerForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@email.com"
              />
            </div>
            <div>
              <Label htmlFor="new-phone">Phone</Label>
              <Input
                id="new-phone"
                type="tel"
                value={newPassengerForm.phone}
                onChange={(e) => setNewPassengerForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(512) 555-1234"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="new-minor"
                checked={newPassengerForm.isMinor}
                onCheckedChange={(checked) => setNewPassengerForm(prev => ({ ...prev, isMinor: !!checked }))}
              />
              <Label htmlFor="new-minor">This is a minor (under 18)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPassengerDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddPassenger}
              disabled={isSubmitting || !newPassengerForm.fullName.trim()}
              className="gap-2"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              Add Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Force Enrollment Dialog - Manager Alert Warning */}
      <AlertDialog open={showForceDialog} onOpenChange={setShowForceDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              Missing Consent Forms!
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 mt-4">
                <p className="font-semibold text-slate-700">
                  {missingCount} client{missingCount > 1 ? 's have' : ' has'} NOT signed consent forms:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  {unsignedPassengers.map(p => (
                    <li key={p.id} className="text-red-600 font-medium">{p.fullName}</li>
                  ))}
                </ul>
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mt-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ If you proceed, <strong>management will be immediately notified via SMS and email</strong> and this will be logged as a policy violation.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back &amp; Collect Consent Forms</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleApproveDeparture(true)}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Proceed Anyway (Alert Manager)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
