/**
 * HealthShield - Stripe Payment Integration
 *
 * Complete payment processing solution:
 * - Secure checkout
 * - Deposit handling
 * - Refund processing
 * - Payment tracking
 * - Receipt generation
 */

export interface PaymentConfig {
  publishableKey: string;
  currency: string;
  depositPercentage: number;
  weekendSurchargePercent: number;
  holidaySurchargePercent: number;
}

export const paymentConfig: PaymentConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  currency: 'usd',
  depositPercentage: 100,
  weekendSurchargePercent: 0, // Surcharges baked into day-type pricing (Fri/Sun/Sat)
  holidaySurchargePercent: 0, // Surcharges baked into day-type pricing (Sat/holidays)
};

export interface BookingPayment {
  id: string;
  bookingId: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  serviceSlug: string;
  serviceName: string;
  appointmentDate: Date;
  duration: '3hr' | '4hr' | '5hr' | '6hr' | '7hr' | '8hr';
  basePrice: number;
  surcharges: Surcharge[];
  totalAmount: number;
  depositAmount: number;
  balanceAmount: number;
  tipAmount: number;
  gratuityPercent: number;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  depositPaidAt?: Date;
  balancePaidAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
  refundReason?: string;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentStatus =
  | 'pending'
  | 'deposit_paid'
  | 'fully_paid'
  | 'partially_refunded'
  | 'fully_refunded'
  | 'failed'
  | 'cancelled';

export interface Surcharge {
  type: 'weekend' | 'holiday' | 'large_group' | 'premium_addon';
  description: string;
  amount: number;
  percentage?: number;
}

export interface CreatePaymentIntentRequest {
  bookingId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  metadata: {
    serviceSlug: string;
    serviceName: string;
    appointmentDate: string;
    duration: string;
    paymentType: 'deposit' | 'balance' | 'full';
  };
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
}

export interface RefundRequest {
  paymentIntentId: string;
  amount: number;
  reason: 'customer_request' | 'weather_cancellation' | 'duplicate' | 'other';
  note?: string;
}

// Price calculation utilities
export function calculateBookingPrice(params: {
  basePrice: number;
  appointmentDate: Date;
  groupSize: number;
  maxCapacity: number;
  addons?: string[];
}): {
  basePrice: number;
  surcharges: Surcharge[];
  subtotal: number;
  total: number;
} {
  const surcharges: Surcharge[] = [];
  let subtotal = params.basePrice;

  // Weekend surcharge
  const dayOfWeek = params.appointmentDate.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    const weekendSurcharge = Math.round(params.basePrice * (paymentConfig.weekendSurchargePercent / 100));
    surcharges.push({
      type: 'weekend',
      description: 'Weekend Booking',
      amount: weekendSurcharge,
      percentage: paymentConfig.weekendSurchargePercent,
    });
    subtotal += weekendSurcharge;
  }

  // Holiday surcharge
  if (isHolidayWeekend(params.appointmentDate)) {
    const holidaySurcharge = Math.round(params.basePrice * (paymentConfig.holidaySurchargePercent / 100));
    surcharges.push({
      type: 'holiday',
      description: 'Holiday Weekend',
      amount: holidaySurcharge,
      percentage: paymentConfig.holidaySurchargePercent,
    });
    subtotal += holidaySurcharge;
  }

  // Large group surcharge (if over 80% capacity)
  const capacityRatio = params.groupSize / params.maxCapacity;
  if (capacityRatio > 0.8) {
    const largeGroupSurcharge = Math.round(params.basePrice * 0.1);
    surcharges.push({
      type: 'large_group',
      description: 'Large Group',
      amount: largeGroupSurcharge,
      percentage: 10,
    });
    subtotal += largeGroupSurcharge;
  }

  return {
    basePrice: params.basePrice,
    surcharges,
    subtotal,
    total: subtotal,
  };
}

export function calculateDeposit(totalAmount: number): number {
  return Math.round(totalAmount * (paymentConfig.depositPercentage / 100));
}

export function calculateBalance(totalAmount: number, depositPaid: number): number {
  return totalAmount - depositPaid;
}

export function calculateTip(amount: number, percentage: number): number {
  return Math.round(amount * (percentage / 100));
}

function isHolidayWeekend(date: Date): boolean {
  const month = date.getMonth();
  const day = date.getDate();

  // Memorial Day (late May)
  if (month === 4 && day >= 25) return true;

  // July 4th weekend
  if (month === 6 && day >= 1 && day <= 7) return true;

  // Labor Day (early September)
  if (month === 8 && day <= 7) return true;

  return false;
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);
}

export function formatCurrencySimple(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// Sample payment data
export const samplePayments: BookingPayment[] = [
  {
    id: 'pay-001',
    bookingId: 'book-001',
    customerId: 'cust-001',
    customerEmail: 'jessica@email.com',
    customerName: 'Jessica Johnson',
    serviceSlug: 'consultation-001',
    serviceName: 'Health Consultation',
    appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    duration: '4hr',
    basePrice: 1000,
    surcharges: [
      { type: 'weekend', description: 'Weekend Booking', amount: 200, percentage: 20 },
    ],
    totalAmount: 1200,
    depositAmount: 600,
    balanceAmount: 600,
    tipAmount: 180,
    gratuityPercent: 15,
    status: 'deposit_paid',
    stripePaymentIntentId: 'pi_1234567890',
    depositPaidAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: 'pay-002',
    bookingId: 'book-002',
    customerId: 'cust-002',
    customerEmail: 'mike@company.com',
    customerName: 'Mike Thompson',
    serviceSlug: 'enrollment-001',
    serviceName: 'Plan Enrollment',
    appointmentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    duration: '6hr',
    basePrice: 1200,
    surcharges: [],
    totalAmount: 1200,
    depositAmount: 600,
    balanceAmount: 0,
    tipAmount: 240,
    gratuityPercent: 20,
    status: 'fully_paid',
    stripePaymentIntentId: 'pi_0987654321',
    depositPaidAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    balancePaidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    receiptUrl: 'https://pay.stripe.com/receipts/...',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: 'pay-003',
    bookingId: 'book-003',
    customerId: 'cust-003',
    customerEmail: 'sarah@email.com',
    customerName: 'Sarah Williams',
    serviceSlug: 'claims-001',
    serviceName: 'Claims Review',
    appointmentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    duration: '4hr',
    basePrice: 750,
    surcharges: [
      { type: 'holiday', description: 'Memorial Day Weekend', amount: 375, percentage: 50 },
    ],
    totalAmount: 1125,
    depositAmount: 562,
    balanceAmount: 0,
    tipAmount: 281,
    gratuityPercent: 25,
    status: 'fully_paid',
    stripePaymentIntentId: 'pi_1122334455',
    depositPaidAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    balancePaidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    receiptUrl: 'https://pay.stripe.com/receipts/...',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
];

// Payment analytics
export function getPaymentAnalytics(payments: BookingPayment[]): {
  totalRevenue: number;
  totalTips: number;
  pendingBalance: number;
  averageBookingValue: number;
  depositConversionRate: number;
  refundRate: number;
  paymentsByStatus: Record<PaymentStatus, number>;
} {
  const completed = payments.filter((p) => p.status === 'fully_paid');
  const pending = payments.filter((p) => p.status === 'deposit_paid');
  const refunded = payments.filter((p) =>
    ['partially_refunded', 'fully_refunded'].includes(p.status)
  );

  const totalRevenue = completed.reduce(
    (sum, p) => sum + p.totalAmount + p.tipAmount,
    0
  );

  const totalTips = completed.reduce((sum, p) => sum + p.tipAmount, 0);

  const pendingBalance = pending.reduce((sum, p) => sum + p.balanceAmount, 0);

  const averageBookingValue =
    completed.length > 0 ? totalRevenue / completed.length : 0;

  const allWithDeposit = payments.filter(
    (p) => p.status !== 'pending' && p.status !== 'failed' && p.status !== 'cancelled'
  );
  const depositConversionRate =
    allWithDeposit.length > 0
      ? (completed.length / allWithDeposit.length) * 100
      : 0;

  const refundRate =
    payments.length > 0 ? (refunded.length / payments.length) * 100 : 0;

  const paymentsByStatus: Record<PaymentStatus, number> = {
    pending: 0,
    deposit_paid: 0,
    fully_paid: 0,
    partially_refunded: 0,
    fully_refunded: 0,
    failed: 0,
    cancelled: 0,
  };

  for (const payment of payments) {
    paymentsByStatus[payment.status]++;
  }

  return {
    totalRevenue,
    totalTips,
    pendingBalance,
    averageBookingValue,
    depositConversionRate,
    refundRate,
    paymentsByStatus,
  };
}

// Refund calculation based on policy
export function calculateRefundAmount(
  payment: BookingPayment,
  cancellationDate: Date
): {
  refundAmount: number;
  processingFee: number;
  reason: string;
} {
  const apptDate = new Date(payment.appointmentDate);
  const daysUntilAppointment = Math.ceil(
    (apptDate.getTime() - cancellationDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const totalPaid = payment.depositAmount + (payment.balancePaidAt ? payment.balanceAmount : 0);

  if (daysUntilAppointment >= 7) {
    // Full refund minus $50 processing
    return {
      refundAmount: totalPaid - 50,
      processingFee: 50,
      reason: 'Cancelled 7+ days before appointment',
    };
  } else if (daysUntilAppointment >= 3) {
    // 50% refund
    return {
      refundAmount: Math.round(totalPaid * 0.5),
      processingFee: 0,
      reason: 'Cancelled 3-7 days before appointment (50% refund)',
    };
  } else {
    // No refund
    return {
      refundAmount: 0,
      processingFee: 0,
      reason: 'Cancelled less than 3 days before appointment (no refund)',
    };
  }
}

// Generate receipt data
export function generateReceiptData(payment: BookingPayment): {
  receiptNumber: string;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  customerName: string;
  customerEmail: string;
  items: { description: string; amount: number }[];
  subtotal: number;
  surcharges: Surcharge[];
  total: number;
  tip: number;
  grandTotal: number;
  paymentMethod: string;
  transactionId: string;
  date: string;
} {
  const durationLabels: Record<string, string> = {
    '3hr': '3 Hour Session',
    '4hr': '4 Hour Session',
    '5hr': '5 Hour Session',
    '6hr': '6 Hour Session (Half Day)',
    '7hr': '7 Hour Session',
    '8hr': 'Full Day Session (8 Hours)',
  };

  return {
    receiptNumber: `RCP-${payment.id.split('-')[1]}`,
    businessName: 'HealthShield',
    businessAddress: 'HealthShield Office',
    businessPhone: '',
    customerName: payment.customerName,
    customerEmail: payment.customerEmail,
    items: [
      {
        description: `${payment.serviceName} - ${durationLabels[payment.duration]}`,
        amount: payment.basePrice,
      },
    ],
    subtotal: payment.basePrice,
    surcharges: payment.surcharges,
    total: payment.totalAmount,
    tip: payment.tipAmount,
    grandTotal: payment.totalAmount + payment.tipAmount,
    paymentMethod: 'Credit Card',
    transactionId: payment.stripePaymentIntentId || 'N/A',
    date: payment.balancePaidAt
      ? payment.balancePaidAt.toLocaleDateString()
      : payment.depositPaidAt
      ? payment.depositPaidAt.toLocaleDateString()
      : 'Pending',
  };
}

// Gratuity options
export const gratuityOptions = [
  { percent: 15, label: '15%', description: 'Good' },
  { percent: 20, label: '20%', description: 'Great' },
  { percent: 25, label: '25%', description: 'Excellent' },
  { percent: 0, label: 'Custom', description: 'Enter amount' },
];
