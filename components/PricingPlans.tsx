"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import { effectiveLeadPrice, formatPlanPrice, getPricingPlans } from "@/lib/pricing";
import { getMarket, isCountryCode } from "@/lib/market";

export function PricingPlans({ compact = false }: { compact?: boolean }) {
  const params = useSearchParams();
  const raw = params.get("country");
  const country = isCountryCode(raw) ? raw : "PK";
  const market = getMarket(country);
  const plans = getPricingPlans(country);

  if (!plans.length) {
    return <section className={`pricingSection pricingUnavailable ${compact ? "pricingCompact" : ""}`}>
      <div className="pricingHeader"><div><p className="eyebrow">{market.shortName} PRICING</p><h2>PRICING<br/><span>COMING SOON.</span></h2></div><p>Blueprint Buddies is preparing realtor packages for {market.name}. Pakistan pricing is already configured; USA and UK pricing will only go live once the final package economics are approved.</p></div>
      <div className="pricingUnavailableBox"><strong>{market.shortName} REALTOR ACCESS</strong><p>Join the realtor network now and we&apos;ll keep your account ready for market launch.</p><Link href={`/join-realtor?country=${country}`}>JOIN REALTOR NETWORK <ArrowUpRight size={16}/></Link></div>
    </section>;
  }

  return <section className={`pricingSection ${compact ? "pricingCompact" : ""}`} id="pricing">
    <div className="pricingHeader"><div><p className="eyebrow">PAKISTAN REALTOR PRICING</p><h2>PAY FOR<br/><span>VERIFIED DEMAND.</span></h2></div><p>Only verified leads count toward your allowance. Raw submissions, rejected contacts and unverified requirements do not consume a monthly lead slot.</p></div>
    <div className="pricingGrid">
      {plans.map(plan => <article key={plan.id} className={plan.featured ? "featured" : ""}>
        {plan.featured && <span className="pricingRecommended"><Sparkles size={13}/> BEST VALUE</span>}
        <div className="pricingCardHead"><span>{plan.kind === "subscription" ? "MONTHLY PLAN" : "NO SUBSCRIPTION"}</span><h3>{plan.name}</h3><p>{plan.description}</p></div>
        <div className="pricingAmount"><strong>{formatPlanPrice(plan)}</strong><span>{plan.billingInterval === "month" ? "/ MONTH" : "/ VERIFIED LEAD"}</span></div>
        <div className="pricingAllowance"><strong>{plan.leadCap}</strong><span>{plan.leadCap === 1 ? "VERIFIED LEAD" : "VERIFIED LEADS"}</span></div>
        {plan.kind === "subscription" && <p className="effectiveRate">≈ PKR {effectiveLeadPrice(plan).toLocaleString("en-PK")} per verified lead at full usage</p>}
        <ul>{plan.features.map(feature => <li key={feature}><Check size={15}/>{feature}</li>)}</ul>
        <Link className="pricingCta" href="/realtor/billing">{plan.kind === "subscription" ? `CHOOSE ${plan.name}` : "BUY INDIVIDUAL LEAD"}<ArrowUpRight size={16}/></Link>
      </article>)}
    </div>
    <p className="pricingFootnote">Monthly allowances reset with each paid billing period and do not roll over. Individual verified leads can be purchased when you do not want a subscription or when a plan allowance is exhausted.</p>
  </section>;
}
