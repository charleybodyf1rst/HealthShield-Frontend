'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
  FileText,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLeadsStore, usePipelineStore, useLeadStats } from '@/stores/leads-store';
import { useUser } from '@/stores/auth-store';
import { useHealthShieldCrmStore } from '@/stores/healthshield-crm-store';
import { useInsuranceStore } from '@/stores/insurance-store';
import { aiAssistantApi, type NextBestAction } from '@/lib/api';

// Status and stage color mappings
const statusColors: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-500',
  contacted: 'bg-yellow-500/10 text-yellow-500',
  qualified: 'bg-orange-500/10 text-orange-500',
  proposal: 'bg-purple-500/10 text-purple-500',
  negotiation: 'bg-pink-500/10 text-pink-500',
  won: 'bg-green-500/10 text-green-500',
  lost: 'bg-red-500/10 text-red-500',
};

const stageColors: Record<string, string> = {
  new: 'bg-blue-500',
  contacted: 'bg-yellow-500',
  qualified: 'bg-orange-500',
  proposal: 'bg-purple-500',
  negotiation: 'bg-pink-500',
  won: 'bg-green-500',
  lost: 'bg-red-500',
};

const actionTypeIcons: Record<string, React.ReactNode> = {
  call: <Phone className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  meeting: <Calendar className="h-4 w-4" />,
  follow_up: <Clock className="h-4 w-4" />,
  proposal: <Target className="h-4 w-4" />,
};

const priorityColors: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

export default function DashboardPage() {
  const user = useUser();
  const { fetchStats, fetchLeads, leads, isLoading, error } = useLeadsStore();
  const { fetchPipeline, stages } = usePipelineStore();
  const stats = useLeadStats();
  const { fetchDashboardData, kpis, todaySchedule, kpisLoading, pendingApprovals } = useHealthShieldCrmStore();
  const { stats: insuranceStats, fetchStats: fetchInsuranceStats } = useInsuranceStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // AI-powered next best actions
  const [nextActions, setNextActions] = useState<NextBestAction[]>([]);
  const [isLoadingActions, setIsLoadingActions] = useState(true);

  // Load data on mount
  useEffect(() => {
    fetchStats();
    fetchLeads({}, 1, 5); // Fetch recent 5 leads
    fetchPipeline();
    fetchDashboardData();
    fetchInsuranceStats();
    loadNextActions();
  }, [fetchStats, fetchLeads, fetchPipeline, fetchDashboardData, fetchInsuranceStats]);

  // Load AI-powered next best actions
  const loadNextActions = async () => {
    setIsLoadingActions(true);
    try {
      const response = await aiAssistantApi.getNextBestActions(5);
      if (response.actions) {
        setNextActions(response.actions);
      }
    } catch (err) {
      toast.error('Failed to load AI recommendations');
      // Use fallback empty array
      setNextActions([]);
    } finally {
      setIsLoadingActions(false);
    }
  };

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchLeads({}, 1, 5),
        fetchPipeline(),
        fetchDashboardData(),
        fetchInsuranceStats(),
        loadNextActions(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Insurance-focused KPI cards
  const dashboardStats = [
    {
      title: 'Total Programs',
      value: (insuranceStats?.totalPrograms ?? 0).toLocaleString(),
      change: insuranceStats?.totalPrograms ? `${insuranceStats.totalPrograms} active` : '-',
      trend: 'up' as 'up' | 'down',
      icon: ShieldCheck,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      href: '/dashboard/programs',
    },
    {
      title: 'Active Enrollments',
      value: (insuranceStats?.activeEnrollments ?? 0).toLocaleString(),
      change: insuranceStats?.conversionRate ? `${insuranceStats.conversionRate}% conversion` : '-',
      trend: 'up' as 'up' | 'down',
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      href: '/dashboard/enrollments',
    },
    {
      title: 'AI Calls Today',
      value: (kpis?.aiCallsToday ?? kpis?.aiCallsToday ?? 0).toLocaleString(),
      change: kpis?.scheduledCalls ? `${kpis.scheduledCalls} scheduled` : '-',
      trend: 'up' as 'up' | 'down',
      icon: Phone,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      href: '/dashboard/ai-caller',
    },
    {
      title: 'Proposals Sent',
      value: (insuranceStats?.totalProposals ?? 0).toLocaleString(),
      change: insuranceStats?.averagePremium ? `$${insuranceStats.averagePremium.toLocaleString()} avg premium` : '-',
      trend: 'up' as 'up' | 'down',
      icon: FileText,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      href: '/dashboard/proposals',
    },
    {
      title: 'Conversion Rate',
      value: `${insuranceStats?.conversionRate ?? 0}%`,
      change: insuranceStats?.claimsProcessed ? `${insuranceStats.claimsProcessed} claims processed` : '-',
      trend: (insuranceStats?.conversionRate ?? 0) >= 20 ? 'up' as 'up' | 'down' : 'down' as 'up' | 'down',
      icon: TrendingUp,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      href: '/dashboard/analytics',
    },
    {
      title: 'Monthly Revenue',
      value: `$${(insuranceStats?.totalRevenue ?? 0).toLocaleString()}`,
      change: kpis?.revenueTrendPercent ? `${kpis.revenueTrendPercent}% vs last month` : '-',
      trend: (kpis?.revenueTrend === 'down' ? 'down' : 'up') as 'up' | 'down',
      icon: DollarSign,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      href: '/dashboard/finance',
    },
  ];

  // Build pipeline overview from API data
  const pipelineOverview = (stages ?? []).length > 0 ? (stages ?? []).slice(0, 5).map(stage => ({
    stage: stage.name,
    count: stage.leads.length,
    value: stage.totalValue || 0,
    color: stageColors[stage.id] || 'bg-gray-500',
  })) : [
    { stage: 'New Inquiry', count: 0, value: 0, color: 'bg-blue-500' },
    { stage: 'Contacted', count: 0, value: 0, color: 'bg-yellow-500' },
    { stage: 'Qualified', count: 0, value: 0, color: 'bg-orange-500' },
    { stage: 'Proposal Sent', count: 0, value: 0, color: 'bg-purple-500' },
    { stage: 'Enrollment Pending', count: 0, value: 0, color: 'bg-pink-500' },
  ];

  // Use recent leads from API
  const recentLeads = (leads ?? []).slice(0, 4).map(lead => ({
    id: lead.id,
    name: `${lead.firstName} ${lead.lastName}`,
    email: lead.email || '-',
    value: lead.value || 0,
    status: lead.status,
    avatar: null,
  }));

  const totalPipelineValue = pipelineOverview.reduce((acc, stage) => acc + stage.value, 0);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Welcome section with gradient */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 border">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {getGreeting()}, {user?.firstName || 'User'}
            </h1>
            <p className="text-muted-foreground mt-1">
              Here&apos;s what&apos;s happening with your call center today.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/ai-agents">
                <Bot className="mr-2 h-4 w-4" />
                AI Assistant
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/leads/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Lead
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Stats cards — 6 insurance KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {(isLoading || kpisLoading) && !insuranceStats ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))
        ) : (
          dashboardStats.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
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
                  <div className={`flex items-center text-xs ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    <TrendingUp className={`mr-1 h-3 w-3 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                    {stat.change}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* AI Insights and Quick Actions Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* AI-Powered Next Best Actions */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">AI-Powered Next Best Actions</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Recommended actions to move deals forward
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/ai-agents">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingActions ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-40 mb-2" />
                      <Skeleton className="h-3 w-60" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : nextActions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recommended actions at the moment</p>
                <p className="text-xs mt-1">Add more leads to get AI-powered suggestions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {nextActions.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className={`mt-0.5 p-2 rounded-full ${
                      action.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                      action.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-green-500/10 text-green-500'
                    }`}>
                      {actionTypeIcons[action.type] || <Zap className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{action.action}</p>
                        <div className={`h-2 w-2 rounded-full ${priorityColors[action.priority]}`} />
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {action.leadName} - {action.reason}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/leads/${action.leadId}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/leads/new">
                <Plus className="mr-2 h-4 w-4 text-blue-500" />
                Add New Lead
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/proposals/new">
                <FileText className="mr-2 h-4 w-4 text-orange-500" />
                Create Proposal
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/ai-agents">
                <Bot className="mr-2 h-4 w-4 text-purple-500" />
                AI Sales Assistant
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/programs">
                <ShieldCheck className="mr-2 h-4 w-4 text-green-500" />
                Insurance Programs
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/pipeline">
                <Target className="mr-2 h-4 w-4 text-pink-500" />
                View Pipeline
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/wellness">
                <Activity className="mr-2 h-4 w-4 text-cyan-500" />
                Wellness Metrics
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pipeline Overview */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pipeline Overview</CardTitle>
              <p className="text-sm text-muted-foreground">
                Total pipeline value: ${totalPipelineValue.toLocaleString()}
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/pipeline">
                View Pipeline
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pipelineOverview.map((stage) => (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${stage.color}`} />
                      <span className="font-medium">{stage.stage}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {stage.count} leads · ${stage.value.toLocaleString()}
                    </span>
                  </div>
                  <Progress
                    value={totalPipelineValue > 0 ? (stage.value / totalPipelineValue) * 100 : 0}
                    className={`h-2`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/calendar">
                <Calendar className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLeads.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent activity</p>
                </div>
              ) : (
                recentLeads.slice(0, 3).map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {lead.name.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Added to {lead.status}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={statusColors[lead.status]}
                    >
                      {lead.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Leads</CardTitle>
            <p className="text-sm text-muted-foreground">
              Your most recently added leads
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/leads">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading && (leads ?? []).length === 0 ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No leads yet</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/dashboard/leads/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add your first lead
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={lead.avatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {lead.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {lead.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant="secondary"
                      className={statusColors[lead.status]}
                    >
                      {lead.status}
                    </Badge>
                    <span className="font-medium text-sm">
                      ${lead.value.toLocaleString()}
                    </span>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/leads/${lead.id}`}>
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
