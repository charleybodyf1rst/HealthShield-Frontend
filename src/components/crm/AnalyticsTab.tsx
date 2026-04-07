'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Ship,
  Users,
  Phone,
  Calendar,
  RefreshCw,
  Star,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useHealthShieldCrmStore } from '@/stores/healthshield-crm-store';
import { cn } from '@/lib/utils';

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'blue',
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  color?: 'blue' | 'emerald' | 'purple' | 'orange' | 'red';
}) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
            {subtitle && (
              <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={cn("p-3 rounded-xl", colors[color])}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        {trend && trendValue !== undefined && (
          <div className={cn(
            "flex items-center gap-1 mt-3 text-sm font-medium",
            trend === 'up' ? "text-emerald-600" : trend === 'down' ? "text-red-600" : "text-slate-500"
          )}>
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4" />
            ) : trend === 'down' ? (
              <TrendingDown className="w-4 h-4" />
            ) : null}
            <span>{trend === 'up' ? '+' : trend === 'down' ? '-' : ''}{trendValue}% from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BoatPerformanceRow({ name, bookings, revenue }: {
  name: string;
  bookings: number;
  revenue: number;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3">
        <Ship className="w-5 h-5 text-yellow-500" />
        <span className="font-medium text-slate-900">{name}</span>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-sm text-slate-500">Bookings</p>
          <p className="font-semibold">{bookings}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Revenue</p>
          <p className="font-semibold text-emerald-600">${revenue.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

function CaptainRow({ name, trips, rating }: {
  name: string;
  trips: number;
  rating: number;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
          {(name || '').split(' ').filter(Boolean).map(n => n[0]).join('')}
        </div>
        <span className="font-medium text-slate-900">{name}</span>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-sm text-slate-500">Trips</p>
          <p className="font-semibold">{trips}</p>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="font-semibold">{rating.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}

export function AnalyticsTab() {
  const {
    analytics,
    analyticsLoading,
    analyticsPeriod,
    fetchAnalytics,
    setAnalyticsPeriod,
  } = useHealthShieldCrmStore();

  useEffect(() => {
    if (!analytics) {
      fetchAnalytics();
    }
  }, [analytics, fetchAnalytics]);

  const bookings = analytics?.bookings;
  const calls = analytics?.calls;
  const captains = analytics?.captains;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Analytics Dashboard</h2>
          <p className="text-slate-500">Performance metrics and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={analyticsPeriod} onValueChange={(v) => setAnalyticsPeriod(v as typeof analyticsPeriod)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => fetchAnalytics()}>
            <RefreshCw className={cn("w-4 h-4 mr-2", analyticsLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {analyticsLoading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          {/* Top Stats */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              title="Total Revenue"
              value={`$${(bookings?.revenue || 0).toLocaleString()}`}
              subtitle={`${bookings?.bookingsThisMonth || 0} bookings this month`}
              icon={DollarSign}
              trend={bookings?.trend}
              trendValue={bookings?.trendPercent}
              color="emerald"
            />
            <StatCard
              title="Total Bookings"
              value={bookings?.totalBookings || 0}
              subtitle={`${bookings?.completedBookings || 0} completed`}
              icon={Calendar}
              color="blue"
            />
            <StatCard
              title="AI Calls"
              value={calls?.totalCalls || 0}
              subtitle={`${calls?.successRate?.toFixed(1) || 0}% success rate`}
              icon={Phone}
              color="purple"
            />
            <StatCard
              title="Active Captains"
              value={`${captains?.availableCaptains || 0}/${captains?.totalCaptains || 0}`}
              subtitle={`${captains?.tripsToday || 0} trips today`}
              icon={Users}
              color="orange"
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              title="Avg. Booking Value"
              value={`$${(bookings?.avgBookingValue || 0).toLocaleString()}`}
              icon={DollarSign}
              color="blue"
            />
            <StatCard
              title="Completed Trips"
              value={bookings?.completedBookings || 0}
              icon={CheckCircle}
              color="emerald"
            />
            <StatCard
              title="Cancelled"
              value={bookings?.cancelledBookings || 0}
              icon={XCircle}
              color="red"
            />
            <StatCard
              title="Captain Rating"
              value={captains?.avgRating?.toFixed(1) || '0.0'}
              subtitle="Average"
              icon={Star}
              color="orange"
            />
          </div>

          {/* Detail Cards */}
          <div className="grid grid-cols-2 gap-6">
            {/* Boat Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="w-5 h-5 text-yellow-500" />
                  Boat Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bookings?.bookingsByBoat && Object.keys(bookings.bookingsByBoat).length > 0 ? (
                  <div className="space-y-1">
                    {Object.entries(bookings.bookingsByBoat)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([boat, count]) => (
                        <BoatPerformanceRow
                          key={boat}
                          name={boat}
                          bookings={count}
                          revenue={count * (bookings.avgBookingValue || 600)}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    No boat data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Captains */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Top Captains
                </CardTitle>
              </CardHeader>
              <CardContent>
                {captains?.topCaptains && captains.topCaptains.length > 0 ? (
                  <div className="space-y-1">
                    {captains.topCaptains.map((captain) => (
                      <CaptainRow
                        key={captain.id}
                        name={captain.name}
                        trips={captain.trips}
                        rating={captain.rating}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    No captain data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Call Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-purple-500" />
                AI Caller Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Completed</p>
                  <p className="text-2xl font-bold text-emerald-600">{calls?.completedCalls || 0}</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{calls?.failedCalls || 0}</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Today</p>
                  <p className="text-2xl font-bold text-blue-600">{calls?.callsToday || 0}</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">This Week</p>
                  <p className="text-2xl font-bold text-purple-600">{calls?.callsThisWeek || 0}</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Avg Duration</p>
                  <p className="text-2xl font-bold text-slate-700">
                    {Math.floor((calls?.avgDuration || 0) / 60)}:{((calls?.avgDuration || 0) % 60).toString().padStart(2, '0')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
