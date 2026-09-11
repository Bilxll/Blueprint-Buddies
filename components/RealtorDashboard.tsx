"use client";

import { useEffect,useMemo,useState } from "react";
import { onAuthStateChanged, sendEmailVerification, signOut } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase-client";
import { ArrowUpRight, BriefcaseBusiness, CheckCircle2, Coins, Copy, Flame, LogOut, MapPin, MessageCircle, RefreshCw, Search, SlidersHorizontal, UserRoundCheck, X } from "lucide-react";
import { BrutalistSelect } from "@/components/BrutalistSelect";

const CRM_STAGES=[
  ["new","NEW"],["contacted","CONTACTED"],["responded","RESPONDED"],["qualified","QUALIFIED"],["viewing_scheduled","VIEWING"],["negotiating","NEGOTIATING"],["won","WON"],["lost","LOST"],["invalid","INVALID"],["no_response","NO RESPONSE"]
] as const;

const TEMP_WEIGHT:Record<string,number>={hot:0,warm:1,future:2,needs_verification:3};
function money(n:number){if(!n)return "Open";return `PKR ${new Intl.NumberFormat("en-PK").format(n)}`}
function moneyRange(l:any){if(l.type==="sell"&&l.expectedPrice)return money(l.expectedPrice);if(l.budgetMin&&l.budgetMax)return `${money(l.budgetMin)} — ${money(l.budgetMax)}`;return money(l.budgetMax||l.budgetMin)}
function daysAgo(value?:string){if(!value)return "";const diff=Math.max(0,Date.now()-new Date(value).getTime());const d=Math.floor(diff/86400000);if(d===0)return "TODAY";if(d===1)return "1 DAY AGO";return `${d} DAYS AGO`}
function whatsappHref(phone:string){let n=String(phone||"").replace(/\D/g,"");if(n.startsWith("0"))n=`92${n.slice(1)}`;return `https://wa.me/${n}`}

export function RealtorDashboard(){
  const[loading,setLoading]=useState(true);
  const[leads,setLeads]=useState<any[]>([]);
  const[claimed,setClaimed]=useState<any[]>([]);
  const[pending,setPending]=useState(false);
  const[emailPending,setEmailPending]=useState(false);
  const[notice,setNotice]=useState("");
  const[realtor,setRealtor]=useState<any>(null);
  const[tab,setTab]=useState<"discover"|"claimed">("discover");
  const[type,setType]=useState("all");
  const[temp,setTemp]=useState("all");
  const[sort,setSort]=useState("recommended");
  const[query,setQuery]=useState("");
  const[busyId,setBusyId]=useState("");

  async function token(force=false){const u=firebaseAuth.currentUser;if(!u)throw new Error("NO_USER");return u.getIdToken(force);}
  async function load(){
    setLoading(true);
    try{
      await firebaseAuth.currentUser?.reload();
      const t=await token(true);
      const [a,b]=await Promise.all([fetch("/api/realtor/leads",{headers:{authorization:`Bearer ${t}`}}),fetch("/api/realtor/claimed",{headers:{authorization:`Bearer ${t}`}})]);
      const aj=await a.json();const bj=await b.json();
      if(!a.ok) throw new Error(aj.error||"Could not load your marketplace.");
      setEmailPending(!!aj.pendingEmailVerification);setPending(!!aj.pendingVerification);setRealtor(aj.realtor||null);setLeads(aj.leads||[]);setClaimed(bj.claimed||[]);
    }catch{location.href="/login"}finally{setLoading(false)}
  }
  useEffect(()=>onAuthStateChanged(firebaseAuth,u=>{if(!u)location.href="/login";else load()}),[]);

  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase();
    const rows=leads.filter(l=>(type==="all"||l.type===type)&&(temp==="all"||l.temperature===temp)&&(!q||`${l.area} ${l.city} ${l.propertyType}`.toLowerCase().includes(q)));
    return [...rows].sort((a,b)=>{
      if(sort==="newest")return String(b.createdAt||"").localeCompare(String(a.createdAt||""));
      if(sort==="least_claimed")return (a.claimCount||0)-(b.claimCount||0)||String(b.createdAt||"").localeCompare(String(a.createdAt||""));
      return (TEMP_WEIGHT[a.temperature]??9)-(TEMP_WEIGHT[b.temperature]??9)||String(b.createdAt||"").localeCompare(String(a.createdAt||""));
    });
  },[leads,type,temp,query,sort]);

  const hot=leads.filter(l=>l.temperature==="hot").length;
  const activeClaims=claimed.filter(x=>!["won","lost","invalid"].includes(x.claim?.status)).length;
  const wonClaims=claimed.filter(x=>x.claim?.status==="won").length;
  const hasFilters=type!=="all"||temp!=="all"||query!==""||sort!=="recommended";

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


  async function resendVerification(){
    setNotice("");
    const user=firebaseAuth.currentUser;
    if(!user){location.href="/login";return;}
    try{await sendEmailVerification(user);setNotice("Verification email sent. Check your inbox, then refresh this page after verifying.");}
    catch(e:any){setNotice(e?.code?.includes("too-many-requests")?"Too many verification emails requested. Wait a moment and try again.":"Could not send the verification email.");}
  }

  async function copyPhone(phone:string){
    try{await navigator.clipboard.writeText(phone);setNotice("Phone number copied.");}catch{setNotice("Could not copy the phone number.");}
  }

  return <div className="portalShell">
    <header className="portalTopbar"><a className="portalBrand" href="/">BLUEPRINT <span>BUDDIES</span></a><div><span className="portalIdentity"><UserRoundCheck size={15}/>{realtor?.fullName||firebaseAuth.currentUser?.email||"REALTOR"}</span><button onClick={()=>signOut(firebaseAuth).then(()=>location.href="/")}><LogOut size={16}/> LOG OUT</button></div></header>

    <main className="dashboardShell">
      <header className="dashHeader"><div><p className="eyebrow">REALTOR PORTAL / BETA</p><h1>YOUR<br/><span>MARKET.</span></h1></div><div className="dashHeaderAside"><p>Qualified property opportunities matched to your approved territories.</p><button onClick={load}><RefreshCw size={16}/> REFRESH DATA</button></div></header>

      {realtor&&<section className="accountContext" aria-label="Realtor access summary"><div><span>ACCESS</span><strong>{emailPending?"EMAIL VERIFY":pending?"PENDING":"BETA ACTIVE"}</strong></div><div><span>CITY</span><strong>{realtor.city||"—"}</strong></div><div className="accountContextWide"><span>TERRITORIES</span><strong>{(realtor.areas||[]).length?(realtor.areas||[]).join(" · "):"NOT SET"}</strong></div><div><span>CREDITS</span><strong>{realtor.creditsBalance??0}</strong></div><div><span>PLAN</span><strong>{String(realtor.planId||"beta").toUpperCase()}</strong></div><a className="accountContextBilling" href="/realtor/billing"><Coins size={16}/><span>TEST BILLING</span><strong>MANAGE →</strong></a></section>}

      {notice&&<div className="notice" role="status">{notice}<button onClick={()=>setNotice("")} aria-label="Dismiss notification"><X size={16}/></button></div>}
      {loading?<div className="portalLoading"><span/><p>Loading your territory…</p></div>:emailPending?<div className="pendingBox"><p className="eyebrow">EMAIL VERIFICATION REQUIRED</p><h2>VERIFY YOUR<br/><span>EMAIL ADDRESS.</span></h2><p>We protect consumer contact information behind verified realtor accounts. Open the verification link sent to your email, then refresh your portal.</p><div className="pendingActions"><button className="nextBtn" onClick={resendVerification}>RESEND EMAIL</button><button className="backBtn" onClick={load}>I VERIFIED — REFRESH</button></div></div>:pending?<div className="pendingBox"><p className="eyebrow">REALTOR REVIEW PENDING</p><h2>YOUR MARKETPLACE<br/><span>ACCESS IS LOCKED.</span></h2><p>Your email is verified. We now review the realtor profile before exposing property opportunities or consumer contact information. Return to this portal after approval.</p></div>:<>
        <section className="dashboardStats">
          <article><span>AVAILABLE</span><strong>{leads.length}</strong><p>matching opportunities</p></article>
          <article><span>HOT NOW</span><strong>{hot}</strong><p>high-intent opportunities</p></article>
          <article><span>MY LEADS</span><strong>{claimed.length}</strong><p>claimed to date</p></article>
          <article><span>ACTIVE</span><strong>{activeClaims}</strong><p>still in your pipeline</p></article>
        </section>

        <div className="dashboardTabs"><button className={tab==="discover"?"active":""} onClick={()=>setTab("discover")}><BriefcaseBusiness/> DISCOVER <span>{leads.length}</span></button><button className={tab==="claimed"?"active":""} onClick={()=>setTab("claimed")}><CheckCircle2/> MY LEADS <span>{claimed.length}</span></button></div>

        {tab==="discover"&&<section className="dashboardSection">
          <div className="sectionLine"><div><p className="eyebrow">MATCHED TO YOUR TERRITORY</p><h2>AVAILABLE</h2></div><span>{filtered.length} SHOWN</span></div>
          <div className="leadToolbar"><label><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search area or property type"/></label><div><SlidersHorizontal size={16}/><BrutalistSelect variant="compact" ariaLabel="Lead type" value={type} onChange={setType} options={[{value:"all",label:"ALL TYPES"},{value:"buy",label:"BUYERS"},{value:"sell",label:"SELLERS"},{value:"invest",label:"INVESTORS"},{value:"rent",label:"RENTALS"}]}/><BrutalistSelect variant="compact" ariaLabel="Lead intent" value={temp} onChange={setTemp} options={[{value:"all",label:"ALL INTENT"},{value:"hot",label:"HOT"},{value:"warm",label:"WARM"},{value:"future",label:"FUTURE"},{value:"needs_verification",label:"NEEDS VERIFY"}]}/><BrutalistSelect variant="compact" ariaLabel="Sort opportunities" value={sort} onChange={setSort} options={[{value:"recommended",label:"HOT FIRST"},{value:"newest",label:"NEWEST"},{value:"least_claimed",label:"LEAST CLAIMED"}]}/>{hasFilters&&<button className="filterReset" onClick={()=>{setType("all");setTemp("all");setSort("recommended");setQuery("")}}>RESET</button>}</div></div>
          <div className="leadGrid">{filtered.map(l=>{const remaining=Math.max(0,(l.maxClaims||3)-(l.claimCount||0));return <article className="leadCard" key={l.id}><div className="leadTop"><span className={`temp ${l.temperature}`}><Flame size={14}/>{l.temperature.replace("_"," ")}</span><span>{daysAgo(l.createdAt)}</span></div><div className="leadMatchTag">YOUR TERRITORY · {l.area}</div><div className="leadLocation"><span>{l.type.toUpperCase()}</span><h3>{l.area}<br/><b>{l.city}</b></h3></div><div className="leadMeta"><p><MapPin size={15}/>{l.propertyType} · {l.size||"Size open"}</p><p className="leadBudget">{moneyRange(l)}</p><p>{l.paymentMode||"Payment open"} · {l.timeframe}</p><p className={l.verificationStatus==="verified"?"verifiedText":"mutedText"}>{l.verificationStatus==="verified"?"✓ CONTACT VERIFIED":"CONTACT NOT YET VERIFIED"}</p></div><div className="claimAvailability"><span>{remaining}</span> claim slot{remaining===1?"":"s"} remaining</div><button disabled={busyId===l.id||remaining===0||Number(realtor?.creditsBalance||0)<Number(l.creditCost||1)} className="claimBtn" onClick={()=>claim(l.id)}>{busyId===l.id?"CLAIMING…":Number(realtor?.creditsBalance||0)<Number(l.creditCost||1)?"MORE CREDITS REQUIRED":`CLAIM · ${l.creditCost||1} CREDIT${Number(l.creditCost||1)===1?"":"S"}`}<ArrowUpRight size={16}/></button></article>})}</div>
          {!filtered.length&&<div className="emptyBox"><strong>NO MATCHES IN THIS VIEW.</strong><p>{hasFilters?"Try resetting filters to see everything currently available in your territory.":"There are no open opportunities in your approved territory right now. New matching demand will appear here."}</p>{hasFilters&&<button className="textButton" onClick={()=>{setType("all");setTemp("all");setSort("recommended");setQuery("")}}>RESET FILTERS →</button>}</div>}
        </section>}

        {tab==="claimed"&&<section className="dashboardSection claimedSection"><div className="sectionLine"><div><p className="eyebrow">YOUR ACTIVE PIPELINE</p><h2>MY LEADS</h2></div><span>{claimed.length} CLAIMED</span></div>{claimed.length?<div className="claimedList">{claimed.map((x:any)=><article key={x.claim.id} className="claimedRow"><div className="claimedLeadMain"><div className="claimedLeadTitle"><div className="claimedBadges"><span>{x.lead?.type?.toUpperCase()||"LEAD"}</span><span className={`pipelinePill stage-${x.claim?.status||"new"}`}>{String(x.claim?.status||"new").replaceAll("_"," ")}</span></div><h3>{x.lead?.name||"Lead unavailable"}</h3><p>{x.lead?.area} · {x.lead?.city} · {x.lead?.propertyType}</p>{x.lead&&<strong className="claimedBudget">{moneyRange(x.lead)}</strong>}</div><div className="claimedContact"><strong>{x.lead?.phone||"No phone"}</strong><div className="contactActions">{x.lead?.phone&&<><a target="_blank" rel="noreferrer" href={whatsappHref(x.lead.phone)}><MessageCircle size={16}/> WHATSAPP</a><button onClick={()=>copyPhone(x.lead.phone)}><Copy size={15}/> COPY</button></>}</div>{x.lead?.email&&<span>{x.lead.email}</span>}</div></div><div className="crmControls"><label>PIPELINE STAGE<BrutalistSelect variant="crm" ariaLabel="Pipeline stage" value={x.claim?.status||"new"} onChange={value=>updateClaim(x.claim.id,{status:value})} disabled={busyId===x.claim.id} options={CRM_STAGES.map(([value,label])=>({value,label}))}/></label><label>PRIVATE NOTES<textarea defaultValue={x.claim?.notes||""} placeholder="Add call notes, property shown, next step…" onBlur={e=>{if(e.target.value!==x.claim?.notes) updateClaim(x.claim.id,{notes:e.target.value})}}/></label>{x.lead&&<div className="leadFeedback"><span>WAS THIS LEAD VALID?</span><button disabled={busyId===`feedback-${x.lead.id}`} onClick={()=>feedback(x.lead.id,true)}>YES</button><button disabled={busyId===`feedback-${x.lead.id}`} onClick={()=>feedback(x.lead.id,false)}>NO</button></div>}</div></article>)}</div>:<div className="emptyBox"><strong>YOUR PIPELINE IS EMPTY.</strong><p>Claim a matching opportunity from Discover and the protected contact details will appear here.</p><button className="textButton" onClick={()=>setTab("discover")}>BROWSE AVAILABLE LEADS →</button></div>}</section>}
      </>}
    </main>
  </div>
}
