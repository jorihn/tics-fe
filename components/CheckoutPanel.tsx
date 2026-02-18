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
  const paymentStatus = useCheckoutStore((state) => state.paymentStatus);
  const paymentMessage = useCheckoutStore((state) => state.paymentMessage);
  const resetPayment = useCheckoutStore((state) => state.resetPayment);

  const disabled = !selectedPlan || isPaying || paymentStatus === "pending";

  return (
    <section className="sticky top-3 w-full min-w-0 rounded-2xl border border-borderTone bg-gradient-to-br from-white via-[#f2f3ff] to-[#ebfff7] p-5">
      <h2 className="font-heading text-2xl font-semibold text-ink">Checkout</h2>

      {!selectedPlan ? (
        <p className="mt-2 rounded-xl border border-dashed border-[#b8bdfd] bg-white/90 p-4 text-base leading-7 text-ink/75">
          Choose a plan to continue.
        </p>
      ) : (
        <div className="mt-3 rounded-xl border border-[#b8bdfd] bg-white/95 p-4">
          <p className="text-sm uppercase tracking-[0.12em] text-ink/60">Selected plan</p>
          <p className="mt-1 font-heading text-2xl font-bold text-ink">{selectedPlan.name}</p>
          <p className="text-base text-ink/80">{selectedPlan.priceLabel} / month</p>
        </div>
      )}

      <div className="mt-4">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-ink/60">Payment method</p>
        <div className="mt-2 rounded-xl border border-[#4f46e5] bg-[#eef0ff] px-4 py-3">
          <p className="text-base font-semibold text-[#3f46b5]">USDT (TRC20)</p>
          <p className="mt-1 text-sm leading-6 text-[#3f46b5]/85">Single method for faster activation and fewer payment errors.</p>
        </div>
      </div>

      {checkoutHint ? (
        <div className="mt-3 rounded-xl border border-[#b8bdfd] bg-white/90 p-4 text-sm leading-7 text-ink/85">
          <p>{checkoutHint}</p>
          {destination ? <p className="mt-1 break-all text-base font-semibold text-[#3f46b5]">{destination}</p> : null}
        </div>
      ) : null}

      <button
        type="button"
        disabled={disabled}
        onClick={onPay}
        className="mt-4 min-h-12 w-full rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#10b981] px-4 text-base font-bold text-white transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPaying || paymentStatus === "pending" ? "Processing..." : "Pay with USDT now"}
      </button>

      {paymentStatus === "failed" ? (
        <button
          type="button"
          onClick={resetPayment}
          className="mt-2 min-h-11 w-full rounded-xl border border-borderTone bg-white px-4 text-base font-semibold text-ink transition-colors duration-200 hover:border-[#4f46e5] hover:text-[#4f46e5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2 cursor-pointer"
        >
          Retry payment
        </button>
      ) : null}

      <PaymentStatus status={paymentStatus} message={paymentMessage} />
    </section>
  );
}
