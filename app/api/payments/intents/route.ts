import { NextRequest, NextResponse } from 'next/server';
import { PaymentIntentInput, PaymentIntent } from '@/types/payment';
import { getTONPrice, calculateTONAmount } from '@/lib/ton-price';
import { savePaymentIntent } from '@/lib/payment-db';

const PLAN_PRICES: Record<string, number> = {
  donate: 0.001,
  explore: 10,
  savings: 20,
  standard: 30,
};

export async function POST(request: NextRequest) {
  try {
    const body: PaymentIntentInput = await request.json();
    const { planId, asset } = body;

    if (!planId || !asset) {
      return NextResponse.json(
        { error: 'Missing planId or asset' },
        { status: 400 }
      );
    }

    const plan_usd = PLAN_PRICES[planId];
    if (plan_usd === undefined) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      );
    }

    let amount_expected: number;
    let quote_rate: number | undefined;
    let quote_expires_at: string | undefined;

    if (planId === 'donate') {
      amount_expected = 0.001;
      if (asset === 'TON') {
        quote_expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      }
    } else if (asset === 'TON') {
      quote_rate = await getTONPrice();
      amount_expected = calculateTONAmount(plan_usd, quote_rate);
      quote_expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    } else {
      amount_expected = plan_usd;
    }

    const intent: PaymentIntent = {
      id: `intent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: 'user_temp',
      plan_id: planId,
      plan_usd,
      asset,
      chain: 'TON',
      amount_expected,
      quote_rate,
      quote_expires_at,
      wallet_address: process.env.TON_WALLET_ADDRESS || 'UQD_placeholder',
      status: 'idle',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    savePaymentIntent(intent);

    return NextResponse.json({
      intent_id: intent.id,
      plan_usd: intent.plan_usd,
      asset: intent.asset,
      amount_expected: intent.amount_expected,
      quote_rate: intent.quote_rate,
      quote_expires_at: intent.quote_expires_at,
      wallet_address: intent.wallet_address,
      status: intent.status,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
