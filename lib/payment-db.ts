import { PaymentIntent, PaymentStatus } from "@/types/payment";

const STORAGE_KEY = 'payment_intents';

export function savePaymentIntent(intent: PaymentIntent): void {
  if (typeof window === 'undefined') return;
  
  const intents = getAllPaymentIntents();
  intents[intent.id] = intent;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(intents));
}

export function getPaymentIntent(id: string): PaymentIntent | null {
  if (typeof window === 'undefined') return null;
  
  const intents = getAllPaymentIntents();
  return intents[id] || null;
}

export function updatePaymentStatus(
  id: string, 
  status: PaymentStatus, 
  updates: Partial<PaymentIntent> = {}
): void {
  if (typeof window === 'undefined') return;
  
  const intent = getPaymentIntent(id);
  if (!intent) return;
  
  const updatedIntent: PaymentIntent = {
    ...intent,
    ...updates,
    status,
    updated_at: new Date().toISOString(),
  };
  
  savePaymentIntent(updatedIntent);
}

export function getAllPaymentIntents(): Record<string, PaymentIntent> {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function getPendingIntents(): PaymentIntent[] {
  const intents = getAllPaymentIntents();
  return Object.values(intents).filter(i => i.status === 'pending');
}

export function expireOldQuotes(): void {
  const intents = getAllPaymentIntents();
  const now = new Date();
  
  Object.values(intents).forEach(intent => {
    if (
      intent.status === 'idle' && 
      intent.quote_expires_at && 
      new Date(intent.quote_expires_at) < now
    ) {
      updatePaymentStatus(intent.id, 'expired');
    }
  });
}
