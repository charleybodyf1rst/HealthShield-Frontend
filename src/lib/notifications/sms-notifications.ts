// =============================================================================
// HEALTHSHIELD - SMS NOTIFICATIONS (TWILIO)
// Automated SMS for appointments, reminders, and advisor communication
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
Hello! This is HealthShield confirming your upcoming appointment.

📅 Date: ${data.date}
⏰ Time: ${data.timeSlot}
📂 Service: ${data.serviceName || 'Consultation'}
👤 Advisor: ${data.agentName || 'TBD'}

Please have your insurance information and ID ready for your appointment.

Questions? Call or text us at the number on file.

We look forward to assisting you! ✅
  `.trim(),

  'booking-reminder-24h': (data) => `
📋 Reminder: Your appointment is TOMORROW!

${data.customerName}, here are your details:
📅 ${data.date}
⏰ ${data.timeSlot}
📂 ${data.serviceName}
📍 ${data.meetingPoint}

Don't forget:
✅ Insurance card
✅ Photo ID
✅ Any relevant medical documents

Advisor ${data.agentName} looks forward to assisting you!

Questions? Reply to this message.
  `.trim(),

  'booking-reminder-2h': (data) => `
📋 2 Hours Until Your Appointment!

${data.customerName}, it's almost time!
⏰ ${data.timeSlot}
📍 Location: ${data.meetingPoint}

Your advisor ${data.agentName} is preparing for your ${data.serviceName} consultation now!

Running late? Text us back or call the number on file.
  `.trim(),

  'booking-reminder-3d': (data) => `
Hello from HealthShield!

Just a reminder about your upcoming appointment in a few days.

📅 ${data.date}
📂 ${data.serviceName || 'Consultation'}
👤 Advisor: ${data.agentName || 'TBD'}

Please have the following ready:
✅ Insurance card
✅ Photo ID
✅ Any relevant documents or records

If you have any questions before your appointment, feel free to call or text us.

We look forward to seeing you soon! ✅
  `.trim(),

  'booking-reminder-dayof': (data) => `
Good morning! This is HealthShield. We look forward to seeing you today!

📅 Your appointment is today
⏰ ${data.timeSlot || 'See confirmation email for time'}
📂 ${data.serviceName || 'Consultation'}

Please remember to bring:
✅ Insurance card
✅ Photo ID

If you need to reschedule, please call us as soon as possible.

See you soon! ✅
  `.trim(),

  'agent-assignment': (data) => `
📋 NEW APPOINTMENT ASSIGNMENT

Hey ${data.agentName}!

New appointment assigned:
📅 ${data.date} at ${data.timeSlot}
📂 ${data.serviceName}
👤 Customer: ${data.customerName} - ${data.customerPhone}

Special requests: ${data.specialRequests || 'None'}

Confirm receipt by replying YES
  `.trim(),

  'agent-on-way': (data) => `
📋 Advisor ${data.agentName} is ready for you!

${data.customerName}, your advisor is preparing for your appointment at ${data.meetingPoint} now. Your session starts in about ${data.eta} minutes.

Service: ${data.serviceName}

Need anything? Reply to this text!
  `.trim(),

  'trip-started': (data) => `
🎉 Your consultation has started!

Welcome, ${data.customerName}!

Session ends at: ${data.endTime}

Need assistance during your session? Advisor ${data.agentName} is there for you.

#HealthShield
  `.trim(),

  'trip-completed': (data) => `
Thanks for choosing HealthShield!

${data.customerName}, we hope your ${data.serviceName} consultation was helpful!

We'd love to hear about your experience! Leave us a Google review:
${data.reviewLink}

Schedule your next appointment: ${data.rebookLink}

See you next time! ✅
  `.trim(),

  'review-request': (data) => `
Quick favor, ${data.customerName}?

How was your recent consultation? We'd love a Google review!

⭐ Leave a review: ${data.reviewLink}

As thanks, here's $25 off your next appointment: ${data.discountCode}

Thanks for being awesome!
- The HealthShield Team
  `.trim(),

  'payment-confirmation': (data) => `
💰 Payment Received!

${data.customerName}, your payment of $${data.amount} has been processed.

${data.isDeposit ? `Deposit paid. Remaining balance: $${data.remaining} (due day of trip)` : 'Paid in full!'}

Receipt sent to: ${data.email}

Confirmation #: ${data.confirmationCode}

Questions? (833) 432-5841
  `.trim(),

  'cancellation': (data) => `
❌ Booking Cancelled

${data.customerName}, your booking has been cancelled:

📅 ${data.date} - ${data.timeSlot}
📂 ${data.serviceName}

${data.refundAmount ? `Refund of $${data.refundAmount} will be processed in 5-7 business days.` : ''}

We're sorry to see you go! Hope to assist you again soon.

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

Questions? Call (833) 432-5841
  `.trim(),

  'reschedule-offer': (data) => `
📋 Ready to Reschedule?

${data.customerName}, we have these openings for your rain check:

${data.availableDates}

Reply with your preferred date/time or call (833) 432-5841

Your credit of $${data.creditAmount} never expires!
  `.trim(),

  'loyalty-reward': (data) => `
🎁 You've Earned a Reward!

${data.customerName}, you've completed ${data.tripCount} trips with us!

As a thank you, enjoy ${data.reward}

Use code: ${data.rewardCode}
Expires: ${data.expiryDate}

Book now: healthshield.com/book
  `.trim(),

  'birthday-offer': (data) => `
🎂 Happy Birthday, ${data.customerName}!

From the HealthShield crew to you - have an amazing day!

Celebrate with 20% OFF your next consultation:
Use code: BDAY${data.discountCode}

Valid for 30 days. Book at healthshield.com

🎈 Enjoy your special day! 🎈
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
    from: config?.fromNumber || '+18334325841',
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
      reviewLink: 'https://g.page/r/healthshield/review',
      discountCode: `THANKS${bookingId.slice(-4).toUpperCase()}`,
    },
    status: 'pending',
  });

  return scheduledMessages;
}

// =============================================================================
// ADVISOR NOTIFICATIONS
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
  serviceName: string,
  meetingPoint: string,
  eta: number
): Promise<SMSMessage> {
  return sendSMS(customerPhone, 'agent-on-way', {
    customerName,
    agentName,
    serviceName,
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
