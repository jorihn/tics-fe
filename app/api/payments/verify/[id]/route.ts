import { NextRequest, NextResponse } from 'next/server';
import { getPaymentIntent } from '@/lib/payment-db';
import { verifyTONPayment, verifyUSDTPayment } from '@/lib/ton-verify';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const intent = getPaymentIntent(id);

    if (!intent) {
      return NextResponse.json(
        { error: 'Payment intent not found' },
        { status: 404 }
      );
    }

    if (intent.status === 'success') {
      return NextResponse.json({
        intent_id: intent.id,
        status: 'success',
        message: 'Payment already confirmed',
        tx_hash: intent.tx_hash,
        paid_at: intent.paid_at,
      });
    }

    let verified = false;
    
    if (intent.asset === 'TON') {
      verified = await verifyTONPayment(intent);
    } else if (intent.asset === 'USDT') {
      verified = await verifyUSDTPayment(intent);
    }

    if (verified) {
      const updatedIntent = getPaymentIntent(id);
      
      return NextResponse.json({
        intent_id: id,
        status: 'success',
        message: 'Payment verified successfully',
        tx_hash: updatedIntent?.tx_hash,
        paid_at: updatedIntent?.paid_at,
      });
    } else {
      return NextResponse.json({
        intent_id: id,
        status: 'failed',
        message: 'Payment verification failed. Transaction not found on blockchain.',
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
