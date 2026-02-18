export type PaymentAsset = "TON" | "USDT";

export type PaymentStatus = "idle" | "pending" | "success" | "failed" | "expired";

export interface PaymentIntentInput {
  planId: string;
  asset: PaymentAsset;
}

export interface PaymentIntent {
  id: string;
  user_id: string;
  plan_id: string;
  plan_usd: number;
  asset: PaymentAsset;
  chain: "TON";
  amount_expected: number;
  quote_rate?: number;
  quote_expires_at?: string;
  status: PaymentStatus;
  tx_hash?: string;
  wallet_address: string;
  user_wallet_address?: string;
  raw_event?: any;
  created_at: string;
  updated_at: string;
  paid_at?: string;
}

export interface PaymentIntentResponse {
  intent_id: string;
  plan_usd: number;
  asset: PaymentAsset;
  amount_expected: number;
  quote_rate?: number;
  quote_expires_at?: string;
  wallet_address: string;
  status: PaymentStatus;
}

export interface PaymentResult {
  status: Extract<PaymentStatus, "success" | "failed">;
  message: string;
  tx_hash?: string;
  paid_at?: string;
}
