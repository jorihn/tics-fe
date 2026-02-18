import Link from "next/link";

interface QuickDemoProps {
  onPrimaryClick: () => void;
}

const DEMO_STEPS = [
  {
    title: "0-10s: Chọn mục tiêu tuần",
    detail: "Bạn chọn 1 mục tiêu quan trọng nhất để tập trung.",
    icon: (
      <path d="M4 12h16M12 4v16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    )
  },
  {
    title: "10-20s: AI sắp việc theo ưu tiên",
    detail: "Danh sách việc được xếp sẵn theo thứ tự nên làm.",
    icon: (
      <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    )
  },
  {
    title: "20-30s: Bắt đầu ngay",
    detail: "Bạn nhận kế hoạch tuần rõ ràng và bắt tay làm ngay.",
    icon: (
      <path d="M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    )
  }
];

export function QuickDemo({ onPrimaryClick }: QuickDemoProps) {
  return (
    <section id="quick-demo" className="rounded-2xl border border-[#b8bdfd] bg-gradient-to-r from-[#edf0ff] via-white to-[#e7fff6] p-4">
      <p className="inline-flex items-center gap-2 rounded-full border border-[#b8bdfd] bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink/70">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
          <path d="M8 6v12l10-6-10-6z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        30s demo preview
      </p>

      <h2 className="mt-3 font-heading text-xl font-bold text-ink">Bạn sẽ thấy gì khi bấm “See 30s demo”</h2>

      <div className="mt-3 grid gap-2">
        {DEMO_STEPS.map((step, index) => (
          <article
            key={step.title}
            className="rounded-xl border border-[#b8bdfd] bg-white/90 p-3 transition-transform duration-200 hover:-translate-y-0.5"
            style={{ animation: "fade-up 0.5s ease-out both", animationDelay: `${index * 0.06}s` }}
          >
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#4f46e5]" fill="none" aria-hidden="true">
                {step.icon}
              </svg>
              {step.title}
            </p>
            <p className="mt-1 text-xs text-ink/75">{step.detail}</p>
          </article>
        ))}
      </div>

      <Link
        href="/agents"
        onClick={onPrimaryClick}
        className="mt-4 flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#10b981] px-4 text-sm font-bold text-white transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2"
      >
        Xem gói phù hợp cho bạn
      </Link>
    </section>
  );
}
