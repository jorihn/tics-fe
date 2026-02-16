const REASONS = [
  {
    title: "Built for AI agents",
    description: "Reliable action flow, not just chat responses.",
    icon: <path d="M4 12h16M12 4v16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  },
  {
    title: "Cost-efficient by design",
    description: "Lower token/API cost over time.",
    icon: <path d="M12 3v18M15.5 7.5c0-1.7-1.6-3-3.5-3s-3.5 1.3-3.5 3 1.6 3 3.5 3 3.5 1.3 3.5 3-1.6 3-3.5 3-3.5-1.3-3.5-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  },
  {
    title: "Deep context memory",
    description: "Remembers your context for sharper planning and execution support.",
    icon: <path d="M7 5h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2zm3 4h4m-4 3h4m-4 3h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  }
];

export function WhyThisWorks() {
  return (
    <section className="mt-5 rounded-2xl border border-borderTone bg-gradient-to-br from-white via-[#f0f3ff] to-[#ecfffa] p-5">
      <h2 className="font-heading text-xl font-semibold text-ink">Why this works better than typical AI tools</h2>
      <ul className="mt-3 space-y-3">
        {REASONS.map((reason, index) => (
          <li
            key={reason.title}
            className="flex items-start gap-3 rounded-xl border border-[#b8bdfd] bg-white/95 p-3 text-sm leading-6 text-ink/85 transition-transform duration-200 hover:-translate-y-0.5"
            style={{ animation: "fade-up 0.5s ease-out both", animationDelay: `${index * 0.06}s` }}
          >
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#6366f1] to-[#10b981] text-xs font-bold text-white">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                {reason.icon}
              </svg>
            </span>
            <span>
              <span className="block font-semibold text-ink">{reason.title}</span>
              <span className="text-ink/75">{reason.description}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
