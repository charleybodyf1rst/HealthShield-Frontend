'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { useFinanceStore } from '@/stores/finance-store';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Plus,
  CheckCircle,
  Clock,
  RotateCcw,
  CreditCard,
  DollarSign,
} from 'lucide-react';

const statusStyles: Record<string, string> = {
  Completed: 'bg-green-500/10 text-green-600 border-green-500/20',
  completed: 'bg-green-500/10 text-green-600 border-green-500/20',
  Pending: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  pending: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  Refunded: 'bg-red-500/10 text-red-600 border-red-500/20',
  refunded: 'bg-red-500/10 text-red-600 border-red-500/20',
};

const methodStyles: Record<string, string> = {
  Visa: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  visa: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  Cash: 'bg-green-500/10 text-green-600 border-green-500/20',
  cash: 'bg-green-500/10 text-green-600 border-green-500/20',
  Venmo: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  venmo: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  card: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  bank_transfer: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
};

function formatCurrency(value: number | string | undefined | null): string {
  if (value === undefined || value === null) return '$0';
  return `$${Number(value).toLocaleString()}`;
}

export default function PaymentsPage() {
  const {
    payments,
    paymentsLoading,
    fetchPayments,
    createPayment,
  } = useFinanceStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    customer_name: '',
    amount: '',
    method: '',
    reference: '',
  });

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleCreate = async () => {
    if (!form.customer_name || !form.amount) {
      toast.error('Customer name and amount are required');
      return;
    }
    setCreating(true);
    try {
      await createPayment({
        customer_name: form.customer_name,
        amount: parseFloat(form.amount),
        method: (form.method || 'cash').toLowerCase().replace(/\s+/g, '_'),
        reference: form.reference,
      });
      toast.success('Payment recorded successfully');
      setDialogOpen(false);
      setForm({ customer_name: '', amount: '', method: '', reference: '' });
      fetchPayments();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to record payment');
    } finally {
      setCreating(false);
    }
  };

  // Compute stats from real data
  const receivedAmount = payments
    .filter((p: any) => (p.status || '').toLowerCase() === 'completed')
    .reduce((s, p) => s + Number(p.amount || 0), 0);
  const pendingAmount = payments
    .filter((p: any) => (p.status || '').toLowerCase() === 'pending')
    .reduce((s, p) => s + Number(p.amount || 0), 0);
  const refundedAmount = payments
    .filter((p: any) => (p.status || '').toLowerCase() === 'refunded')
    .reduce((s, p) => s + Number(p.amount || 0), 0);

  const stats = [
    { label: 'Received', value: formatCurrency(receivedAmount), icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Pending', value: formatCurrency(pendingAmount), icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Refunded', value: formatCurrency(refundedAmount), icon: RotateCcw, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/finance">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
            <p className="text-muted-foreground">Track customer payments and refunds</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="pmt-customer">Customer Name *</Label>
                <Input
                  id="pmt-customer"
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  placeholder="e.g., Johnson Party"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pmt-amount">Amount *</Label>
                <Input
                  id="pmt-amount"
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pmt-method">Payment Method</Label>
                <select
                  id="pmt-method"
                  title="Payment method"
                  value={form.method}
                  onChange={(e) => setForm({ ...form, method: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select method...</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="visa">Visa</option>
                  <option value="mastercard">Mastercard</option>
                  <option value="amex">American Express</option>
                  <option value="debit">Debit Card</option>
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="bank_transfer">Bank Transfer / ACH</option>
                  <option value="venmo">Venmo</option>
                  <option value="zelle">Zelle</option>
                  <option value="paypal">PayPal</option>
                  <option value="apple_pay">Apple Pay</option>
                  <option value="google_pay">Google Pay</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pmt-reference">Reference</Label>
                <Input
                  id="pmt-reference"
                  value={form.reference}
                  onChange={(e) => setForm({ ...form, reference: e.target.value })}
                  placeholder="Transaction reference or note"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? 'Recording...' : 'Record Payment'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {paymentsLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-7 w-24" />
                </CardContent>
              </Card>
            ))
          : stats.map((stat) => (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                  <div className={`p-2 rounded-full ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="mx-auto h-10 w-10 mb-3 opacity-50" />
              <p className="text-lg font-medium">No payments yet</p>
              <p className="text-sm mt-1">Record your first payment to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Method</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((pmt: any) => (
                    <tr key={pmt.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 font-medium">{pmt.customer_name || '--'}</td>
                      <td className="py-3">
                        <Badge variant="outline" className={methodStyles[pmt.method] || 'bg-gray-500/10 text-gray-600'}>
                          <CreditCard className="mr-1 h-3 w-3" />
                          {pmt.method || 'N/A'}
                        </Badge>
                      </td>
                      <td className="py-3 font-semibold">{formatCurrency(pmt.amount)}</td>
                      <td className="py-3 text-muted-foreground">{pmt.date || pmt.created_at?.slice(0, 10) || '--'}</td>
                      <td className="py-3">
                        <Badge variant="outline" className={statusStyles[pmt.status] || 'bg-gray-500/10 text-gray-600'}>
                          {pmt.status || 'Pending'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
