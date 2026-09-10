"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Flame, Home, BadgeDollarSign, TrendingUp, KeyRound, LockKeyhole, MapPinned, ShieldCheck, Sparkles } from "lucide-react";
import { CITY_AREAS, PROPERTY_TYPES, TIMEFRAMES } from "@/lib/market";
import type { LeadType } from "@/lib/types";

const TYPES: {id:LeadType; label:string; kicker:string; icon: typeof Home}[]=[
  {id:"buy",label:"BUY",kicker:"Find your next property",icon:Home},
  {id:"sell",label:"SELL",kicker:"Reach serious buyers",icon:BadgeDollarSign},
  {id:"invest",label:"INVEST",kicker:"Find matching opportunities",icon:TrendingUp},
  {id:"rent",label:"RENT",kicker:"Find your next place",icon:KeyRound},
];
const STEP_NAMES=["MOVE","LOCATION","INTENT","CONTACT"];
const inputClass="field";
const BUDGET_PRESETS=[5_000_000,10_000_000,20_000_000,50_000_000,100_000_000];

function money(n?: string | number){
  if(!n) return "Not set";
  const value=Number(n);
  if(!Number.isFinite(value)) return "Not set";
  return `PKR ${new Intl.NumberFormat("en-PK",{maximumFractionDigits:0}).format(value)}`;
}
function compactMoney(value:number){
  if(value>=10_000_000){const c=value/10_000_000;return `${Number.isInteger(c)?c:c.toFixed(1)} CR`;}
  if(value>=100_000){const l=value/100_000;return `${Number.isInteger(l)?l:l.toFixed(1)} LAC`;}
  return new Intl.NumberFormat("en-PK",{notation:"compact"}).format(value);
}

export function LeadWizard(){
 const [step,setStep]=useState(0);
 const [busy,setBusy]=useState(false);
 const [done,setDone]=useState<{id:string;temperature:string}|null>(null);
 const [error,setError]=useState("");
 const [consent,setConsent]=useState(false);
 const [data,setData]=useState<any>({type:"buy",city:"Karachi",area:"DHA",propertyType:"House",timeframe:"Within 30 days",paymentMode:"Cash",name:"",phone:"",email:"",ownerConfirmed:false});
 const areas=useMemo(()=>CITY_AREAS[data.city]||["Other"],[data.city]);
 const selectedType=TYPES.find(t=>t.id===data.type)!;
 const SelectedIcon=selectedType.icon;
 const progress=Math.round(((step+1)/4)*100);

 useEffect(()=>{
   const q=new URLSearchParams(window.location.search);
   const city=q.get("city"); const area=q.get("area"); const type=q.get("type") as LeadType|null;
   if(city && CITY_AREAS[city]) setData((d:any)=>({...d,city,area:area && CITY_AREAS[city].includes(area)?area:CITY_AREAS[city][0]}));
   if(type && TYPES.some(t=>t.id===type)) setData((d:any)=>({...d,type}));
 },[]);

 function patch(k:string,v:any){setData((d:any)=>({...d,[k]:v}));setError("");}
 function setPreset(value:number){patch(data.type==="sell"?"expectedPrice":"budgetMax",String(value));}

 function validateCurrent(){
   if(step===1 && (!data.city || !data.area || !data.propertyType)){setError("Choose a city, area and property type to continue.");return false;}
   if(step===2){
     if(!data.timeframe){setError("Choose a timeframe to continue.");return false;}
     if(data.type==="sell" && !data.expectedPrice){setError("Add an expected property price so the requirement is useful.");return false;}
     if(data.type!=="sell" && !data.budgetMax && !data.budgetMin){setError("Add at least one budget value so realtors can understand the requirement.");return false;}
   }
   return true;
 }

 function next(){if(validateCurrent()) setStep(s=>Math.min(3,s+1));}

 async function submit(){
   if(!data.name.trim()){setError("Enter your full name.");return;}
   if(String(data.phone).replace(/\D/g,"").length<10){setError("Enter a valid WhatsApp or phone number.");return;}
   if(!consent){setError("Please confirm that matched realtors may contact you about this requirement.");return;}
   setBusy(true);setError("");
   try{
     const params=new URLSearchParams(location.search);
     const payload={...data,contactConsent:true,budgetMin:data.budgetMin?Number(data.budgetMin):undefined,budgetMax:data.budgetMax?Number(data.budgetMax):undefined,expectedPrice:data.expectedPrice?Number(data.expectedPrice):undefined,source:params.get("source")||"website",utmSource:params.get("utm_source")||undefined,utmMedium:params.get("utm_medium")||undefined,utmCampaign:params.get("utm_campaign")||undefined};
     const r=await fetch("/api/leads",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});
     const j=await r.json();if(!r.ok)throw new Error(j.error||"Submission failed");
     setDone({id:j.leadId,temperature:j.temperature});
   }catch(e:any){setError(e.message)}finally{setBusy(false)}
 }

 if(done)return <div className="successPanel enhancedSuccess">
   <div className="successIcon"><Check/></div><p className="eyebrow">REQUIREMENT RECEIVED</p>
   <h2>YOUR BRIEF IS<br/><span>IN THE NETWORK.</span></h2>
   <p>Reference <strong>{done.id}</strong>. Your intent is currently marked <strong>{done.temperature.replace("_"," ").toUpperCase()}</strong>. Verification is handled separately before any verified label is shown to realtors.</p>
   <div className="successTimeline"><div><span>01</span><ShieldCheck/><strong>REVIEW</strong><p>Your requirement enters the verification queue.</p></div><div><span>02</span><MapPinned/><strong>MATCH</strong><p>Relevant territory and property signals are compared.</p></div><div><span>03</span><Sparkles/><strong>CONNECT</strong><p>An authorized matched realtor may contact you.</p></div></div>
   <div className="successActions"><a className="ctaButton inlineButton" href="/"><span className="ctaFill"/><span className="ctaText">BACK HOME <ArrowRight size={18}/></span></a><a className="secondaryLink" href="/get-started">SUBMIT ANOTHER <ArrowRight size={18}/></a></div>
 </div>;

 return <div className="wizardShell">
  <div className="wizard">
    <div className="wizardTop">
      <span className="stepCounter">0{step+1} / 04</span>
      <div className="stepTrack" aria-label={`Step ${step+1} of 4`}>
        {STEP_NAMES.map((name,i)=><button type="button" key={name} className={i===step?"current":i<step?"complete":""} onClick={()=>i<step&&setStep(i)}><span>{String(i+1).padStart(2,"0")}</span>{name}</button>)}
      </div>
    </div>
    <div className="wizardProgressMobile"><span style={{width:`${progress}%`}}/><p>STEP {step+1} OF 4 · {STEP_NAMES[step]}</p></div>

    {step===0&&<section className="wizardStage"><div className="stageIntro"><p className="eyebrow">YOUR MOVE</p><span>Choose the intent that best describes this requirement.</span></div><h1>WHAT ARE YOU<br/>HERE TO DO?</h1><div className="typeGrid">{TYPES.map((t,i)=>{const Icon=t.icon;const active=data.type===t.id;return <button type="button" key={t.id} className={`typeChoice ${active?"active":""}`} onClick={()=>patch("type",t.id)} aria-pressed={active}><div><span>0{i+1}</span>{active?<CheckCircle2 size={21}/>:<Icon size={21}/>}</div><strong>{t.label}</strong><small>{t.kicker}</small></button>})}</div></section>}

    {step===1&&<section className="wizardStage"><div className="stageIntro"><p className="eyebrow">LOCATION</p><span>Local matching begins with the exact market.</span></div><h1>WHERE IS THE<br/>PROPERTY?</h1><div className="formGrid"><label>CITY<select className={inputClass} value={data.city} onChange={e=>{patch("city",e.target.value);patch("area",CITY_AREAS[e.target.value]?.[0]||"Other")}}>{Object.keys(CITY_AREAS).map(c=><option key={c}>{c}</option>)}</select></label><label>AREA / SOCIETY<select className={inputClass} value={data.area} onChange={e=>patch("area",e.target.value)}>{areas.map(a=><option key={a}>{a}</option>)}</select></label><label>PROPERTY TYPE<select className={inputClass} value={data.propertyType} onChange={e=>patch("propertyType",e.target.value)}>{PROPERTY_TYPES.map(p=><option key={p}>{p}</option>)}</select></label><label>SIZE <small>OPTIONAL</small><input className={inputClass} placeholder="e.g. 500 sq yd / 10 marla" value={data.size||""} onChange={e=>patch("size",e.target.value)}/><small className="fieldHint">Use the local unit you already know.</small></label></div></section>}

    {step===2&&<section className="wizardStage"><div className="stageIntro"><p className="eyebrow">INTENT</p><span>Budget and timing help realtors judge fit before contacting you.</span></div><h1>MAKE THE BRIEF<br/><span>USEFUL.</span></h1><div className="budgetPresets"><span>{data.type==="sell"?"QUICK EXPECTED PRICE":"QUICK MAX BUDGET"}</span><div>{BUDGET_PRESETS.map(v=><button type="button" key={v} onClick={()=>setPreset(v)} className={Number(data.type==="sell"?data.expectedPrice:data.budgetMax)===v?"active":""}>{compactMoney(v)}</button>)}</div></div><div className="formGrid"><label>{data.type==="sell"?"EXPECTED PRICE (PKR)":"MIN BUDGET (PKR)"}<input className={inputClass} inputMode="numeric" type="number" min="0" value={data.type==="sell"?(data.expectedPrice||""):(data.budgetMin||"")} onChange={e=>patch(data.type==="sell"?"expectedPrice":"budgetMin",e.target.value)} placeholder="e.g. 20000000"/><small className="fieldHint">{money(data.type==="sell"?data.expectedPrice:data.budgetMin)}</small></label>{data.type!=="sell"&&<label>MAX BUDGET (PKR)<input className={inputClass} inputMode="numeric" type="number" min="0" value={data.budgetMax||""} onChange={e=>patch("budgetMax",e.target.value)} placeholder="e.g. 30000000"/><small className="fieldHint">{money(data.budgetMax)}</small></label>}<label>TIMEFRAME<select className={inputClass} value={data.timeframe} onChange={e=>patch("timeframe",e.target.value)}>{TIMEFRAMES.map(t=><option key={t}>{t}</option>)}</select></label><label>PAYMENT<select className={inputClass} value={data.paymentMode||""} onChange={e=>patch("paymentMode",e.target.value)}><option>Cash</option><option>Installments</option><option>Financing / Mortgage</option><option>Open to options</option></select></label>{["buy","rent"].includes(data.type)&&<label>BEDROOMS<select className={inputClass} value={data.bedrooms||"Open"} onChange={e=>patch("bedrooms",e.target.value)}><option>Open</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5+</option></select></label>}{data.type!=="sell"&&<label>PURPOSE <small>OPTIONAL</small><input className={inputClass} placeholder={data.type==="invest"?"e.g. long-term investment":"e.g. family residence"} value={data.purpose||""} onChange={e=>patch("purpose",e.target.value)}/></label>}{data.type==="sell"&&<label className="checkLine"><input type="checkbox" checked={!!data.ownerConfirmed} onChange={e=>patch("ownerConfirmed",e.target.checked)}/><span>I am the owner or authorized seller</span></label>}{data.type==="invest"&&<label>INVESTMENT GOAL<select className={inputClass} value={data.investmentGoal||"Appreciation"} onChange={e=>patch("investmentGoal",e.target.value)}><option>Appreciation</option><option>Rental income</option><option>Both</option></select></label>}</div></section>}

    {step===3&&<section className="wizardStage"><div className="stageIntro"><p className="eyebrow"><Flame size={15}/> FINAL STEP</p><span>No consumer account is required.</span></div><h1>WHERE SHOULD<br/>REALTORS REACH YOU?</h1><div className="formGrid"><label>FULL NAME<input required className={inputClass} autoComplete="name" value={data.name} onChange={e=>patch("name",e.target.value)} placeholder="Your full name"/></label><label>WHATSAPP / PHONE<input required className={inputClass} inputMode="tel" autoComplete="tel" value={data.phone} onChange={e=>patch("phone",e.target.value)} placeholder="03XX XXXXXXX"/><small className="fieldHint">Use a number you actively answer.</small></label><label>EMAIL <small>OPTIONAL</small><input className={inputClass} type="email" autoComplete="email" value={data.email} onChange={e=>patch("email",e.target.value)} placeholder="you@email.com"/></label></div><label className="consentLine"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span><strong>CONTACT PERMISSION</strong> I agree that authorized participating realtors matched to this requirement may contact me about it.</span></label><div className="privacyNote enhancedPrivacy"><LockKeyhole size={18}/><div><strong>YOUR CONTACT IS NOT PUBLIC.</strong><p>Your phone and email unlock only to an authorized realtor after a valid claim. They are never shown on public market pages.</p></div></div></section>}

    {error&&<div className="formError" role="alert">{error}</div>}
    <div className="wizardActions">{step>0?<button type="button" className="backBtn" onClick={()=>{setStep(s=>s-1);setError("")}}><ArrowLeft/> BACK</button>:<span/>}{step<3?<button type="button" className="nextBtn" onClick={next}>CONTINUE <ArrowRight/></button>:<button type="button" disabled={busy} className="nextBtn" onClick={submit}>{busy?"SUBMITTING…":"SUBMIT REQUIREMENT"}<ArrowRight/></button>}</div>
  </div>

  <aside className="briefSummary">
    <div className="briefSummaryTop"><p className="eyebrow">YOUR BRIEF</p><span>{progress}%</span></div>
    <div className="briefMove"><SelectedIcon size={20}/><strong>{selectedType.label}</strong></div>
    <dl><div><dt>MARKET</dt><dd>{data.area}, {data.city}</dd></div><div><dt>PROPERTY</dt><dd>{data.propertyType}{data.size?` · ${data.size}`:""}</dd></div><div><dt>{data.type==="sell"?"EXPECTED":"BUDGET"}</dt><dd>{data.type==="sell"?money(data.expectedPrice):data.budgetMin||data.budgetMax?`${money(data.budgetMin)}${data.budgetMax?` — ${money(data.budgetMax)}`:""}`:"Not set"}</dd></div><div><dt>TIMEFRAME</dt><dd>{data.timeframe}</dd></div></dl>
    <div className="briefPrivacy"><LockKeyhole size={17}/><p><strong>PRIVATE BY DEFAULT</strong><br/>Contact details stay protected until a matched realtor claims the lead.</p></div>
  </aside>
 </div>
}
