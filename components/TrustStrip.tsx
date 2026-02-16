const TRUST_ITEMS = [
  {
    label: "No card details stored",
    icon: <path d="M4 8h16v8H4zM4 11h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  },
  {
    label: "Start in under 2 minutes",
    icon: <path d="M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  },
  {
    label: "Cancel anytime",
    icon: <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  }
];

export function TrustStrip() {
  return (
    <section className="mt-5 rounded-2xl border border-borderTone bg-gradient-to-r from-[#eef0ff] via-white to-[#e8fff7] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/60">Trusted checkout</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {TRUST_ITEMS.map((item) => (
          <span key={item.label} className="inline-flex items-center gap-1.5 rounded-full border border-[#b8bdfd] bg-white/95 px-3 py-1 text-xs font-semibold text-ink/75">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[#4f46e5]" fill="none" aria-hidden="true">
              {item.icon}
            </svg>
            {item.label}
          </span>
        ))}
      </div>
    </section>
  );
}
