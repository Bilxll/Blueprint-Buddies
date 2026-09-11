"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Copy, Flame, Home, BadgeDollarSign, TrendingUp, KeyRound, LockKeyhole, MapPinned, ShieldCheck, Sparkles } from "lucide-react";
import { COUNTRY_OPTIONS, PROPERTY_TYPES, TIMEFRAMES, formatCompactMoney, formatMoney, getAreas, getCities, getMarket, isCountryCode } from "@/lib/market";
import type { LeadType } from "@/lib/types";
import { BrutalistSelect } from "@/components/BrutalistSelect";

const TYPES: {id:LeadType; label:string; kicker:string; icon: typeof Home}[]=[
  {id:"buy",label:"BUY",kicker:"Find your next property",icon:Home},
  {id:"sell",label:"SELL",kicker:"Reach serious buyers",icon:BadgeDollarSign},
  {id:"invest",label:"INVEST",kicker:"Find matching opportunities",icon:TrendingUp},
  {id:"rent",label:"RENT",kicker:"Find your next place",icon:KeyRound},
];
const STEP_NAMES=["MOVE","LOCATION","INTENT","CONTACT"];
const inputClass="field";

export function LeadWizard(){
 const [step,setStep]=useState(0);
 const [busy,setBusy]=useState(false);
 const [done,setDone]=useState<{id:string;temperature:string}|null>(null);
 const [error,setError]=useState("");
 const [consent,setConsent]=useState(false);
 const [data,setData]=useState<any>({country:"PK",type:"buy",city:"Karachi",area:"DHA",propertyType:"House",timeframe:"Within 30 days",paymentMode:"Cash",name:"",phone:"",email:"",ownerConfirmed:false});
 const market=useMemo(()=>getMarket(data.country),[data.country]);
 const cities=useMemo(()=>getCities(data.country),[data.country]);
 const areas=useMemo(()=>getAreas(data.country,data.city),[data.country,data.city]);
 const selectedType=TYPES.find(t=>t.id===data.type)!;
 const SelectedIcon=selectedType.icon;
 const progress=Math.round(((step+1)/4)*100);

 useEffect(()=>{
   const q=new URLSearchParams(window.location.search);
   const countryParam=q.get("country"); const country=isCountryCode(countryParam)?countryParam:"PK"; const cfg=getMarket(country); const city=q.get("city"); const area=q.get("area"); const type=q.get("type") as LeadType|null;
   const nextCity=city && cfg.cities[city] ? city : cfg.defaultCity; const nextAreas=getAreas(country,nextCity);
   setData((d:any)=>({...d,country,city:nextCity,area:area && nextAreas.includes(area)?area:nextAreas[0]}));
   if(type && TYPES.some(t=>t.id===type)) setData((d:any)=>({...d,type}));
 },[]);

 function patch(k:string,v:any){setData((d:any)=>({...d,[k]:v}));setError("");}
 function chooseType(type:LeadType){setData((d:any)=>({...d,type,paymentMode:type==="rent"?"Monthly":d.paymentMode==="Monthly"?"Cash":d.paymentMode||"Cash"}));setError("");}
 const budgetPresets=data.type==="rent"?market.rentBudgetPresets:market.buyBudgetPresets;
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
   if(String(data.phone).replace(/\D/g,"").length<7){setError("Enter a valid WhatsApp or phone number.");return;}
   if(!consent){setError("Please confirm that matched realtors may contact you about this requirement.");return;}
   setBusy(true);setError("");
   try{
     const params=new URLSearchParams(location.search);
     const payload={...data,contactConsent:true,budgetMin:data.budgetMin?Number(data.budgetMin):undefined,budgetMax:data.budgetMax?Number(data.budgetMax):undefined,expectedPrice:data.expectedPrice?Number(data.expectedPrice):undefined,source:params.get("source")||"website",campaign:params.get("campaign")||undefined,contentId:params.get("content")||params.get("content_id")||undefined,utmSource:params.get("utm_source")||undefined,utmMedium:params.get("utm_medium")||undefined,utmCampaign:params.get("utm_campaign")||undefined};
     const r=await fetch("/api/leads",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});
     const j=await r.json();if(!r.ok)throw new Error(j.error||"Submission failed");
     setDone({id:j.leadId,temperature:j.temperature});
     try{localStorage.setItem("bb:lastLeadId",j.leadId);localStorage.setItem("bb:lastLeadPhone",data.phone)}catch{}
   }catch(e:any){setError(e.message)}finally{setBusy(false)}
 }

 if(done)return <div className="successPanel enhancedSuccess">
   <div className="successIcon"><Check/></div><p className="eyebrow">REQUIREMENT RECEIVED</p>
   <h2>YOUR BRIEF IS<br/><span>IN THE NETWORK.</span></h2>
   <p>Your private reference is <strong>{done.id}</strong>. Keep it with the phone number you submitted so you can check progress without creating an account.</p>
   <div className="referenceBox"><code>{done.id}</code><button type="button" onClick={async()=>{try{await navigator.clipboard.writeText(done.id)}catch{}}}><Copy size={15}/> COPY</button></div>
   <div className="successTimeline"><div><span>01</span><ShieldCheck/><strong>REVIEW</strong><p>Your requirement enters the verification queue.</p></div><div><span>02</span><MapPinned/><strong>MATCH</strong><p>Relevant territory and property signals are compared.</p></div><div><span>03</span><Sparkles/><strong>CONNECT</strong><p>An authorized matched realtor may contact you.</p></div></div>
   <div className="successActions"><a className="ctaButton inlineButton" href="/track"><span className="ctaFill"/><span className="ctaText">TRACK REQUIREMENT <ArrowRight size={18}/></span></a><a className="secondaryLink" href="/get-started">SUBMIT ANOTHER <ArrowRight size={18}/></a></div>
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

    {step===0&&<section className="wizardStage"><div className="stageIntro"><p className="eyebrow">YOUR MOVE</p><span>Choose the intent that best describes this requirement.</span></div><h1>WHAT ARE YOU<br/>HERE TO DO?</h1><div className="typeGrid">{TYPES.map((t,i)=>{const Icon=t.icon;const active=data.type===t.id;return <button type="button" key={t.id} className={`typeChoice ${active?"active":""}`} onClick={()=>chooseType(t.id)} aria-pressed={active}><div><span>0{i+1}</span>{active?<CheckCircle2 size={21}/>:<Icon size={21}/>}</div><strong>{t.label}</strong><small>{t.kicker}</small></button>})}</div></section>}

    {step===1&&<section className="wizardStage"><div className="stageIntro"><p className="eyebrow">LOCATION</p><span>Local matching begins with the exact market.</span></div><h1>WHERE IS THE<br/>PROPERTY?</h1><div className="formGrid"><label>COUNTRY<BrutalistSelect ariaLabel="Country" value={data.country} onChange={value=>{const cfg=getMarket(value);patch("country",value);patch("city",cfg.defaultCity);patch("area",getAreas(value,cfg.defaultCity)[0])}} options={COUNTRY_OPTIONS}/></label><label>CITY<BrutalistSelect ariaLabel="City" value={data.city} onChange={value=>{patch("city",value);patch("area",getAreas(data.country,value)[0]||"Other")}} options={cities.map(c=>({value:c,label:c}))}/></label><label>AREA / SOCIETY<BrutalistSelect ariaLabel="Area or society" value={data.area} onChange={value=>patch("area",value)} options={areas.map(a=>({value:a,label:a}))}/></label><label>PROPERTY TYPE<BrutalistSelect ariaLabel="Property type" value={data.propertyType} onChange={value=>patch("propertyType",value)} options={PROPERTY_TYPES.map(p=>({value:p,label:p}))}/></label><label>SIZE <small>OPTIONAL</small><input className={inputClass} placeholder="e.g. 500 sq yd / 10 marla" value={data.size||""} onChange={e=>patch("size",e.target.value)}/><small className="fieldHint">Use the local unit you already know.</small></label></div></section>}

    {step===2&&<section className="wizardStage"><div className="stageIntro"><p className="eyebrow">INTENT</p><span>Budget and timing help realtors judge fit before contacting you.</span></div><h1>MAKE THE BRIEF<br/><span>USEFUL.</span></h1><div className="budgetPresets"><span>{data.type==="sell"?"QUICK EXPECTED PRICE":"QUICK MAX BUDGET"}</span><div>{budgetPresets.map(v=><button type="button" key={v} onClick={()=>setPreset(v)} className={Number(data.type==="sell"?data.expectedPrice:data.budgetMax)===v?"active":""}>{formatCompactMoney(v,data.country)}</button>)}</div></div><div className="formGrid"><label>{data.type==="sell"?`EXPECTED PRICE (${market.currency})`:`MIN BUDGET (${market.currency})`}<input className={inputClass} inputMode="numeric" type="number" min="0" value={data.type==="sell"?(data.expectedPrice||""):(data.budgetMin||"")} onChange={e=>patch(data.type==="sell"?"expectedPrice":"budgetMin",e.target.value)} placeholder="e.g. 20000000"/><small className="fieldHint">{formatMoney(data.type==="sell"?data.expectedPrice:data.budgetMin,data.country)}</small></label>{data.type!=="sell"&&<label>MAX BUDGET ({market.currency})<input className={inputClass} inputMode="numeric" type="number" min="0" value={data.budgetMax||""} onChange={e=>patch("budgetMax",e.target.value)} placeholder="e.g. 30000000"/><small className="fieldHint">{formatMoney(data.budgetMax,data.country)}</small></label>}<label>TIMEFRAME<BrutalistSelect ariaLabel="Timeframe" value={data.timeframe} onChange={value=>patch("timeframe",value)} options={TIMEFRAMES.map(t=>({value:t,label:t}))}/></label><label>{data.type==="rent"?"RENT PAYMENT":"PAYMENT"}<BrutalistSelect ariaLabel="Payment" value={data.paymentMode||"Cash"} onChange={value=>patch("paymentMode",value)} options={(data.type==="rent"?["Monthly","Quarterly","6 months advance","Yearly","Open to terms"]:["Cash","Installments","Financing / Mortgage","Open to options"]).map(x=>({value:x,label:x}))}/></label>{["buy","rent"].includes(data.type)&&<label>BEDROOMS<BrutalistSelect ariaLabel="Bedrooms" value={data.bedrooms||"Open"} onChange={value=>patch("bedrooms",value)} options={["Open","1","2","3","4","5+"].map(x=>({value:x,label:x}))}/></label>}{data.type!=="sell"&&<label>PURPOSE <small>OPTIONAL</small><input className={inputClass} placeholder={data.type==="invest"?"e.g. long-term investment":"e.g. family residence"} value={data.purpose||""} onChange={e=>patch("purpose",e.target.value)}/></label>}{data.type==="sell"&&<label className="checkLine"><input type="checkbox" checked={!!data.ownerConfirmed} onChange={e=>patch("ownerConfirmed",e.target.checked)}/><span>I am the owner or authorized seller</span></label>}{data.type==="invest"&&<label>INVESTMENT GOAL<BrutalistSelect ariaLabel="Investment goal" value={data.investmentGoal||"Appreciation"} onChange={value=>patch("investmentGoal",value)} options={["Appreciation","Rental income","Both"].map(x=>({value:x,label:x}))}/></label>}</div></section>}

    {step===3&&<section className="wizardStage"><div className="stageIntro"><p className="eyebrow"><Flame size={15}/> FINAL STEP</p><span>No consumer account is required.</span></div><h1>WHERE SHOULD<br/>REALTORS REACH YOU?</h1><div className="formGrid"><label>FULL NAME<input required className={inputClass} autoComplete="name" value={data.name} onChange={e=>patch("name",e.target.value)} placeholder="Your full name"/></label><label>WHATSAPP / PHONE<input required className={inputClass} inputMode="tel" autoComplete="tel" value={data.phone} onChange={e=>patch("phone",e.target.value)} placeholder={market.phonePlaceholder}/><small className="fieldHint">Use a number you actively answer.</small></label><label>EMAIL <small>OPTIONAL</small><input className={inputClass} type="email" autoComplete="email" value={data.email} onChange={e=>patch("email",e.target.value)} placeholder="you@email.com"/></label></div><label className="consentLine"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span><strong>CONTACT PERMISSION</strong> I agree that authorized participating realtors matched to this requirement may contact me about it.</span></label><div className="privacyNote enhancedPrivacy"><LockKeyhole size={18}/><div><strong>YOUR CONTACT IS NOT PUBLIC.</strong><p>Your phone and email unlock only to an authorized realtor after a valid claim. They are never shown on public market pages.</p></div></div></section>}

    {error&&<div className="formError" role="alert">{error}</div>}
    <div className="wizardActions">{step>0?<button type="button" className="backBtn" onClick={()=>{setStep(s=>s-1);setError("")}}><ArrowLeft/> BACK</button>:<span/>}{step<3?<button type="button" className="nextBtn" onClick={next}>CONTINUE <ArrowRight/></button>:<button type="button" disabled={busy} className="nextBtn" onClick={submit}>{busy?"SUBMITTING…":"SUBMIT REQUIREMENT"}<ArrowRight/></button>}</div>
  </div>

  <aside className="briefSummary">
    <div className="briefSummaryTop"><p className="eyebrow">YOUR BRIEF</p><span>{progress}%</span></div>
    <div className="briefMove"><SelectedIcon size={20}/><strong>{selectedType.label}</strong></div>
    <dl><div><dt>MARKET</dt><dd>{data.area}, {data.city} · {market.shortName}</dd></div><div><dt>PROPERTY</dt><dd>{data.propertyType}{data.size?` · ${data.size}`:""}</dd></div><div><dt>{data.type==="sell"?"EXPECTED":"BUDGET"}</dt><dd>{data.type==="sell"?formatMoney(data.expectedPrice,data.country):data.budgetMin||data.budgetMax?`${formatMoney(data.budgetMin,data.country)}${data.budgetMax?` — ${formatMoney(data.budgetMax,data.country)}`:""}`:"Not set"}</dd></div><div><dt>TIMEFRAME</dt><dd>{data.timeframe}</dd></div></dl>
    <div className="briefPrivacy"><LockKeyhole size={17}/><p><strong>PRIVATE BY DEFAULT</strong><br/>Contact details stay protected until a matched realtor claims the lead.</p></div>
  </aside>
 </div>
}
