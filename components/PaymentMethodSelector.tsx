"use client";

import { useState, useEffect } from "react";
import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { PaymentAsset } from "@/types/payment";
import { useCheckoutStore } from "@/stores/checkout-store";
import { createPaymentIntent, getPaymentIntent, verifyPayment } from "@/lib/api";
import { trackEvent } from "@/lib/tracking";

interface PaymentMethodSelectorProps {
  onPaymentComplete?: () => void;
}

export function PaymentMethodSelector({ onPaymentComplete }: PaymentMethodSelectorProps) {
  const selectedPlan = useCheckoutStore((state) => state.selectedPlan);
  const asset = useCheckoutStore((state) => state.asset);
  const setAsset = useCheckoutStore((state) => state.setAsset);
  const paymentStatus = useCheckoutStore((state) => state.paymentStatus);
  const paymentMessage = useCheckoutStore((state) => state.paymentMessage);
  const setPaymentState = useCheckoutStore((state) => state.setPaymentState);
  const intentId = useCheckoutStore((state) => state.intentId);

  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const [intentData, setIntentData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!intentData?.quote_expires_at) return;

    const interval = setInterval(() => {
      const expiresAt = new Date(intentData.quote_expires_at).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0) {
        setPaymentState("expired", "Quote expired. Please create a new payment.");
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [intentData, setPaymentState]);

  const handleCreateIntent = async () => {
    if (!selectedPlan) return;

    try {
      setPaymentState("pending", "Creating payment intent...");
      trackEvent("payment_intent_create", { plan: selectedPlan.id, asset });

      const intent = await createPaymentIntent({
        planId: selectedPlan.id,
        asset,
      });

      setIntentData(intent);
      setPaymentState("idle", "", intent.intent_id);
      trackEvent("payment_intent_created", { plan: selectedPlan.id, asset });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create payment intent";
      setPaymentState("failed", message);
      trackEvent("payment_intent_failed", { plan: selectedPlan.id, asset, error: message });
    }
  };

  const handlePay = async () => {
    if (!intentData || !selectedPlan) return;

    if (!wallet) {
      try {
        await tonConnectUI.openModal();
        return;
      } catch (error) {
        setPaymentState("failed", "Failed to connect wallet");
        return;
      }
    }

    setPaymentState("pending", "Processing payment...");
    trackEvent("payment_start", { plan: selectedPlan.id, asset, intent_id: intentData.intent_id });

    try {
      if (asset === "TON") {
        const amountNano = Math.floor(intentData.amount_expected * 1e9).toString();
        
        const transaction = {
          validUntil: Math.floor(Date.now() / 1000) + 600,
          messages: [
            {
              address: intentData.wallet_address,
              amount: amountNano,
              payload: intentData.intent_id,
            }
          ]
        };

        await tonConnectUI.sendTransaction(transaction);
        setPaymentState("pending", "Transaction sent. Waiting for confirmation...");
        
        setTimeout(() => {
          handleVerify(true);
        }, 5000);
      } else {
        alert(
          `USDT Jetton transfer not yet implemented.\n\n` +
          `Send ${intentData.amount_expected} USDT (on TON) to:\n${intentData.wallet_address}\n\n` +
          `Include memo: ${intentData.intent_id}\n\n` +
          `After sending, click "Verify Payment" below.`
        );
        setPaymentState("pending", "Waiting for USDT payment confirmation...");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Transaction failed";
      setPaymentState("failed", message);
      trackEvent("payment_failed", { plan: selectedPlan.id, asset, reason: message });
    }
  };

  const handleVerify = async (isAutoCheck = false) => {
    if (!intentData) return;

    try {
      setPaymentState("pending", "Verifying payment...");
      const result = await verifyPayment(intentData.intent_id);

      if (
        isAutoCheck &&
        result.status === "failed" &&
        typeof result.message === "string" &&
        result.message.toLowerCase().includes("not found on blockchain")
      ) {
        setPaymentState(
          "idle",
          "Transaction sent. Waiting for blockchain confirmation. Please click Verify Payment in a few seconds."
        );
        return;
      }

      setPaymentState(result.status, result.message);

      if (result.status === "success") {
        trackEvent("payment_success", { 
          plan: selectedPlan?.id, 
          asset, 
          tx_hash: result.tx_hash 
        });
        onPaymentComplete?.();
      } else {
        trackEvent("payment_failed", { 
          plan: selectedPlan?.id, 
          asset, 
          reason: result.message 
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Verification failed";
      setPaymentState("failed", message);
      trackEvent("payment_verify_failed", { plan: selectedPlan?.id, asset, error: message });
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!selectedPlan) {
    return (
      <div className="rounded-2xl border border-borderTone bg-white/95 p-5">
        <p className="text-base text-ink/75">Please select a plan first.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#b8bdfd] bg-white/95 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-semibold text-ink">Payment Method</h2>
        {wallet ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink/60">
              {wallet.account.address.slice(0, 6)}...{wallet.account.address.slice(-4)}
            </span>
            <button
              type="button"
              onClick={() => tonConnectUI.disconnect()}
              className="text-xs text-rose-600 hover:text-rose-700"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => tonConnectUI.openModal()}
            className="text-sm px-3 py-1.5 rounded-lg border border-[#4f46e5] text-[#4f46e5] hover:bg-[#eef0ff] transition-colors"
          >
            Connect Wallet
          </button>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setAsset("TON")}
          disabled={paymentStatus === "pending"}
          className={`flex-1 min-h-11 rounded-xl border px-4 text-base font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2 ${
            asset === "TON"
              ? "border-[#4f46e5] bg-[#4f46e5] text-white"
              : "border-borderTone bg-white text-ink hover:border-[#4f46e5]"
          }`}
        >
          TON
        </button>
        <button
          type="button"
          onClick={() => setAsset("USDT")}
          disabled={paymentStatus === "pending"}
          className={`flex-1 min-h-11 rounded-xl border px-4 text-base font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2 ${
            asset === "USDT"
              ? "border-[#4f46e5] bg-[#4f46e5] text-white"
              : "border-borderTone bg-white text-ink hover:border-[#4f46e5]"
          }`}
        >
          USDT
        </button>
      </div>

      {!intentData && selectedPlan && (
        <div className="rounded-xl border border-[#d9dcff] bg-[#fafaff] p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-ink">Estimated Amount:</span>
            <span className="text-base font-bold text-ink">
              {selectedPlan.id === 'donate' 
                ? '0.001 TON'
                : asset === "TON" 
                  ? `~${(selectedPlan.priceValue / 6).toFixed(2)} TON`
                  : `$${selectedPlan.priceValue} USDT`
              }
            </span>
          </div>
          
          {selectedPlan.id !== 'donate' && asset === "TON" && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-ink/75">Plan price:</span>
              <span className="text-sm text-ink/75">${selectedPlan.priceValue} USD</span>
            </div>
          )}

          <p className="text-xs text-ink/60 pt-2 border-t border-[#d9dcff]">
            {asset === "TON" 
              ? "Exact amount will be calculated at current TON/USD rate when you create payment."
              : "Fixed USDT amount based on plan price."
            }
          </p>
        </div>
      )}

      {intentData && (
        <div className="rounded-xl border border-[#d9dcff] bg-[#fafaff] p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-ink">Amount:</span>
            <span className="text-base text-ink">
              {asset === "TON" 
                ? `${intentData.amount_expected} TON` 
                : `$${intentData.amount_expected} USDT`}
            </span>
          </div>
          
          {asset === "TON" && intentData.quote_rate && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-ink/75">Rate:</span>
                <span className="text-sm text-ink/75">${intentData.quote_rate} USD/TON</span>
              </div>
              {timeLeft > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-ink/75">Quote expires in:</span>
                  <span className="text-sm font-mono text-[#4f46e5]">{formatTime(timeLeft)}</span>
                </div>
              )}
            </>
          )}

          <div className="pt-2 border-t border-[#d9dcff]">
            <p className="text-xs text-ink/60">Send to:</p>
            <p className="text-xs font-mono text-ink/80 break-all">{intentData.wallet_address}</p>
          </div>
        </div>
      )}

      {paymentStatus === "success" && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4">
          <p className="text-base font-semibold text-emerald-800">✅ Payment successful!</p>
          <p className="text-sm text-emerald-700 mt-1">Your plan is now active.</p>
        </div>
      )}

      {paymentStatus === "failed" && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-4">
          <p className="text-base font-semibold text-rose-800">❌ Payment failed</p>
          <p className="text-sm text-rose-700 mt-1">
            {paymentMessage || "Please try again or contact support."}
          </p>
        </div>
      )}

      {paymentStatus === "expired" && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="text-base font-semibold text-amber-800">⏱️ Quote expired</p>
          <p className="text-sm text-amber-700 mt-1">Please create a new payment intent.</p>
        </div>
      )}

      {paymentStatus === "idle" && paymentMessage && (
        <div className="rounded-xl border border-sky-300 bg-sky-50 p-4">
          <p className="text-sm text-sky-800">{paymentMessage}</p>
        </div>
      )}

      <div className="flex gap-3">
        {!intentData ? (
          <button
            type="button"
            onClick={handleCreateIntent}
            disabled={paymentStatus === "pending"}
            className="flex-1 min-h-12 rounded-xl border border-[#4f46e5] bg-gradient-to-r from-[#4f46e5] to-[#10b981] text-white text-base font-bold transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {paymentStatus === "pending" ? "Creating..." : "Create Payment"}
          </button>
        ) : paymentStatus === "idle" || paymentStatus === "expired" ? (
          <>
            <button
              type="button"
              onClick={handlePay}
              disabled={timeLeft === 0}
              className="flex-1 min-h-12 rounded-xl border border-[#4f46e5] bg-gradient-to-r from-[#4f46e5] to-[#10b981] text-white text-base font-bold transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {wallet ? "Pay Now" : "Connect Wallet & Pay"}
            </button>
            <button
              type="button"
              onClick={() => handleVerify(false)}
              className="flex-1 min-h-12 rounded-xl border border-borderTone bg-white text-ink text-base font-semibold transition-colors duration-200 hover:border-[#4f46e5] hover:text-[#4f46e5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2"
            >
              Verify Payment
            </button>
          </>
        ) : paymentStatus === "pending" ? (
          <button
            type="button"
            disabled
            className="flex-1 min-h-12 rounded-xl border border-borderTone bg-white text-ink text-base font-semibold opacity-50 cursor-not-allowed"
          >
            Processing...
          </button>
        ) : null}
      </div>
    </div>
  );
}
