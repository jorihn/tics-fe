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
    <main className="space-y-5 pb-4">
      <Hero onPrimaryClick={() => trackEvent("click_view_plans", { source: "hero" })} />

      <section className="grid grid-cols-3 gap-2 rounded-2xl border border-[#b8bdfd] bg-gradient-to-r from-[#edf0ff] via-white to-[#e7fff6] p-3 text-center">
        <div className="rounded-xl border border-[#b8bdfd] bg-white/90 p-2">
          <p className="font-heading text-lg font-bold text-[#4f46e5]">60s</p>
          <p className="text-[11px] text-ink/70">weekly plan ready</p>
        </div>
        <div className="rounded-xl border border-[#b8bdfd] bg-white/90 p-2">
          <p className="font-heading text-lg font-bold text-[#4f46e5]">2 min</p>
          <p className="text-[11px] text-ink/70">to get started</p>
        </div>
        <div className="rounded-xl border border-[#b8bdfd] bg-white/90 p-2">
          <p className="font-heading text-lg font-bold text-[#10b981]">24/7</p>
          <p className="text-[11px] text-ink/70">guided support</p>
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
