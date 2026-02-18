import Link from "next/link";

interface RepeatedCtaBlockProps {
  onClick: () => void;
}

export function RepeatedCtaBlock({ onClick }: RepeatedCtaBlockProps) {
  return (
    <section id="repeated-cta" className="mt-5 rounded-2xl border border-[#b8bdfd] bg-gradient-to-r from-[#edf0ff] via-white to-[#e7fff6] p-5 text-center">
      <h2 className="font-heading text-3xl font-bold text-ink">Ready to turn this week into clear wins?</h2>
      <p className="mt-2 text-base leading-7 text-ink/80">Move to the agents page, compare plans side by side, and choose the one you can commit to today.</p>

      <Link
        href="/agents"
        onClick={onClick}
        className="mx-auto mt-4 flex min-h-12 w-full max-w-xs items-center justify-center rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#10b981] px-4 text-base font-bold text-white transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2"
      >
        Compare Plans & Start
      </Link>

      <p className="mt-3 text-base text-ink/70">Activate now and start your first weekly plan in minutes.</p>
    </section>
  );
}
