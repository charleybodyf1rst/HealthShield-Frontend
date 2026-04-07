// =============================================================================
// BANANA BOAT RENTALS - EMAIL MARKETING AUTOMATION
// Drip campaigns, transactional emails, newsletters
// =============================================================================

export interface EmailConfig {
  provider: 'sendgrid' | 'mailchimp' | 'ses';
  apiKey: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  category: EmailCategory;
  variables: string[];
}

export type EmailCategory =
  | 'transactional'
  | 'marketing'
  | 'newsletter'
  | 'drip-campaign'
  | 're-engagement'
  | 'loyalty'
  | 'triggered';

export interface Email {
  id: string;
  to: string;
  toName?: string;
  from: string;
  fromName: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  templateId?: string;
  variables?: Record<string, string>;
  status: 'draft' | 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'spam';
  sentAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  tags?: string[];
}

export interface EmailCampaign {
  id: string;
  name: string;
  description?: string;
  type: 'one-time' | 'drip' | 'triggered' | 'recurring';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
  templateId: string;
  audience: EmailAudience;
  schedule?: CampaignSchedule;
  stats: CampaignStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailAudience {
  type: 'all' | 'segment' | 'list' | 'custom';
  segmentId?: string;
  listId?: string;
  filters?: AudienceFilter[];
  excludeFilters?: AudienceFilter[];
  estimatedSize?: number;
}

export interface AudienceFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'gt' | 'lt' | 'between' | 'in';
  value: string | number | string[] | number[];
}

export interface CampaignSchedule {
  sendAt?: Date;
  timezone?: string;
  frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time?: string;
}

export interface CampaignStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  spamReports: number;
  openRate: number;
  clickRate: number;
}

// =============================================================================
// EMAIL TEMPLATES
// =============================================================================

export const emailTemplates: Record<string, EmailTemplate> = {
  'booking-confirmation': {
    id: 'booking-confirmation',
    name: 'Booking Confirmation',
    subject: 'HealthShield – Booking Confirmation & Pickup Information',
    category: 'transactional',
    variables: ['customerName', 'date', 'timeSlot', 'boatName', 'partySize', 'captainName', 'totalPrice', 'confirmationCode', 'meetingPoint'],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation & Pickup Information</title>
</head>
<body style="margin:0;padding:0;background:#fff7ed;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:30px;">
      <img src="https://healthshield-frontend.web.app/images/logo/banana-logo.png" alt="HealthShield" style="width:100px;height:auto;">
      <h1 style="color:#ea580c;font-size:28px;margin:20px 0 10px;">Booking Confirmation & Pickup Information</h1>
    </div>

    <!-- Greeting -->
    <div style="background:white;border-radius:20px;padding:30px;box-shadow:0 10px 40px rgba(0,0,0,0.08);margin-bottom:30px;">
      <p style="color:#083344;font-size:16px;line-height:1.6;margin:0 0 15px;">Howdy! 👋</p>
      <p style="color:#083344;font-size:16px;line-height:1.6;margin:0;">Thank you for choosing HealthShield for your boating adventure on Lake Austin. We're excited to have you out on the water!</p>
    </div>

    <!-- Booking Details Card -->
    <div style="background:white;border-radius:20px;padding:30px;box-shadow:0 10px 40px rgba(0,0,0,0.08);margin-bottom:30px;">
      <h2 style="color:#083344;font-size:20px;margin:0 0 20px;border-bottom:2px solid #fed7aa;padding-bottom:10px;">Booking Details</h2>

      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:12px 0;color:#64748b;width:40%;">Confirmation #</td>
          <td style="padding:12px 0;color:#083344;font-weight:bold;">{{confirmationCode}}</td>
        </tr>
        <tr>
          <td style="padding:12px 0;color:#64748b;">Date</td>
          <td style="padding:12px 0;color:#083344;font-weight:bold;">{{date}}</td>
        </tr>
        <tr>
          <td style="padding:12px 0;color:#64748b;">Time</td>
          <td style="padding:12px 0;color:#083344;font-weight:bold;">{{timeSlot}}</td>
        </tr>
        <tr>
          <td style="padding:12px 0;color:#64748b;">Boat</td>
          <td style="padding:12px 0;color:#083344;font-weight:bold;">{{boatName}}</td>
        </tr>
        <tr>
          <td style="padding:12px 0;color:#64748b;">Party Size</td>
          <td style="padding:12px 0;color:#083344;font-weight:bold;">{{partySize}} guests</td>
        </tr>
        <tr>
          <td style="padding:12px 0;color:#64748b;">Your Captain</td>
          <td style="padding:12px 0;color:#083344;font-weight:bold;">Captain {{captainName}}</td>
        </tr>
        <tr style="background:#fef7ed;border-radius:10px;">
          <td style="padding:15px;color:#64748b;font-size:18px;">Total</td>
          <td style="padding:15px;color:#ea580c;font-weight:bold;font-size:24px;">\${{totalPrice}}</td>
        </tr>
      </table>
    </div>

    <!-- Pickup Location -->
    <div style="background:linear-gradient(135deg,#083344,#0c4a6e);border-radius:20px;padding:25px;color:white;margin-bottom:30px;">
      <h3 style="margin:0 0 15px;font-size:18px;">📍 Pickup Location</h3>
      <p style="margin:0;font-size:16px;opacity:0.9;line-height:1.6;">Your party will be picked up at:</p>
      <p style="margin:10px 0;font-size:18px;font-weight:bold;">Highland Lakes Marina</p>
      <p style="margin:0;font-size:16px;opacity:0.9;">16120 Wharf Cove<br>Volente, TX 78641</p>
      <a href="https://maps.google.com/?q=Highland+Lakes+Marina+16120+Wharf+Cove+Volente+TX+78641" style="display:inline-block;margin-top:15px;background:white;color:#083344;padding:10px 20px;border-radius:10px;text-decoration:none;font-weight:bold;">Get Directions</a>
    </div>

    <!-- Marina Entry Fees -->
    <div style="background:white;border-radius:20px;padding:30px;box-shadow:0 10px 40px rgba(0,0,0,0.08);margin-bottom:30px;">
      <h3 style="color:#083344;margin:0 0 20px;">💰 Marina Entry Fees</h3>
      <p style="color:#64748b;line-height:1.6;margin:0 0 10px;">The marina charges an entry fee to access the property:</p>
      <ul style="color:#083344;padding-left:20px;margin:0 0 15px;line-height:2;">
        <li><strong>$5 per person</strong>, OR</li>
        <li><strong>$20 per car</strong> (covers up to 4 passengers)</li>
      </ul>
      <p style="color:#64748b;line-height:1.6;margin:0 0 10px;">If a car has more than 4 passengers, each additional passenger will be $5 per person.</p>
      <p style="color:#64748b;line-height:1.6;margin:0;">🚗 <strong>Rideshare / Bus Drop-Off:</strong> Uber, Lyft, and buses are not charged the vehicle entry fee when dropping off passengers.</p>
    </div>

    <!-- Coolers & Ice -->
    <div style="background:white;border-radius:20px;padding:30px;box-shadow:0 10px 40px rgba(0,0,0,0.08);margin-bottom:30px;">
      <h3 style="color:#083344;margin:0 0 20px;">🧊 Coolers & Ice</h3>
      <p style="color:#64748b;line-height:1.6;margin:0;">Each boat includes a large empty cooler, but we do <strong>not</strong> provide ice. Please bring ice with you.</p>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:30px;">
      <a href="https://healthshield-frontend.web.app/dashboard" style="display:inline-block;background:linear-gradient(135deg,#fb923c,#eab308);color:white;padding:15px 40px;border-radius:50px;text-decoration:none;font-weight:bold;font-size:16px;box-shadow:0 10px 30px rgba(251,146,60,0.3);">View Your Booking</a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;color:#64748b;font-size:14px;border-top:1px solid #fed7aa;padding-top:30px;">
      <p style="margin:0 0 10px;">Questions? We're here to help!</p>
      <p style="margin:0;"><a href="tel:+15127057758" style="color:#ea580c;text-decoration:none;">512-705-7758</a> | <a href="mailto:hello@healthshieldrentals.com" style="color:#ea580c;text-decoration:none;">hello@healthshieldrentals.com</a></p>
      <p style="margin:20px 0 0;font-size:12px;color:#94a3b8;">HealthShield | Austin, TX</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
    textContent: `
HealthShield - Booking Confirmation & Pickup Information

Howdy! 👋
Thank you for choosing HealthShield for your boating adventure on Lake Austin. We're excited to have you out on the water!

BOOKING DETAILS:
Confirmation #: {{confirmationCode}}
Date: {{date}}
Time: {{timeSlot}}
Boat: {{boatName}}
Party Size: {{partySize}} guests
Captain: {{captainName}}
Total: \${{totalPrice}}

PICKUP LOCATION:
Your party will be picked up at:
Highland Lakes Marina
16120 Wharf Cove
Volente, TX 78641

MARINA ENTRY FEES:
The marina charges an entry fee to access the property:
* $5 per person, OR
* $20 per car (covers up to 4 passengers)
If a car has more than 4 passengers, each additional passenger will be $5 per person.
Rideshare / Bus Drop-Off: Uber, Lyft, and buses are not charged the vehicle entry fee when dropping off passengers.

COOLERS & ICE:
Each boat includes a large empty cooler, but we do not provide ice. Please bring ice with you.

Questions? Call or text 512-705-7758

We look forward to having you on the water! 🌊
- HealthShield
    `.trim(),
  },

  'welcome-series-1': {
    id: 'welcome-series-1',
    name: 'Welcome Series - Day 1',
    subject: '🍌 Welcome to the HealthShield Family!',
    category: 'drip-campaign',
    variables: ['customerName', 'firstName'],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome!</title>
</head>
<body style="margin:0;padding:0;background:#fff7ed;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:30px;">
      <img src="https://healthshield-frontend.web.app/images/logo/banana-logo.png" alt="HealthShield" style="width:80px;">
      <h1 style="color:#ea580c;margin:20px 0;">Welcome Aboard, {{firstName}}! 🎉</h1>
    </div>

    <div style="background:white;border-radius:20px;padding:30px;box-shadow:0 10px 40px rgba(0,0,0,0.08);">
      <p style="color:#083344;font-size:16px;line-height:1.8;">
        Thanks for joining the HealthShield family! We're Austin's premier party boat experience on Lake Travis.
      </p>

      <p style="color:#083344;font-size:16px;line-height:1.8;">
        Here's what you can expect:
      </p>

      <ul style="color:#64748b;line-height:2.2;padding-left:20px;">
        <li><strong style="color:#083344;">6 Amazing Boats</strong> - From intimate to party-size</li>
        <li><strong style="color:#083344;">Expert Captains</strong> - USCG certified & super friendly</li>
        <li><strong style="color:#083344;">Premium Sound</strong> - JBL speakers for your playlist</li>
        <li><strong style="color:#083344;">Water Toys</strong> - Lily pads, floats, and more!</li>
      </ul>

      <div style="text-align:center;margin:30px 0;">
        <a href="https://healthshield-frontend.web.app/boats" style="display:inline-block;background:linear-gradient(135deg,#fb923c,#eab308);color:white;padding:15px 40px;border-radius:50px;text-decoration:none;font-weight:bold;">Explore Our Fleet</a>
      </div>

      <p style="color:#083344;font-size:16px;line-height:1.8;">
        As a welcome gift, enjoy <strong style="color:#ea580c;">15% OFF</strong> your first booking!
        <br>Use code: <strong style="background:#fef7ed;padding:5px 15px;border-radius:5px;color:#ea580c;">WELCOME15</strong>
      </p>
    </div>

    <div style="text-align:center;margin-top:30px;color:#64748b;font-size:14px;">
      <p>See you on the water! 🌊</p>
      <p>- Captain Jason & The HealthShield Crew</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
    textContent: `
Welcome Aboard, {{firstName}}! 🍌

Thanks for joining the HealthShield family!

We're Austin's premier party boat experience on Lake Travis.

What we offer:
- 6 Amazing Boats
- Expert Captains
- Premium Sound Systems
- Water Toys & More

WELCOME GIFT: 15% OFF your first booking!
Use code: WELCOME15

Explore our fleet: https://healthshield-frontend.web.app/boats

See you on the water!
- Captain Jason & Crew
    `.trim(),
  },

  'abandoned-booking': {
    id: 'abandoned-booking',
    name: 'Abandoned Booking Recovery',
    subject: '🍌 Your boat is waiting! Complete your booking',
    category: 'triggered',
    variables: ['customerName', 'boatName', 'date', 'discountCode'],
    htmlContent: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#fff7ed;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:30px;">
      <img src="https://healthshield-frontend.web.app/images/logo/banana-logo.png" alt="HealthShield" style="width:80px;">
      <h1 style="color:#ea580c;margin:20px 0;">Don't Miss Out! 🚤</h1>
    </div>

    <div style="background:white;border-radius:20px;padding:30px;box-shadow:0 10px 40px rgba(0,0,0,0.08);">
      <p style="color:#083344;font-size:16px;line-height:1.8;">
        Hey {{customerName}}!
      </p>

      <p style="color:#083344;font-size:16px;line-height:1.8;">
        We noticed you were checking out <strong>{{boatName}}</strong> for {{date}}. Great choice! 🎉
      </p>

      <p style="color:#083344;font-size:16px;line-height:1.8;">
        These spots fill up fast, especially on weekends. To help you secure your date, here's a little incentive:
      </p>

      <div style="background:linear-gradient(135deg,#fb923c,#eab308);border-radius:15px;padding:25px;text-align:center;margin:25px 0;">
        <p style="color:white;margin:0 0 10px;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Limited Time Offer</p>
        <p style="color:white;margin:0;font-size:32px;font-weight:bold;">$50 OFF</p>
        <p style="color:white;margin:10px 0 0;font-size:14px;">Use code: <strong>{{discountCode}}</strong></p>
      </div>

      <div style="text-align:center;">
        <a href="https://healthshield-frontend.web.app/book" style="display:inline-block;background:#083344;color:white;padding:15px 40px;border-radius:50px;text-decoration:none;font-weight:bold;">Complete Your Booking</a>
      </div>

      <p style="color:#94a3b8;font-size:13px;text-align:center;margin-top:25px;">
        *Offer expires in 48 hours
      </p>
    </div>
  </div>
</body>
</html>
    `.trim(),
    textContent: `
Don't Miss Out! 🍌

Hey {{customerName}}!

We noticed you were checking out {{boatName}} for {{date}}. Great choice!

These spots fill up fast. Here's $50 OFF to help you secure your date:

Use code: {{discountCode}}

Book now: https://healthshield-frontend.web.app/book

*Offer expires in 48 hours

- HealthShield
    `.trim(),
  },

  'review-request': {
    id: 'review-request',
    name: 'Post-Trip Review Request',
    subject: '🍌 How was your trip, {{firstName}}?',
    category: 'transactional',
    variables: ['customerName', 'firstName', 'boatName', 'captainName', 'reviewLink', 'discountCode'],
    htmlContent: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#fff7ed;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:30px;">
      <img src="https://healthshield-frontend.web.app/images/logo/banana-logo.png" alt="HealthShield" style="width:80px;">
      <h1 style="color:#ea580c;margin:20px 0;">Thanks for Sailing With Us! ⛵</h1>
    </div>

    <div style="background:white;border-radius:20px;padding:30px;box-shadow:0 10px 40px rgba(0,0,0,0.08);">
      <p style="color:#083344;font-size:16px;line-height:1.8;">
        Hey {{firstName}}!
      </p>

      <p style="color:#083344;font-size:16px;line-height:1.8;">
        We hope you had an amazing time on {{boatName}} with Captain {{captainName}}!
      </p>

      <p style="color:#083344;font-size:16px;line-height:1.8;">
        We'd love to hear about your experience. Your feedback helps us improve and helps other party-goers find us!
      </p>

      <div style="text-align:center;margin:30px 0;">
        <p style="color:#64748b;margin-bottom:15px;">How would you rate your experience?</p>
        <a href="{{reviewLink}}" style="font-size:40px;text-decoration:none;">⭐⭐⭐⭐⭐</a>
      </div>

      <div style="text-align:center;">
        <a href="{{reviewLink}}" style="display:inline-block;background:linear-gradient(135deg,#fb923c,#eab308);color:white;padding:15px 40px;border-radius:50px;text-decoration:none;font-weight:bold;">Leave a Google Review</a>
      </div>

      <div style="background:#fef7ed;border-radius:15px;padding:20px;margin-top:30px;text-align:center;">
        <p style="color:#083344;margin:0 0 10px;font-weight:bold;">Thanks for reviewing! Here's $25 off your next trip:</p>
        <p style="color:#ea580c;font-size:24px;font-weight:bold;margin:0;">{{discountCode}}</p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim(),
    textContent: `
Thanks for Sailing With Us! 🍌

Hey {{firstName}}!

We hope you had an amazing time on {{boatName}} with Captain {{captainName}}!

We'd love to hear about your experience. Please leave us a Google review:
{{reviewLink}}

As a thank you, here's $25 off your next trip: {{discountCode}}

Thanks!
- HealthShield
    `.trim(),
  },

  'monthly-newsletter': {
    id: 'monthly-newsletter',
    name: 'Monthly Newsletter',
    subject: '🍌 {{monthName}} on the Water - News & Deals!',
    category: 'newsletter',
    variables: ['firstName', 'monthName', 'featuredBoat', 'promoCode', 'upcomingEvents'],
    htmlContent: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:20px;">
  <div style="background:linear-gradient(135deg,#f59e0b,#eab308);padding:30px 24px;text-align:center;">
    <h1 style="color:#ffffff;font-size:28px;margin:0;">HealthShield</h1>
    <p style="color:#fef3c7;margin:8px 0 0;font-size:16px;">{{monthName}} Newsletter</p>
  </div>
  <div style="padding:24px;">
    <p style="font-size:16px;color:#1e293b;">Hey {{firstName}},</p>
    <p style="font-size:14px;color:#475569;line-height:1.6;">Here is what is happening on Lake Travis and Lake Austin this month!</p>

    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:20px 0;">
      <h3 style="color:#92400e;margin:0 0 8px;">Featured Boat: {{featuredBoat}}</h3>
      <p style="font-size:14px;color:#78350f;margin:0;">Book this month and get exclusive rates. Perfect for groups and celebrations!</p>
    </div>

    <div style="margin:20px 0;">
      <h3 style="color:#1e293b;font-size:16px;">Upcoming Events</h3>
      <p style="font-size:14px;color:#475569;line-height:1.6;">{{upcomingEvents}}</p>
    </div>

    <div style="text-align:center;margin:24px 0;">
      <a href="https://healthshieldrentals.com/boats" style="background:#f59e0b;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:bold;font-size:16px;display:inline-block;">Browse Our Fleet</a>
    </div>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0;text-align:center;">
      <p style="font-size:14px;color:#166534;margin:0 0 4px;font-weight:bold;">Use code {{promoCode}} for 10% off!</p>
      <p style="font-size:12px;color:#15803d;margin:0;">Valid through the end of {{monthName}}</p>
    </div>
  </div>
  <div style="background:#f1f5f9;padding:20px 24px;text-align:center;">
    <p style="font-size:12px;color:#94a3b8;margin:0;">HealthShield | Austin, TX</p>
    <p style="font-size:12px;color:#94a3b8;margin:4px 0 0;">Questions? Call us at (512) 350-5372</p>
  </div>
</div>
</body>
</html>
    `.trim(),
    textContent: `Hey {{firstName}}!\n\n{{monthName}} Newsletter from HealthShield\n\nFeatured Boat: {{featuredBoat}}\nBook this month for exclusive rates!\n\nUpcoming Events:\n{{upcomingEvents}}\n\nUse code {{promoCode}} for 10% off - valid through the end of {{monthName}}!\n\nBrowse our fleet: https://healthshieldrentals.com/boats\n\nHealthShield | Austin, TX | (512) 350-5372`,
  },
};

// =============================================================================
// DRIP CAMPAIGN SEQUENCES
// =============================================================================

export interface DripSequence {
  id: string;
  name: string;
  trigger: 'signup' | 'first-booking' | 'post-trip' | 'inactive' | 'birthday';
  emails: DripEmail[];
}

export interface DripEmail {
  templateId: string;
  delayDays: number;
  delayHours?: number;
  conditions?: AudienceFilter[];
}

export const dripSequences: DripSequence[] = [
  {
    id: 'welcome-series',
    name: 'Welcome Series',
    trigger: 'signup',
    emails: [
      { templateId: 'welcome-series-1', delayDays: 0, delayHours: 1 },
      { templateId: 'welcome-series-2', delayDays: 3 },
      { templateId: 'welcome-series-3', delayDays: 7 },
    ],
  },
  {
    id: 'post-trip-series',
    name: 'Post-Trip Follow Up',
    trigger: 'post-trip',
    emails: [
      { templateId: 'review-request', delayDays: 1 },
      { templateId: 'share-photos', delayDays: 3 },
      { templateId: 'rebook-offer', delayDays: 14 },
    ],
  },
  {
    id: 're-engagement',
    name: 'Re-engagement Series',
    trigger: 'inactive',
    emails: [
      { templateId: 'we-miss-you', delayDays: 0 },
      { templateId: 'special-offer', delayDays: 7 },
      { templateId: 'last-chance', delayDays: 14 },
    ],
  },
];

// =============================================================================
// EMAIL FUNCTIONS
// =============================================================================

/**
 * Send transactional email
 */
export async function sendEmail(
  to: string,
  toName: string,
  templateId: string,
  variables: Record<string, string>,
  config?: EmailConfig
): Promise<Email> {
  const template = emailTemplates[templateId];
  if (!template) throw new Error(`Template not found: ${templateId}`);

  // Replace variables in template
  let subject = template.subject;
  let htmlContent = template.htmlContent;
  let textContent = template.textContent;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    subject = subject.replace(regex, value);
    htmlContent = htmlContent.replace(regex, value);
    textContent = textContent.replace(regex, value);
  }

  const email: Email = {
    id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    to,
    toName,
    from: config?.fromEmail || 'hello@healthshieldrentals.com',
    fromName: config?.fromName || 'HealthShield',
    subject,
    htmlContent,
    textContent,
    templateId,
    variables,
    status: 'queued',
    tags: [template.category],
  };

  // In production, send via provider:
  // await sendgrid.send({ ... })

  console.log('📧 Email Queued:', {
    to: email.to,
    subject: email.subject,
    template: templateId,
  });

  email.status = 'sent';
  email.sentAt = new Date();

  return email;
}

/**
 * Start drip campaign for subscriber
 */
export async function startDripCampaign(
  subscriberEmail: string,
  subscriberName: string,
  sequenceId: string,
  variables: Record<string, string>
): Promise<{ scheduled: number; emails: { templateId: string; sendAt: Date }[] }> {
  const sequence = dripSequences.find(s => s.id === sequenceId);
  if (!sequence) throw new Error(`Sequence not found: ${sequenceId}`);

  const scheduledEmails: { templateId: string; sendAt: Date }[] = [];
  const now = new Date();

  for (const email of sequence.emails) {
    const sendAt = new Date(now);
    sendAt.setDate(sendAt.getDate() + email.delayDays);
    if (email.delayHours) {
      sendAt.setHours(sendAt.getHours() + email.delayHours);
    }

    scheduledEmails.push({
      templateId: email.templateId,
      sendAt,
    });

    // In production, schedule with job queue
    console.log(`📅 Scheduled: ${email.templateId} for ${subscriberEmail} at ${sendAt.toISOString()}`);
  }

  return {
    scheduled: scheduledEmails.length,
    emails: scheduledEmails,
  };
}

/**
 * Send abandoned booking recovery email
 */
export async function sendAbandonedBookingEmail(
  email: string,
  customerName: string,
  boatName: string,
  date: string
): Promise<Email> {
  const discountCode = `SAVE50_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  return sendEmail(email, customerName, 'abandoned-booking', {
    customerName,
    boatName,
    date,
    discountCode,
  });
}

// =============================================================================
// SUBSCRIBER MANAGEMENT
// =============================================================================

export interface Subscriber {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status: 'active' | 'unsubscribed' | 'bounced' | 'spam';
  tags: string[];
  customFields: Record<string, string>;
  totalTrips: number;
  totalSpent: number;
  lastTripDate?: Date;
  birthday?: string;
  signupDate: Date;
  lastEmailDate?: Date;
  emailsReceived: number;
  emailsOpened: number;
  emailsClicked: number;
}

/**
 * Segment subscribers based on criteria
 */
export function segmentSubscribers(
  subscribers: Subscriber[],
  filters: AudienceFilter[]
): Subscriber[] {
  return subscribers.filter(sub => {
    for (const filter of filters) {
      const value = sub[filter.field as keyof Subscriber] ?? sub.customFields[filter.field];

      switch (filter.operator) {
        case 'equals':
          if (value !== filter.value) return false;
          break;
        case 'not_equals':
          if (value === filter.value) return false;
          break;
        case 'gt':
          if (typeof value !== 'number' || value <= (filter.value as number)) return false;
          break;
        case 'lt':
          if (typeof value !== 'number' || value >= (filter.value as number)) return false;
          break;
        case 'in':
          if (!Array.isArray(filter.value) || !(filter.value as (string | number)[]).includes(value as string | number)) return false;
          break;
      }
    }
    return true;
  });
}

/**
 * Get VIP subscribers (3+ trips or $1500+ spent)
 */
export function getVIPSubscribers(subscribers: Subscriber[]): Subscriber[] {
  return segmentSubscribers(subscribers, [
    { field: 'status', operator: 'equals', value: 'active' },
  ]).filter(sub => sub.totalTrips >= 3 || sub.totalSpent >= 1500);
}

/**
 * Get inactive subscribers (no trip in 6 months)
 */
export function getInactiveSubscribers(subscribers: Subscriber[]): Subscriber[] {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  return subscribers.filter(sub =>
    sub.status === 'active' &&
    sub.totalTrips > 0 &&
    (!sub.lastTripDate || sub.lastTripDate < sixMonthsAgo)
  );
}
