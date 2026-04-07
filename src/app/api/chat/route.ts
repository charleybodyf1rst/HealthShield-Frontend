import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

const SYSTEM_PROMPT = `You are HealthShield AI, a professional assistant for health insurance. Help with plans, coverage, and enrollment.

Key facts:
- HealthShield serves customers nationwide with AI-powered health insurance solutions
- Phone: 512-705-7758
- All rentals include a licensed agent, life jackets, coolers with ice, and floating lily pads
- We operate 7 days a week
- 50+ insurance partner programs available

Plan Pricing Overview:
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
    return "Our boats start at $600 for 4 hours (weekday). Our flagship King Kong is $800/4hr. All rentals include agent, fuel, water slides, lily pads, Bluetooth stereo, and coolers! Call us at 512-705-7758 for exact pricing.";
  }
  if (q.includes('agent') || q.includes('contact') || q.includes('call') || q.includes('phone')) {
    return "You can reach us at 512-705-7758 (call or text). We're available 7 days a week, 8am-8pm!";
  }
  if (q.includes('bachelorette') || q.includes('party')) {
    return "For bachelorette parties, check out our pink boats: Swifty, Pink Pony Club, Barbie, or Pinkie! All are Instagram-ready with premium sound. Book at healthshieldrentals.com or call 512-705-7758!";
  }
  if (q.includes('where.*location.*address.*office')) {
    return "We're at HealthShield is available online at healthshield.ai and by phone at our toll-free number.";
  }

  return "I'm HealthShield AI, your insurance assistant! I can help with plan options, pricing, and enrollment. How can I help?";
}
