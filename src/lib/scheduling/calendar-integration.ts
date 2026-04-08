// =============================================================================
// HEALTHSHIELD - CALENDAR & SCHEDULING INTEGRATION
// Full calendar system with Google Calendar sync, appointment management
// =============================================================================

export interface TimeSlot {
  id: string;
  startTime: string; // HH:MM format
  endTime: string;
  duration: number; // hours
  label: string;
}

export interface BookingSlot {
  id: string;
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  timeSlot: TimeSlot;
  status: 'available' | 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  partySize?: number;
  agentId?: string;
  agentName?: string;
  totalPrice?: number;
  depositPaid?: boolean;
  notes?: string;
  specialRequests?: string[];
  addOns?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  certifications: string[];
  assignedServices: string[];
  availability: AgentAvailability[];
  rating: number;
  totalConsultations: number;
  status: 'active' | 'in-session' | 'off-duty' | 'vacation';
}

export interface AgentAvailability {
  dayOfWeek: number; // 0-6, Sunday-Saturday
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay: boolean;
  type: 'booking' | 'maintenance' | 'hold' | 'private-event' | 'blocked';
  serviceId?: string;
  agentId?: string;
  color: string;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// DEFAULT TIME SLOTS
// =============================================================================

export const defaultTimeSlots: TimeSlot[] = [
  { id: 'morning', startTime: '09:00', endTime: '12:00', duration: 3, label: 'Morning (9am - 12pm)' },
  { id: 'midday', startTime: '12:00', endTime: '15:00', duration: 3, label: 'Midday (12pm - 3pm)' },
  { id: 'afternoon', startTime: '15:00', endTime: '18:00', duration: 3, label: 'Afternoon (3pm - 6pm)' },
  { id: 'sunset', startTime: '18:00', endTime: '21:00', duration: 3, label: 'Sunset (6pm - 9pm)' },
  { id: 'half-day-am', startTime: '09:00', endTime: '14:00', duration: 5, label: 'Half Day AM (9am - 2pm)' },
  { id: 'half-day-pm', startTime: '14:00', endTime: '19:00', duration: 5, label: 'Half Day PM (2pm - 7pm)' },
  { id: 'full-day', startTime: '09:00', endTime: '18:00', duration: 9, label: 'Full Day (9am - 6pm)' },
];

// =============================================================================
// AGENT / ADVISOR DATA
// =============================================================================

export const agents: Agent[] = [
  {
    id: 'agent-001',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@healthshield.com',
    phone: '(555) 100-0001',
    certifications: ['Licensed Insurance Agent', 'Health Insurance Specialist', 'Medicare Certified'],
    assignedServices: ['enrollment', 'claims', 'general'],
    availability: [
      { dayOfWeek: 0, startTime: '09:00', endTime: '17:00', isAvailable: false },
      { dayOfWeek: 1, startTime: '08:00', endTime: '18:00', isAvailable: true },
      { dayOfWeek: 2, startTime: '08:00', endTime: '18:00', isAvailable: true },
      { dayOfWeek: 3, startTime: '08:00', endTime: '18:00', isAvailable: true },
      { dayOfWeek: 4, startTime: '08:00', endTime: '18:00', isAvailable: true },
      { dayOfWeek: 5, startTime: '08:00', endTime: '17:00', isAvailable: true },
      { dayOfWeek: 6, startTime: '09:00', endTime: '13:00', isAvailable: false },
    ],
    rating: 4.9,
    totalConsultations: 487,
    status: 'active',
  },
  {
    id: 'agent-002',
    name: 'James Rodriguez',
    email: 'james.rodriguez@healthshield.com',
    phone: '(555) 100-0002',
    certifications: ['Licensed Insurance Agent', 'Wellness Program Coordinator'],
    assignedServices: ['wellness', 'enrollment'],
    availability: [
      { dayOfWeek: 0, startTime: '09:00', endTime: '17:00', isAvailable: false },
      { dayOfWeek: 1, startTime: '08:00', endTime: '18:00', isAvailable: true },
      { dayOfWeek: 2, startTime: '08:00', endTime: '18:00', isAvailable: false },
      { dayOfWeek: 3, startTime: '08:00', endTime: '18:00', isAvailable: true },
      { dayOfWeek: 4, startTime: '08:00', endTime: '18:00', isAvailable: true },
      { dayOfWeek: 5, startTime: '08:00', endTime: '17:00', isAvailable: true },
      { dayOfWeek: 6, startTime: '09:00', endTime: '13:00', isAvailable: false },
    ],
    rating: 4.8,
    totalConsultations: 312,
    status: 'active',
  },
  {
    id: 'agent-003',
    name: 'Emily Chen',
    email: 'emily.chen@healthshield.com',
    phone: '(555) 100-0003',
    certifications: ['Licensed Insurance Agent', 'Claims Specialist', 'Customer Advocacy Certified'],
    assignedServices: ['claims', 'general'],
    availability: [
      { dayOfWeek: 0, startTime: '09:00', endTime: '17:00', isAvailable: false },
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: false },
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: false },
      { dayOfWeek: 3, startTime: '08:00', endTime: '18:00', isAvailable: true },
      { dayOfWeek: 4, startTime: '08:00', endTime: '18:00', isAvailable: true },
      { dayOfWeek: 5, startTime: '08:00', endTime: '17:00', isAvailable: true },
      { dayOfWeek: 6, startTime: '09:00', endTime: '13:00', isAvailable: true },
    ],
    rating: 5.0,
    totalConsultations: 156,
    status: 'active',
  },
];

// =============================================================================
// CALENDAR FUNCTIONS
// =============================================================================

/**
 * Get available time slots for a specific service on a specific date
 */
export function getAvailableSlots(
  serviceId: string,
  date: string,
  existingBookings: BookingSlot[]
): TimeSlot[] {
  const dayOfWeek = new Date(date).getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Get bookings for this service on this date
  const bookedSlots = existingBookings
    .filter(b => b.serviceId === serviceId && b.date === date && b.status !== 'cancelled')
    .map(b => b.timeSlot.id);

  // Filter out booked slots
  let available = defaultTimeSlots.filter(slot => !bookedSlots.includes(slot.id));

  // On weekdays, maybe limit sunset slots based on demand
  if (!isWeekend) {
    // All slots available on weekdays
  }

  return available;
}

/**
 * Check if a agent is available for a specific time slot
 */
export function isAgentAvailable(
  agentId: string,
  date: string,
  timeSlot: TimeSlot,
  existingBookings: BookingSlot[]
): boolean {
  const agent = agents.find(c => c.id === agentId);
  if (!agent || agent.status !== 'active') return false;

  const dayOfWeek = new Date(date).getDay();
  const dayAvailability = agent.availability.find(a => a.dayOfWeek === dayOfWeek);

  if (!dayAvailability || !dayAvailability.isAvailable) return false;

  // Check if time slot falls within agent's hours
  if (timeSlot.startTime < dayAvailability.startTime ||
      timeSlot.endTime > dayAvailability.endTime) {
    return false;
  }

  // Check if agent already has a booking
  const agentBookings = existingBookings.filter(
    b => b.agentId === agentId &&
         b.date === date &&
         b.status !== 'cancelled'
  );

  for (const booking of agentBookings) {
    // Check for time overlap
    if (timeSlotsOverlap(timeSlot, booking.timeSlot)) {
      return false;
    }
  }

  return true;
}

/**
 * Check if two time slots overlap
 */
function timeSlotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
  return slot1.startTime < slot2.endTime && slot2.startTime < slot1.endTime;
}

/**
 * Auto-assign best available agent for a booking
 */
export function autoAssignAgent(
  serviceId: string,
  date: string,
  timeSlot: TimeSlot,
  existingBookings: BookingSlot[]
): Agent | null {
  // Find agents assigned to this service
  const eligibleAgents = agents.filter(c => c.assignedServices.includes(serviceId));

  // Check availability and sort by rating
  const availableAgents = eligibleAgents
    .filter(c => isAgentAvailable(c.id, date, timeSlot, existingBookings))
    .sort((a, b) => b.rating - a.rating);

  return availableAgents[0] || null;
}

/**
 * Generate calendar events from bookings
 */
export function generateCalendarEvents(bookings: BookingSlot[]): CalendarEvent[] {
  return bookings.map(booking => {
    const [year, month, day] = booking.date.split('-').map(Number);
    const [startHour, startMin] = booking.timeSlot.startTime.split(':').map(Number);
    const [endHour, endMin] = booking.timeSlot.endTime.split(':').map(Number);

    const start = new Date(year, month - 1, day, startHour, startMin);
    const end = new Date(year, month - 1, day, endHour, endMin);

    const statusColors: Record<string, string> = {
      'available': '#10b981',
      'pending': '#f59e0b',
      'confirmed': '#3b82f6',
      'in-progress': '#8b5cf6',
      'completed': '#6b7280',
      'cancelled': '#ef4444',
    };

    return {
      id: booking.id,
      title: `${booking.serviceName} - ${booking.customerName || 'Pending'}`,
      description: `Party size: ${booking.partySize || 'TBD'}\nAdvisor: ${booking.agentName || 'TBD'}`,
      start,
      end,
      allDay: false,
      type: 'booking',
      serviceId: booking.serviceId,
      agentId: booking.agentId,
      color: statusColors[booking.status] || '#6b7280',
      metadata: {
        status: booking.status,
        customerPhone: booking.customerPhone,
        totalPrice: booking.totalPrice,
      },
    };
  });
}

/**
 * Get daily schedule summary
 */
export function getDailySchedule(date: string, bookings: BookingSlot[]): {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  revenue: number;
  serviceUtilization: Record<string, number>;
  agentSchedule: { agent: Agent; bookings: BookingSlot[] }[];
} {
  const dayBookings = bookings.filter(b => b.date === date && b.status !== 'cancelled');

  const confirmedBookings = dayBookings.filter(b => b.status === 'confirmed' || b.status === 'in-progress');
  const pendingBookings = dayBookings.filter(b => b.status === 'pending');

  const revenue = confirmedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  // Calculate service utilization (hours booked / available hours)
  const serviceUtilization: Record<string, number> = {};
  const serviceIds = ['enrollment', 'claims', 'wellness', 'general', 'follow-up', 'consultation'];

  for (const svcId of serviceIds) {
    const svcBookings = dayBookings.filter(b => b.serviceId === svcId);
    const hoursBooked = svcBookings.reduce((sum, b) => sum + b.timeSlot.duration, 0);
    serviceUtilization[svcId] = Math.round((hoursBooked / 12) * 100); // 12 hours max per day
  }

  // Agent schedule
  const agentSchedule = agents.map(agent => ({
    agent,
    bookings: dayBookings.filter(b => b.agentId === agent.id),
  }));

  return {
    totalBookings: dayBookings.length,
    confirmedBookings: confirmedBookings.length,
    pendingBookings: pendingBookings.length,
    revenue,
    serviceUtilization,
    agentSchedule,
  };
}

/**
 * Get weekly overview
 */
export function getWeeklyOverview(startDate: string, bookings: BookingSlot[]): {
  days: {
    date: string;
    dayName: string;
    bookings: number;
    revenue: number;
    peakSlot: string;
  }[];
  totalBookings: number;
  totalRevenue: number;
  busiestDay: string;
} {
  const start = new Date(startDate);
  const days = [];
  let totalBookings = 0;
  let totalRevenue = 0;
  let busiestDay = '';
  let maxBookings = 0;

  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

    const dayBookings = bookings.filter(b => b.date === dateStr && b.status !== 'cancelled');
    const dayRevenue = dayBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    // Find peak slot
    const slotCounts: Record<string, number> = {};
    dayBookings.forEach(b => {
      slotCounts[b.timeSlot.label] = (slotCounts[b.timeSlot.label] || 0) + 1;
    });
    const peakSlot = Object.entries(slotCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    days.push({
      date: dateStr,
      dayName,
      bookings: dayBookings.length,
      revenue: dayRevenue,
      peakSlot,
    });

    totalBookings += dayBookings.length;
    totalRevenue += dayRevenue;

    if (dayBookings.length > maxBookings) {
      maxBookings = dayBookings.length;
      busiestDay = dayName;
    }
  }

  return { days, totalBookings, totalRevenue, busiestDay };
}

// =============================================================================
// GOOGLE CALENDAR SYNC
// =============================================================================

export interface GoogleCalendarConfig {
  clientId: string;
  apiKey: string;
  calendarId: string;
}

/**
 * Sync booking to Google Calendar (stub - requires API keys)
 */
export async function syncToGoogleCalendar(
  booking: BookingSlot,
  config: GoogleCalendarConfig
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  // This would integrate with Google Calendar API
  // For now, return a mock response

  const event = {
    summary: `${booking.serviceName} - ${booking.customerName}`,
    description: `
Party Size: ${booking.partySize}
Phone: ${booking.customerPhone}
Advisor: ${booking.agentName}
Total: $${booking.totalPrice}
Notes: ${booking.notes || 'None'}
Special Requests: ${booking.specialRequests?.join(', ') || 'None'}
    `.trim(),
    start: {
      dateTime: `${booking.date}T${booking.timeSlot.startTime}:00`,
      timeZone: 'America/Chicago',
    },
    end: {
      dateTime: `${booking.date}T${booking.timeSlot.endTime}:00`,
      timeZone: 'America/Chicago',
    },
    colorId: booking.status === 'confirmed' ? '9' : '5', // Blue or Yellow
  };

  console.log('Would sync to Google Calendar:', event);

  return {
    success: true,
    eventId: `gcal_${booking.id}`,
  };
}

/**
 * Generate iCal format for calendar export
 */
export function generateICalEvent(booking: BookingSlot): string {
  const formatDate = (date: string, time: string) => {
    const [year, month, day] = date.split('-');
    const [hour, min] = time.split(':');
    return `${year}${month}${day}T${hour}${min}00`;
  };

  const uid = `${booking.id}@healthshield.com`;
  const dtstart = formatDate(booking.date, booking.timeSlot.startTime);
  const dtend = formatDate(booking.date, booking.timeSlot.endTime);
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//HealthShield//Booking System//EN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART;TZID=America/Chicago:${dtstart}
DTEND;TZID=America/Chicago:${dtend}
SUMMARY:${booking.serviceName} - ${booking.customerName || 'Booking'}
DESCRIPTION:Party Size: ${booking.partySize || 'TBD'}\\nAdvisor: ${booking.agentName || 'TBD'}\\nPhone: ${booking.customerPhone || 'TBD'}
LOCATION:HealthShield Office
STATUS:${booking.status === 'confirmed' ? 'CONFIRMED' : 'TENTATIVE'}
END:VEVENT
END:VCALENDAR`;
}

// =============================================================================
// RECURRING BOOKINGS
// =============================================================================

export interface RecurringBooking {
  id: string;
  baseBooking: Omit<BookingSlot, 'id' | 'date'>;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  startDate: string;
  endDate?: string;
  occurrences?: number;
  dayOfWeek?: number;
  dayOfMonth?: number;
}

/**
 * Generate booking instances from recurring booking
 */
export function generateRecurringInstances(
  recurring: RecurringBooking,
  existingBookings: BookingSlot[]
): BookingSlot[] {
  const instances: BookingSlot[] = [];
  const start = new Date(recurring.startDate);
  const end = recurring.endDate ? new Date(recurring.endDate) : null;
  const maxOccurrences = recurring.occurrences || 52; // Max 1 year of weekly

  let current = new Date(start);
  let count = 0;

  while (count < maxOccurrences) {
    if (end && current > end) break;

    const dateStr = current.toISOString().split('T')[0];

    // Check if slot is available
    const available = getAvailableSlots(
      recurring.baseBooking.serviceId,
      dateStr,
      existingBookings
    );

    if (available.some(s => s.id === recurring.baseBooking.timeSlot.id)) {
      instances.push({
        ...recurring.baseBooking,
        id: `${recurring.id}_${count}`,
        date: dateStr,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Move to next occurrence
    switch (recurring.frequency) {
      case 'weekly':
        current.setDate(current.getDate() + 7);
        break;
      case 'biweekly':
        current.setDate(current.getDate() + 14);
        break;
      case 'monthly':
        current.setMonth(current.getMonth() + 1);
        break;
    }

    count++;
  }

  return instances;
}