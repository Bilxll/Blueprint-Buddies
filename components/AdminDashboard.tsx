"use client";

import { useEffect,useMemo,useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase-client";
import { CheckCircle2, Flame, LogOut, RefreshCw, Search, ShieldCheck, UserRoundCheck, UsersRound, AlertCircle, X } from "lucide-react";

export function AdminDashboard(){
  const[leads,setLeads]=useState<any[]>([]);
  const[realtors,setRealtors]=useState<any[]>([]);
  const[error,setError]=useState("");
  const[notice,setNotice]=useState("");
  const[loading,setLoading]=useState(true);
  const[query,setQuery]=useState("");
  const[actionOnly,setActionOnly]=useState(true);
  const[tab,setTab]=useState<"realtors"|"leads">("realtors");
  const[busy,setBusy]=useState("");

  async function tok(){const u=firebaseAuth.currentUser;if(!u)throw new Error();return u.getIdToken()}
  async function load(){setLoading(true);setError("");try{const t=await tok();const[a,b]=await Promise.all([fetch("/api/admin/leads",{headers:{authorization:`Bearer ${t}`}}),fetch("/api/admin/realtors",{headers:{authorization:`Bearer ${t}`}})]);const aj=await a.json(),bj=await b.json();if(!a.ok||!b.ok)throw new Error("Admin access denied");setLeads(aj.leads||[]);setRealtors(bj.realtors||[])}catch(e:any){setError(e.message||"Admin access denied")}finally{setLoading(false)}}
  useEffect(()=>onAuthStateChanged(firebaseAuth,u=>u?load():location.href="/login"),[]);
  async function verify(id:string,status:string){setBusy(id);setNotice("");try{const t=await tok();const r=await fetch("/api/admin/realtors",{method:"PATCH",headers:{"content-type":"application/json",authorization:`Bearer ${t}`},body:JSON.stringify({realtorId:id,verificationStatus:status})});if(!r.ok)throw new Error();setNotice(status==="verified"?"Realtor verified and marketplace access opened.":"Realtor application rejected.");await load()}catch{setNotice("Could not update this realtor.")}finally{setBusy("")}}
  async function verifyLead(id:string){setBusy(id);setNotice("");try{const t=await tok();const r=await fetch("/api/admin/leads",{method:"PATCH",headers:{"content-type":"application/json",authorization:`Bearer ${t}`},body:JSON.stringify({leadId:id,verificationStatus:"verified",status:"verified"})});if(!r.ok)throw new Error();setNotice("Lead contact marked verified.");await load()}catch{setNotice("Could not verify this lead.")}finally{setBusy("")}}
  async function rejectLead(id:string){setBusy(id);setNotice("");try{const t=await tok();const r=await fetch("/api/admin/leads",{method:"PATCH",headers:{"content-type":"application/json",authorization:`Bearer ${t}`},body:JSON.stringify({leadId:id,verificationStatus:"rejected",status:"rejected"})});if(!r.ok)throw new Error();setNotice("Lead rejected and removed from marketplace eligibility.");await load()}catch{setNotice("Could not reject this lead.")}finally{setBusy("")}}

  async function adjustCredits(id:string,amount:number){setBusy(id);setNotice("");try{const t=await tok();const r=await fetch("/api/admin/realtors",{method:"PATCH",headers:{"content-type":"application/json",authorization:`Bearer ${t}`},body:JSON.stringify({realtorId:id,creditAdjustment:amount,note:"Beta test credit top-up"})});const j=await r.json();if(!r.ok)throw new Error(j.error||"Could not adjust credits");setNotice(`${amount>0?"Added":"Adjusted"} ${Math.abs(amount)} test credits.`);await load()}catch(e:any){setNotice(e.message||"Could not adjust credits.")}finally{setBusy("")}}

  const pendingRealtors=realtors.filter(r=>r.verificationStatus==="pending").length;
  const unverifiedLeads=leads.filter(l=>l.verificationStatus!=="verified").length;
  const hotLeads=leads.filter(l=>l.temperature==="hot").length;
  const verifiedLeads=leads.filter(l=>l.verificationStatus==="verified").length;
  const q=query.trim().toLowerCase();
  const filteredRealtors=useMemo(()=>realtors.filter(r=>(!actionOnly||r.verificationStatus==="pending")&&(!q||`${r.fullName} ${r.agencyName} ${r.city} ${(r.areas||[]).join(" ")}`.toLowerCase().includes(q))).sort((a,b)=>(a.verificationStatus==="pending"?0:1)-(b.verificationStatus==="pending"?0:1)),[realtors,q,actionOnly]);
  const filteredLeads=useMemo(()=>leads.filter(l=>(!actionOnly||l.verificationStatus!=="verified")&&(!q||`${l.name} ${l.phone} ${l.type} ${l.area} ${l.city}`.toLowerCase().includes(q))),[leads,q,actionOnly]);
  const queueCount=tab==="realtors"?pendingRealtors:unverifiedLeads;

  if(error)return <div className="adminShell adminDenied"><p className="eyebrow">ADMIN</p><h1>ACCESS<br/>DENIED.</h1><p className="errorText">{error}</p><a href="/login">RETURN TO LOGIN →</a></div>;

  return <div className="portalShell adminPortal">
    <header className="portalTopbar"><a className="portalBrand" href="/">BLUEPRINT <span>BUDDIES</span></a><div><span className="portalIdentity"><ShieldCheck size={15}/> OPERATIONS</span><button onClick={()=>signOut(firebaseAuth).then(()=>location.href="/")}><LogOut size={16}/> LOG OUT</button></div></header>
    <main className="adminShell">
      <header className="adminHero"><div><p className="eyebrow">OPERATIONS / BETA</p><h1>CONTROL<br/><span>THE MARKET.</span></h1></div><button className="outlineAction" onClick={load}><RefreshCw size={16}/> REFRESH</button></header>
      <section className="opsQueueBar"><div><AlertCircle/><span><strong>{pendingRealtors+unverifiedLeads}</strong> ITEMS NEED ACTION</span></div><p>{pendingRealtors} realtor review{pendingRealtors===1?"":"s"} · {unverifiedLeads} lead verification{unverifiedLeads===1?"":"s"}</p></section>
      {notice&&<div className="notice" role="status">{notice}<button onClick={()=>setNotice("")} aria-label="Dismiss"><X size={16}/></button></div>}
      <section className="dashboardStats adminStatsGrid"><article><UsersRound/><span>REALTORS</span><strong>{realtors.length}</strong><p>{pendingRealtors} awaiting review</p></article><article><UserRoundCheck/><span>LEADS</span><strong>{leads.length}</strong><p>{unverifiedLeads} need verification</p></article><article><Flame/><span>HOT INTENT</span><strong>{hotLeads}</strong><p>currently scored hot</p></article><article><CheckCircle2/><span>VERIFIED</span><strong>{verifiedLeads}</strong><p>lead contacts verified</p></article></section>
      <div className="dashboardTabs"><button className={tab==="realtors"?"active":""} onClick={()=>{setTab("realtors");setQuery("")}}>REALTOR VERIFICATION <span>{pendingRealtors}</span></button><button className={tab==="leads"?"active":""} onClick={()=>{setTab("leads");setQuery("")}}>LEAD REVIEW <span>{unverifiedLeads}</span></button></div>
      <div className="adminToolbar"><label><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={tab==="realtors"?"Search realtor, agency or area":"Search lead, phone or area"}/></label><label className="actionToggle"><input type="checkbox" checked={actionOnly} onChange={e=>setActionOnly(e.target.checked)}/><span>ACTION REQUIRED ONLY</span></label></div>
      {loading?<div className="portalLoading"><span/><p>Loading operations…</p></div>:tab==="realtors"?<section><div className="sectionLine"><div><p className="eyebrow">ACCOUNT ACCESS</p><h2>REALTORS</h2></div><span>{filteredRealtors.length} SHOWN / {queueCount} PENDING</span></div><div className="adminTable">{filteredRealtors.map(r=><article className="adminRow" key={r.id}><div><strong>{r.fullName}</strong><span>{r.agencyName} · {r.city}</span><small>{r.areas?.join(" · ")||"No areas selected"} · {Number(r.creditsBalance||0)} credits</small></div><span className={`statusPill status-${r.verificationStatus}`}>{r.verificationStatus}</span><div>{r.verificationStatus==="pending"?<><button disabled={busy===r.id} onClick={()=>verify(r.id,"verified")}>VERIFY</button><button disabled={busy===r.id} className="dangerButton" onClick={()=>verify(r.id,"rejected")}>REJECT</button></>:<><button disabled={busy===r.id} onClick={()=>adjustCredits(r.id,10)}>+10 CREDITS</button><span className="adminResolved">{String(r.subscriptionStatus||"beta").replaceAll("_"," ")}</span></>}</div></article>)}</div>{!filteredRealtors.length&&<div className="emptyBox"><strong>{actionOnly?"REALTOR QUEUE IS CLEAR.":"NO REALTORS MATCH."}</strong><p>{actionOnly?"There are no pending realtor applications requiring review.":"Try a different search."}</p></div>}</section>:<section><div className="sectionLine"><div><p className="eyebrow">CONTACT QUALITY</p><h2>LEADS</h2></div><span>{filteredLeads.length} SHOWN / {queueCount} PENDING</span></div><div className="adminTable">{filteredLeads.slice(0,100).map(l=><article className="adminRow" key={l.id}><div><strong>{l.type?.toUpperCase()} · {l.area}</strong><span>{l.name} · {l.phone}</span><small>{l.propertyType} · {l.timeframe} · {l.city}</small></div><span className={`statusPill ${l.temperature}`}>{l.temperature} / {l.verificationStatus}</span><div>{l.verificationStatus==="unverified"?<><button disabled={busy===l.id} onClick={()=>verifyLead(l.id)}>VERIFY CONTACT</button><button disabled={busy===l.id} className="dangerButton" onClick={()=>rejectLead(l.id)}>REJECT</button></>:l.verificationStatus==="verified"?<span className="verifiedLabel">✓ VERIFIED</span>:<span className="adminResolved">{String(l.verificationStatus).toUpperCase()}</span>}</div></article>)}</div>{!filteredLeads.length&&<div className="emptyBox"><strong>{actionOnly?"LEAD QUEUE IS CLEAR.":"NO LEADS MATCH."}</strong><p>{actionOnly?"There are no lead contacts waiting for verification.":"Try a different search."}</p></div>}</section>}
    </main>
  </div>
}
