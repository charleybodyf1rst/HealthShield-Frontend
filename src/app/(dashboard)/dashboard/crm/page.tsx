'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  LayoutDashboard,
  Users,
  CheckCircle,
  Phone,
  BarChart3,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertTriangle,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  Shield,
  X,
  UserPlus,
} from 'lucide-react';
import { useHealthShieldCrmStore } from '@/stores/healthshield-crm-store';
import { cn } from '@/lib/utils';

// Tab components - inline for now, can be extracted later
import { OverviewTab } from '@/components/crm/OverviewTab';
import { CustomersTab } from '@/components/crm/CustomersTab';
import { ApprovalsTab } from '@/components/crm/ApprovalsTab';
import { AiCallerTab } from '@/components/crm/AiCallerTab';
import { AnalyticsTab } from '@/components/crm/AnalyticsTab';
import { LeadsTab } from '@/components/crm/LeadsTab';

export default function InsuranceCrmPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const isConnected = false; // Realtime connection handled by polling

  const {
    kpis,
    pendingApprovals,
    activeCalls,
    connectionError,
    isPolling,
    fetchDashboardData,
    startPolling,
    clearError,
  } = useHealthShieldCrmStore();

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
    // Start polling as fallback
    if (!isConnected) {
      startPolling(10000);
    }
  }, [fetchDashboardData, startPolling, isConnected]);

  const pendingCount = pendingApprovals.length;
  const activeCallsCount = activeCalls.length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-white">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Shield className="w-7 h-7 text-blue-500" />
            Insurance CRM
          </h1>
          <p className="text-slate-500 mt-1">
            AI-powered customer management and automation
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
            isConnected
              ? "bg-emerald-50 text-emerald-700"
              : isPolling
                ? "bg-yellow-50 text-yellow-700"
                : "bg-red-50 text-red-700"
          )}>
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4" />
                <span>Live</span>
              </>
            ) : isPolling ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Polling</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDashboardData()}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Connection Error Banner */}
      {connectionError && (
        <div className="mx-6 mt-4 flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{connectionError}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearError}
            className="h-6 w-6 p-0 text-red-700 hover:text-red-900"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-4 gap-4 p-6 bg-slate-50 border-b border-slate-200">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Phone className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Today&apos;s Enrollments</p>
              <p className="text-2xl font-bold text-slate-900">{kpis?.todayEnrollments ?? kpis?.aiCallsToday ?? '-'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-xl",
              pendingCount > 0 ? "bg-yellow-100" : "bg-slate-100"
            )}>
              <CheckCircle className={cn(
                "w-6 h-6",
                pendingCount > 0 ? "text-yellow-600" : "text-slate-400"
              )} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending Approvals</p>
              <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-xl",
              activeCallsCount > 0 ? "bg-green-100" : "bg-slate-100"
            )}>
              <Phone className={cn(
                "w-6 h-6",
                activeCallsCount > 0 ? "text-green-600" : "text-slate-400"
              )} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Active Calls</p>
              <p className="text-2xl font-bold text-slate-900">{kpis?.activeCalls ?? kpis?.activeTrips ?? '-'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Revenue Today</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-slate-900">
                  ${(kpis?.revenueToday ?? 0).toLocaleString()}
                </p>
                {kpis?.revenueTrend === 'up' && (
                  <span className="flex items-center text-emerald-600 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    {kpis.revenueTrendPercent}%
                  </span>
                )}
                {kpis?.revenueTrend === 'down' && (
                  <span className="flex items-center text-red-600 text-sm">
                    <TrendingDown className="w-4 h-4" />
                    {kpis.revenueTrendPercent}%
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-6 pt-4 bg-white border-b border-slate-200">
            <TabsList className="bg-slate-100">
              <TabsTrigger value="overview" className="gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="leads" className="gap-2">
                <UserPlus className="w-4 h-4" />
                Leads
              </TabsTrigger>
              <TabsTrigger value="customers" className="gap-2">
                <Users className="w-4 h-4" />
                Customers
              </TabsTrigger>
              <TabsTrigger value="approvals" className="gap-2 relative">
                <CheckCircle className="w-4 h-4" />
                Approvals
                {pendingCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs animate-pulse"
                  >
                    {pendingCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="ai-caller" className="gap-2">
                <Phone className="w-4 h-4" />
                AI Caller
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto p-6 bg-slate-50">
            <TabsContent value="overview" className="h-full m-0">
              <OverviewTab />
            </TabsContent>

            <TabsContent value="leads" className="h-full m-0">
              <LeadsTab />
            </TabsContent>

            <TabsContent value="customers" className="h-full m-0">
              <CustomersTab />
            </TabsContent>

            <TabsContent value="approvals" className="h-full m-0">
              <ApprovalsTab />
            </TabsContent>

            <TabsContent value="ai-caller" className="h-full m-0">
              <AiCallerTab />
            </TabsContent>

            <TabsContent value="analytics" className="h-full m-0">
              <AnalyticsTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
