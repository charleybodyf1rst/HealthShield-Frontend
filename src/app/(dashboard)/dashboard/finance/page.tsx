'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useFinanceStore } from '@/stores/finance-store';
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  DollarSign,
  FileText,
  Receipt,
  TrendingUp,
  Users,
  BarChart3,
  PiggyBank,
} from 'lucide-react';

const quickActions = [
  { label: 'Invoices', icon: FileText, color: 'text-blue-500', href: '/dashboard/finance/invoices' },
  { label: 'Expenses', icon: Receipt, color: 'text-red-500', href: '/dashboard/finance/expenses' },
  { label: 'Payments', icon: CreditCard, color: 'text-green-500', href: '/dashboard/finance/payments' },
  { label: 'Budget', icon: PiggyBank, color: 'text-purple-500', href: '/dashboard/finance/budget' },
  { label: 'Payroll', icon: Users, color: 'text-orange-500', href: '/dashboard/finance/payroll' },
  { label: 'Reports', icon: BarChart3, color: 'text-cyan-500', href: '/dashboard/finance/reports' },
];

function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null) return '$0';
  return `$${Number(value).toLocaleString()}`;
}

export default function FinanceDashboardPage() {
  const { metrics, metricsLoading, fetchMetrics } = useFinanceStore();

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const selectedPeriod = 'This Month';

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(metrics?.total_revenue),
      change: metrics?.revenue_change ? `${metrics.revenue_change > 0 ? '+' : ''}${metrics.revenue_change}%` : '--',
      trend: (metrics?.revenue_change ?? 0) >= 0 ? 'up' as const : 'down' as const,
      icon: DollarSign,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Outstanding Invoices',
      value: formatCurrency(metrics?.outstanding_invoices),
      change: metrics?.outstanding_count ? `${metrics.outstanding_count} pending` : '--',
      trend: 'up' as const,
      icon: FileText,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Monthly Expenses',
      value: formatCurrency(metrics?.monthly_expenses),
      change: metrics?.expenses_change ? `${metrics.expenses_change > 0 ? '+' : ''}${metrics.expenses_change}%` : '--',
      trend: (metrics?.expenses_change ?? 0) >= 0 ? 'up' as const : 'down' as const,
      icon: Receipt,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Net Profit',
      value: formatCurrency(metrics?.net_profit),
      change: metrics?.profit_change ? `${metrics.profit_change > 0 ? '+' : ''}${metrics.profit_change}%` : '--',
      trend: (metrics?.profit_change ?? 0) >= 0 ? 'up' as const : 'down' as const,
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-background p-6 border">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Financial Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Track revenue, expenses, and profitability for your boat rental business.
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
              {selectedPeriod}
            </Badge>
            <Button variant="outline" asChild>
              <Link href="/dashboard/analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                Full Analytics
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-7 w-20 mb-2" />
                  <Skeleton className="h-3 w-28" />
                </CardContent>
              </Card>
            ))
          : kpiCards.map((stat) => (
              <Card key={stat.title} className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div
                    className={`flex items-center text-xs ${
                      stat.title === 'Monthly Expenses'
                        ? stat.trend === 'down'
                          ? 'text-green-500'
                          : 'text-red-500'
                        : stat.trend === 'up'
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}
                  >
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-3 w-3" />
                    )}
                    {stat.change} from last month
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center p-4 gap-2">
                    <div className="p-2 rounded-full bg-muted">
                      <action.icon className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions - from metrics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <p className="text-sm text-muted-foreground">
              Latest financial activity across your fleet
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/finance/payments">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {metricsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-40 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : metrics?.recent_transactions && metrics.recent_transactions.length > 0 ? (
            <div className="space-y-3">
              {metrics.recent_transactions.map((tx: any, idx: number) => (
                <div
                  key={tx.id || idx}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        tx.type === 'income' ? 'bg-green-500/10' : 'bg-red-500/10'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{tx.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {tx.category && (
                      <Badge variant="secondary" className="text-xs">
                        {tx.category}
                      </Badge>
                    )}
                    <span
                      className={`font-semibold text-sm ${
                        tx.type === 'income' ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}${Number(tx.amount).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="mx-auto h-10 w-10 mb-3 opacity-50" />
              <p>No recent transactions yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
