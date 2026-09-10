"use client";

import { useMemo, useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase-client";
import { CITY_AREAS, PROPERTY_TYPES } from "@/lib/market";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, ShieldCheck } from "lucide-react";

const STEPS=["ACCOUNT","MARKET","PROFILE"];

export function RealtorSignup(){
  const [step,setStep]=useState(0);
  const [busy,setBusy]=useState(false);
  const [done,setDone]=useState(false);
  const [error,setError]=useState("");
  const [showPassword,setShowPassword]=useState(false);
  const [f,setF]=useState<any>({fullName:"",agencyName:"",email:"",password:"",phone:"",whatsapp:"",city:"Karachi",areas:["DHA"],propertyTypes:["House"],leadTypes:["buy","sell"],experience:"",website:"",instagram:"",facebook:"",about:""});
  const p=(k:string,v:any)=>{setF((x:any)=>({...x,[k]:v}));setError("")};
  const areaOptions=useMemo(()=>CITY_AREAS[f.city]||[],[f.city]);

  function validateStep(){
    if(step===0){
      if(f.fullName.trim().length<2 || f.agencyName.trim().length<2){setError("Add your name and agency name.");return false;}
      if(!/^\S+@\S+\.\S+$/.test(f.email)){setError("Enter a valid email address.");return false;}
      if(f.password.length<8){setError("Use a password with at least 8 characters.");return false;}
      if(String(f.phone).replace(/\D/g,"").length<10 || String(f.whatsapp).replace(/\D/g,"").length<10){setError("Add valid phone and WhatsApp numbers.");return false;}
    }
    if(step===1){
      if(!f.city || f.areas.length<1){setError("Choose at least one area you actively serve.");return false;}
      if(f.propertyTypes.length<1){setError("Choose at least one property type.");return false;}
      if(f.leadTypes.length<1){setError("Choose at least one lead type.");return false;}
    }
    return true;
  }

  function next(){if(validateStep()) setStep(s=>Math.min(2,s+1));}

  async function submit(e:React.FormEvent){
    e.preventDefault(); if(!validateStep()) return; setBusy(true);setError("");
    try{
      const cred=await createUserWithEmailAndPassword(firebaseAuth,f.email,f.password);
      const token=await cred.user.getIdToken();
      const {email,password,...profile}=f;
      const r=await fetch("/api/realtors",{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${token}`},body:JSON.stringify(profile)});
      const j=await r.json();if(!r.ok)throw new Error(j.error||"Could not create realtor profile.");
      setDone(true);
    }catch(e:any){
      const raw=e?.code||e?.message||"Signup failed";
      const friendly=raw.includes("email-already-in-use")?"An account with this email already exists. Use Realtor Login instead.":raw.includes("invalid-email")?"Enter a valid email address.":raw.includes("weak-password")?"Choose a stronger password.":raw;
      setError(friendly);
    }finally{setBusy(false)}
  }

  if(done)return <div className="successPanel compactSuccess"><div className="successIcon"><CheckCircle2/></div><p className="eyebrow">APPLICATION RECEIVED</p><h2>PROFILE SENT<br/><span>FOR REVIEW.</span></h2><p>We&apos;ll keep your marketplace access closed until the realtor profile is verified. After approval, matching opportunities for your selected territories will appear in your portal.</p><a className="ctaButton inlineButton" href="/login"><span className="ctaFill"/><span className="ctaText">GO TO REALTOR LOGIN <ArrowRight size={18}/></span></a></div>;

  return <form className="realtorForm" onSubmit={submit}>
    <div className="signupProgress">
      {STEPS.map((label,i)=><button type="button" onClick={()=>i<step&&setStep(i)} className={i===step?"current":i<step?"complete":""} key={label}><span>0{i+1}</span>{label}</button>)}
    </div>

    {step===0&&<div className="signupStage"><div className="formStageHead"><p className="eyebrow">01 / ACCOUNT</p><h2>WHO ARE WE<br/>VERIFYING?</h2><p>Use the business identity and contact details you want associated with your realtor profile.</p></div><div className="formGrid"><label>FULL NAME<input className="field" autoComplete="name" value={f.fullName} onChange={e=>p("fullName",e.target.value)} required/></label><label>AGENCY NAME<input className="field" value={f.agencyName} onChange={e=>p("agencyName",e.target.value)} required/></label><label>EMAIL<input className="field" autoComplete="email" type="email" value={f.email} onChange={e=>p("email",e.target.value)} required/></label><label>PASSWORD<div className="passwordField"><input className="field" autoComplete="new-password" type={showPassword?"text":"password"} minLength={8} value={f.password} onChange={e=>p("password",e.target.value)} required/><button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?"Hide password":"Show password"}>{showPassword?<EyeOff/>:<Eye/>}</button></div><small className="fieldHint">8 characters minimum</small></label><label>PHONE<input className="field" inputMode="tel" autoComplete="tel" value={f.phone} onChange={e=>p("phone",e.target.value)} required/></label><label>WHATSAPP<div className="whatsappField"><input className="field" inputMode="tel" value={f.whatsapp} onChange={e=>p("whatsapp",e.target.value)} required/><button type="button" onClick={()=>p("whatsapp",f.phone)} disabled={!f.phone}>USE PHONE</button></div></label></div></div>}

    {step===1&&<div className="signupStage"><div className="formStageHead"><p className="eyebrow">02 / MARKET</p><h2>WHERE DO<br/>YOU ACTUALLY WORK?</h2><p>Matching starts with territory and specialization. Choose only markets you can genuinely serve.</p></div><div className="formGrid"><label>CITY<select className="field" value={f.city} onChange={e=>{p("city",e.target.value);p("areas",[CITY_AREAS[e.target.value]?.[0]||"Other"])}}>{Object.keys(CITY_AREAS).map(c=><option key={c}>{c}</option>)}</select></label><div className="choiceField"><span>AREAS SERVED</span><div className="chipGrid">{areaOptions.map(a=><label className={`selectChip ${f.areas.includes(a)?"selected":""}`} key={a}><input type="checkbox" checked={f.areas.includes(a)} onChange={e=>p("areas",e.target.checked?[...f.areas,a]:f.areas.filter((x:string)=>x!==a))}/>{a}</label>)}</div></div><div className="choiceField"><span>PROPERTY TYPES</span><div className="chipGrid">{PROPERTY_TYPES.map(x=><label className={`selectChip ${f.propertyTypes.includes(x)?"selected":""}`} key={x}><input type="checkbox" checked={f.propertyTypes.includes(x)} onChange={e=>p("propertyTypes",e.target.checked?[...f.propertyTypes,x]:f.propertyTypes.filter((v:string)=>v!==x))}/>{x}</label>)}</div></div><div className="choiceField"><span>OPPORTUNITY TYPES</span><div className="chipGrid">{["buy","sell","invest","rent"].map(x=><label className={`selectChip ${f.leadTypes.includes(x)?"selected":""}`} key={x}><input type="checkbox" checked={f.leadTypes.includes(x)} onChange={e=>p("leadTypes",e.target.checked?[...f.leadTypes,x]:f.leadTypes.filter((v:string)=>v!==x))}/>{x.toUpperCase()}</label>)}</div></div></div></div>}

    {step===2&&<div className="signupStage"><div className="formStageHead"><p className="eyebrow">03 / PROFILE</p><h2>BUILD YOUR<br/><span>MARKET PROFILE.</span></h2><p>These details help us review your account and will later support your public realtor profile.</p></div><div className="formGrid"><label>EXPERIENCE <small>OPTIONAL</small><input className="field" placeholder="e.g. 6 years" value={f.experience} onChange={e=>p("experience",e.target.value)}/></label><label>WEBSITE <small>OPTIONAL</small><input className="field" placeholder="https://..." value={f.website} onChange={e=>p("website",e.target.value)}/></label><label>INSTAGRAM <small>OPTIONAL</small><input className="field" placeholder="@agency or profile URL" value={f.instagram} onChange={e=>p("instagram",e.target.value)}/></label><label>FACEBOOK <small>OPTIONAL</small><input className="field" placeholder="Profile or page URL" value={f.facebook} onChange={e=>p("facebook",e.target.value)}/></label></div><label className="fullField">ABOUT YOUR WORK <small>OPTIONAL</small><textarea className="field textarea" maxLength={800} value={f.about} onChange={e=>p("about",e.target.value)} placeholder="Tell us about your areas, property segments and client types."/></label><div className="verificationNote"><ShieldCheck/><p><strong>WHY VERIFICATION?</strong><br/>Consumer contact details are protected. Realtor profiles are reviewed before marketplace access is opened.</p></div></div>}

    {error&&<div className="formError" role="alert">{error}</div>}
    <div className="signupActions">{step>0?<button type="button" className="backBtn" onClick={()=>{setStep(s=>s-1);setError("")}}><ArrowLeft/> BACK</button>:<span/>}{step<2?<button type="button" className="nextBtn" onClick={next}>CONTINUE <ArrowRight/></button>:<button className="nextBtn" disabled={busy}>{busy?"CREATING ACCOUNT…":"CREATE REALTOR ACCOUNT"}<ArrowRight/></button>}</div>
  </form>
}
