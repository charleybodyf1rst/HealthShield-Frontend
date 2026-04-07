'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { financeApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Edit,
  Fuel,
  Wrench,
  Megaphone,
  Users,
  Shield,
  Receipt,
} from 'lucide-react';

interface BudgetCategory {
  label: string;
  spent: number;
  budget: number;
}

const categoryIcons: Record<string, any> = {
  Fuel: Fuel,
  fuel: Fuel,
  Maintenance: Wrench,
  maintenance: Wrench,
  Marketing: Megaphone,
  marketing: Megaphone,
  Payroll: Users,
  payroll: Users,
  Insurance: Shield,
  insurance: Shield,
};

const categoryColors: Record<string, string> = {
  Fuel: 'bg-orange-500',
  fuel: 'bg-orange-500',
  Maintenance: 'bg-blue-500',
  maintenance: 'bg-blue-500',
  Marketing: 'bg-pink-500',
  marketing: 'bg-pink-500',
  Payroll: 'bg-green-500',
  payroll: 'bg-green-500',
  Insurance: 'bg-purple-500',
  insurance: 'bg-purple-500',
};

export default function BudgetPage() {
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBudget() {
      setLoading(true);
      try {
        const response: any = await financeApi.getExpenseBreakdown();
        const data = response?.data || response;

        // Transform API response into budget categories
        // API may return { categories: [...] } or similar structure
        if (data?.categories && Array.isArray(data.categories)) {
          setBudgetCategories(
            data.categories.map((cat: any) => ({
              label: cat.category || cat.label || cat.name,
              spent: Number(cat.spent || cat.amount || cat.total || 0),
              budget: Number(cat.budget || cat.limit || cat.allocated || cat.spent * 1.5 || 0),
            }))
          );
        } else if (data?.breakdown && Array.isArray(data.breakdown)) {
          setBudgetCategories(
            data.breakdown.map((cat: any) => ({
              label: cat.category || cat.label || cat.name,
              spent: Number(cat.spent || cat.amount || cat.total || 0),
              budget: Number(cat.budget || cat.limit || cat.allocated || cat.spent * 1.5 || 0),
            }))
          );
        } else if (Array.isArray(data)) {
          setBudgetCategories(
            data.map((cat: any) => ({
              label: cat.category || cat.label || cat.name,
              spent: Number(cat.spent || cat.amount || cat.total || 0),
              budget: Number(cat.budget || cat.limit || cat.allocated || cat.spent * 1.5 || 0),
            }))
          );
        } else {
          // If API returns a flat object like { fuel: 4200, maintenance: 3800, ... }
          const entries = Object.entries(data).filter(([key]) => !['status', 'message', 'total', 'period'].includes(key));
          if (entries.length > 0) {
            setBudgetCategories(
              entries.map(([key, val]: [string, any]) => ({
                label: key.charAt(0).toUpperCase() + key.slice(1),
                spent: typeof val === 'number' ? val : Number(val?.amount || val?.spent || 0),
                budget: typeof val === 'number' ? val * 1.5 : Number(val?.budget || val?.limit || (val?.amount || 0) * 1.5),
              }))
            );
          }
        }
      } catch (err: any) {
        toast.error('Failed to load budget data');
        console.error('Budget load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBudget();
  }, []);

  const totalSpent = budgetCategories.reduce((sum, c) => sum + c.spent, 0);
  const totalBudget = budgetCategories.reduce((sum, c) => sum + c.budget, 0);

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
            <h1 className="text-2xl font-bold tracking-tight">Budget</h1>
            <p className="text-muted-foreground">Monitor spending against budget targets</p>
          </div>
        </div>
        <Button>
          <Edit className="mr-2 h-4 w-4" />
          Edit Budget
        </Button>
      </div>

      {/* Overall Summary */}
      {loading ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-24 mb-2" />
            <Skeleton className="h-3 w-full rounded-full mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      ) : budgetCategories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Receipt className="mx-auto h-10 w-10 mb-3 opacity-50" />
            <p className="text-lg font-medium">No budget data available</p>
            <p className="text-sm mt-1">Budget data will appear once expenses are tracked.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Overall Budget Summary</CardTitle>
              {totalBudget > 0 && (
                <Badge
                  variant="outline"
                  className={
                    totalSpent / totalBudget > 0.9
                      ? 'bg-red-500/10 text-red-600 border-red-500/20'
                      : totalSpent / totalBudget > 0.7
                      ? 'bg-orange-500/10 text-orange-600 border-orange-500/20'
                      : 'bg-green-500/10 text-green-600 border-green-500/20'
                  }
                >
                  {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}% Used
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">${totalSpent.toLocaleString()}</span>
                <span className="text-muted-foreground">of ${totalBudget.toLocaleString()}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all"
                  style={{ width: `${totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                ${Math.max(totalBudget - totalSpent, 0).toLocaleString()} remaining this period
              </p>
            </CardContent>
          </Card>

          {/* Budget Categories */}
          <div className="grid gap-4">
            {budgetCategories.map((cat) => {
              const pct = cat.budget > 0 ? Math.round((cat.spent / cat.budget) * 100) : 0;
              const remaining = Math.max(cat.budget - cat.spent, 0);
              const IconComponent = categoryIcons[cat.label] || Receipt;
              const colorClass = categoryColors[cat.label] || 'bg-gray-500';

              return (
                <Card key={cat.label}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${colorClass}/10`}>
                          <IconComponent className={`h-4 w-4 ${colorClass.replace('bg-', 'text-')}`} />
                        </div>
                        <div>
                          <p className="font-medium">{cat.label}</p>
                          <p className="text-sm text-muted-foreground">
                            ${cat.spent.toLocaleString()} of ${cat.budget.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className={
                            pct > 90
                              ? 'bg-red-500/10 text-red-600 border-red-500/20'
                              : pct > 70
                              ? 'bg-orange-500/10 text-orange-600 border-orange-500/20'
                              : 'bg-green-500/10 text-green-600 border-green-500/20'
                          }
                        >
                          {pct}%
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          ${remaining.toLocaleString()} left
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`${colorClass} h-2 rounded-full transition-all`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
