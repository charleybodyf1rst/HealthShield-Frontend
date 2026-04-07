import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl, getServerHeaders } from '@/lib/api-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.first_name || !body.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Forward to SystemsF1RST backend CRM
    const response = await fetch(getApiUrl('/api/v1/crm/leads'), {
      method: 'POST',
      headers: getServerHeaders(),
      body: JSON.stringify({
        first_name: body.first_name,
        last_name: body.last_name || '',
        email: body.email,
        phone: body.phone || null,
        source: body.source || 'website_contact',
        inquiry_type: body.inquiry_type || 'general',
        preferred_date: body.preferred_date || null,
        party_size: body.party_size || null,
        message: body.message || null,
        status: 'new',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        lead_id: data.data?.id || data.id,
        message: 'Thank you! We\'ll get back to you within 24 hours.',
      });
    }

    // Even if backend fails, show success to user (we don't want them to re-submit)
    // Log the error server-side
    console.error('Lead creation failed:', response.status, await response.text().catch(() => ''));
    return NextResponse.json({
      success: true,
      message: 'Thank you! We\'ll get back to you within 24 hours.',
    });
  } catch (error) {
    console.error('Lead API error:', error);
    // Still show success to user
    return NextResponse.json({
      success: true,
      message: 'Thank you! We\'ll get back to you within 24 hours.',
    });
  }
}
