'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { useInsuranceStore } from '@/stores/insurance-store';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Placeholder trend data for the chart
const trendData = [
  { month: 'Jan', score: 72 },
  { month: 'Feb', score: 74 },
  { month: 'Mar', score: 71 },
  { month: 'Apr', score: 76 },
  { month: 'May', score: 78 },
  { month: 'Jun', score: 80 },
  { month: 'Jul', score: 79 },
  { month: 'Aug', score: 82 },
  { month: 'Sep', score: 85 },
  { month: 'Oct', score: 83 },
  { month: 'Nov', score: 86 },
  { month: 'Dec', score: 88 },
];

const trendIcons = {
  up: <ArrowUp className="h-4 w-4 text-green-500" />,
  down: <ArrowDown className="h-4 w-4 text-red-500" />,
  stable: <Minus className="h-4 w-4 text-gray-400" />,
};

const trendColors = {
  up: 'text-green-500',
  down: 'text-red-500',
  stable: 'text-gray-400',
};

export default function WellnessPage() {
  const { wellnessMetrics, isLoading, error, fetchWellnessMetrics } = useInsuranceStore();

  useEffect(() => {
    fetchWellnessMetrics();
  }, [fetchWellnessMetrics]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Wellness Metrics</h1>
        <p className="text-muted-foreground">
          Monitor health and wellness indicators across your insurance programs.
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Wellness Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Wellness Score Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  domain={[60, 100]}
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      {isLoading && wellnessMetrics.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : wellnessMetrics.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No wellness metrics available</p>
              <p className="text-sm mt-1">
                Metrics will appear here as enrollees submit health data.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wellnessMetrics.map((metric) => (
            <Card key={metric.id} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.metricName}
                </CardTitle>
                {metric.trend && trendIcons[metric.trend]}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metric.value.toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {metric.unit}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    Period: {metric.period}
                  </span>
                  {metric.trend && (
                    <span className={`text-xs font-medium ${trendColors[metric.trend]}`}>
                      {metric.trend === 'up' ? 'Improving' : metric.trend === 'down' ? 'Declining' : 'Stable'}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
