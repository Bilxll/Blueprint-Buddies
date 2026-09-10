"use client";

import { useEffect,useMemo,useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase-client";
import { ArrowUpRight, BriefcaseBusiness, CheckCircle2, Flame, LogOut, MapPin, MessageCircle, RefreshCw, Search, SlidersHorizontal, UserRoundCheck } from "lucide-react";

const CRM_STAGES=[
  ["new","NEW"],["contacted","CONTACTED"],["responded","RESPONDED"],["qualified","QUALIFIED"],["viewing_scheduled","VIEWING"],["negotiating","NEGOTIATING"],["won","WON"],["lost","LOST"],["invalid","INVALID"],["no_response","NO RESPONSE"]
] as const;

function money(n:number){if(!n)return "Budget open";return `PKR ${new Intl.NumberFormat("en-PK").format(n)}`}
function daysAgo(value?:string){if(!value)return "";const diff=Math.max(0,Date.now()-new Date(value).getTime());const d=Math.floor(diff/86400000);if(d===0)return "TODAY";if(d===1)return "1 DAY AGO";return `${d} DAYS AGO`}
function whatsappHref(phone:string){let n=String(phone||"").replace(/\D/g,"");if(n.startsWith("0"))n=`92${n.slice(1)}`;return `https://wa.me/${n}`}

export function RealtorDashboard(){
  const[loading,setLoading]=useState(true);
  const[leads,setLeads]=useState<any[]>([]);
  const[claimed,setClaimed]=useState<any[]>([]);
  const[pending,setPending]=useState(false);
  const[notice,setNotice]=useState("");
  const[realtor,setRealtor]=useState<any>(null);
  const[tab,setTab]=useState<"discover"|"claimed">("discover");
  const[type,setType]=useState("all");
  const[temp,setTemp]=useState("all");
  const[query,setQuery]=useState("");
  const[busyId,setBusyId]=useState("");

  async function token(){const u=firebaseAuth.currentUser;if(!u)throw new Error("NO_USER");return u.getIdToken();}
  async function load(){
    setLoading(true);
    try{
      const t=await token();
      const [a,b]=await Promise.all([fetch("/api/realtor/leads",{headers:{authorization:`Bearer ${t}`}}),fetch("/api/realtor/claimed",{headers:{authorization:`Bearer ${t}`}})]);
      const aj=await a.json();const bj=await b.json();
      if(!a.ok) throw new Error(aj.error||"Could not load your marketplace.");
      setPending(!!aj.pendingVerification);setRealtor(aj.realtor||null);setLeads(aj.leads||[]);setClaimed(bj.claimed||[]);
    }catch{location.href="/login"}finally{setLoading(false)}
  }
  useEffect(()=>onAuthStateChanged(firebaseAuth,u=>{if(!u)location.href="/login";else load()}),[]);

  const filtered=useMemo(()=>leads.filter(l=>{
    const q=query.trim().toLowerCase();
    return (type==="all"||l.type===type)&&(temp==="all"||l.temperature===temp)&&(!q||`${l.area} ${l.city} ${l.propertyType}`.toLowerCase().includes(q));
  }),[leads,type,temp,query]);

  const hot=leads.filter(l=>l.temperature==="hot").length;
  const activeClaims=claimed.filter(x=>!["won","lost","invalid"].includes(x.claim?.status)).length;

  async function claim(id:string){
    setBusyId(id);setNotice("");
    try{const t=await token();const r=await fetch("/api/realtor/claims",{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${t}`},body:JSON.stringify({leadId:id})});const j=await r.json();setNotice(j.ok?"Opportunity claimed — contact details are now available in My Leads.":j.error);if(j.ok){setTab("claimed");await load();}}
    catch{setNotice("Could not claim this opportunity.")}finally{setBusyId("")}
  }

  async function updateClaim(claimId:string,patch:any){
    setBusyId(claimId);setNotice("");
    try{const t=await token();const r=await fetch("/api/realtor/claimed",{method:"PATCH",headers:{"content-type":"application/json",authorization:`Bearer ${t}`},body:JSON.stringify({claimId,...patch})});const j=await r.json();if(!r.ok)throw new Error(j.error);setClaimed(rows=>rows.map(x=>x.claim?.id===claimId?{...x,claim:{...x.claim,...patch}}:x));setNotice("Lead updated.");}
    catch(e:any){setNotice(e.message||"Could not update lead.")}finally{setBusyId("")}
  }

  async function feedback(leadId:string,valid:boolean){
    setBusyId(`feedback-${leadId}`);setNotice("");
    try{const t=await token();const r=await fetch("/api/realtor/feedback",{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${t}`},body:JSON.stringify({leadId,valid,reason:valid?"valid":"quality_issue"})});const j=await r.json();if(!r.ok)throw new Error(j.error);setNotice("Thanks — your lead-quality feedback was recorded.");}
    catch(e:any){setNotice(e.message||"Could not submit feedback.")}finally{setBusyId("")}
  }

  return <div className="portalShell">
    <header className="portalTopbar"><a className="portalBrand" href="/">CREAIONX <span>PROPERTY</span></a><div><span className="portalIdentity"><UserRoundCheck size={15}/>{realtor?.fullName||firebaseAuth.currentUser?.email||"REALTOR"}</span><button onClick={()=>signOut(firebaseAuth).then(()=>location.href="/")}><LogOut size={16}/> LOG OUT</button></div></header>

    <main className="dashboardShell">
      <header className="dashHeader"><div><p className="eyebrow">REALTOR PORTAL / BETA</p><h1>YOUR<br/><span>MARKET.</span></h1></div><div className="dashHeaderAside"><p>Qualified property opportunities matched to your approved territories.</p><button onClick={load}><RefreshCw size={16}/> REFRESH DATA</button></div></header>

      {notice&&<div className="notice" role="status">{notice}<button onClick={()=>setNotice("")}>×</button></div>}
      {loading?<div className="portalLoading"><span/><p>Loading your territory…</p></div>:pending?<div className="pendingBox"><p className="eyebrow">VERIFICATION PENDING</p><h2>YOUR MARKETPLACE<br/><span>ACCESS IS LOCKED.</span></h2><p>We review realtor profiles before exposing property opportunities or consumer contact information. You can return to this portal after approval.</p></div>:<>
        <section className="dashboardStats">
          <article><span>AVAILABLE</span><strong>{leads.length}</strong><p>matching opportunities</p></article>
          <article><span>HOT NOW</span><strong>{hot}</strong><p>high-intent opportunities</p></article>
          <article><span>MY LEADS</span><strong>{claimed.length}</strong><p>claimed to date</p></article>
          <article><span>ACTIVE</span><strong>{activeClaims}</strong><p>still in your pipeline</p></article>
        </section>

        <div className="dashboardTabs"><button className={tab==="discover"?"active":""} onClick={()=>setTab("discover")}><BriefcaseBusiness/> DISCOVER <span>{leads.length}</span></button><button className={tab==="claimed"?"active":""} onClick={()=>setTab("claimed")}><CheckCircle2/> MY LEADS <span>{claimed.length}</span></button></div>

        {tab==="discover"&&<section className="dashboardSection">
          <div className="sectionLine"><div><p className="eyebrow">MATCHED TO YOUR TERRITORY</p><h2>AVAILABLE</h2></div><span>{filtered.length} SHOWN</span></div>
          <div className="leadToolbar"><label><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search area or property type"/></label><div><SlidersHorizontal size={16}/><select value={type} onChange={e=>setType(e.target.value)}><option value="all">ALL TYPES</option><option value="buy">BUYERS</option><option value="sell">SELLERS</option><option value="invest">INVESTORS</option><option value="rent">RENTALS</option></select><select value={temp} onChange={e=>setTemp(e.target.value)}><option value="all">ALL INTENT</option><option value="hot">HOT</option><option value="warm">WARM</option><option value="future">FUTURE</option><option value="needs_verification">NEEDS VERIFY</option></select></div></div>
          <div className="leadGrid">{filtered.map(l=><article className="leadCard" key={l.id}><div className="leadTop"><span className={`temp ${l.temperature}`}><Flame size={14}/>{l.temperature.replace("_"," ")}</span><span>{daysAgo(l.createdAt)}</span></div><div className="leadLocation"><span>{l.type.toUpperCase()}</span><h3>{l.area}<br/><b>{l.city}</b></h3></div><div className="leadMeta"><p><MapPin size={15}/>{l.propertyType} · {l.size||"Size open"}</p><p className="leadBudget">{money(l.budgetMax||l.budgetMin)}</p><p>{l.paymentMode||"Payment open"} · {l.timeframe}</p><p className={l.verificationStatus==="verified"?"verifiedText":"mutedText"}>{l.verificationStatus==="verified"?"✓ CONTACT VERIFIED":"CONTACT NOT YET VERIFIED"}</p></div><div className="claimAvailability"><span>{Math.max(0,(l.maxClaims||3)-(l.claimCount||0))}</span> claim slot{Math.max(0,(l.maxClaims||3)-(l.claimCount||0))===1?"":"s"} remaining</div><button disabled={busyId===l.id} className="claimBtn" onClick={()=>claim(l.id)}>{busyId===l.id?"CLAIMING…":"CLAIM OPPORTUNITY"}<ArrowUpRight size={16}/></button></article>)}</div>
          {!filtered.length&&<div className="emptyBox"><strong>NO MATCHES IN THIS VIEW.</strong><p>Try removing a filter or check again when new opportunities enter your territory.</p></div>}
        </section>}

        {tab==="claimed"&&<section className="dashboardSection claimedSection"><div className="sectionLine"><div><p className="eyebrow">YOUR ACTIVE PIPELINE</p><h2>MY LEADS</h2></div><span>{claimed.length} CLAIMED</span></div>{claimed.length?<div className="claimedList">{claimed.map((x:any)=><article key={x.claim.id} className="claimedRow"><div className="claimedLeadMain"><div className="claimedLeadTitle"><span>{x.lead?.type?.toUpperCase()||"LEAD"}</span><h3>{x.lead?.name||"Lead unavailable"}</h3><p>{x.lead?.area} · {x.lead?.city} · {x.lead?.propertyType}</p></div><div className="claimedContact"><strong>{x.lead?.phone||"No phone"}</strong>{x.lead?.phone&&<a target="_blank" rel="noreferrer" href={whatsappHref(x.lead.phone)}><MessageCircle size={16}/> OPEN WHATSAPP</a>} {x.lead?.email&&<span>{x.lead.email}</span>}</div></div><div className="crmControls"><label>PIPELINE STAGE<select value={x.claim?.status||"new"} onChange={e=>updateClaim(x.claim.id,{status:e.target.value})} disabled={busyId===x.claim.id}>{CRM_STAGES.map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label><label>PRIVATE NOTES<textarea defaultValue={x.claim?.notes||""} placeholder="Add call notes, property shown, next step…" onBlur={e=>{if(e.target.value!==x.claim?.notes) updateClaim(x.claim.id,{notes:e.target.value})}}/></label>{x.lead&&<div className="leadFeedback"><span>WAS THIS LEAD VALID?</span><button disabled={busyId===`feedback-${x.lead.id}`} onClick={()=>feedback(x.lead.id,true)}>YES</button><button disabled={busyId===`feedback-${x.lead.id}`} onClick={()=>feedback(x.lead.id,false)}>NO</button></div>}</div></article>)}</div>:<div className="emptyBox"><strong>YOUR PIPELINE IS EMPTY.</strong><p>Claim a matching opportunity from Discover and the protected contact details will appear here.</p><button className="textButton" onClick={()=>setTab("discover")}>BROWSE AVAILABLE LEADS →</button></div>}</section>}
      </>}
    </main>
  </div>
}
