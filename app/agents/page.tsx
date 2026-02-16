"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckoutPanel } from "@/components/CheckoutPanel";
import { createPaymentIntent, fetchPlans, confirmPayment } from "@/lib/api";
import { trackEvent } from "@/lib/tracking";
import { useCheckoutStore } from "@/stores/checkout-store";
import { Plan } from "@/types/plan";

const FAQ_ITEMS = [
  {
    question: "What happens if I run out of tokens?",
    answer: "You can top up anytime. Your workflow continues smoothly.",
  },
  {
    question: "Will I lose memory/context after top-up?",
    answer: "No. Memory and context are preserved.",
  },
  {
    question: "Do I need to set up everything again after top-up?",
    answer: "No. No re-setup is needed.",
  },
  {
    question: "When does my assistant become active?",
    answer: "Immediately after payment confirmation.",
  },
];

export default function AgentsPage() {
  const selectedPlan = useCheckoutStore((state) => state.selectedPlan);
  const method = useCheckoutStore((state) => state.method);
  const setPlan = useCheckoutStore((state) => state.setPlan);
  const setPaymentState = useCheckoutStore((state) => state.setPaymentState);
  const resetPayment = useCheckoutStore((state) => state.resetPayment);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isPaying, setIsPaying] = useState(false);
  const [checkoutHint, setCheckoutHint] = useState("");
  const [destination, setDestination] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [trialMessage, setTrialMessage] = useState("");

  const carouselRef = useRef<HTMLDivElement | null>(null);
  const hasAlignedDefaultRef = useRef(false);

  const hasPlans = plans.length > 0;

  const explorePlan: Plan = {
    id: "explore",
    name: "Explore Plan",
    badge: "TRIAL",
    audience: "Teams that want to test the assistant before committing to a full monthly plan.",
    outcome: "Try the same flow as Savings with a smaller API budget.",
    priceLabel: "$10",
    priceValue: 10,
    priceNote: "Tool fee is waived. You only pay for API credits.",
    bestFor: "Teams exploring fit and early results with lower upfront spend.",
    includes: [
      "Full access to core assistant features",
      "$10 API credits included",
      "Great for goal setup, planning, and first task assignments",
    ],
    tradeOffs: ["Smaller API budget than Savings", "No priority 1:1 support"],
    ctaLabel: "Choose Explore",
    period: "month",
  };

  const scrollToIndex = useCallback((index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, plans.length - 1));
    const container = carouselRef.current;

    if (!container) {
      return;
    }

    const targetCard = container.children[clampedIndex] as HTMLElement | undefined;
    if (!targetCard) {
      return;
    }

    targetCard.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    setActiveIndex(clampedIndex);

    const nextPlan = plans[clampedIndex];
    if (nextPlan && selectedPlan?.id !== nextPlan.id) {
      setPlan(nextPlan);
      setCheckoutHint("");
      setDestination("");
      trackEvent("click_choose_plan", { plan: nextPlan.id, source: "carousel" });
    }
  }, [plans, selectedPlan?.id, setPlan]);

  const loadPlans = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await fetchPlans();
      setPlans(data);

      const defaultIndex = data.findIndex((plan) => plan.id === "standard");
      const resolvedIndex = defaultIndex >= 0 ? defaultIndex : 0;
      setActiveIndex(resolvedIndex);

      const defaultPlan = data[resolvedIndex];
      if (defaultPlan) {
        setPlan(defaultPlan);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load plans right now.");
    } finally {
      setIsLoading(false);
    }
  }, [setPlan]);

  useEffect(() => {
    trackEvent("view_agent_plans");
    loadPlans();
  }, [loadPlans]);

  useEffect(() => {
    const container = carouselRef.current;

    if (!container || !hasPlans || hasAlignedDefaultRef.current) {
      return;
    }

    const defaultIndex = plans.findIndex((plan) => plan.id === "standard");
    const resolvedIndex = defaultIndex >= 0 ? defaultIndex : 0;
    const targetCard = container.children[resolvedIndex] as HTMLElement | undefined;

    if (!targetCard) {
      return;
    }

    targetCard.scrollIntoView({ behavior: "auto", inline: "center", block: "nearest" });
    hasAlignedDefaultRef.current = true;
  }, [hasPlans, plans]);

  useEffect(() => {
    const container = carouselRef.current;

    if (!container || !hasPlans) {
      return;
    }

    const onScroll = () => {
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;

      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;

      Array.from(container.children).forEach((child, index) => {
        const childRect = (child as HTMLElement).getBoundingClientRect();
        const childCenter = childRect.left + childRect.width / 2;
        const distance = Math.abs(childCenter - containerCenter);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      setActiveIndex((prev) => {
        if (prev === nearestIndex) {
          return prev;
        }

        const nextPlan = plans[nearestIndex];
        if (nextPlan && selectedPlan?.id !== nextPlan.id) {
          setPlan(nextPlan);
          setCheckoutHint("");
          setDestination("");
        }

        return nearestIndex;
      });
    };

    container.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", onScroll);
    };
  }, [hasPlans, plans, selectedPlan?.id, setPlan]);

  useEffect(() => {
    if (!hasPlans) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollToIndex(activeIndex + 1);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollToIndex(activeIndex - 1);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, hasPlans, scrollToIndex]);

  const handlePay = async () => {
    if (!selectedPlan) {
      return;
    }

    setIsPaying(true);
    setPaymentState("pending", "Waiting for payment confirmation…");
    trackEvent("click_pay", { plan: selectedPlan.id, method });

    try {
      const intent = await createPaymentIntent({ planId: selectedPlan.id, method });
      setCheckoutHint(intent.amountLabel);
      setDestination(intent.destination);
      setPaymentState("pending", "Waiting for payment confirmation…", intent.checkoutId);

      const result = await confirmPayment(intent.checkoutId);
      setPaymentState(result.status, result.message, intent.checkoutId);

      if (result.status === "success") {
        trackEvent("payment_success", { plan: selectedPlan.id, method });
      } else {
        trackEvent("payment_failed", { plan: selectedPlan.id, method });
      }
    } catch (payError) {
      const message = payError instanceof Error ? payError.message : "Payment failed. Please retry.";
      setPaymentState("failed", message);
      trackEvent("payment_failed", { plan: selectedPlan.id, method, reason: message });
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <main className="space-y-4 pb-4">
      <header className="rounded-2xl border border-[#b8bdfd] bg-gradient-to-r from-[#edf0ff] via-white to-[#e7fff6] p-5">
        <h1 className="font-heading text-3xl font-bold text-ink">Choose your plan</h1>
        <p className="mt-2 text-sm text-ink/75">One payment, instant activation in Telegram. No complex setup.</p>
      </header>

      {isLoading ? (
        <section className="space-y-3">
          {[1, 2].map((item) => (
            <div key={item} className="h-44 animate-pulse rounded-2xl border border-[#b8bdfd] bg-gradient-to-r from-[#f2f3ff] to-[#eafff6]" />
          ))}
        </section>
      ) : error ? (
        <section className="rounded-2xl border border-rose-300 bg-[#fff2f2] p-4">
          <p className="text-sm text-rose-900">{error}</p>
          <button
            type="button"
            onClick={loadPlans}
            className="mt-3 min-h-11 rounded-xl border border-rose-300 bg-white px-4 text-sm font-semibold text-rose-800 transition-colors duration-200 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 cursor-pointer"
          >
            Retry loading plans
          </button>
        </section>
      ) : (
        <div className="grid gap-4">
          <section>
            <div
              ref={carouselRef}
              className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label="Plan carousel"
            >
              {plans.map((plan, index) => {
                const isSelected = selectedPlan?.id === plan.id;

                return (
                  <article
                    key={plan.id}
                    className={`w-[86%] shrink-0 snap-center rounded-2xl border p-5 transition-colors duration-200 sm:w-[72%] ${
                      isSelected
                        ? "border-[#6366f1] bg-gradient-to-br from-[#f2f2ff] via-[#ffffff] to-[#eafff6]"
                        : "border-borderTone bg-[var(--surface)]"
                    }`}
                  >
                    {plan.badge ? (
                      <span className="inline-flex rounded-full border border-[#9aa2ff] bg-[#eef0ff] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#3f46b5]">
                        {plan.badge}
                      </span>
                    ) : null}

                    <h2 className="mt-3 font-heading text-2xl font-bold text-ink">{plan.name}</h2>
                    <p className="mt-1 font-heading text-4xl font-bold text-ink">{plan.priceLabel}</p>
                    <p className="text-xs text-ink/70">{plan.priceNote}</p>

                    {plan.id === "savings" ? (
                      <p className="mt-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
                        Tool fee: FREE. You only pay for API credits.
                      </p>
                    ) : null}

                    <p className="mt-3 text-sm font-semibold text-ink">Best for</p>
                    <p className="text-sm text-ink/80">{plan.bestFor}</p>

                    <p className="mt-3 text-sm font-semibold text-ink">Includes</p>
                    <ul className="mt-2 space-y-2">
                      {plan.includes.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-ink/80">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#4f46e5]" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.tradeOffs?.length ? (
                      <>
                        <p className="mt-3 text-sm font-semibold text-ink">Trade-offs</p>
                        <ul className="mt-2 space-y-2">
                          {plan.tradeOffs.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-sm text-ink/75">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#f59e0b]" aria-hidden="true" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => scrollToIndex(index)}
                      className={`mt-4 min-h-11 w-full rounded-xl border px-4 text-sm font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2 cursor-pointer ${
                        isSelected
                          ? "border-[#4f46e5] bg-gradient-to-r from-[#4f46e5] to-[#10b981] text-white hover:opacity-90"
                          : "border-borderTone bg-white text-ink hover:border-[#4f46e5] hover:text-[#4f46e5]"
                      }`}
                    >
                      {plan.ctaLabel}
                    </button>
                  </article>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-center gap-2">
              {plans.map((plan, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => scrollToIndex(index)}
                    aria-label={`Go to ${plan.name}`}
                    aria-current={isActive}
                    className={`h-2.5 rounded-full transition-all duration-200 ${isActive ? "w-6 bg-[#4f46e5]" : "w-2.5 bg-[#c7c9ff] hover:bg-[#9aa2ff]"}`}
                  />
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-borderTone bg-gradient-to-r from-[#eef0ff] via-white to-[#e8fff7] p-4">
            <h2 className="font-heading text-xl font-semibold text-ink">Explore Plan</h2>
            <p className="mt-1 text-sm text-ink/75">
              Same model as Savings, with a smaller $10 API credit bundle to get started.
            </p>
            <ul className="mt-2 space-y-2">
              <li className="flex items-start gap-2 text-sm text-ink/80">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#4f46e5]" aria-hidden="true" />
                <span>Tool fee is free; you only pay for API usage</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-ink/80">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#4f46e5]" aria-hidden="true" />
                <span>$10 API credits included</span>
              </li>
            </ul>
            <button
              type="button"
              onClick={() => {
                setPlan(explorePlan);
                setCheckoutHint("");
                setDestination("");
                setTrialMessage("Explore Plan selected in checkout.");
                trackEvent("click_view_plans", { source: "trial" });
              }}
              className="mt-3 min-h-11 rounded-xl border border-[#4f46e5] bg-white px-4 text-sm font-semibold text-[#4f46e5] transition-colors duration-200 hover:bg-[#eef0ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2 cursor-pointer"
            >
              Start Trial
            </button>
            {trialMessage ? <p className="mt-2 text-xs text-ink/70">{trialMessage}</p> : null}
          </section>

          <section className="rounded-2xl border border-borderTone bg-white/95 p-4">
            <h2 className="font-heading text-xl font-semibold text-ink">Quick answers before you pay</h2>
            <div className="mt-3 space-y-3">
              {FAQ_ITEMS.map((item) => (
                <article key={item.question} className="rounded-xl border border-[#d9dcff] bg-[#fafaff] p-3">
                  <p className="text-sm font-semibold text-ink">{item.question}</p>
                  <p className="mt-1 text-sm text-ink/75">{item.answer}</p>
                </article>
              ))}
            </div>
          </section>

          <CheckoutPanel
            isPaying={isPaying}
            checkoutHint={checkoutHint}
            destination={destination}
            onPay={handlePay}
          />

          <button
            type="button"
            onClick={() => {
              resetPayment();
              setCheckoutHint("");
              setDestination("");
              setTrialMessage("");
            }}
            className="min-h-11 rounded-xl border border-[#b8bdfd] bg-white/95 px-4 text-sm font-semibold text-ink/85 transition-colors duration-200 hover:border-[#4f46e5] hover:text-[#4f46e5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2 cursor-pointer"
          >
            Clear payment state
          </button>
        </div>
      )}
    </main>
  );
}
