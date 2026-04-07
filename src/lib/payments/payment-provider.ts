/**
 * Payment Provider — Routes payments through the backend API.
 *
 * Currently uses mock mode for testing. When MX Merchant credentials
 * are configured, swap to real payment processing by setting
 * NEXT_PUBLIC_PAYMENT_MODE=live and configuring MX_MERCHANT_* env vars
 * on the backend.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://systemsf1rst-backend-887571186773.us-central1.run.app';

interface CardDetails {
  number: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardHolderName: string;
  zipCode: string;
}

interface PaymentRequest {
  bookingId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  card: CardDetails;
  metadata?: Record<string, string>;
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

interface PaymentProvider {
  createPayment: (request: PaymentRequest) => Promise<PaymentResult>;
}

async function createPaymentViaBackend(request: PaymentRequest): Promise<PaymentResult> {
  try {
    const response = await fetch(`${API_URL}/api/v1/boat-rentals/public/process-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        booking_id: request.bookingId,
        amount: request.amount,
        currency: request.currency,
        customer_email: request.customerEmail,
        customer_name: request.customerName,
        card_number: request.card.number,
        card_exp_month: request.card.expiryMonth,
        card_exp_year: request.card.expiryYear,
        card_cvv: request.card.cvv,
        card_holder_name: request.card.cardHolderName,
        card_zip: request.card.zipCode,
        card_street: request.metadata?.billingStreet || '',
        boat_name: request.metadata?.boatName,
        trip_date: request.metadata?.tripDate,
        duration: request.metadata?.duration,
      }),
    });

    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        transactionId: data.transaction_id || data.booking_number,
      };
    }

    return {
      success: false,
      error: data.message || data.error || 'Payment was declined. Please try a different card.',
    };
  } catch (error) {
    console.error('Payment provider error:', error);
    return {
      success: false,
      error: 'Unable to process payment. Please try again.',
    };
  }
}

export async function getPaymentProvider(): Promise<PaymentProvider> {
  return {
    createPayment: createPaymentViaBackend,
  };
}
