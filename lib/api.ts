import { PLANS } from "@/lib/plans";
import { PaymentIntent, PaymentIntentInput, PaymentResult } from "@/types/payment";
import { Plan } from "@/types/plan";

const SIMULATED_DELAY_MS = 1100;

async function mockFetch<T>(factory: () => T, failRate = 0): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));

  if (Math.random() < failRate) {
    throw new Error("Network temporarily unstable. Please retry.");
  }

  return factory();
}

export async function fetchPlans(): Promise<Plan[]> {
  return mockFetch(() => PLANS, 0.05);
}

export async function createPaymentIntent(input: PaymentIntentInput): Promise<PaymentIntent> {
  return mockFetch(() => ({
    checkoutId: `chk_${Date.now()}`,
    method: input.method,
    amountLabel: input.method === "vnd" ? "Scan VietQR or pay via Sepay" : "Transfer exact USDT amount",
    destination: input.method === "vnd" ? "VCB • 1055 000 8899" : "TRC20 • THX8...A91",
  }));
}

export async function confirmPayment(checkoutId: string): Promise<PaymentResult> {
  return mockFetch(() => {
    const succeeded = checkoutId.length > 0 && Math.random() > 0.3;

    if (!succeeded) {
      return {
        status: "failed",
        message: "Payment not confirmed yet. Retry or switch method.",
      };
    }

    return {
      status: "success",
      message: "Payment successful. Your assistant is ready in bot.",
    };
  });
}
