import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl, getServerHeaders } from '@/lib/api-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ['plan_name', 'appointment_date', 'start_time', 'duration', 'first_name', 'last_name', 'email', 'phone'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }

    // Forward to SystemsF1RST backend
    const response = await fetch(getApiUrl('/api/v1/crm/enrollments'), {
      method: 'POST',
      headers: getServerHeaders(),
      body: JSON.stringify({
        plan_name: body.plan_name,
        plan_type: body.plan_type,
        appointment_date: body.appointment_date,
        start_time: body.start_time,
        duration_hours: body.duration,
        member_count: body.party_size || 1,
        enrollment_type: body.occasion || null,
        special_requests: body.special_requests || null,
        customer_first_name: body.first_name,
        customer_last_name: body.last_name,
        customer_email: body.email,
        customer_phone: body.phone,
        emergency_contact_name: body.emergency_name || null,
        emergency_contact_phone: body.emergency_phone || null,
        base_rate: body.base_price || 0,
        processing_fee: body.agent_fee || 0,
        addon_fees: body.add_ons_total || 0,
        tax_amount: body.tax || 0,
        total_amount: body.total || 0,
        promo_code: body.promo_code || null,
        consent_sms: body.agree_to_consent_sms || false,
        source: 'website',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        booking_id: data.data?.id || data.id,
        confirmation_code: data.data?.confirmation_code || data.confirmation_code,
        message: 'Booking created successfully! Check your email and phone for confirmation.',
      });
    }

    // Backend returned an error
    const errorData = await response.json().catch(() => null);
    return NextResponse.json({
      success: false,
      error: errorData?.message || 'Failed to create booking. Please call us at (833) 432-5841.',
    }, { status: response.status });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Something went wrong. Please call us at (833) 432-5841 to complete your booking.',
    }, { status: 500 });
  }
}
