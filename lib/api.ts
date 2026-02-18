import { PLANS } from "@/lib/plans";
import { PaymentIntentInput, PaymentIntentResponse, PaymentResult } from "@/types/payment";
import { Plan } from "@/types/plan";

export async function fetchPlans(): Promise<Plan[]> {
  return Promise.resolve(PLANS);
}

export async function createPaymentIntent(input: PaymentIntentInput): Promise<PaymentIntentResponse> {
  const response = await fetch('/api/payments/intents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('Failed to create payment intent');
  }

  return response.json();
}

export async function getPaymentIntent(intentId: string): Promise<any> {
  const response = await fetch(`/api/payments/intents/${intentId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch payment intent');
  }

  return response.json();
}

export async function verifyPayment(intentId: string): Promise<PaymentResult> {
  const response = await fetch(`/api/payments/verify/${intentId}`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to verify payment');
  }

  return response.json();
}
