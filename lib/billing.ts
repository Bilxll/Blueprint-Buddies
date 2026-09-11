import { appConfig } from "./config";
import { getPricingPlan, getPricingPlans } from "./pricing";
import type { CountryCode } from "./market";

export function billingEnabledForTest() {
  return appConfig.betaMode && appConfig.billingMode === "test_credits" && appConfig.allowTestPurchases;
}

export function paidBillingLive() {
  return appConfig.billingMode === "live";
}

export function getBillablePlans(country: CountryCode | string | undefined) {
  return getPricingPlans(country);
}

export function getBillablePlan(country: CountryCode | string | undefined, id: string) {
  return getPricingPlan(country, id);
}

export function subscriptionRemaining(realtor: Record<string, any>) {
  const cap = Math.max(0, Number(realtor.planLeadCap || 0));
  const used = Math.max(0, Number(realtor.planLeadsUsed || 0));
  const periodEnd = realtor.planPeriodEnd ? new Date(realtor.planPeriodEnd).getTime() : 0;
  const expired = periodEnd > 0 && periodEnd <= Date.now();
  const active = String(realtor.subscriptionStatus || "").startsWith("active") && cap > 0 && !expired;
  return active ? Math.max(0, cap - used) : 0;
}

export function totalLeadAccessRemaining(realtor: Record<string, any>) {
  return subscriptionRemaining(realtor) + Math.max(0, Number(realtor.paygLeadBalance || 0)) + Math.max(0, Number(realtor.creditsBalance || 0));
}
