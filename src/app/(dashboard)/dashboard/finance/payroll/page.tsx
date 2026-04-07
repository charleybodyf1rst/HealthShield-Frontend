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
  Users,
  Trash2,
} from 'lucide-react';

const roleStyles: Record<string, string> = {
  Agent: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  agent: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  Sales: 'bg-green-500/10 text-green-600 border-green-500/20',
  sales: 'bg-green-500/10 text-green-600 border-green-500/20',
  Admin: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  admin: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
};

const statusStyles: Record<string, string> = {
  Paid: 'bg-green-500/10 text-green-600 border-green-500/20',
  paid: 'bg-green-500/10 text-green-600 border-green-500/20',
  Pending: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  pending: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  processed: 'bg-green-500/10 text-green-600 border-green-500/20',
};

function formatCurrency(value: number | string | undefined | null): string {
  if (value === undefined || value === null) return '$0';
  return `$${Number(value).toLocaleString()}`;
}

export default function PayrollPage() {
  const {
    payroll,
    payrollLoading,
    fetchPayroll,
    createPayroll,
    deletePayroll,
  } = useFinanceStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    employee_name: '',
    role: '',
    pay_rate: '',
    hours: '',
    period: '',
  });

  useEffect(() => {
    fetchPayroll();
  }, [fetchPayroll]);

  const handleCreate = async () => {
    if (!form.employee_name || !form.pay_rate || !form.hours) {
      toast.error('Employee name, pay rate, and hours are required');
      return;
    }
    setCreating(true);
    try {
      const rate = parseFloat(form.pay_rate);
      const hours = parseFloat(form.hours);
      await createPayroll({
        employee_name: form.employee_name,
        department: form.role || 'Agent',
        base_salary: rate * hours,
        net_pay: rate * hours,
        pay_period_start: new Date().toISOString().slice(0, 10),
        pay_period_end: new Date().toISOString().slice(0, 10),
        status: 'pending',
      });
      toast.success('Payroll entry added successfully');
      setDialogOpen(false);
      setForm({ employee_name: '', role: '', pay_rate: '', hours: '', period: '' });
      fetchPayroll();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add payroll entry');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deletePayroll(id);
      toast.success('Payroll entry deleted successfully');
      setDeleteConfirmId(null);
      fetchPayroll();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete payroll entry');
    } finally {
      setDeleting(false);
    }
  };

  const totalPayroll = payroll.reduce((sum, p: any) => {
    const total = p.total_pay || p.total || (Number(p.pay_rate || 0) * Number(p.hours || 0));
    return sum + Number(total);
  }, 0);

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
            <h1 className="text-2xl font-bold tracking-tight">Payroll</h1>
            <p className="text-muted-foreground">Manage agent and staff payroll</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Payroll Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Payroll Entry</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="pr-name">Employee Name *</Label>
                <Input
                  id="pr-name"
                  value={form.employee_name}
                  onChange={(e) => setForm({ ...form, employee_name: e.target.value })}
                  placeholder="e.g., Agent Mike Reynolds"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pr-role">Role</Label>
                <Input
                  id="pr-role"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="e.g., Agent, Sales, Admin"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pr-rate">Pay Rate ($/hr) *</Label>
                <Input
                  id="pr-rate"
                  type="number"
                  step="0.01"
                  value={form.pay_rate}
                  onChange={(e) => setForm({ ...form, pay_rate: e.target.value })}
                  placeholder="35.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pr-hours">Hours *</Label>
                <Input
                  id="pr-hours"
                  type="number"
                  step="0.5"
                  value={form.hours}
                  onChange={(e) => setForm({ ...form, hours: e.target.value })}
                  placeholder="40"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pr-period">Period</Label>
                <Input
                  id="pr-period"
                  value={form.period}
                  onChange={(e) => setForm({ ...form, period: e.target.value })}
                  placeholder="e.g., weekly, bi-weekly, monthly"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? 'Adding...' : 'Add Entry'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      {payrollLoading ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-24 mb-1" />
            <Skeleton className="h-4 w-20" />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Payroll This Period</CardTitle>
            <div className="p-2 rounded-full bg-green-500/10">
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPayroll)}</div>
            <p className="text-sm text-muted-foreground">{payroll.length} team members</p>
          </CardContent>
        </Card>
      )}

      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Payroll</CardTitle>
        </CardHeader>
        <CardContent>
          {payrollLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : payroll.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="mx-auto h-10 w-10 mb-3 opacity-50" />
              <p className="text-lg font-medium">No payroll entries yet</p>
              <p className="text-sm mt-1">Add your first payroll entry to start tracking.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Role</th>
                    <th className="pb-3 font-medium">Pay Rate</th>
                    <th className="pb-3 font-medium">Hours</th>
                    <th className="pb-3 font-medium">Total Pay</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payroll.map((person: any) => {
                    const totalPay = person.total_pay || person.total || (Number(person.pay_rate || 0) * Number(person.hours || 0));
                    return (
                      <tr key={person.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 font-medium">{person.employee_name || person.name || '--'}</td>
                        <td className="py-3">
                          <Badge variant="outline" className={roleStyles[person.role] || 'bg-gray-500/10 text-gray-600'}>
                            {person.role || 'Staff'}
                          </Badge>
                        </td>
                        <td className="py-3 text-muted-foreground">${Number(person.pay_rate || 0).toFixed(0)}/hr</td>
                        <td className="py-3">{person.hours || 0}</td>
                        <td className="py-3 font-semibold">{formatCurrency(totalPay)}</td>
                        <td className="py-3">
                          <Badge variant="outline" className={statusStyles[person.status] || 'bg-orange-500/10 text-orange-600'}>
                            {person.status || 'Pending'}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Dialog
                            open={deleteConfirmId === String(person.id)}
                            onOpenChange={(open) => !open && setDeleteConfirmId(null)}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                onClick={() => setDeleteConfirmId(String(person.id))}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Payroll Entry</DialogTitle>
                              </DialogHeader>
                              <p className="text-sm text-muted-foreground">
                                Are you sure you want to delete the payroll entry for {person.employee_name || person.name}? This action cannot be undone.
                              </p>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleDelete(String(person.id))}
                                  disabled={deleting}
                                >
                                  {deleting ? 'Deleting...' : 'Delete'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
