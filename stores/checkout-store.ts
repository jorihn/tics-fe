"use client";

import { create } from "zustand";
import { PaymentMethod, PaymentStatus } from "@/types/payment";
import { Plan } from "@/types/plan";

interface CheckoutState {
  selectedPlan: Plan | null;
  method: PaymentMethod;
  paymentStatus: PaymentStatus;
  checkoutId: string | null;
  paymentMessage: string;
  setPlan: (plan: Plan) => void;
  setMethod: (method: PaymentMethod) => void;
  setPaymentState: (status: PaymentStatus, message?: string, checkoutId?: string | null) => void;
  resetPayment: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  selectedPlan: null,
  method: "vnd",
  paymentStatus: "idle",
  checkoutId: null,
  paymentMessage: "",
  setPlan: (plan) =>
    set({
      selectedPlan: plan,
      paymentStatus: "idle",
      paymentMessage: "",
      checkoutId: null,
    }),
  setMethod: (method) => set({ method }),
  setPaymentState: (paymentStatus, paymentMessage = "", checkoutId = null) =>
    set({ paymentStatus, paymentMessage, checkoutId }),
  resetPayment: () => set({ paymentStatus: "idle", paymentMessage: "", checkoutId: null }),
}));
