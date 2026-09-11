import { createHash } from "node:crypto";

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

export function normalizePakistanPhone(value: string) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("0092")) digits = digits.slice(2);
  if (digits.startsWith("92")) return `+${digits}`;
  if (digits.startsWith("0")) return `+92${digits.slice(1)}`;
  if (digits.length === 10 && digits.startsWith("3")) return `+92${digits}`;
  return `+${digits}`;
}

export function leadDedupKey(input: { phone: string; type: string; city: string; area: string }, date = new Date()) {
  const day = date.toISOString().slice(0, 10);
  return sha256(`${normalizePakistanPhone(input.phone)}|${input.type}|${input.city}|${input.area}|${day}`);
}
