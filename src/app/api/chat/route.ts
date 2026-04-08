import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

const SYSTEM_PROMPT = `You are HealthShield AI, a helpful and professional assistant for HealthShield, an AI-powered health insurance platform.

You help customers with:
- Insurance plan selection and comparison
- Enrollment and onboarding
- Wellness programs and preventive care benefits
- Claims status and filing assistance
- Coverage questions and benefit explanations
- Finding in-network providers

Key facts:
- HealthShield serves customers nationwide with AI-powered health insurance solutions
- 50+ insurance partner programs available
- Plans include: Bronze, Silver, Gold, and Platinum tiers
- All plans include preventive care, telehealth, and wellness program access
- Open enrollment and qualifying life event enrollment available year-round
- Contact: support@healthshield.com

Be professional, empathetic, and concise. Keep responses to 2-4 sentences when possible. Always encourage customers to reach out to support@healthshield.com for detailed policy questions.`;

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
    return "HealthShield offers Bronze, Silver, Gold, and Platinum plans to fit every budget. Visit healthshield.ai or email support@healthshield.com for a personalized quote.";
  }
  if (q.includes('agent') || q.includes('contact') || q.includes('call') || q.includes('phone')) {
    return "You can reach our support team at support@healthshield.com. We're available Monday through Friday, 8am-6pm CST.";
  }
  if (q.includes('enroll') || q.includes('sign up') || q.includes('register')) {
    return "You can enroll online at healthshield.ai or contact support@healthshield.com for guided enrollment assistance.";
  }
  if (q.includes('claim') || q.includes('claims')) {
    return "For claims inquiries, please log into your HealthShield dashboard or email support@healthshield.com with your policy number.";
  }

  return "I'm HealthShield AI, your insurance assistant! I can help with plan options, enrollment, claims, and wellness programs. How can I help?";
}
