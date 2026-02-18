# Payment Integration Plan: TON + USDT for Telegram Mini App

## Overview
Integrate blockchain payment (TON native + USDT on TON) into the `/agents` page with real-time TON/USD conversion and unified payment state machine.

---

## 1. Chain Selection (MVP)
- **TON (native)**: for TON payments
- **USDT on TON (Jetton)**: for USDT payments
- **Rationale**: lowest gas fees, native Telegram/TON wallet integration, seamless UX

---

## 2. Database Schema

### `payment_intents` collection/table
```typescript
{
  id: string;                    // unique intent ID
  user_id: string;               // Telegram user ID
  plan_id: string;               // 'trial' | 'savings' | 'standard'
  plan_usd: number;              // 10 | 20 | 30
  asset: 'TON' | 'USDT';         // payment currency
  chain: 'TON';                  // blockchain network
  amount_expected: number;       // amount user must pay
  quote_rate?: number;           // TON/USD rate (only for TON payments)
  quote_expires_at?: Date;       // quote expiration timestamp
  status: 'idle' | 'pending' | 'success' | 'failed' | 'expired';
  tx_hash?: string;              // blockchain transaction hash
  wallet_address: string;        // recipient wallet (your wallet)
  user_wallet_address?: string;  // sender wallet (for verification)
  raw_event?: any;               // raw blockchain event data
  created_at: Date;
  updated_at: Date;
  paid_at?: Date;
}
```

---

## 3. API Endpoints

### `POST /api/payments/intents`
Create a new payment intent.

**Request:**
```json
{
  "plan_id": "standard",
  "asset": "TON"
}
```

**Response:**
```json
{
  "intent_id": "intent_abc123",
  "plan_usd": 30,
  "asset": "TON",
  "amount_expected": 5.1,
  "quote_rate": 5.88,
  "quote_expires_at": "2026-02-18T11:32:00Z",
  "wallet_address": "UQD...",
  "status": "idle"
}
```

### `GET /api/payments/intents/:id`
Get payment intent status.

**Response:**
```json
{
  "intent_id": "intent_abc123",
  "status": "pending",
  "tx_hash": "abc...",
  "amount_expected": 5.1,
  "asset": "TON"
}
```

### `POST /api/payments/verify/:id`
Manually trigger verification (optional, for testing).

**Response:**
```json
{
  "intent_id": "intent_abc123",
  "status": "success",
  "tx_hash": "abc...",
  "paid_at": "2026-02-18T11:30:00Z"
}
```

### `POST /api/webhooks/ton`
Webhook for TON blockchain events (if using indexer service).

**Request:** (depends on indexer provider)
```json
{
  "tx_hash": "abc...",
  "from": "UQA...",
  "to": "UQD...",
  "amount": "5100000000",
  "payload": "intent_abc123"
}
```

---

## 4. Backend Implementation

### 4.1 TON Price Service
```typescript
// lib/ton-price.ts
export async function getTONPrice(): Promise<number> {
  // Fetch from CoinGecko/Binance/CMC
  const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd');
  const data = await response.json();
  return data['the-open-network'].usd;
}

export function calculateTONAmount(usd: number, tonPrice: number, slippage = 0.02): number {
  const baseAmount = usd / tonPrice;
  return baseAmount * (1 + slippage); // add 2% buffer
}
```

### 4.2 Payment Intent Creation
```typescript
// app/api/payments/intents/route.ts
export async function POST(req: Request) {
  const { plan_id, asset } = await req.json();
  const user_id = getUserIdFromSession(req);
  
  const planPrices = { trial: 10, savings: 20, standard: 30 };
  const plan_usd = planPrices[plan_id];
  
  let amount_expected: number;
  let quote_rate: number | undefined;
  let quote_expires_at: Date | undefined;
  
  if (asset === 'TON') {
    quote_rate = await getTONPrice();
    amount_expected = calculateTONAmount(plan_usd, quote_rate);
    quote_expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  } else {
    amount_expected = plan_usd; // USDT 1:1
  }
  
  const intent = await db.payment_intents.create({
    user_id,
    plan_id,
    plan_usd,
    asset,
    chain: 'TON',
    amount_expected,
    quote_rate,
    quote_expires_at,
    wallet_address: process.env.TON_WALLET_ADDRESS,
    status: 'idle',
  });
  
  return Response.json(intent);
}
```

### 4.3 On-Chain Verification
```typescript
// lib/ton-verify.ts
import { TonClient, Address } from '@ton/ton';

export async function verifyTONPayment(intent: PaymentIntent): Promise<boolean> {
  const client = new TonClient({
    endpoint: 'https://toncenter.com/api/v2/jsonRPC',
    apiKey: process.env.TON_API_KEY,
  });
  
  // Get transactions for your wallet
  const transactions = await client.getTransactions(
    Address.parse(intent.wallet_address),
    { limit: 100 }
  );
  
  // Find matching transaction
  const match = transactions.find(tx => {
    const inMsg = tx.inMessage;
    if (!inMsg) return false;
    
    const amount = Number(inMsg.info.value.coins) / 1e9; // convert nanotons
    const payload = inMsg.body?.toString();
    
    return (
      amount >= intent.amount_expected * 0.98 && // 2% tolerance
      payload?.includes(intent.id)
    );
  });
  
  if (match) {
    await db.payment_intents.update(intent.id, {
      status: 'success',
      tx_hash: match.hash().toString('hex'),
      paid_at: new Date(),
    });
    
    // Activate plan for user
    await activatePlan(intent.user_id, intent.plan_id);
    return true;
  }
  
  return false;
}

export async function verifyUSDTPayment(intent: PaymentIntent): Promise<boolean> {
  // Similar logic but for Jetton transfers
  // Check Jetton master contract = official USDT
  // Verify transfer to your wallet
  // Amount in USDT decimals
}
```

### 4.4 Background Job (Polling)
```typescript
// lib/payment-monitor.ts
export async function monitorPendingPayments() {
  const pending = await db.payment_intents.findMany({
    status: 'pending',
    created_at: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // last 1h
  });
  
  for (const intent of pending) {
    if (intent.asset === 'TON') {
      await verifyTONPayment(intent);
    } else {
      await verifyUSDTPayment(intent);
    }
  }
  
  // Expire old quotes
  await db.payment_intents.updateMany(
    {
      status: 'idle',
      quote_expires_at: { $lt: new Date() }
    },
    { status: 'expired' }
  );
}

// Run every 30s
setInterval(monitorPendingPayments, 30000);
```

---

## 5. Frontend Integration

### 5.1 Payment Method Selector (on `/agents`)
```tsx
// components/PaymentMethodSelector.tsx
'use client';

import { useState } from 'react';

export function PaymentMethodSelector({ 
  selectedPlan, 
  onPaymentComplete 
}: { 
  selectedPlan: 'trial' | 'savings' | 'standard';
  onPaymentComplete: () => void;
}) {
  const [asset, setAsset] = useState<'TON' | 'USDT'>('TON');
  const [intent, setIntent] = useState(null);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
  
  const createIntent = async () => {
    const res = await fetch('/api/payments/intents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan_id: selectedPlan, asset }),
    });
    const data = await res.json();
    setIntent(data);
  };
  
  const handlePay = async () => {
    if (!intent) await createIntent();
    
    setStatus('pending');
    
    if (asset === 'TON') {
      // TON Connect integration
      const tonConnectUI = getTonConnectUI();
      const tx = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{
          address: intent.wallet_address,
          amount: (intent.amount_expected * 1e9).toString(),
          payload: intent.intent_id,
        }]
      };
      
      await tonConnectUI.sendTransaction(tx);
      
      // Poll for confirmation
      pollPaymentStatus(intent.intent_id);
    }
  };
  
  const pollPaymentStatus = async (intentId: string) => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/payments/intents/${intentId}`);
      const data = await res.json();
      
      if (data.status === 'success') {
        setStatus('success');
        clearInterval(interval);
        onPaymentComplete();
      } else if (data.status === 'failed') {
        setStatus('failed');
        clearInterval(interval);
      }
    }, 3000);
  };
  
  return (
    <div className="payment-selector">
      <div className="method-toggle">
        <button onClick={() => setAsset('TON')}>TON</button>
        <button onClick={() => setAsset('USDT')}>USDT</button>
      </div>
      
      {intent && (
        <div className="quote">
          {asset === 'TON' ? (
            <p>{intent.amount_expected} TON (${intent.plan_usd} @ {intent.quote_rate} USD/TON)</p>
          ) : (
            <p>${intent.amount_expected} USDT</p>
          )}
        </div>
      )}
      
      <button 
        onClick={handlePay}
        disabled={status === 'pending'}
      >
        {status === 'pending' ? 'Processing...' : 'Pay Now'}
      </button>
      
      {status === 'success' && <p>✅ Payment successful!</p>}
      {status === 'failed' && <p>❌ Payment failed. Try again.</p>}
    </div>
  );
}
```

### 5.2 Integrate into `/agents` page
```tsx
// app/agents/page.tsx
import { PaymentMethodSelector } from '@/components/PaymentMethodSelector';

export default function AgentsPage() {
  const [selectedPlan, setSelectedPlan] = useState('standard');
  
  return (
    <div>
      {/* Existing plan carousel */}
      <PlanCarousel onSelect={setSelectedPlan} />
      
      {/* New payment section */}
      <PaymentMethodSelector 
        selectedPlan={selectedPlan}
        onPaymentComplete={() => {
          // Redirect or show success
        }}
      />
    </div>
  );
}
```

---

## 6. Security Checklist
- [ ] Verify TON/USDT contract addresses (whitelist official contracts)
- [ ] Idempotency keys for all payment state updates
- [ ] Replay protection (check tx_hash uniqueness)
- [ ] Quote TTL enforcement (expire old quotes)
- [ ] Rate limiting on intent creation
- [ ] Audit logging (intent_id, tx_hash, status transitions)
- [ ] Monitoring alerts for stuck pending payments
- [ ] Testnet testing before mainnet

---

## 7. Environment Variables
```env
TON_WALLET_ADDRESS=UQD...
TON_API_KEY=...
USDT_JETTON_MASTER=EQC...
TON_NETWORK=mainnet # or testnet
```

---

## 8. Dependencies
```json
{
  "@ton/ton": "^13.x",
  "@tonconnect/ui-react": "^2.x"
}
```

---

## 9. Implementation Phases

### Phase 1: MVP (3-5 days)
- [ ] Database schema + payment_intents model
- [ ] TON price service
- [ ] Create intent API
- [ ] TON payment verification (native TON only)
- [ ] Frontend payment selector + TON Connect
- [ ] Testnet end-to-end test

### Phase 2: Hardening (2-3 days)
- [ ] USDT Jetton verification
- [ ] Background monitoring job
- [ ] Idempotency + retry logic
- [ ] Error handling + user feedback
- [ ] Monitoring/alerts

### Phase 3: Production (1-2 days)
- [ ] Mainnet deployment
- [ ] Real wallet setup
- [ ] Production monitoring
- [ ] User documentation

---

## 10. Testing Checklist (Testnet)
- [ ] Create intent for TON payment
- [ ] Send TON with correct payload → verify success
- [ ] Send TON with wrong amount → verify failed
- [ ] Quote expiration → verify expired status
- [ ] Create intent for USDT payment
- [ ] Send USDT Jetton → verify success
- [ ] Concurrent payments from different users
- [ ] Idempotency: duplicate webhook/callback handling

---

## Notes
- Start with TON native only for fastest MVP
- Add USDT-TON Jetton in Phase 2
- Consider adding TRC20 USDT fallback in Phase 3 if user demand exists
- All amounts in TON use 9 decimals (nanotons)
- USDT typically uses 6 decimals
