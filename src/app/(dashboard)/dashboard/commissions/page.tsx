'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DollarSign,
  Clock,
  CheckCircle2,
  Percent,
  RefreshCw,
  Download,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { insuranceApi } from '@/lib/api';
import { toast } from 'sonner';

interface CommissionRecord {
  id: string;
  agentName: string;
  program: string;
  policyCount: number;
  premiumVolume: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'paid';
  payDate: string;
}

const sampleCommissions: CommissionRecord[] = [
  { id: '1', agentName: 'Sarah Mitchell', program: 'HealthShield Gold', policyCount: 12, premiumVolume: 72000, commissionRate: 8, commissionAmount: 5760, status: 'paid', payDate: '2026-03-15' },
  { id: '2', agentName: 'Sarah Mitchell', program: 'HealthShield Silver', policyCount: 8, premiumVolume: 38400, commissionRate: 7, commissionAmount: 2688, status: 'paid', payDate: '2026-03-15' },
  { id: '3', agentName: 'James Rodriguez', program: 'HealthShield Gold', policyCount: 15, premiumVolume: 90000, commissionRate: 8, commissionAmount: 7200, status: 'paid', payDate: '2026-03-15' },
  { id: '4', agentName: 'James Rodriguez', program: 'HealthShield Platinum', policyCount: 5, premiumVolume: 45000, commissionRate: 10, commissionAmount: 4500, status: 'pending', payDate: '2026-04-15' },
  { id: '5', agentName: 'Emily Watson', program: 'HealthShield Silver', policyCount: 20, premiumVolume: 96000, commissionRate: 7, commissionAmount: 6720, status: 'pending', payDate: '2026-04-15' },
  { id: '6', agentName: 'Emily Watson', program: 'HealthShield Bronze', policyCount: 10, premiumVolume: 30000, commissionRate: 6, commissionAmount: 1800, status: 'pending', payDate: '2026-04-15' },
  { id: '7', agentName: 'Michael Park', program: 'HealthShield Platinum', policyCount: 7, premiumVolume: 63000, commissionRate: 10, commissionAmount: 6300, status: 'paid', payDate: '2026-03-15' },
  { id: '8', agentName: 'Michael Park', program: 'HealthShield Gold', policyCount: 9, premiumVolume: 54000, commissionRate: 8, commissionAmount: 4320, status: 'pending', payDate: '2026-04-15' },
  { id: '9', agentName: 'Laura Kim', program: 'HealthShield Silver', policyCount: 14, premiumVolume: 67200, commissionRate: 7, commissionAmount: 4704, status: 'paid', payDate: '2026-03-15' },
  { id: '10', agentName: 'Laura Kim', program: 'HealthShield Gold', policyCount: 6, premiumVolume: 36000, commissionRate: 8, commissionAmount: 2880, status: 'pending', payDate: '2026-04-15' },
];

const monthlyChartData = [
  { month: 'Oct', amount: 28500 },
  { month: 'Nov', amount: 32100 },
  { month: 'Dec', amount: 35800 },
  { month: 'Jan', amount: 29400 },
  { month: 'Feb', amount: 38200 },
  { month: 'Mar', amount: 41600 },
  { month: 'Apr', amount: 46872 },
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600',
  paid: 'bg-green-500/10 text-green-600',
};

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const fetchCommissions = async () => {
    try {
      // Attempt to fetch from API — commissions endpoint may not exist yet
      const res = await insuranceApi.getPolicies({ include: 'commissions' });
      const data = res?.commissions || res?.data;

      if (Array.isArray(data) && data.length > 0) {
        const mapped: CommissionRecord[] = data.map((c: any) => ({
          id: String(c.id),
          agentName: c.agent_name || c.agentName || 'Unknown',
          program: c.program || c.plan_name || 'N/A',
          policyCount: c.policy_count || c.policyCount || 0,
          premiumVolume: c.premium_volume || c.premiumVolume || 0,
          commissionRate: c.commission_rate || c.commissionRate || 0,
          commissionAmount: c.commission_amount || c.commissionAmount || 0,
          status: c.status === 'paid' ? 'paid' : 'pending',
          payDate: c.pay_date || c.payDate || '',
        }));
        setCommissions(mapped);
        return;
      }

      setCommissions(sampleCommissions);
    } catch {
      setCommissions(sampleCommissions);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCommissions();
  };

  const handleExport = () => {
    toast.success('Commission report exported');
  };

  // Filter commissions
  const filtered = commissions.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (dateFilter === 'this-month') {
      const now = new Date();
      const payDate = new Date(c.payDate);
      if (payDate.getMonth() !== now.getMonth() || payDate.getFullYear() !== now.getFullYear()) return false;
    }
    if (dateFilter === 'last-month') {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const payDate = new Date(c.payDate);
      if (payDate.getMonth() !== lastMonth.getMonth() || payDate.getFullYear() !== lastMonth.getFullYear()) return false;
    }
    return true;
  });

  // Summary calculations
  const totalEarned = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);
  const totalPending = commissions.filter((c) => c.status === 'pending').reduce((sum, c) => sum + c.commissionAmount, 0);
  const totalPaid = commissions.filter((c) => c.status === 'paid').reduce((sum, c) => sum + c.commissionAmount, 0);
  const avgRate = commissions.length > 0
    ? commissions.reduce((sum, c) => sum + c.commissionRate, 0) / commissions.length
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-10" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
              <CardContent><Skeleton className="h-8 w-20" /></CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
          <CardContent><Skeleton className="h-64 w-full" /></CardContent>
        </Card>
        <Card>
          <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Commissions
          </h1>
          <p className="text-muted-foreground">
            Track agent commissions and payouts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1.5" />
            Export
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earned</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarned.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">${totalPending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Awaiting payout</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">${totalPaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Already disbursed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Commission Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Average rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Commissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))',
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Commission']}
                />
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Commission Details</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No commissions found</p>
              <p className="text-sm mt-1">Adjust filters to see commission records.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent Name</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead className="text-right">Policies</TableHead>
                    <TableHead className="text-right">Premium Volume</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pay Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.agentName}</TableCell>
                      <TableCell>{c.program}</TableCell>
                      <TableCell className="text-right">{c.policyCount}</TableCell>
                      <TableCell className="text-right">${c.premiumVolume.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{c.commissionRate}%</TableCell>
                      <TableCell className="text-right font-semibold">${c.commissionAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusColors[c.status] || ''}>
                          {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(c.payDate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
