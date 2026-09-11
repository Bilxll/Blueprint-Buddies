"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Clock3, Copy, Search, ShieldCheck } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

function labelStatus(lead:any){
  if(lead.status==="rejected") return ["CLOSED","This requirement was not approved for matching."];
  if(lead.status==="archived") return ["ARCHIVED","This requirement is no longer active."];
  if(lead.verificationStatus==="verified" && lead.status==="verified" && lead.claimCount>0) return ["MATCHING ACTIVE",`${lead.claimCount} realtor${lead.claimCount===1?" has":"s have"} claimed this opportunity.`];
  if(lead.verificationStatus==="verified" && lead.status==="verified") return ["VERIFIED","Your requirement is approved and available to matching realtors."];
  if(lead.verificationStatus==="flagged" || lead.status==="flagged") return ["NEEDS REVIEW","Our operations team is reviewing a detail before matching continues."];
  return ["IN REVIEW","Your requirement is in the verification queue."];
}

export default function TrackPage(){
  const[leadId,setLeadId]=useState("");const[phone,setPhone]=useState("");const[busy,setBusy]=useState(false);const[error,setError]=useState("");const[result,setResult]=useState<any>(null);
  useEffect(()=>{try{setLeadId(localStorage.getItem("bb:lastLeadId")||"");setPhone(localStorage.getItem("bb:lastLeadPhone")||"")}catch{}},[]);
  async function lookup(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");setResult(null);try{const r=await fetch("/api/track",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({leadId:leadId.trim(),phone:phone.trim()})});const j=await r.json();if(!r.ok)throw new Error(j.error||"Could not find that requirement.");setResult(j.lead);try{localStorage.setItem("bb:lastLeadId",leadId.trim());localStorage.setItem("bb:lastLeadPhone",phone.trim())}catch{}}catch(e:any){setError(e.message||"Could not find that requirement.")}finally{setBusy(false)}}
  async function copy(){try{await navigator.clipboard.writeText(leadId)}catch{}}
  const status=result?labelStatus(result):null;
  return <><Nav/><main className="trackPage"><section className="trackHero"><p className="eyebrow">PRIVATE REQUIREMENT TRACKING</p><h1>TRACK YOUR<br/><span>PROPERTY BRIEF.</span></h1><p>Use the private reference from your submission and the same phone number you entered. No consumer account is required.</p></section><section className="trackGrid"><form className="trackForm" onSubmit={lookup}><label>REFERENCE<input className="field" value={leadId} onChange={e=>setLeadId(e.target.value.toUpperCase())} placeholder="LEAD_..." required/></label><label>ORIGINAL PHONE / WHATSAPP<input className="field" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="03XX XXXXXXX" inputMode="tel" required/></label>{error&&<div className="formError" role="alert">{error}</div>}<button className="nextBtn" disabled={busy}>{busy?"CHECKING…":"CHECK STATUS"}<Search size={18}/></button><div className="privacyNote enhancedPrivacy"><ShieldCheck size={18}/><div><strong>PRIVATE LOOKUP</strong><p>Tracking never exposes your contact details or any realtor contact information.</p></div></div></form>{result&&status&&<article className="trackResult"><div className="trackResultTop"><span>{status[0]}</span><CheckCircle2/></div><p className="eyebrow">{result.id}</p><h2>{String(result.type).toUpperCase()} · {result.area}</h2><p>{result.propertyType} · {result.city} · {result.timeframe}</p><div className="trackStatusCopy"><Clock3/><p><strong>{status[0]}</strong><br/>{status[1]}</p></div><dl><div><dt>VERIFICATION</dt><dd>{String(result.verificationStatus).replaceAll("_"," ").toUpperCase()}</dd></div><div><dt>MATCHES CLAIMED</dt><dd>{result.claimCount}</dd></div><div><dt>SUBMITTED</dt><dd>{new Date(result.createdAt).toLocaleDateString("en-PK")}</dd></div></dl><button className="textButton" onClick={copy}><Copy size={15}/> COPY REFERENCE</button><a className="secondaryLink" href="/get-started">SUBMIT ANOTHER REQUIREMENT <ArrowRight size={16}/></a></article>}</section></main><Footer/></>
}
