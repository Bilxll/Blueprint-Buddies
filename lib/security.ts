import { createHash } from "node:crypto";
import type { CountryCode } from "./market";

export function sha256(value: string) { return createHash("sha256").update(value).digest("hex"); }
export function clientIp(request: Request) { const forwarded=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(); return forwarded||request.headers.get("x-real-ip")||"unknown"; }

export function normalizePhone(value: string, country: CountryCode | string = "PK") {
  let digits=String(value||"").replace(/\D/g,"");
  if(country==="PK"){
    if(digits.startsWith("0092"))digits=digits.slice(2);
    if(digits.startsWith("92"))return `+${digits}`;
    if(digits.startsWith("0"))return `+92${digits.slice(1)}`;
    if(digits.length===10&&digits.startsWith("3"))return `+92${digits}`;
  }
  if(country==="US"){
    if(digits.startsWith("001"))digits=digits.slice(2);
    if(digits.length===11&&digits.startsWith("1"))return `+${digits}`;
    if(digits.length===10)return `+1${digits}`;
  }
  if(country==="UK"){
    if(digits.startsWith("0044"))digits=digits.slice(2);
    if(digits.startsWith("44"))return `+${digits}`;
    if(digits.startsWith("0"))return `+44${digits.slice(1)}`;
    if(digits.length===10)return `+44${digits}`;
  }
  return digits?`+${digits}`:"";
}

export function normalizePakistanPhone(value:string){return normalizePhone(value,"PK")}

export function leadDedupKey(input:{phone:string;type:string;country?:CountryCode|string;city:string;area:string},date=new Date()){
  const day=date.toISOString().slice(0,10);const country=(input.country||"PK") as CountryCode;
  return sha256(`${normalizePhone(input.phone,country)}|${country}|${input.type}|${input.city}|${input.area}|${day}`);
}
