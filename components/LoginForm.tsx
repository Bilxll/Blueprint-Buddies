"use client";

import { useState } from "react";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase-client";
import {
  authErrorMessage,
  getSessionDestination,
  prepareAuthPersistence,
  signInWithGoogleAccount,
} from "@/lib/auth-client";
import { ArrowRight, Eye, EyeOff, MailCheck } from "lucide-react";
import Link from "next/link";

export function LoginForm(){
  const[email,setEmail]=useState("");
  const[password,setPassword]=useState("");
  const[error,setError]=useState("");
  const[notice,setNotice]=useState("");
  const[busy,setBusy]=useState(false);
  const[googleBusy,setGoogleBusy]=useState(false);
  const[show,setShow]=useState(false);

  async function routeUser(user:any){
    const session=await getSessionDestination(user);
    if(session.role==="admin"){location.href="/admin";return;}
    if(session.role==="realtor"){location.href="/realtor/dashboard";return;}
    location.href="/join-realtor?complete=1";
  }

  async function submit(e:React.FormEvent){
    e.preventDefault();setError("");setNotice("");setBusy(true);
    try{
      await prepareAuthPersistence();
      const cred=await signInWithEmailAndPassword(firebaseAuth,email.trim(),password);
      await routeUser(cred.user);
    }
    catch(e){setError(authErrorMessage(e,"Could not sign in. Check your email and password."));}
    finally{setBusy(false)}
  }

  async function googleSignIn(){
    setError("");setNotice("");setGoogleBusy(true);
    try{
      const cred=await signInWithGoogleAccount();
      await routeUser(cred.user);
    }catch(e){setError(authErrorMessage(e,"Could not sign in with Google."));}
    finally{setGoogleBusy(false)}
  }

  async function reset(){
    setError("");setNotice("");
    if(!/^\S+@\S+\.\S+$/.test(email)){setError("Enter your account email first, then choose reset password.");return;}
    try{
      await prepareAuthPersistence();
      await sendPasswordResetEmail(firebaseAuth,email.trim());
      setNotice("Password reset email sent. Check your inbox.");
    }
    catch(e){setError(authErrorMessage(e,"Could not send a reset email. Confirm the email and try again."));}
  }

  return <form className="loginForm" onSubmit={submit}>
    <div className="loginFormHead"><p className="eyebrow">SECURE ACCESS</p><h2>REALTOR LOGIN</h2><p>Sign in with Google or the email connected to your realtor account.</p></div>

    <button type="button" className="googleAuthButton" onClick={googleSignIn} disabled={googleBusy||busy}>
      <span className="googleMark" aria-hidden="true">G</span>
      <span>{googleBusy?"CONNECTING…":"CONTINUE WITH GOOGLE"}</span>
      <ArrowRight size={18}/>
    </button>

    <div className="authDivider"><span>OR SIGN IN WITH EMAIL</span></div>

    <label>EMAIL<input className="field" autoComplete="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@agency.com" required/></label>
    <label>PASSWORD<div className="passwordField"><input className="field" autoComplete="current-password" type={show?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} required/><button type="button" onClick={()=>setShow(v=>!v)} aria-label={show?"Hide password":"Show password"}>{show?<EyeOff/>:<Eye/>}</button></div></label>
    <button type="button" className="resetLink" onClick={reset}>FORGOT PASSWORD?</button>
    {notice&&<div className="formNotice"><MailCheck size={17}/>{notice}</div>}
    {error&&<div className="formError" role="alert">{error}</div>}
    <button className="nextBtn wideBtn" disabled={busy||googleBusy}>{busy?"SIGNING IN…":"SIGN IN WITH EMAIL"} <ArrowRight/></button>
    <p className="loginSwitch">NEW TO THE REALTOR NETWORK? <Link href="/join-realtor">CREATE AN ACCOUNT →</Link></p>
  </form>
}
