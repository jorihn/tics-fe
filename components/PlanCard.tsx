import { Plan } from "@/types/plan";

interface PlanCardProps {
  plan: Plan;
  selected: boolean;
  onSelect: (plan: Plan) => void;
}

export function PlanCard({ plan, selected, onSelect }: PlanCardProps) {
  return (
    <article
      className={`relative rounded-2xl border p-5 transition-colors duration-200 ${
        selected
          ? "border-[#6366f1] bg-gradient-to-br from-[#f2f2ff] via-[#ffffff] to-[#eafff6]"
          : "border-borderTone bg-[var(--surface)]"
      }`}
    >
      {plan.highlight ? (
        <span className="absolute right-4 top-4 rounded-full border border-[#9aa2ff] bg-[#eef0ff] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#3f46b5]">
          {plan.highlight}
        </span>
      ) : null}

      <h3 className="font-heading text-2xl font-bold text-ink">{plan.name}</h3>
      <p className="mt-1 text-sm text-ink/75">{plan.audience}</p>
      <p className="mt-3 text-sm leading-6 text-ink/85">{plan.outcome}</p>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="font-heading text-3xl font-bold text-ink">{plan.priceLabel}</p>
          <p className="text-xs text-ink/65">per {plan.period}</p>
        </div>

        <button
          type="button"
          onClick={() => onSelect(plan)}
          className={`min-h-11 rounded-xl border px-4 text-sm font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 cursor-pointer ${
            selected
              ? "border-[#4f46e5] bg-gradient-to-r from-[#4f46e5] to-[#10b981] text-white hover:opacity-90"
              : "border-borderTone bg-white text-ink hover:border-[#4f46e5] hover:text-[#4f46e5]"
          }`}
        >
          Choose this plan
        </button>
      </div>
    </article>
  );
}
