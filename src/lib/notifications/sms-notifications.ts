// =============================================================================
// BANANA BOAT RENTALS - SMS NOTIFICATIONS (TWILIO)
// Automated SMS for bookings, reminders, and agent communication
// =============================================================================

export interface SMSConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

export interface SMSMessage {
  id: string;
  to: string;
  from: string;
  body: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed';
  type: SMSType;
  bookingId?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  error?: string;
}

export type SMSType =
  | 'booking-confirmation'
  | 'booking-reminder-24h'
  | 'booking-reminder-2h'
  | 'booking-reminder-3d'
  | 'booking-reminder-dayof'
  | 'agent-assignment'
  | 'agent-on-way'
  | 'trip-started'
  | 'trip-completed'
  | 'review-request'
  | 'payment-confirmation'
  | 'cancellation'
  | 'weather-alert'
  | 'reschedule-offer'
  | 'loyalty-reward'
  | 'birthday-offer'
  | 'custom';

// =============================================================================
// SMS TEMPLATES
// =============================================================================

export const smsTemplates: Record<SMSType, (data: Record<string, string>) => string> = {
  'booking-confirmation': (data) => `
Howdy! This is HealthShield with your pickup info.

📍 Pickup Location
Highland Lakes Marina
16120 Wharf Cove
Volente TX 78641

Marina entry fee:
* $5 per person OR
* $20 per car (up to 4 people)

Extra passengers in a car: $5 each.
Uber/Lyft drop-offs are not charged vehicle fees.

Each boat includes a large cooler but NO ice, so please bring ice with you.

Questions? Call or text 512-705-7758

We look forward to having you on the water! 🌊
  `.trim(),

  'booking-reminder-24h': (data) => `
🍌 Reminder: Your boat party is TOMORROW!

${data.customerName}, get ready for:
📅 ${data.date}
⏰ ${data.timeSlot}
🚤 ${data.boatName}
📍 ${data.meetingPoint}

Don't forget:
✅ Sunscreen
✅ Towels
✅ Cooler with drinks
✅ Good vibes!

Agent ${data.agentName} is excited to see you!

Questions? 512-705-7758
  `.trim(),

  'booking-reminder-2h': (data) => `
🍌 2 Hours Until Your Boat Party!

${data.customerName}, it's almost time!
⏰ ${data.timeSlot}
📍 Meet at: ${data.meetingPoint}

Your agent ${data.agentName} is prepping ${data.boatName} for you now!

Running late? Text us back or call 512-705-7758
  `.trim(),

  'booking-reminder-3d': (data) => `
Howdy from HealthShield!

Just a reminder about your upcoming boat rental in a few days.

📍 Pickup Location
Highland Lakes Marina
16120 Wharf Cove
Volente TX 78641

Marina entry fees:
* $5 per person OR
* $20 per car (up to 4 passengers)

Uber/Lyft drop-offs are not charged vehicle fees.

Reminder: Each boat has a large cooler but we do NOT provide ice, so please bring ice with you.

If you have any questions before your trip, feel free to call or text us at 512-705-7758.

We look forward to seeing you soon! 🌊
  `.trim(),

  'booking-reminder-dayof': (data) => `
Good morning! This is HealthShield. We look forward to seeing you today!

📍 Pickup Location
Highland Lakes Marina
16120 Wharf Cove
Volente TX 78641

Reminder from the marina:
* $5 per person OR
* $20 per car (up to 4 people)

Uber/Lyft drop-offs are not charged vehicle fees.

Each boat includes a large cooler but no ice, so please bring ice with you.

If you have any issues finding the marina, call or text 512-705-7758.

See you on the lake! ☀️
  `.trim(),

  'agent-assignment': (data) => `
🚤 CAPTAIN ASSIGNMENT

Hey Agent ${data.agentName}!

New trip assigned:
📅 ${data.date} at ${data.timeSlot}
🚤 ${data.boatName}
👥 ${data.partySize} guests
📞 Customer: ${data.customerName} - ${data.customerPhone}

Special requests: ${data.specialRequests || 'None'}

Confirm receipt by replying YES
  `.trim(),

  'agent-on-way': (data) => `
🍌 Agent ${data.agentName} is on the way!

${data.customerName}, your agent is heading to ${data.meetingPoint} now and will arrive in about ${data.eta} minutes.

Look for ${data.boatName} 🚤

Need anything? Reply to this text!
  `.trim(),

  'trip-started': (data) => `
🎉 Your boat party has started!

Have an amazing time, ${data.customerName}!

Trip ends at: ${data.endTime}

Need assistance during your trip? Agent ${data.agentName} is there for you, or call base: 512-705-7758

#HealthShieldLife 🍌🌊
  `.trim(),

  'trip-completed': (data) => `
🍌 Thanks for sailing with us!

${data.customerName}, we hope you had a blast on ${data.boatName}!

We'd love to hear about your experience! Leave us a Google review:
${data.reviewLink}

Book again and get 10% off: ${data.rebookLink}

See you next time! 🌊
  `.trim(),

  'review-request': (data) => `
🍌 Quick favor, ${data.customerName}?

How was your trip on ${data.boatName}? We'd love a Google review!

⭐ Leave a review: ${data.reviewLink}

As thanks, here's $25 off your next booking: ${data.discountCode}

Thanks for being awesome!
- Agent Jason & Crew
  `.trim(),

  'payment-confirmation': (data) => `
💰 Payment Received!

${data.customerName}, your payment of $${data.amount} has been processed.

${data.isDeposit ? `Deposit paid. Remaining balance: $${data.remaining} (due day of trip)` : 'Paid in full!'}

Receipt sent to: ${data.email}

Confirmation #: ${data.confirmationCode}

Questions? 512-705-7758
  `.trim(),

  'cancellation': (data) => `
❌ Booking Cancelled

${data.customerName}, your booking has been cancelled:

📅 ${data.date} - ${data.timeSlot}
🚤 ${data.boatName}

${data.refundAmount ? `Refund of $${data.refundAmount} will be processed in 5-7 business days.` : ''}

We're sorry to see you go! Hope to see you on the water soon.

Rebook anytime: ${data.rebookLink}
  `.trim(),

  'weather-alert': (data) => `
⛈️ Weather Alert for Your Booking

${data.customerName}, we're monitoring weather conditions for:
📅 ${data.date}

Current forecast: ${data.forecast}

${data.isCancelled ?
  `Due to unsafe conditions, we need to reschedule. Reply with your preferred new date.` :
  `We'll update you if anything changes. Trip is still ON for now!`}

Questions? Call 512-705-7758
  `.trim(),

  'reschedule-offer': (data) => `
🍌 Ready to Reschedule?

${data.customerName}, we have these openings for your rain check:

${data.availableDates}

Reply with your preferred date/time or call 512-705-7758

Your credit of $${data.creditAmount} never expires!
  `.trim(),

  'loyalty-reward': (data) => `
🎁 You've Earned a Reward!

${data.customerName}, you've completed ${data.tripCount} trips with us!

As a thank you, enjoy ${data.reward}

Use code: ${data.rewardCode}
Expires: ${data.expiryDate}

Book now: healthshieldrentals.com/book
  `.trim(),

  'birthday-offer': (data) => `
🎂 Happy Birthday, ${data.customerName}!

From the HealthShield crew to you - have an amazing day!

Celebrate on the water with 20% OFF:
Use code: BDAY${data.discountCode}

Valid for 30 days. Book at healthshieldrentals.com

🍌🎈 Party time! 🎈🍌
  `.trim(),

  'custom': (data) => data.message || '',
};

// =============================================================================
// SMS FUNCTIONS
// =============================================================================

/**
 * Send SMS via Twilio (stub - requires API keys)
 */
export async function sendSMS(
  to: string,
  type: SMSType,
  data: Record<string, string>,
  config?: SMSConfig
): Promise<SMSMessage> {
  const body = smsTemplates[type](data);
  const cleanPhone = to.replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('1') ? `+${cleanPhone}` : `+1${cleanPhone}`;

  const message: SMSMessage = {
    id: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    to: formattedPhone,
    from: config?.fromNumber || '+15127057758',
    body,
    status: 'queued',
    type,
    bookingId: data.bookingId,
  };

  // In production, this would call Twilio API:
  // const client = twilio(config.accountSid, config.authToken);
  // const result = await client.messages.create({
  //   body: message.body,
  //   to: message.to,
  //   from: message.from,
  // });

  console.log('📱 SMS Queued:', {
    to: message.to,
    type: message.type,
    preview: message.body.substring(0, 50) + '...',
  });

  // Simulate successful send
  message.status = 'sent';
  message.sentAt = new Date();

  return message;
}

/**
 * Send bulk SMS to multiple recipients
 */
export async function sendBulkSMS(
  recipients: { phone: string; data: Record<string, string> }[],
  type: SMSType,
  config?: SMSConfig
): Promise<{ sent: number; failed: number; messages: SMSMessage[] }> {
  const messages: SMSMessage[] = [];
  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    try {
      const message = await sendSMS(recipient.phone, type, recipient.data, config);
      messages.push(message);
      if (message.status === 'sent' || message.status === 'delivered') {
        sent++;
      } else {
        failed++;
      }
    } catch (error) {
      failed++;
      messages.push({
        id: `sms_failed_${Date.now()}`,
        to: recipient.phone,
        from: config?.fromNumber || '',
        body: '',
        status: 'failed',
        type,
        error: String(error),
      });
    }

    // Rate limiting - wait 100ms between messages
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return { sent, failed, messages };
}

// =============================================================================
// AUTOMATED SMS SCHEDULER
// =============================================================================

export interface ScheduledSMS {
  id: string;
  bookingId: string;
  type: SMSType;
  scheduledFor: Date;
  data: Record<string, string>;
  status: 'pending' | 'sent' | 'cancelled';
}

/**
 * Schedule automated SMS for a booking
 */
export function scheduleBookingSMS(
  bookingId: string,
  bookingDate: string,
  timeSlot: string,
  customerData: Record<string, string>
): ScheduledSMS[] {
  const [startHour] = timeSlot.split(' - ')[0].match(/\d+/) || ['9'];
  const bookingDateTime = new Date(`${bookingDate}T${startHour.padStart(2, '0')}:00:00`);

  const scheduledMessages: ScheduledSMS[] = [];

  // 1. Confirmation - immediately
  scheduledMessages.push({
    id: `sched_${bookingId}_confirm`,
    bookingId,
    type: 'booking-confirmation',
    scheduledFor: new Date(),
    data: customerData,
    status: 'pending',
  });

  // 2. 3-day reminder
  const reminder3d = new Date(bookingDateTime);
  reminder3d.setDate(reminder3d.getDate() - 3);
  scheduledMessages.push({
    id: `sched_${bookingId}_3d`,
    bookingId,
    type: 'booking-reminder-3d',
    scheduledFor: reminder3d,
    data: customerData,
    status: 'pending',
  });

  // 3. Day-of morning reminder (8:00 AM)
  const reminderDayof = new Date(bookingDateTime);
  reminderDayof.setHours(8, 0, 0, 0);
  scheduledMessages.push({
    id: `sched_${bookingId}_dayof`,
    bookingId,
    type: 'booking-reminder-dayof',
    scheduledFor: reminderDayof,
    data: customerData,
    status: 'pending',
  });

  // 4. Review request - 2 hours after trip end
  const reviewRequest = new Date(bookingDateTime);
  reviewRequest.setHours(reviewRequest.getHours() + 5); // 3hr trip + 2hr wait
  scheduledMessages.push({
    id: `sched_${bookingId}_review`,
    bookingId,
    type: 'review-request',
    scheduledFor: reviewRequest,
    data: {
      ...customerData,
      reviewLink: 'https://g.page/r/healthshieldrentals/review',
      discountCode: `THANKS${bookingId.slice(-4).toUpperCase()}`,
    },
    status: 'pending',
  });

  return scheduledMessages;
}

// =============================================================================
// CAPTAIN NOTIFICATIONS
// =============================================================================

/**
 * Notify agent of new assignment
 */
export async function notifyAgentAssignment(
  agentPhone: string,
  agentName: string,
  bookingData: Record<string, string>
): Promise<SMSMessage> {
  return sendSMS(agentPhone, 'agent-assignment', {
    ...bookingData,
    agentName,
  });
}

/**
 * Notify customer that agent is on the way
 */
export async function notifyAgentEnRoute(
  customerPhone: string,
  customerName: string,
  agentName: string,
  boatName: string,
  meetingPoint: string,
  eta: number
): Promise<SMSMessage> {
  return sendSMS(customerPhone, 'agent-on-way', {
    customerName,
    agentName,
    boatName,
    meetingPoint,
    eta: String(eta),
  });
}

// =============================================================================
// MARKETING SMS
// =============================================================================

/**
 * Send birthday offer to customer
 */
export async function sendBirthdayOffer(
  phone: string,
  customerName: string
): Promise<SMSMessage> {
  const discountCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  return sendSMS(phone, 'birthday-offer', {
    customerName,
    discountCode,
  });
}

/**
 * Send loyalty reward notification
 */
export async function sendLoyaltyReward(
  phone: string,
  customerName: string,
  tripCount: number,
  reward: string,
  rewardCode: string
): Promise<SMSMessage> {
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 3);

  return sendSMS(phone, 'loyalty-reward', {
    customerName,
    tripCount: String(tripCount),
    reward,
    rewardCode,
    expiryDate: expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  });
}

// =============================================================================
// WEATHER ALERTS
// =============================================================================

/**
 * Send weather alert to affected customers
 */
export async function sendWeatherAlerts(
  affectedBookings: { phone: string; customerName: string; date: string; isCancelled: boolean }[],
  forecast: string
): Promise<{ sent: number; failed: number }> {
  const recipients = affectedBookings.map(booking => ({
    phone: booking.phone,
    data: {
      customerName: booking.customerName,
      date: booking.date,
      forecast,
      isCancelled: String(booking.isCancelled),
    },
  }));

  const result = await sendBulkSMS(recipients, 'weather-alert');
  return { sent: result.sent, failed: result.failed };
}
