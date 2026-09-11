"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  sendEmailVerification,
  signOut,
  type User,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase-client";
import {
  authErrorMessage,
  getSessionDestination,
  prepareAuthPersistence,
  signInWithGoogleAccount,
} from "@/lib/auth-client";
import { COUNTRY_OPTIONS, PROPERTY_TYPES, getAreas, getCities, getMarket, isCountryCode } from "@/lib/market";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, MailCheck, ShieldCheck } from "lucide-react";
import { BrutalistSelect } from "@/components/BrutalistSelect";
import Link from "next/link";

const STEPS=["ACCOUNT","MARKET","PROFILE"];
type AuthMethod="email"|"google"|"existing";

export function RealtorSignup(){
  const [step,setStep]=useState(0);
  const [busy,setBusy]=useState(false);
  const [googleBusy,setGoogleBusy]=useState(false);
  const [done,setDone]=useState(false);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const [showPassword,setShowPassword]=useState(false);
  const [showConfirm,setShowConfirm]=useState(false);
  const [confirmPassword,setConfirmPassword]=useState("");
  const [acceptedTerms,setAcceptedTerms]=useState(false);
  const [authMethod,setAuthMethod]=useState<AuthMethod>("email");
  const [authUser,setAuthUser]=useState<User|null>(null);
  const [emailVerificationSent,setEmailVerificationSent]=useState(false);
  const [logoFile,setLogoFile]=useState<File|null>(null);
  const [f,setF]=useState<any>({fullName:"",agencyName:"",email:"",password:"",phone:"",whatsapp:"",country:"PK",city:"Karachi",areas:["DHA"],propertyTypes:["House"],leadTypes:["buy","sell"],experience:"",website:"",instagram:"",facebook:"",about:""});
  const p=(k:string,v:any)=>{setF((x:any)=>({...x,[k]:v}));setError("")};
  const areaOptions=useMemo(()=>getAreas(f.country,f.city),[f.country,f.city]);
  const cityOptions=useMemo(()=>getCities(f.country),[f.country]);
  const market=useMemo(()=>getMarket(f.country),[f.country]);


  useEffect(()=>{
    const q=new URLSearchParams(window.location.search);const c=q.get("country");if(isCountryCode(c)){const cfg=getMarket(c);setF((x:any)=>({...x,country:c,city:cfg.defaultCity,areas:[getAreas(c,cfg.defaultCity)[0]]}));}
  },[]);

  useEffect(()=>onAuthStateChanged(firebaseAuth,async user=>{
    if(!user){setAuthUser(null);setAuthMethod("email");return;}
    try{
      const session=await getSessionDestination(user);
      if(session.role==="admin"){location.href="/admin";return;}
      if(session.role==="realtor"){location.href="/realtor/dashboard";return;}
      const viaGoogle=user.providerData.some(provider=>provider.providerId==="google.com");
      setAuthUser(user);
      setAuthMethod(viaGoogle?"google":"existing");
      setF((current:any)=>({...current,fullName:current.fullName||user.displayName||"",email:user.email||current.email}));
      setNotice(viaGoogle?"Google account connected. Complete your realtor profile below.":"Account connected. Complete your realtor profile below.");
    }catch{
      setError("Could not verify the signed-in account. Please try again.");
    }
  }),[]);

  function validateStep(){
    if(step===0){
      if(f.fullName.trim().length<2 || f.agencyName.trim().length<2){setError("Add your name and agency name.");return false;}
      if(!/^\S+@\S+\.\S+$/.test(f.email)){setError("Enter a valid email address.");return false;}
      if(!authUser){
        if(f.password.length<8){setError("Use a password with at least 8 characters.");return false;}
        if(f.password!==confirmPassword){setError("Your passwords do not match.");return false;}
      }
      if(String(f.phone).replace(/\D/g,"").length<7 || String(f.whatsapp).replace(/\D/g,"").length<7){setError("Add valid phone and WhatsApp numbers.");return false;}
    }
    if(step===1){
      if(!f.city || f.areas.length<1){setError("Choose at least one area you actively serve.");return false;}
      if(f.propertyTypes.length<1){setError("Choose at least one property type.");return false;}
      if(f.leadTypes.length<1){setError("Choose at least one lead type.");return false;}
    }
    if(step===2&&!acceptedTerms){setError("Accept the Terms and Privacy Policy to create your realtor account.");return false;}
    return true;
  }

  function next(){if(validateStep())setStep(s=>Math.min(2,s+1));}

  async function connectGoogle(){
    setError("");setNotice("");setGoogleBusy(true);
    try{
      const cred=await signInWithGoogleAccount();
      const session=await getSessionDestination(cred.user);
      if(session.role==="admin"){location.href="/admin";return;}
      if(session.role==="realtor"){location.href="/realtor/dashboard";return;}
      setAuthUser(cred.user);setAuthMethod("google");
      setF((current:any)=>({...current,fullName:current.fullName||cred.user.displayName||"",email:cred.user.email||current.email,password:""}));
      setConfirmPassword("");
      setNotice("Google account connected. No password needed — complete the details below.");
    }catch(e){setError(authErrorMessage(e,"Could not continue with Google."));}
    finally{setGoogleBusy(false)}
  }

  async function useEmailInstead(){
    setError("");setNotice("");
    try{await signOut(firebaseAuth);}catch{}
    setAuthUser(null);setAuthMethod("email");setF((current:any)=>({...current,password:""}));setConfirmPassword("");
  }

  async function submit(e:React.FormEvent){
    e.preventDefault();if(!validateStep())return;setBusy(true);setError("");
    let createdUser:User|null=null;
    try{
      await prepareAuthPersistence();
      let user=authUser||firebaseAuth.currentUser;
      if(!user){
        const cred=await createUserWithEmailAndPassword(firebaseAuth,f.email.trim(),f.password);
        user=cred.user;createdUser=user;
      }
      const token=await user.getIdToken();
      const {email,password,...profile}=f;
      const r=await fetch("/api/realtors",{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${token}`},body:JSON.stringify({...profile,logoDriveFileId:"",termsAccepted:true})});
      const j=await r.json();
      if(!r.ok)throw new Error(j.error||"Could not create realtor profile.");

      if(logoFile){
        try{
          const form=new FormData();form.set("file",logoFile);form.set("purpose","agency_logo");
          const upload=await fetch("/api/upload",{method:"POST",headers:{authorization:`Bearer ${token}`},body:form});
          const uploaded=await upload.json();
          if(upload.ok){
            const logoDriveFileId=String(uploaded.file?.id||"");
            if(logoDriveFileId){
              const patch=await fetch("/api/realtors",{method:"PATCH",headers:{"content-type":"application/json",authorization:`Bearer ${token}`},body:JSON.stringify({...profile,logoDriveFileId})});
              if(!patch.ok) console.warn("Logo uploaded but profile logo reference could not be saved.");
            }
          }else console.warn(uploaded.error||"Agency logo upload failed. It can be added later from Settings.");
        }catch(uploadError){console.warn("Agency logo upload failed. It can be added later from Settings.",uploadError)}
      }

      if(!user.emailVerified){
        try{await sendEmailVerification(user);setEmailVerificationSent(true);}catch{}
      }
      setAuthUser(user);setDone(true);
    }catch(e:any){
      if(createdUser){try{await deleteUser(createdUser);}catch{}}
      setError(authErrorMessage(e,e?.message||"Signup failed. Please try again."));
    }finally{setBusy(false)}
  }

  if(done)return <div className="successPanel compactSuccess"><div className="successIcon"><CheckCircle2/></div><p className="eyebrow">ACCOUNT CREATED</p><h2>PROFILE SENT<br/><span>FOR REVIEW.</span></h2><p>{emailVerificationSent?"We sent a verification link to your email. Verify your email while our team reviews your realtor profile.":"Your secure account is ready. Our team will review your realtor profile before marketplace access is opened."}</p>{emailVerificationSent&&<div className="formNotice authSuccessNotice"><MailCheck size={17}/> CHECK YOUR INBOX FOR THE VERIFICATION LINK</div>}<a className="ctaButton inlineButton" href="/realtor/dashboard"><span className="ctaFill"/><span className="ctaText">OPEN REALTOR PORTAL <ArrowRight size={18}/></span></a></div>;

  return <form className="realtorForm" onSubmit={submit}>
    <div className="signupProgress">
      {STEPS.map((label,i)=><button type="button" onClick={()=>i<step&&setStep(i)} className={i===step?"current":i<step?"complete":""} key={label}><span>0{i+1}</span>{label}</button>)}
    </div>

    {step===0&&<div className="signupStage"><div className="formStageHead"><p className="eyebrow">01 / ACCOUNT</p><h2>WHO ARE WE<br/>VERIFYING?</h2><p>Create your realtor account with Google or email, then add the business identity we should verify.</p></div>
      {!authUser?<><button type="button" className="googleAuthButton" onClick={connectGoogle} disabled={googleBusy||busy}><span className="googleMark" aria-hidden="true">G</span><span>{googleBusy?"CONNECTING…":"SIGN UP WITH GOOGLE"}</span><ArrowRight size={18}/></button><div className="authDivider"><span>OR SIGN UP WITH EMAIL</span></div></>:<div className="authConnected"><div><span className="googleMark" aria-hidden="true">{authMethod==="google"?"G":"@"}</span><p><small>CONNECTED ACCOUNT</small><strong>{authUser.email}</strong></p></div><button type="button" onClick={useEmailInstead}>USE EMAIL INSTEAD</button></div>}
      {notice&&<div className="formNotice">{notice}</div>}
      <div className="formGrid"><label>FULL NAME<input className="field" autoComplete="name" value={f.fullName} onChange={e=>p("fullName",e.target.value)} required/></label><label>AGENCY NAME<input className="field" autoComplete="organization" value={f.agencyName} onChange={e=>p("agencyName",e.target.value)} required/></label><label>EMAIL<input className="field" autoComplete="email" type="email" value={f.email} onChange={e=>p("email",e.target.value)} readOnly={!!authUser} required/></label>{!authUser&&<><label>PASSWORD<div className="passwordField"><input className="field" autoComplete="new-password" type={showPassword?"text":"password"} minLength={8} value={f.password} onChange={e=>p("password",e.target.value)} required/><button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?"Hide password":"Show password"}>{showPassword?<EyeOff/>:<Eye/>}</button></div><small className="fieldHint">8 characters minimum</small></label><label>CONFIRM PASSWORD<div className="passwordField"><input className="field" autoComplete="new-password" type={showConfirm?"text":"password"} minLength={8} value={confirmPassword} onChange={e=>{setConfirmPassword(e.target.value);setError("")}} required/><button type="button" onClick={()=>setShowConfirm(v=>!v)} aria-label={showConfirm?"Hide password":"Show password"}>{showConfirm?<EyeOff/>:<Eye/>}</button></div></label></>}<label>PHONE<input className="field" inputMode="tel" autoComplete="tel" value={f.phone} onChange={e=>p("phone",e.target.value)} placeholder={market.phonePlaceholder} required/></label><label>WHATSAPP<div className="whatsappField"><input className="field" inputMode="tel" autoComplete="tel" value={f.whatsapp} onChange={e=>p("whatsapp",e.target.value)} placeholder={market.phonePlaceholder} required/><button type="button" onClick={()=>p("whatsapp",f.phone)} disabled={!f.phone}>USE PHONE</button></div></label></div>
      <p className="authMethodHelp">Already registered? <Link href="/login">SIGN IN TO YOUR REALTOR ACCOUNT →</Link></p>
    </div>}

    {step===1&&<div className="signupStage"><div className="formStageHead"><p className="eyebrow">02 / MARKET</p><h2>WHERE DO<br/>YOU ACTUALLY WORK?</h2><p>Matching starts with territory and specialization. Choose only markets you can genuinely serve.</p></div><div className="formGrid"><label>COUNTRY<BrutalistSelect ariaLabel="Country" value={f.country} onChange={value=>{const cfg=getMarket(value);p("country",value);p("city",cfg.defaultCity);p("areas",[getAreas(value,cfg.defaultCity)[0]])}} options={COUNTRY_OPTIONS}/></label><label>CITY<BrutalistSelect ariaLabel="City" value={f.city} onChange={value=>{p("city",value);p("areas",[getAreas(f.country,value)[0]||"Other"])}} options={cityOptions.map(c=>({value:c,label:c}))}/></label><div className="choiceField"><span>AREAS SERVED</span><div className="chipGrid">{areaOptions.map(a=><label className={`selectChip ${f.areas.includes(a)?"selected":""}`} key={a}><input type="checkbox" checked={f.areas.includes(a)} onChange={e=>p("areas",e.target.checked?[...f.areas,a]:f.areas.filter((x:string)=>x!==a))}/>{a}</label>)}</div></div><div className="choiceField"><span>PROPERTY TYPES</span><div className="chipGrid">{PROPERTY_TYPES.map(x=><label className={`selectChip ${f.propertyTypes.includes(x)?"selected":""}`} key={x}><input type="checkbox" checked={f.propertyTypes.includes(x)} onChange={e=>p("propertyTypes",e.target.checked?[...f.propertyTypes,x]:f.propertyTypes.filter((v:string)=>v!==x))}/>{x}</label>)}</div></div><div className="choiceField"><span>OPPORTUNITY TYPES</span><div className="chipGrid">{["buy","sell","invest","rent"].map(x=><label className={`selectChip ${f.leadTypes.includes(x)?"selected":""}`} key={x}><input type="checkbox" checked={f.leadTypes.includes(x)} onChange={e=>p("leadTypes",e.target.checked?[...f.leadTypes,x]:f.leadTypes.filter((v:string)=>v!==x))}/>{x.toUpperCase()}</label>)}</div></div></div></div>}

    {step===2&&<div className="signupStage"><div className="formStageHead"><p className="eyebrow">03 / PROFILE</p><h2>BUILD YOUR<br/><span>MARKET PROFILE.</span></h2><p>These details help us review your account and will later support your public realtor profile.</p></div><div className="formGrid"><label>EXPERIENCE <small>OPTIONAL</small><input className="field" placeholder="e.g. 6 years" value={f.experience} onChange={e=>p("experience",e.target.value)}/></label><label>WEBSITE <small>OPTIONAL</small><input className="field" placeholder="https://..." value={f.website} onChange={e=>p("website",e.target.value)}/></label><label>INSTAGRAM <small>OPTIONAL</small><input className="field" placeholder="@agency or profile URL" value={f.instagram} onChange={e=>p("instagram",e.target.value)}/></label><label>FACEBOOK <small>OPTIONAL</small><input className="field" placeholder="Profile or page URL" value={f.facebook} onChange={e=>p("facebook",e.target.value)}/></label></div><label className="fullField realtorLogoField">AGENCY LOGO <small>OPTIONAL · JPG/PNG/WEBP · MAX 4MB</small><input className="field" type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{const file=e.target.files?.[0]||null;if(file&&file.size>4*1024*1024){setError("Agency logo must be under 4MB.");e.currentTarget.value="";setLogoFile(null);return}setLogoFile(file);setError("")}}/><span className="fieldHint">{logoFile?`Selected: ${logoFile.name}`:"Stored securely in the Blueprint Buddies Drive workspace."}</span></label><label className="fullField">ABOUT YOUR WORK <small>OPTIONAL</small><textarea className="field textarea" maxLength={800} value={f.about} onChange={e=>p("about",e.target.value)} placeholder="Tell us about your areas, property segments and client types."/></label><div className="verificationNote"><ShieldCheck/><p><strong>WHY VERIFICATION?</strong><br/>Consumer contact details are protected. Realtor profiles are reviewed before marketplace access is opened.</p></div><label className="authConsent"><input type="checkbox" checked={acceptedTerms} onChange={e=>{setAcceptedTerms(e.target.checked);setError("")}}/><span>I agree to the BLUEPRINT BUDDIES <Link href="/terms" target="_blank">Terms</Link> and <Link href="/privacy" target="_blank">Privacy Policy</Link>.</span></label></div>}

    {error&&<div className="formError" role="alert">{error}</div>}
    <div className="signupActions">{step>0?<button type="button" className="backBtn" onClick={()=>{setStep(s=>s-1);setError("")}}><ArrowLeft/> BACK</button>:<span/>}{step<2?<button type="button" className="nextBtn" onClick={next}>CONTINUE <ArrowRight/></button>:<button className="nextBtn" disabled={busy}>{busy?"CREATING ACCOUNT…":"CREATE REALTOR ACCOUNT"}<ArrowRight/></button>}</div>
  </form>
}
