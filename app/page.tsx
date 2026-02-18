"use client";

import { useEffect } from "react";
import { BenefitList } from "@/components/BenefitList";
import { Hero } from "@/components/Hero";
import { RepeatedCtaBlock } from "@/components/RepeatedCtaBlock";
import { StickyBottomCta } from "@/components/StickyBottomCta";
import { TrustStrip } from "@/components/TrustStrip";
import { WhyThisWorks } from "@/components/WhyThisWorks";
import { trackEvent } from "@/lib/tracking";

export default function HomePage() {
  useEffect(() => {
    trackEvent("view_home");
  }, []);

  return (
    <main className="space-y-6 pb-4">
      <Hero onPrimaryClick={() => trackEvent("click_view_plans", { source: "hero" })} />

      <section className="rounded-2xl border border-[#b8bdfd] bg-gradient-to-r from-[#edf0ff] via-white to-[#e7fff6] p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-ink/65">What you get right away</p>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl border border-[#b8bdfd] bg-white/90 p-3.5">
            <p className="font-heading text-2xl font-bold text-[#4f46e5]">60s</p>
            <p className="text-sma text-ink/75">weekly plan ready</p>
          </div>
          <div className="rounded-xl border border-[#b8bdfd] bg-white/90 p-3.5">
            <p className="font-heading text-2xl font-bold text-[#4f46e5]">2 min</p>
            <p className="text-sma text-ink/75">to get started</p>
          </div>
          <div className="rounded-xl border border-[#b8bdfd] bg-white/90 p-3.5">
            <p className="font-heading text-2xl font-bold text-[#10b981]">24/7</p>
            <p className="text-sma text-ink/75">guided support</p>
          </div>
        </div>
        <p className="mt-4 text-base leading-7 text-ink/80">
          Next step: compare plans on the agents page, pick what fits your team today, and activate instantly with USDT.
        </p>
        <div className="mt-4 rounded-xl border border-[#b8bdfd] bg-white/90 p-4">
          <p className="text-base font-semibold text-ink">No long setup. No confusing flow. Just choose, pay, and start shipping.</p>
        </div>
      </section>

      <WhyThisWorks />
      <BenefitList />
      <TrustStrip />
      <RepeatedCtaBlock onClick={() => trackEvent("click_view_plans", { source: "repeated" })} />
      <StickyBottomCta onClick={() => trackEvent("click_view_plans", { source: "sticky" })} />
    </main>
  );
}
