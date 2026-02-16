import { PaymentStatus } from "@/components/PaymentStatus";
import { useCheckoutStore } from "@/stores/checkout-store";

interface CheckoutPanelProps {
  isPaying: boolean;
  checkoutHint: string;
  destination: string;
  onPay: () => Promise<void>;
}

export function CheckoutPanel({ isPaying, checkoutHint, destination, onPay }: CheckoutPanelProps) {
  const selectedPlan = useCheckoutStore((state) => state.selectedPlan);
  const method = useCheckoutStore((state) => state.method);
  const setMethod = useCheckoutStore((state) => state.setMethod);
  const paymentStatus = useCheckoutStore((state) => state.paymentStatus);
  const paymentMessage = useCheckoutStore((state) => state.paymentMessage);
  const resetPayment = useCheckoutStore((state) => state.resetPayment);

  const disabled = !selectedPlan || isPaying || paymentStatus === "pending";

  return (
    <section className="sticky top-3 rounded-2xl border border-borderTone bg-gradient-to-br from-white via-[#f2f3ff] to-[#ebfff7] p-5">
      <h2 className="font-heading text-xl font-semibold text-ink">Checkout</h2>

      {!selectedPlan ? (
        <p className="mt-2 rounded-xl border border-dashed border-[#b8bdfd] bg-white/90 p-4 text-sm text-ink/70">
          Choose a plan to continue.
        </p>
      ) : (
        <div className="mt-3 rounded-xl border border-[#b8bdfd] bg-white/95 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-ink/55">Selected plan</p>
          <p className="mt-1 font-heading text-xl font-bold text-ink">{selectedPlan.name}</p>
          <p className="text-sm text-ink/75">{selectedPlan.priceLabel} / month</p>
        </div>
      )}

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/55">Payment method</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setMethod("vnd");
              resetPayment();
            }}
            className={`min-h-11 rounded-xl border px-3 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2 cursor-pointer ${
              method === "vnd"
                ? "border-[#4f46e5] bg-[#eef0ff] text-[#3f46b5]"
                : "border-borderTone bg-white text-ink hover:border-[#4f46e5]"
            }`}
          >
            VND (VietQR/Sepay)
          </button>
          <button
            type="button"
            onClick={() => {
              setMethod("usdt");
              resetPayment();
            }}
            className={`min-h-11 rounded-xl border px-3 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2 cursor-pointer ${
              method === "usdt"
                ? "border-[#4f46e5] bg-[#eef0ff] text-[#3f46b5]"
                : "border-borderTone bg-white text-ink hover:border-[#4f46e5]"
            }`}
          >
            USDT
          </button>
        </div>
      </div>

      {checkoutHint ? (
        <div className="mt-3 rounded-xl border border-[#b8bdfd] bg-white/90 p-3 text-xs text-ink/80">
          <p>{checkoutHint}</p>
          {destination ? <p className="mt-1 font-semibold text-[#3f46b5]">{destination}</p> : null}
        </div>
      ) : null}

      <button
        type="button"
        disabled={disabled}
        onClick={onPay}
        className="mt-4 min-h-11 w-full rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#10b981] px-4 text-sm font-bold text-white transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPaying || paymentStatus === "pending" ? "Processing..." : "Pay now"}
      </button>

      {paymentStatus === "failed" ? (
        <button
          type="button"
          onClick={resetPayment}
          className="mt-2 min-h-11 w-full rounded-xl border border-borderTone bg-white px-4 text-sm font-semibold text-ink transition-colors duration-200 hover:border-[#4f46e5] hover:text-[#4f46e5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2 cursor-pointer"
        >
          Retry + switch method
        </button>
      ) : null}

      <PaymentStatus status={paymentStatus} message={paymentMessage} />
    </section>
  );
}
