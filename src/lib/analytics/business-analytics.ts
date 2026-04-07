/**
 * HealthShield - Business Analytics Engine
 *
 * Comprehensive analytics for:
 * - Revenue tracking & projections
 * - Booking trends & patterns
 * - Customer insights
 * - Performance metrics
 * - Growth recommendations
 */

export interface RevenueData {
  date: string;
  revenue: number;
  bookings: number;
  avgBookingValue: number;
}

export interface BookingAnalytics {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  noShows: number;
  conversionRate: number;
  avgLeadTime: number; // days between booking and trip
}

export interface BoatPerformance {
  boatSlug: string;
  boatName: string;
  totalRevenue: number;
  bookingCount: number;
  avgRating: number;
  utilizationRate: number;
  mostPopularDuration: string;
}

export interface CustomerSegment {
  name: string;
  count: number;
  totalRevenue: number;
  avgBookingValue: number;
  repeatRate: number;
}

export interface MarketingMetrics {
  source: string;
  bookings: number;
  revenue: number;
  conversionRate: number;
  costPerAcquisition: number;
}

export interface FinancialSummary {
  grossRevenue: number;
  netRevenue: number;
  expenses: {
    fuel: number;
    captainWages: number;
    insurance: number;
    maintenance: number;
    marketing: number;
    other: number;
  };
  profitMargin: number;
  projectedMonthlyRevenue: number;
  projectedAnnualRevenue: number;
}

// Sample data generators (in production, this pulls from database)
export function generateWeeklyRevenueData(): RevenueData[] {
  const data: RevenueData[] = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 7);

  for (let i = 0; i < 7; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    const dayOfWeek = date.getDay();

    // Weekend has more revenue
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseRevenue = isWeekend ? 3500 : 1200;
    const variance = Math.random() * 1000 - 500;

    const revenue = Math.round(baseRevenue + variance);
    const bookings = isWeekend ? Math.floor(Math.random() * 4) + 3 : Math.floor(Math.random() * 2) + 1;

    data.push({
      date: date.toISOString().split('T')[0],
      revenue,
      bookings,
      avgBookingValue: Math.round(revenue / Math.max(bookings, 1)),
    });
  }

  return data;
}

export function generateMonthlyRevenueData(): RevenueData[] {
  const data: RevenueData[] = [];
  const baseDate = new Date();
  baseDate.setDate(1);
  baseDate.setMonth(baseDate.getMonth() - 11);

  const seasonalMultipliers: Record<number, number> = {
    0: 0.4,  // Jan
    1: 0.5,  // Feb
    2: 0.7,  // Mar
    3: 0.9,  // Apr
    4: 1.2,  // May
    5: 1.5,  // Jun
    6: 1.6,  // Jul
    7: 1.5,  // Aug
    8: 1.1,  // Sep
    9: 0.8,  // Oct
    10: 0.5, // Nov
    11: 0.4, // Dec
  };

  for (let i = 0; i < 12; i++) {
    const date = new Date(baseDate);
    date.setMonth(date.getMonth() + i);
    const month = date.getMonth();

    const baseRevenue = 25000;
    const multiplier = seasonalMultipliers[month];
    const variance = Math.random() * 5000 - 2500;

    const revenue = Math.round(baseRevenue * multiplier + variance);
    const bookings = Math.round(revenue / 650);

    data.push({
      date: date.toISOString().substring(0, 7),
      revenue,
      bookings,
      avgBookingValue: Math.round(revenue / Math.max(bookings, 1)),
    });
  }

  return data;
}

export function getBoatPerformance(): BoatPerformance[] {
  return [
    {
      boatSlug: 'king-kong',
      boatName: 'King Kong',
      totalRevenue: 45000,
      bookingCount: 52,
      avgRating: 4.9,
      utilizationRate: 78,
      mostPopularDuration: '4hr',
    },
    {
      boatSlug: 'bananarama',
      boatName: 'Bananarama',
      totalRevenue: 38000,
      bookingCount: 48,
      avgRating: 4.8,
      utilizationRate: 72,
      mostPopularDuration: '4hr',
    },
    {
      boatSlug: 'lemon-drop',
      boatName: 'Lemon Drop',
      totalRevenue: 32000,
      bookingCount: 42,
      avgRating: 4.7,
      utilizationRate: 65,
      mostPopularDuration: '3hr',
    },
    {
      boatSlug: 'banana-split',
      boatName: 'Banana Split',
      totalRevenue: 28000,
      bookingCount: 38,
      avgRating: 4.9,
      utilizationRate: 58,
      mostPopularDuration: '4hr',
    },
    {
      boatSlug: 'pineapple-express',
      boatName: 'Pineapple Express',
      totalRevenue: 26000,
      bookingCount: 35,
      avgRating: 4.8,
      utilizationRate: 55,
      mostPopularDuration: '3hr',
    },
    {
      boatSlug: 'the-swiftie',
      boatName: 'The Swiftie!',
      totalRevenue: 24000,
      bookingCount: 32,
      avgRating: 4.9,
      utilizationRate: 52,
      mostPopularDuration: '4hr',
    },
  ];
}

export function getCustomerSegments(): CustomerSegment[] {
  return [
    {
      name: 'Bachelor/Bachelorette Parties',
      count: 85,
      totalRevenue: 72000,
      avgBookingValue: 847,
      repeatRate: 15,
    },
    {
      name: 'Birthday Celebrations',
      count: 62,
      totalRevenue: 48000,
      avgBookingValue: 774,
      repeatRate: 25,
    },
    {
      name: 'Corporate Events',
      count: 28,
      totalRevenue: 42000,
      avgBookingValue: 1500,
      repeatRate: 45,
    },
    {
      name: 'Family Gatherings',
      count: 45,
      totalRevenue: 32000,
      avgBookingValue: 711,
      repeatRate: 35,
    },
    {
      name: 'Casual Day Trips',
      count: 72,
      totalRevenue: 38000,
      avgBookingValue: 528,
      repeatRate: 40,
    },
  ];
}

export function getMarketingMetrics(): MarketingMetrics[] {
  return [
    {
      source: 'Instagram',
      bookings: 95,
      revenue: 68000,
      conversionRate: 3.2,
      costPerAcquisition: 25,
    },
    {
      source: 'Google Search',
      bookings: 78,
      revenue: 58000,
      conversionRate: 4.5,
      costPerAcquisition: 45,
    },
    {
      source: 'Word of Mouth',
      bookings: 65,
      revenue: 52000,
      conversionRate: 12.0,
      costPerAcquisition: 0,
    },
    {
      source: 'Facebook',
      bookings: 42,
      revenue: 32000,
      conversionRate: 2.8,
      costPerAcquisition: 35,
    },
    {
      source: 'TikTok',
      bookings: 28,
      revenue: 18000,
      conversionRate: 1.5,
      costPerAcquisition: 20,
    },
    {
      source: 'Direct',
      bookings: 35,
      revenue: 28000,
      conversionRate: 8.0,
      costPerAcquisition: 0,
    },
  ];
}

export function getFinancialSummary(): FinancialSummary {
  const grossRevenue = 193000;
  const expenses = {
    fuel: 12000,
    captainWages: 45000,
    insurance: 18000,
    maintenance: 8500,
    marketing: 6500,
    other: 5000,
  };

  const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0);
  const netRevenue = grossRevenue - totalExpenses;
  const profitMargin = (netRevenue / grossRevenue) * 100;

  return {
    grossRevenue,
    netRevenue,
    expenses,
    profitMargin,
    projectedMonthlyRevenue: Math.round(grossRevenue / 6), // Based on 6 months of data
    projectedAnnualRevenue: Math.round((grossRevenue / 6) * 12),
  };
}

export function getBookingAnalytics(): BookingAnalytics {
  return {
    totalBookings: 292,
    completedBookings: 268,
    cancelledBookings: 18,
    noShows: 6,
    conversionRate: 3.8,
    avgLeadTime: 12,
  };
}

// Growth recommendations based on data
export function getGrowthRecommendations(data: {
  utilizationRate: number;
  repeatRate: number;
  avgRating: number;
  topSource: string;
}): string[] {
  const recommendations: string[] = [];

  if (data.utilizationRate < 70) {
    recommendations.push(
      'Consider weekday promotions to increase utilization rate. Target corporate events and team-building activities for Tue-Thu.'
    );
  }

  if (data.repeatRate < 30) {
    recommendations.push(
      'Implement a loyalty program to increase repeat bookings. Offer 10% off for returning customers.'
    );
  }

  if (data.avgRating >= 4.7) {
    recommendations.push(
      'Your excellent rating is an asset! Feature customer testimonials prominently on your website and social media.'
    );
  }

  if (data.topSource === 'Word of Mouth') {
    recommendations.push(
      'Word of mouth is your best channel. Consider a referral program: $50 off for both referrer and new customer.'
    );
  }

  recommendations.push(
    'Peak season (May-Aug) drives 60% of revenue. Build cash reserves during this time for off-season operations.'
  );

  recommendations.push(
    'Bachelor/bachelorette parties are your highest value segment. Partner with wedding planners and engagement venues.'
  );

  return recommendations;
}

// Chart data formatters
export function formatRevenueForChart(data: RevenueData[]): {
  labels: string[];
  datasets: { label: string; data: number[]; borderColor: string; backgroundColor: string }[];
} {
  return {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Revenue ($)',
        data: data.map(d => d.revenue),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      },
    ],
  };
}

export function formatBookingsForChart(data: RevenueData[]): {
  labels: string[];
  datasets: { label: string; data: number[]; backgroundColor: string }[];
} {
  return {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Bookings',
        data: data.map(d => d.bookings),
        backgroundColor: 'rgb(234, 179, 8)',
      },
    ],
  };
}

export function formatBoatPerformanceForChart(data: BoatPerformance[]): {
  labels: string[];
  datasets: { label: string; data: number[]; backgroundColor: string[] }[];
} {
  const colors = [
    'rgba(59, 130, 246, 0.8)',
    'rgba(234, 179, 8, 0.8)',
    'rgba(34, 197, 94, 0.8)',
    'rgba(249, 115, 22, 0.8)',
    'rgba(168, 85, 247, 0.8)',
    'rgba(236, 72, 153, 0.8)',
  ];

  return {
    labels: data.map(d => d.boatName),
    datasets: [
      {
        label: 'Revenue ($)',
        data: data.map(d => d.totalRevenue),
        backgroundColor: colors,
      },
    ],
  };
}

// KPI calculations
export function calculateKPIs(monthlyData: RevenueData[]): {
  totalRevenue: number;
  avgMonthlyRevenue: number;
  bestMonth: { month: string; revenue: number };
  worstMonth: { month: string; revenue: number };
  growthRate: number;
  revenuePerBooking: number;
} {
  if (!monthlyData || monthlyData.length === 0) {
    return {
      totalRevenue: 0,
      avgMonthlyRevenue: 0,
      bestMonth: { month: '—', revenue: 0 },
      worstMonth: { month: '—', revenue: 0 },
      growthRate: 0,
      revenuePerBooking: 0,
    };
  }

  const totalRevenue = monthlyData.reduce((sum, d) => sum + d.revenue, 0);
  const avgMonthlyRevenue = Math.round(totalRevenue / monthlyData.length);

  const sorted = [...monthlyData].sort((a, b) => b.revenue - a.revenue);
  const bestMonth = { month: sorted[0].date, revenue: sorted[0].revenue };
  const worstMonth = { month: sorted[sorted.length - 1].date, revenue: sorted[sorted.length - 1].revenue };

  const recentMonths = monthlyData.slice(-3);
  const earlierMonths = monthlyData.slice(0, 3);
  const recentAvg = recentMonths.length > 0 ? recentMonths.reduce((s, d) => s + d.revenue, 0) / recentMonths.length : 0;
  const earlierAvg = earlierMonths.length > 0 ? earlierMonths.reduce((s, d) => s + d.revenue, 0) / earlierMonths.length : 0;
  const growthRate = earlierAvg > 0 ? ((recentAvg - earlierAvg) / earlierAvg) * 100 : 0;

  const totalBookings = monthlyData.reduce((sum, d) => sum + d.bookings, 0);
  const revenuePerBooking = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

  return {
    totalRevenue,
    avgMonthlyRevenue,
    bestMonth,
    worstMonth,
    growthRate: Math.round(growthRate),
    revenuePerBooking,
  };
}
