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
  Fuel,
  Wrench,
  Building2,
  Shield,
  Trash2,
  Receipt,
} from 'lucide-react';

const categoryStyles: Record<string, string> = {
  fuel: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  maintenance: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  insurance: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  facilities: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  agent_commission: 'bg-green-500/10 text-green-600 border-green-500/20',
  registration: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  equipment: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  marketing: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  office: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  utilities: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  cleaning: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
  supplies: 'bg-lime-500/10 text-lime-600 border-lime-500/20',
  other: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

function formatCurrency(value: number | string | undefined | null): string {
  if (value === undefined || value === null) return '$0';
  return `$${Number(value).toLocaleString()}`;
}

export default function ExpensesPage() {
  const {
    expenses,
    expensesLoading,
    fetchExpenses,
    createExpense,
    deleteExpense,
  } = useFinanceStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    description: '',
    category: '',
    amount: '',
    vendor: '',
    date: '',
  });

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleCreate = async () => {
    if (!form.description || !form.amount) {
      toast.error('Description and amount are required');
      return;
    }
    setCreating(true);
    try {
      await createExpense({
        description: form.description,
        category: form.category,
        amount: parseFloat(form.amount),
        vendor: form.vendor,
        expense_date: form.date || new Date().toISOString().slice(0, 10),
      });
      toast.success('Expense added successfully');
      setDialogOpen(false);
      setForm({ description: '', category: '', amount: '', vendor: '', date: '' });
      fetchExpenses();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add expense');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deleteExpense(id);
      toast.success('Expense deleted successfully');
      setDeleteConfirmId(null);
      fetchExpenses();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete expense');
    } finally {
      setDeleting(false);
    }
  };

  // Compute stats from real data
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const byCategory = expenses.reduce((acc: Record<string, number>, e: any) => {
    const cat = e.category || 'Other';
    acc[cat] = (acc[cat] || 0) + Number(e.amount || 0);
    return acc;
  }, {});

  const statIcons: Record<string, any> = { Fuel: Fuel, fuel: Fuel, Maintenance: Wrench, maintenance: Wrench, Facilities: Building2, facilities: Building2, Insurance: Shield, insurance: Shield };
  const statColors: Record<string, { color: string; bg: string }> = {
    Fuel: { color: 'text-orange-500', bg: 'bg-orange-500/10' },
    fuel: { color: 'text-orange-500', bg: 'bg-orange-500/10' },
    Maintenance: { color: 'text-blue-500', bg: 'bg-blue-500/10' },
    maintenance: { color: 'text-blue-500', bg: 'bg-blue-500/10' },
    Facilities: { color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    facilities: { color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    Insurance: { color: 'text-purple-500', bg: 'bg-purple-500/10' },
    insurance: { color: 'text-purple-500', bg: 'bg-purple-500/10' },
  };

  const stats = [
    { label: 'Total Expenses', value: formatCurrency(totalExpenses), icon: DollarSign, color: 'text-red-500', bg: 'bg-red-500/10' },
    ...Object.entries(byCategory).slice(0, 4).map(([cat, amount]) => ({
      label: cat,
      value: formatCurrency(amount),
      icon: statIcons[cat] || Receipt,
      color: statColors[cat]?.color || 'text-gray-500',
      bg: statColors[cat]?.bg || 'bg-gray-500/10',
    })),
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
            <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
            <p className="text-muted-foreground">Track all operations and business expenses</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="exp-description">Description *</Label>
                <Input
                  id="exp-description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g., Fuel for King Kong"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="exp-category">Category</Label>
                <select
                  id="exp-category"
                  title="Expense category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select category...</option>
                  <option value="fuel">Fuel</option>
                  <option value="maintenance">Maintenance & Repairs</option>
                  <option value="insurance">Insurance</option>
                  <option value="facilities">Office / Facilities</option>
                  <option value="agent_commission">Agent Commission</option>
                  <option value="registration">Registration / Licensing</option>
                  <option value="equipment">Equipment / Safety Gear</option>
                  <option value="marketing">Marketing & Advertising</option>
                  <option value="office">Office / Admin</option>
                  <option value="utilities">Utilities</option>
                  <option value="cleaning">Cleaning / Detailing</option>
                  <option value="supplies">Supplies (ice, coolers, etc.)</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="exp-amount">Amount *</Label>
                <Input
                  id="exp-amount"
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="exp-vendor">Vendor</Label>
                <Input
                  id="exp-vendor"
                  value={form.vendor}
                  onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                  placeholder="e.g., Acme Insurance"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="exp-date">Date</Label>
                <Input
                  id="exp-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? 'Adding...' : 'Add Expense'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {expensesLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-20" />
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

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {expensesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="mx-auto h-10 w-10 mb-3 opacity-50" />
              <p className="text-lg font-medium">No expenses yet</p>
              <p className="text-sm mt-1">Add your first expense to start tracking.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Description</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Vendor</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp: any) => (
                    <tr key={exp.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 font-medium">{exp.description || '--'}</td>
                      <td className="py-3">
                        <Badge variant="outline" className={categoryStyles[exp.category] || 'bg-gray-500/10 text-gray-600'}>
                          {exp.category || 'Other'}
                        </Badge>
                      </td>
                      <td className="py-3 font-semibold text-red-500">{formatCurrency(exp.amount)}</td>
                      <td className="py-3 text-muted-foreground">{exp.date || exp.created_at?.slice(0, 10) || '--'}</td>
                      <td className="py-3 text-muted-foreground">{exp.vendor || '--'}</td>
                      <td className="py-3">
                        <Dialog
                          open={deleteConfirmId === String(exp.id)}
                          onOpenChange={(open) => !open && setDeleteConfirmId(null)}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600"
                              onClick={() => setDeleteConfirmId(String(exp.id))}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Expense</DialogTitle>
                            </DialogHeader>
                            <p className="text-sm text-muted-foreground">
                              Are you sure you want to delete this expense? This action cannot be undone.
                            </p>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleDelete(String(exp.id))}
                                disabled={deleting}
                              >
                                {deleting ? 'Deleting...' : 'Delete'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
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
