'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { financeApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  DollarSign,
  Receipt,
  Ship,
  Eye,
  Download,
  X,
} from 'lucide-react';

interface ReportDefinition {
  title: string;
  description: string;
  icon: any;
  color: string;
  bg: string;
  apiCall: 'income' | 'expenses' | 'cashflow' | null;
}

const reports: ReportDefinition[] = [
  {
    title: 'Revenue Report',
    description: 'Total revenue breakdown by boat, booking type, and time period',
    icon: TrendingUp,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    apiCall: 'income',
  },
  {
    title: 'Expense Report',
    description: 'Detailed expense tracking across fuel, maintenance, marina, and insurance',
    icon: TrendingDown,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    apiCall: 'expenses',
  },
  {
    title: 'Profit & Loss',
    description: 'Net profit analysis comparing revenue against all operational costs',
    icon: BarChart3,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    apiCall: 'income',
  },
  {
    title: 'Cash Flow',
    description: 'Cash inflows and outflows tracking with forecast projections',
    icon: DollarSign,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    apiCall: 'cashflow',
  },
  {
    title: 'Tax Summary',
    description: 'Tax liability estimates, deductions, and quarterly filing summary',
    icon: Receipt,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    apiCall: null,
  },
  {
    title: 'Fleet ROI',
    description: 'Return on investment analysis for each boat in the rental fleet',
    icon: Ship,
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
    apiCall: null,
  },
];

function formatValue(val: any): string {
  if (val === null || val === undefined) return '--';
  if (typeof val === 'number') return `$${val.toLocaleString()}`;
  return String(val);
}

export default function ReportsPage() {
  const [viewingReport, setViewingReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const handleViewReport = async (report: ReportDefinition) => {
    if (!report.apiCall) {
      toast.info('This report type is coming soon');
      return;
    }

    setViewingReport(report.title);
    setReportLoading(true);
    setReportData(null);

    try {
      let response: any;
      switch (report.apiCall) {
        case 'income':
          response = await financeApi.getIncomeStatement();
          break;
        case 'expenses':
          response = await financeApi.getExpenseBreakdown();
          break;
        case 'cashflow':
          response = await financeApi.getCashFlow();
          break;
      }
      setReportData(response?.data || response);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load report');
      setViewingReport(null);
    } finally {
      setReportLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await financeApi.exportReport({ format: 'csv' });
      toast.success('Report export initiated');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to export report');
    }
  };

  const renderReportData = (data: any) => {
    if (!data) return null;

    // Handle different response shapes
    const entries: [string, any][] = [];

    if (typeof data === 'object' && !Array.isArray(data)) {
      Object.entries(data).forEach(([key, value]) => {
        if (['status', 'message'].includes(key)) return;
        entries.push([key, value]);
      });
    }

    if (entries.length === 0) {
      return (
        <p className="text-muted-foreground text-sm text-center py-4">
          No data available for this report.
        </p>
      );
    }

    return (
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {entries.map(([key, value]) => {
          const label = key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());

          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            return (
              <div key={key} className="border rounded-lg p-3">
                <p className="font-medium text-sm mb-2">{label}</p>
                <div className="space-y-1">
                  {Object.entries(value).map(([subKey, subVal]) => (
                    <div key={subKey} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {subKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                      <span className="font-medium">{formatValue(subVal)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          if (Array.isArray(value)) {
            return (
              <div key={key} className="border rounded-lg p-3">
                <p className="font-medium text-sm mb-2">{label} ({value.length} items)</p>
                <div className="space-y-1">
                  {value.slice(0, 10).map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm border-b last:border-0 py-1">
                      <span className="text-muted-foreground">
                        {item.name || item.category || item.label || item.description || `Item ${idx + 1}`}
                      </span>
                      <span className="font-medium">
                        {formatValue(item.amount || item.total || item.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <div key={key} className="flex justify-between items-center p-3 border rounded-lg">
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="font-semibold">{formatValue(value)}</span>
            </div>
          );
        })}
      </div>
    );
  };

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
            <h1 className="text-2xl font-bold tracking-tight">Financial Reports</h1>
            <p className="text-muted-foreground">Generate and view financial reports for your fleet</p>
          </div>
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Report Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.title} className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-start gap-3 pb-3">
              <div className={`p-2 rounded-full ${report.bg}`}>
                <report.icon className={`h-5 w-5 ${report.color}`} />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">{report.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewReport(report)}
                >
                  <Eye className="mr-1 h-3 w-3" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Data Dialog */}
      <Dialog open={!!viewingReport} onOpenChange={(open) => !open && setViewingReport(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewingReport}</DialogTitle>
          </DialogHeader>
          {reportLoading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ) : (
            <div className="py-2">
              {renderReportData(reportData)}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingReport(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
