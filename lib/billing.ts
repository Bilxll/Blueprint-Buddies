import { appConfig } from "./config";

export const TEST_PACKAGES = [
  { id: "beta-10", name: "BETA 10", credits: 10, pricePkr: 0, description: "10 test lead credits" },
  { id: "beta-25", name: "BETA 25", credits: 25, pricePkr: 0, description: "25 test lead credits" },
  { id: "beta-50", name: "BETA 50", credits: 50, pricePkr: 0, description: "50 test lead credits" },
] as const;

export function leadCreditCost() {
  return appConfig.defaultLeadCreditCost;
}

export function billingEnabledForTest() {
  return appConfig.betaMode && appConfig.billingMode === "test_credits" && appConfig.allowTestPurchases;
}
