const BENEFITS = [
  {
    title: "Know what to do first",
    detail: "Open the app and see your priorities in order, ready to act on.",
    icon: <path d="M4 12h16M12 4v16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  },
  {
    title: "Stop missing important work",
    detail: "Keep key tasks in one clear weekly view for your whole team.",
    icon: <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  },
  {
    title: "Start quickly with confidence",
    detail: "Spend less time planning and more time getting real work done.",
    icon: <path d="M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  }
];

export function BenefitList() {
  return (
    <section className="mt-5 rounded-2xl border border-borderTone bg-gradient-to-br from-white via-[#f0f3ff] to-[#ecfffa] p-5">
      <h2 className="font-heading text-2xl font-semibold text-ink">What changes after day one</h2>
      <ul className="mt-3 space-y-3">
        {BENEFITS.map((benefit, index) => (
          <li
            key={benefit.title}
            className="flex items-start gap-3 rounded-xl border border-[#b8bdfd] bg-white/95 p-4 text-base leading-7 text-ink/85 transition-transform duration-200 hover:-translate-y-0.5"
            style={{ animation: "fade-up 0.5s ease-out both", animationDelay: `${index * 0.06}s` }}
          >
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#6366f1] to-[#10b981] text-xs font-bold text-white">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                {benefit.icon}
              </svg>
            </span>
            <span>
              <span className="block text-base font-semibold text-ink">{benefit.title}</span>
              <span className="text-ink/75">{benefit.detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
