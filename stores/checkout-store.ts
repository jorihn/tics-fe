"use client";

import { create } from "zustand";
import { PaymentAsset, PaymentStatus } from "@/types/payment";
import { Plan } from "@/types/plan";

interface CheckoutState {
  selectedPlan: Plan | null;
  asset: PaymentAsset;
  paymentStatus: PaymentStatus;
  intentId: string | null;
  paymentMessage: string;
  setPlan: (plan: Plan) => void;
  setAsset: (asset: PaymentAsset) => void;
  setPaymentState: (status: PaymentStatus, message?: string, intentId?: string | null) => void;
  resetPayment: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  selectedPlan: null,
  asset: "TON",
  paymentStatus: "idle",
  intentId: null,
  paymentMessage: "",
  setPlan: (plan) =>
    set({
      selectedPlan: plan,
      paymentStatus: "idle",
      paymentMessage: "",
      intentId: null,
    }),
  setAsset: (asset) => set({ asset }),
  setPaymentState: (paymentStatus, paymentMessage = "", intentId = null) =>
    set({ paymentStatus, paymentMessage, intentId }),
  resetPayment: () => set({ paymentStatus: "idle", paymentMessage: "", intentId: null }),
}));
