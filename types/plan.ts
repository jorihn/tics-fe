export type PlanTier = "savings" | "standard" | "explore";

export interface Plan {
  id: PlanTier;
  name: string;
  badge?: string;
  audience: string;
  outcome: string;
  priceLabel: string;
  priceValue: number;
  priceNote: string;
  bestFor: string;
  includes: string[];
  tradeOffs?: string[];
  ctaLabel: string;
  period: "month";
  highlight?: string;
}
