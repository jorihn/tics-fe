import Link from "next/link";

interface HeroProps {
  onPrimaryClick: () => void;
}

export function Hero({ onPrimaryClick }: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-borderTone bg-gradient-to-br from-white via-[#eef0ff] to-[#e4fffa] p-6">
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#6366f1]/30 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -bottom-20 -left-12 h-44 w-44 rounded-full bg-[#10b981]/25 blur-3xl animate-float-slow [animation-delay:0.8s]" />

      <p className="relative mb-4 inline-flex items-center gap-2 rounded-full border border-[#b8bdfd] bg-white/90 px-3 py-1.5 text-sma font-semibold uppercase tracking-[0.08em] text-ink/70 whitespace-nowrap animate-fade-up">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path d="M12 3l2.1 4.3L19 8l-3.5 3.4.8 4.8L12 14l-4.3 2.2.8-4.8L5 8l4.9-.7L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        WEEK PLAN READY IN 60 SECONDS
      </p>

      <h1 className="relative font-heading text-[2.3rem] font-bold leading-tight text-ink sm:text-[2.8rem] animate-fade-up [animation-delay:0.08s]">
        Ship faster with a weekly plan
        <span className="mt-1 block bg-gradient-to-r from-[#4f46e5] to-[#10b981] bg-clip-text text-transparent">
          your team can actually execute.
        </span>
      </h1>

      <p className="relative mt-3 max-w-[44ch] text-base leading-7 text-ink/80 animate-fade-up [animation-delay:0.14s]">
        Open once, see what matters first, and move with confidence. No guesswork, no scattered priorities, no endless re-planning.
      </p>

      <ul className="relative mt-4 grid gap-2 text-sm text-ink/80 sm:grid-cols-3 animate-fade-up [animation-delay:0.2s]">
        <li className="flex items-center gap-2 rounded-lg border border-[#b8bdfd] bg-white/90 px-3 py-2.5">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#4f46e5]" fill="none" aria-hidden="true">
            <path d="M4 12h16M12 4v16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Less daily overwhelm
        </li>
        <li className="flex items-center gap-2 rounded-lg border border-[#b8bdfd] bg-white/90 px-3 py-2.5">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#4f46e5]" fill="none" aria-hidden="true">
            <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          No more missed priorities
        </li>
        <li className="flex items-center gap-2 rounded-lg border border-[#b8bdfd] bg-white/90 px-3 py-2.5">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#10b981]" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Start in under 2 minutes
        </li>
      </ul>

      <div className="relative mt-6 animate-fade-up [animation-delay:0.26s]">
        <Link
          href="/agents"
          onClick={onPrimaryClick}
          className="flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#10b981] px-4 text-base font-bold text-white transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2 cursor-pointer"
        >
          See Plans & Activate Now
        </Link>
      </div>
    </section>
  );
}
