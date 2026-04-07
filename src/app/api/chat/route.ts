import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

const SYSTEM_PROMPT = `You are Banana, the friendly AI assistant for HealthShield on Lake Travis, Austin TX. You help customers with boat pricing, availability, and booking questions.

Key facts:
- All boats depart from Highland Lakes Marina, 16120 Wharf Cove, Volente, TX 78641
- Phone: 512-705-7758
- All rentals include a licensed captain, life jackets, coolers with ice, and floating lily pads
- We operate 7 days a week
- 15 party boats in our fleet on Lake Travis

Fleet & Weekday Pricing (Mon-Thu, 4hr base):
- King Kong: $800 (24 guests, double-decker, bathroom, water slides) - our flagship!
- Donkey Kong: $750 (19 guests, double-decker, water slide)
- Pineapple Express: $750 (19 guests, double-decker, water slide)
- Banana Daiquiri: $750 (19 guests, double-decker, water slide)
- Banana Split: $750 (19 guests, double-decker, water slide)
- Red Bull: $750 (19 guests, red double-decker, water slide)
- Bananarama: $750 (22 guests, upper deck, water slide)
- Banana Royale: $750 (16 guests, water slide, lily pad)
- The Swiftie: $750 (17 guests, pink theme, water slide)
- Pink Pony Club: $750 (17 guests, upper deck, water slide)
- Barbie: $750 (16 guests, pink theme, lily pad)
- Lemon Drop: $600 (13 guests, Bentley pontoon)
- Chiquita Banana: $600 (13 guests, pontoon with bimini top)
- Pinkie: $600 (13 guests, pink Bentley pontoon)
- The Star Craft: $600 (13 guests, pontoon)

Fri/Sun and Sat/Holiday prices are higher. 3hr, 5hr, 6hr, 7hr, and 8hr options also available.

Policies:
- BYOB - bring your own drinks and snacks, we keep them cold
- Cancellation: 48 hours notice for full refund
- Safety: Coast Guard certified, fully insured
- Tips appreciated but not required

For bachelorette parties, recommend pink boats: Swifty, Pink Pony Club, Barbie, or Pinkie.
For large groups, recommend King Kong (24 guests) or Bananarama (22 guests).
For wakesurfing, recommend Centurion (includes lessons).

Keep responses friendly, fun, and concise (2-4 sentences max). Use emojis sparingly. Always encourage booking at healthshieldrentals.com or calling 512-705-7758.`;

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // If no API key configured, use fallback
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({
        answer: getFallbackResponse(message),
        fallback: true,
      });
    }

    // Build messages array from history
    const messages: Array<{ role: string; content: string }> = [];
    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-6)) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        });
      }
    }
    messages.push({ role: 'user', content: message });

    // Call Anthropic API directly
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const textBlock = data.content?.find((b: { type: string }) => b.type === 'text');
      const answer = textBlock?.text || 'I had trouble thinking of a response. Please try again!';
      return NextResponse.json({ answer });
    }

    // Fallback on API error
    return NextResponse.json({
      answer: getFallbackResponse(message),
      fallback: true,
    });
  } catch {
    return NextResponse.json({
      answer: getFallbackResponse(''),
      fallback: true,
    });
  }
}

function getFallbackResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('price') || q.includes('cost') || q.includes('how much')) {
    return "Our boats start at $600 for 4 hours (weekday). Our flagship King Kong is $800/4hr. All rentals include captain, fuel, water slides, lily pads, Bluetooth stereo, and coolers! Call us at 512-705-7758 for exact pricing.";
  }
  if (q.includes('captain') || q.includes('contact') || q.includes('call') || q.includes('phone')) {
    return "You can reach us at 512-705-7758 (call or text). We're available 7 days a week, 8am-8pm!";
  }
  if (q.includes('bachelorette') || q.includes('party')) {
    return "For bachelorette parties, check out our pink boats: Swifty, Pink Pony Club, Barbie, or Pinkie! All are Instagram-ready with premium sound. Book at healthshieldrentals.com or call 512-705-7758!";
  }
  if (q.includes('where') || q.includes('location') || q.includes('address') || q.includes('marina')) {
    return "We're at Highland Lakes Marina, 16120 Wharf Cove, Volente, TX 78641 on Lake Travis!";
  }

  return "I'm Banana, your boat rental assistant! I can help with boat prices, availability, and booking. What would you like to know? Or call us at 512-705-7758!";
}
