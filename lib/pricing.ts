import type { CountryCode } from "./market";

export type PricingPlanKind = "subscription" | "payg";

export type PricingPlan = {
  id: string;
  country: CountryCode;
  name: string;
  kind: PricingPlanKind;
  currency: "PKR" | "USD" | "GBP";
  price: number;
  leadCap: number;
  billingInterval: "month" | "per_lead";
  featured?: boolean;
  description: string;
  features: string[];
};

export const PAKISTAN_PRICING: PricingPlan[] = [
  {
    id: "pk-starter",
    country: "PK",
    name: "STARTER",
    kind: "subscription",
    currency: "PKR",
    price: 5_000,
    leadCap: 30,
    billingInterval: "month",
    description: "For individual agents building a consistent pipeline.",
    features: [
      "Up to 30 verified leads per billing month",
      "Direct contact unlock after claim",
      "Territory-based matching",
      "Realtor CRM and private notes",
      "Lead-quality dispute support",
    ],
  },
  {
    id: "pk-pro",
    country: "PK",
    name: "PRO",
    kind: "subscription",
    currency: "PKR",
    price: 13_000,
    leadCap: 100,
    billingInterval: "month",
    featured: true,
    description: "For active agents and teams handling higher lead volume.",
    features: [
      "Up to 100 verified leads per billing month",
      "Everything in Starter",
      "Lower effective cost per verified lead",
      "Higher-volume marketplace access",
      "Priority support",
    ],
  },
  {
    id: "pk-payg",
    country: "PK",
    name: "PAY AS YOU GO",
    kind: "payg",
    currency: "PKR",
    price: 1_000,
    leadCap: 1,
    billingInterval: "per_lead",
    description: "Buy one verified lead without a monthly commitment.",
    features: [
      "1 verified lead",
      "No monthly subscription",
      "Direct contact unlock after purchase",
      "CRM access for the purchased lead",
      "Useful for testing Blueprint Buddies first",
    ],
  },
];

export const MARKET_PRICING: Record<CountryCode, PricingPlan[]> = {
  PK: PAKISTAN_PRICING,
  US: [],
  UK: [],
};

export function getPricingPlans(country: CountryCode | string | undefined) {
  if (country === "US") return MARKET_PRICING.US;
  if (country === "UK") return MARKET_PRICING.UK;
  return MARKET_PRICING.PK;
}

export function getPricingPlan(country: CountryCode | string | undefined, id: string) {
  return getPricingPlans(country).find(plan => plan.id === id);
}

export function formatPlanPrice(plan: PricingPlan) {
  return new Intl.NumberFormat(plan.country === "PK" ? "en-PK" : plan.country === "US" ? "en-US" : "en-GB", {
    style: "currency",
    currency: plan.currency,
    maximumFractionDigits: 0,
  }).format(plan.price);
}

export function effectiveLeadPrice(plan: PricingPlan) {
  return Math.round(plan.price / Math.max(1, plan.leadCap));
}
