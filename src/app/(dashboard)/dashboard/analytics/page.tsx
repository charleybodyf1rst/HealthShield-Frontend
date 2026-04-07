'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  DollarSign,
  Loader2,
  RefreshCw,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { analyticsApi, teamApi } from '@/lib/api';
import { usePipelineStore } from '@/stores/leads-store';

// Types
interface DashboardStat {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface TeamMemberPerformance {
  name: string;
  deals: number;
  revenue: number;
  rate: number;
}

interface LeadSourceData {
  source: string;
  leads: number;
  percentage: number;
  color: string;
  revenue: number;
}

interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
}

// Color mapping for sources
const sourceColors: Record<string, string> = {
  website: 'bg-blue-500',
  referral: 'bg-green-500',
  walk_in: 'bg-purple-500',
  phone: 'bg-amber-500',
  social_media: 'bg-pink-500',
  google: 'bg-red-500',
  yelp: 'bg-rose-500',
  boat_show: 'bg-orange-500',
  marina: 'bg-cyan-500',
  repeat_customer: 'bg-teal-500',
  partner: 'bg-indigo-500',
  advertisement: 'bg-yellow-500',
  other: 'bg-gray-500',
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

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<TeamMemberPerformance[]>([]);
  const [leadSources, setLeadSources] = useState<LeadSourceData[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<FunnelStage[]>([]);

  // Pipeline data
  const { stages, fetchPipeline } = usePipelineStore();

  // Fetch all analytics data
  const fetchAnalytics = async () => {
    try {
      setError(null);

      // Fetch all data in parallel
      const [dashboardRes, teamRes, sourcesRes, funnelRes] = await Promise.all([
        analyticsApi.getDashboardStats().catch(() => null),
        analyticsApi.getTeamPerformance({ period }).catch(() => null),
        analyticsApi.getLeadSourceReport().catch(() => null),
        analyticsApi.getConversionFunnel().catch(() => null),
      ]);

      // Process dashboard stats
      if (dashboardRes?.stats) {
        const s = dashboardRes.stats;
        setStats([
          {
            title: 'Total Revenue',
            value: `$${(s.totalRevenue || 0).toLocaleString()}`,
            change: '-',
            trend: 'up' as const,
            icon: DollarSign,
            description: 'vs last period',
          },
          {
            title: 'Converted This Month',
            value: String(s.convertedThisMonth || 0),
            change: '-',
            trend: 'up' as const,
            icon: Target,
            description: 'vs last period',
          },
          {
            title: 'Conversion Rate',
            value: `${(s.conversionRate || 0).toFixed(1)}%`,
            change: '-',
            trend: 'up' as const,
            icon: TrendingUp,
            description: 'vs last period',
          },
          {
            title: 'New Leads Today',
            value: String(s.newLeadsToday || 0),
            change: '-',
            trend: 'up' as const,
            icon: Users,
            description: 'vs last period',
          },
        ]);
      } else {
        // Fallback stats
        setStats([
          { title: 'Total Revenue', value: '$0', change: '-', trend: 'up', icon: DollarSign, description: 'vs last period' },
          { title: 'Deals Closed', value: '0', change: '-', trend: 'up', icon: Target, description: 'vs last period' },
          { title: 'Conversion Rate', value: '0%', change: '-', trend: 'up', icon: TrendingUp, description: 'vs last period' },
          { title: 'New Leads', value: '0', change: '-', trend: 'up', icon: Users, description: 'vs last period' },
        ]);
      }

      // Process team performance
      if (teamRes?.performance && Array.isArray(teamRes.performance)) {
        setTeamPerformance(
          teamRes.performance.map((p) => ({
            name: p.userName,
            deals: p.leadsConverted || 0,
            revenue: p.revenue || 0,
            rate: p.conversionRate || 0,
          }))
        );
      } else {
        setTeamPerformance([]);
      }

      // Process lead sources
      if (sourcesRes?.data && Array.isArray(sourcesRes.data)) {
        const totalLeads = sourcesRes.data.reduce((sum, s) => sum + s.count, 0);
        setLeadSources(
          sourcesRes.data.map((s) => ({
            source: s.source.charAt(0).toUpperCase() + s.source.slice(1).replace('_', ' '),
            leads: s.count,
            percentage: totalLeads > 0 ? Math.round((s.count / totalLeads) * 100) : 0,
            color: sourceColors[s.source.toLowerCase()] || 'bg-gray-500',
            revenue: s.revenue,
          }))
        );
      } else {
        setLeadSources([]);
      }

      // Process conversion funnel
      if (funnelRes?.funnel && Array.isArray(funnelRes.funnel)) {
        const maxCount = funnelRes.funnel[0]?.count || 1;
        setConversionFunnel(
          funnelRes.funnel.map((f) => ({
            stage: f.stage.charAt(0).toUpperCase() + f.stage.slice(1),
            count: f.count,
            percentage: Math.round((f.count / maxCount) * 100),
          }))
        );
      } else {
        setConversionFunnel([]);
      }

      // Also fetch pipeline data
      await fetchPipeline();
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    setIsLoading(true);
    fetchAnalytics();
  }, [period]);

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAnalytics();
  };

  // Build pipeline data from stages
  const pipelineStages = (stages ?? []).length > 0
    ? (stages ?? []).map((stage) => ({
        stage: stage.name,
        count: stage.leads.length,
        value: stage.totalValue || 0,
        color: stageColors[stage.id] || 'bg-gray-500',
      }))
    : [];

  const maxPipelineValue = Math.max(...pipelineStages.map((s) => s.value), 1);

  // Find best performing source
  const bestConvertingSource = leadSources.length > 0
    ? leadSources.reduce((best, curr) =>
        (curr.revenue / (curr.leads || 1)) > (best.revenue / (best.leads || 1)) ? curr : best
      )
    : null;

  const highestVolumeSource = leadSources.length > 0
    ? leadSources.reduce((best, curr) => curr.leads > best.leads ? curr : best)
    : null;

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your sales performance and team metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs">
                {stat.trend === 'up' ? (
                  <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span
                  className={
                    stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }
                >
                  {stat.change}
                </span>
                <span className="ml-1 text-muted-foreground">
                  {stat.description}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
          <TabsTrigger value="sources">Lead Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Pipeline Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Pipeline Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pipelineStages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No pipeline data available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pipelineStages.map((stage) => (
                      <div key={stage.stage} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-3 w-3 rounded-full ${stage.color}`}
                            />
                            <span>{stage.stage}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="secondary">{stage.count}</Badge>
                            <span className="text-muted-foreground w-24 text-right">
                              ${stage.value.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <Progress
                          value={(stage.value / maxPipelineValue) * 100}
                          className={`h-2 ${stage.color}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Conversion Funnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                {conversionFunnel.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No funnel data available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conversionFunnel.map((stage, index) => (
                      <div key={stage.stage} className="relative">
                        <div
                          className="h-16 rounded-lg bg-primary/10 flex items-center justify-between px-4 transition-all"
                          style={{
                            width: `${Math.max(stage.percentage, 20)}%`,
                            marginLeft: `${(100 - Math.max(stage.percentage, 20)) / 2}%`,
                          }}
                        >
                          <span className="font-medium">{stage.stage}</span>
                          <div className="text-right">
                            <p className="font-bold">{stage.count}</p>
                            <p className="text-xs text-muted-foreground">
                              {stage.percentage}%
                            </p>
                          </div>
                        </div>
                        {index < conversionFunnel.length - 1 && (
                          <div className="flex justify-center py-1">
                            <ArrowDown className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {teamPerformance.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No team performance data available</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {teamPerformance.map((member, index) => (
                    <div key={member.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={index === 0 ? 'default' : 'secondary'}
                            className="w-6 h-6 rounded-full p-0 flex items-center justify-center"
                          >
                            {index + 1}
                          </Badge>
                          <span className="font-medium">{member.name}</span>
                        </div>
                        <div className="flex items-center gap-8 text-sm">
                          <div className="text-right">
                            <p className="text-muted-foreground">Deals</p>
                            <p className="font-semibold">{member.deals}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-muted-foreground">Revenue</p>
                            <p className="font-semibold">
                              ${member.revenue.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right w-20">
                            <p className="text-muted-foreground">Conv. Rate</p>
                            <p className="font-semibold">{member.rate}%</p>
                          </div>
                        </div>
                      </div>
                      <Progress value={member.rate} className="h-2" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Lead Sources</CardTitle>
              </CardHeader>
              <CardContent>
                {leadSources.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No lead source data available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leadSources.map((source) => (
                      <div key={source.source} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-3 w-3 rounded-full ${source.color}`}
                            />
                            <span>{source.source}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-muted-foreground">
                              {source.leads} leads
                            </span>
                            <span className="font-semibold w-12 text-right">
                              {source.percentage}%
                            </span>
                          </div>
                        </div>
                        <Progress
                          value={source.percentage}
                          className={`h-2 ${source.color}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Source Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">
                        Best Converting Source
                      </p>
                      <p className="text-xl font-bold">
                        {bestConvertingSource?.source || '-'}
                      </p>
                      {bestConvertingSource && (
                        <Badge variant="secondary">
                          ${bestConvertingSource.revenue.toLocaleString()} rev
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2 p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">
                        Highest Volume Source
                      </p>
                      <p className="text-xl font-bold">
                        {highestVolumeSource?.source || '-'}
                      </p>
                      {highestVolumeSource && (
                        <Badge variant="secondary">
                          {highestVolumeSource.leads} leads
                        </Badge>
                      )}
                    </div>
                  </div>

                  {leadSources.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Source Insights</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {bestConvertingSource && highestVolumeSource &&
                         bestConvertingSource.source !== highestVolumeSource.source && (
                          <li className="flex items-start gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                            {bestConvertingSource.source} leads generate higher revenue per lead
                          </li>
                        )}
                        {leadSources.slice(0, 3).map((source) => (
                          <li key={source.source} className="flex items-start gap-2">
                            <div className={`h-2 w-2 rounded-full ${source.color} mt-1.5`} />
                            {source.source}: {source.leads} leads, ${source.revenue.toLocaleString()} revenue
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
