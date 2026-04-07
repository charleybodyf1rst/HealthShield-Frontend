// Booking/Reservation Management Types for Boat Rental CRM

export type BookingStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded' | 'failed';
export type BookingSource = 'website' | 'phone' | 'walk-in' | 'referral' | 'repeat' | 'partner';
export type PartyType = 'birthday' | 'bachelor' | 'bachelorette' | 'corporate' | 'family' | 'reunion' | 'anniversary' | 'other';

export interface Booking {
  id: string;
  bookingNumber: string; // e.g., "BBR-2024-001234"

  // Customer Info
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerNotes?: string;
  isRepeatCustomer?: boolean;

  // Boat & Crew
  boatId: string;
  boatName?: string;
  captainId?: string;
  captainName?: string;
  crewIds?: string[];

  // Schedule
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // hours
  checkInTime?: string;
  checkOutTime?: string;

  // Party Details
  partySize: number;
  partyType: PartyType;
  partyName?: string; // e.g., "Sarah's 30th Birthday"
  specialRequests?: string;
  dietaryRestrictions?: string;

  // Location
  location: 'lake-travis';
  pickupLocation?: string;
  dropoffLocation?: string;

  // Pricing
  basePrice: number;
  addOns?: BookingAddOn[];
  addOnsTotal: number;
  discount?: number;
  discountCode?: string;
  taxAmount: number;
  totalPrice: number;

  // Payment
  depositAmount: number;
  depositPaid: number;
  depositPaidAt?: string;
  balanceDue: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash' | 'check';
  stripePaymentIntentId?: string;
  refundAmount?: number;
  refundReason?: string;

  // Status
  status: BookingStatus;
  confirmedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  completedAt?: string;

  // Source & Attribution
  source: BookingSource;
  referralSource?: string;
  marketingCampaign?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;

  // Feedback
  customerRating?: number;
  customerFeedback?: string;
  internalNotes?: string;

  // Communication
  confirmationSentAt?: string;
  reminderSentAt?: string;
  followUpSentAt?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface BookingAddOn {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface BookingCalendarEvent {
  id: string;
  bookingId: string;
  title: string; // e.g., "King Kong - Sarah's Birthday"
  start: string; // ISO datetime
  end: string; // ISO datetime
  boatId: string;
  boatName: string;
  boatColor: 'yellow' | 'pink' | 'blue';
  captainId?: string;
  captainName?: string;
  status: BookingStatus;
  partySize: number;
  customerName: string;
  location: 'lake-travis';
}

export interface BookingStats {
  // Counts
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  inProgressBookings: number;
  completedBookings: number;
  cancelledBookings: number;

  // Financial
  totalRevenue: number;
  totalDeposits: number;
  pendingPayments: number;
  averageBookingValue: number;

  // Conversion
  conversionRate: number;
  cancellationRate: number;

  // By Time
  bookingsToday: number;
  bookingsThisWeek: number;
  bookingsThisMonth: number;

  // By Source
  bySource: {
    website: number;
    phone: number;
    walkIn: number;
    referral: number;
    repeat: number;
    partner: number;
  };

  // By Party Type
  byPartyType: {
    birthday: number;
    bachelor: number;
    bachelorette: number;
    corporate: number;
    family: number;
    other: number;
  };

  // Customer Satisfaction
  averageRating: number;
  totalReviews: number;
}

export interface TimeSlot {
  id: string;
  boatId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  isAvailable: boolean;
  price: number;
  bookingId?: string;
}

// API Request/Response Types
export interface BookingFilters {
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  boatId?: string;
  captainId?: string;
  location?: 'lake-travis';
  partyType?: PartyType;
  source?: BookingSource;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sort?: 'date' | 'createdAt' | 'totalPrice' | 'status' | 'customerName';
  order?: 'asc' | 'desc';
  page?: number;
  perPage?: number;
}

export interface CreateBookingData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  boatId: string;
  date: string;
  startTime: string;
  duration: number;
  partySize: number;
  partyType: PartyType;
  partyName?: string;
  specialRequests?: string;
  source: BookingSource;
  depositAmount?: number;
  addOns?: Omit<BookingAddOn, 'id'>[];
  discountCode?: string;
  internalNotes?: string;
}

export interface UpdateBookingData {
  boatId?: string;
  captainId?: string;
  date?: string;
  startTime?: string;
  duration?: number;
  partySize?: number;
  partyType?: PartyType;
  partyName?: string;
  specialRequests?: string;
  status?: BookingStatus;
  internalNotes?: string;
}

export interface AssignCaptainData {
  captainId: string;
  notifyCustomer?: boolean;
  notifyCaptain?: boolean;
}

export interface CancelBookingData {
  reason: string;
  refundAmount?: number;
  notifyCustomer?: boolean;
}

export interface CalendarQuery {
  startDate: string;
  endDate: string;
  boatIds?: string[];
  captainIds?: string[];
  location?: 'lake-travis';
  status?: BookingStatus[];
}
