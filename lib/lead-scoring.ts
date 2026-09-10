import type { LeadInput, LeadTemperature } from "./types";

export function scoreLead(input: LeadInput): { score: number; temperature: LeadTemperature; reasons: string[] } {
  let score = 35;
  const reasons: string[] = [];
  if (input.city && input.area) { score += 10; reasons.push("location complete"); }
  if (input.propertyType) { score += 5; reasons.push("property type complete"); }
  if (input.budgetMin || input.budgetMax || input.expectedPrice) { score += 12; reasons.push("financial range supplied"); }
  if (input.phone.replace(/\D/g, "").length >= 10) { score += 8; reasons.push("phone format valid"); }
  if (input.type === "sell" && input.ownerConfirmed) { score += 10; reasons.push("owner confirmed"); }
  if (input.timeframe === "Within 30 days") { score += 20; reasons.push("immediate timeframe"); }
  else if (input.timeframe === "1–3 months") { score += 12; reasons.push("near-term timeframe"); }
  else if (input.timeframe === "3–6 months") { score += 5; }
  else if (input.timeframe === "Just exploring") { score -= 15; reasons.push("exploratory intent"); }
  score = Math.max(0, Math.min(100, score));
  const temperature: LeadTemperature = score >= 80 ? "hot" : score >= 62 ? "warm" : score >= 45 ? "future" : "needs_verification";
  return { score, temperature, reasons };
}
