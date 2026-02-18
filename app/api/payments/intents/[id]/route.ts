import { NextRequest, NextResponse } from 'next/server';
import { getPaymentIntent } from '@/lib/payment-db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const intent = getPaymentIntent(id);

    if (!intent) {
      return NextResponse.json(
        { error: 'Payment intent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      intent_id: intent.id,
      status: intent.status,
      tx_hash: intent.tx_hash,
      amount_expected: intent.amount_expected,
      asset: intent.asset,
      paid_at: intent.paid_at,
    });
  } catch (error) {
    console.error('Error fetching payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment intent' },
      { status: 500 }
    );
  }
}
