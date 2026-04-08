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
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Trash2,
  FileText,
} from 'lucide-react';

const statusStyles: Record<string, string> = {
  paid: 'bg-green-500/10 text-green-600 border-green-500/20',
  Paid: 'bg-green-500/10 text-green-600 border-green-500/20',
  pending: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  Pending: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  overdue: 'bg-red-500/10 text-red-600 border-red-500/20',
  Overdue: 'bg-red-500/10 text-red-600 border-red-500/20',
  draft: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  Draft: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

function formatCurrency(value: number | string | undefined | null): string {
  if (value === undefined || value === null) return '$0';
  return `$${Number(value).toLocaleString()}`;
}

export default function InvoicesPage() {
  const {
    invoices,
    invoicesLoading,
    fetchInvoices,
    createInvoice,
    deleteInvoice,
  } = useFinanceStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    customer_name: '',
    plan_name: '',
    amount: '',
    due_date: '',
    description: '',
  });

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleCreate = async () => {
    if (!form.customer_name || !form.amount) {
      toast.error('Customer name and amount are required');
      return;
    }
    setCreating(true);
    try {
      await createInvoice({
        client_name: form.customer_name,
        project_name: form.plan_name,
        amount: parseFloat(form.amount),
        due_date: form.due_date,
        notes: form.description,
        status: 'draft',
      });
      toast.success('Invoice created successfully');
      setDialogOpen(false);
      setForm({ customer_name: '', plan_name: '', amount: '', due_date: '', description: '' });
      fetchInvoices();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create invoice');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deleteInvoice(id);
      toast.success('Invoice deleted successfully');
      setDeleteConfirmId(null);
      fetchInvoices();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete invoice');
    } finally {
      setDeleting(false);
    }
  };

  // Compute stats from real data
  const totalAmount = invoices.reduce((s, inv) => s + Number(inv.amount || 0), 0);
  const paidAmount = invoices.filter((i) => (i.status || '').toLowerCase() === 'paid').reduce((s, inv) => s + Number(inv.amount || 0), 0);
  const pendingAmount = invoices.filter((i) => (i.status || '').toLowerCase() === 'pending').reduce((s, inv) => s + Number(inv.amount || 0), 0);
  const overdueAmount = invoices.filter((i) => (i.status || '').toLowerCase() === 'overdue').reduce((s, inv) => s + Number(inv.amount || 0), 0);

  const stats = [
    { label: 'Total', value: formatCurrency(totalAmount), icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Paid', value: formatCurrency(paidAmount), icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Pending', value: formatCurrency(pendingAmount), icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Overdue', value: formatCurrency(overdueAmount), icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
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
            <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
            <p className="text-muted-foreground">Manage and track all invoices</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Invoice</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="customer_name">Customer Name *</Label>
                <Input
                  id="customer_name"
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  placeholder="e.g., Johnson Party"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="plan_name">Plan Name</Label>
                <Input
                  id="plan_name"
                  value={form.plan_name}
                  onChange={(e) => setForm({ ...form, plan_name: e.target.value })}
                  placeholder="e.g., Medicare Advantage"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Invoice description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? 'Creating...' : 'Create Invoice'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {invoicesLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-7 w-20" />
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

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {invoicesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="mx-auto h-10 w-10 mb-3 opacity-50" />
              <p className="text-lg font-medium">No invoices yet</p>
              <p className="text-sm mt-1">Create your first invoice to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Invoice #</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Plan</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv: any) => (
                    <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 font-medium">{inv.invoice_number || `INV-${inv.id}`}</td>
                      <td className="py-3">{inv.customer_name || '--'}</td>
                      <td className="py-3">{inv.plan_name || inv.service_name || '--'}</td>
                      <td className="py-3 text-muted-foreground">{inv.due_date || inv.created_at?.slice(0, 10) || '--'}</td>
                      <td className="py-3 font-semibold">{formatCurrency(inv.amount)}</td>
                      <td className="py-3">
                        <Badge variant="outline" className={statusStyles[inv.status] || 'bg-gray-500/10 text-gray-600'}>
                          {inv.status || 'Draft'}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Dialog
                            open={deleteConfirmId === String(inv.id)}
                            onOpenChange={(open) => !open && setDeleteConfirmId(null)}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                onClick={() => setDeleteConfirmId(String(inv.id))}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Invoice</DialogTitle>
                              </DialogHeader>
                              <p className="text-sm text-muted-foreground">
                                Are you sure you want to delete invoice {inv.invoice_number || `INV-${inv.id}`}? This action cannot be undone.
                              </p>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleDelete(String(inv.id))}
                                  disabled={deleting}
                                >
                                  {deleting ? 'Deleting...' : 'Delete'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
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
