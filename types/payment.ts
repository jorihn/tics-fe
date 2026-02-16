export type PaymentMethod = "vnd" | "usdt";

export type PaymentStatus = "idle" | "pending" | "success" | "failed";

export interface PaymentIntentInput {
  planId: string;
  method: PaymentMethod;
}

export interface PaymentIntent {
  checkoutId: string;
  method: PaymentMethod;
  amountLabel: string;
  destination: string;
}

export interface PaymentResult {
  status: Extract<PaymentStatus, "success" | "failed">;
  message: string;
}
