import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CTAButton } from "@/components/CTAButton";
import { ArrowUpRight, Check, Flame, LockKeyhole, MapPin, ShieldCheck, Workflow, WalletCards } from "lucide-react";
import { HeroArtwork } from "@/components/HeroArtwork";
import { PricingPlans } from "@/components/PricingPlans";

const features=[
  ["01","TERRITORIES","Select the cities and areas you actually serve."],
  ["02","QUALIFIED CONTEXT","See property type, budget, timeframe and intent before deciding whether an opportunity fits."],
  ["03","CONTROLLED CLAIMS","Contact information remains protected until an authorized realtor claims the lead."],
  ["04","PIPELINE","Move claimed leads through contacted, qualified, viewing, negotiating, won or lost stages."],
  ["05","FEEDBACK","Report invalid or poor-quality opportunities so the network improves."],
  ["06","FLEXIBLE ACCESS","Choose a monthly verified-lead plan or buy individual verified opportunities when you need them."],
];

export default function ForRealtors(){return <main><Nav/>
<section className="realtorHero hasHeroArtwork"><div className="blob blobOne"/><div className="heroGhostWord realtorGhost" aria-hidden="true">DEMAND</div><div className="heroMeta"><p className="eyebrow">REALTOR NETWORK — BETA</p><span className="betaStamp">VERIFICATION REQUIRED</span></div><h1>DON&apos;T BUY<br/><span>ATTENTION.</span><br/>ACCESS DEMAND.</h1><div className="heroBottom"><p>Create one realtor profile, define your markets and manage matching property opportunities from one portal.</p><div className="heroCtas"><CTAButton href="/join-realtor">JOIN THE BETA</CTAButton><CTAButton href="/login" secondary>REALTOR LOGIN</CTAButton></div></div><HeroArtwork src="/images/heroes/for-realtors.webp" alt="Realtors receiving matched property opportunities and connecting with clients" priority/></section>

<section className="realtorTrustRail"><div><MapPin/><span><strong>LOCAL FIRST</strong>Only opportunities from approved territories.</span></div><div><ShieldCheck/><span><strong>VERIFIED ACCESS</strong>Realtor profiles are reviewed before contact unlock.</span></div><div><Workflow/><span><strong>ONE PIPELINE</strong>Claim, contact and track follow-up in one portal.</span></div><div><WalletCards/><span><strong>FLEXIBLE PRICING</strong>Monthly plans or individual verified leads.</span></div></section>

<section className="realtorPreview"><div className="previewCopy"><p className="eyebrow">WHAT YOU SEE</p><h2>CONTEXT<br/><span>BEFORE CONTACT.</span></h2><p>Evaluate the market, property type, budget, payment preference and timeframe before spending a claim. Personal contact details remain protected until access is authorized.</p><div className="previewRules"><span><Check/> MARKET FIT</span><span><Check/> INTENT UPFRONT</span><span><LockKeyhole/> CONTACT PROTECTED</span></div></div><div className="previewCardWrap"><p className="previewLabel">INTERFACE PREVIEW — DEMO DATA</p><article className="leadCard previewLead"><div className="leadTop"><span className="temp hot"><Flame size={14}/>HOT</span><span>TODAY</span></div><div className="leadMatchTag">YOUR TERRITORY · DHA PHASE 8</div><div className="leadLocation"><span>BUYER</span><h3>DHA PHASE 8<br/><b>KARACHI</b></h3></div><div className="leadMeta"><p><MapPin size={15}/>House · 500 sq yd</p><p className="leadBudget">PKR 45,000,000 — 55,000,000</p><p>Cash · Within 30 days</p><p className="verifiedText">✓ CONTACT VERIFIED</p></div><div className="claimAvailability"><span>2</span> claim slots remaining</div><div className="claimBtn staticClaim">CLAIM OPPORTUNITY <ArrowUpRight size={16}/></div></article></div></section>

<section className="featureGrid">{features.map(([n,title,copy])=><article key={n}><span>{n}</span><Check/><h2>{title}</h2><p>{copy}</p></article>)}</section>

<section className="realtorJourney"><div><p className="eyebrow">YOUR WORKFLOW</p><h2>ACCOUNT →<br/>VERIFY →<br/><span>MATCH → CLAIM.</span></h2></div><div className="journeyRows"><div><span>01</span><p>Create your realtor account and choose the areas you genuinely serve.</p></div><div><span>02</span><p>Admin reviews the profile before access to protected consumer data is opened.</p></div><div><span>03</span><p>Matching opportunities appear based on territory and property specialization.</p></div><div><span>04</span><p>Claim a lead, unlock the contact, then manage follow-up inside your pipeline.</p></div></div></section>

<section className="beforeAfter"><div><p className="eyebrow">BEFORE CLAIM</p><h2>SEE THE<br/>FIT.</h2><ul><li>Lead type</li><li>City & area</li><li>Property type & size</li><li>Budget / expected price</li><li>Timeframe</li><li>Verification status</li></ul></div><div className="accentPanel"><p className="eyebrow">AFTER CLAIM</p><h2>UNLOCK THE<br/><span>CONTACT.</span></h2><ul><li>Name</li><li>Phone / WhatsApp</li><li>Email when provided</li><li>Private CRM notes</li><li>Pipeline status</li><li>Lead-quality feedback</li></ul></div></section>

<PricingPlans compact/>
<section className="betaBanner"><p className="eyebrow">JOIN THE REALTOR NETWORK</p><h2>CHOOSE YOUR MARKET.<br/><span>BUILD YOUR PIPELINE.</span></h2><p>Create your verified realtor profile first. Pakistan packages are configured around verified leads so raw or rejected submissions do not consume your allowance.</p><div><CTAButton href="/join-realtor">CREATE REALTOR ACCOUNT</CTAButton><a className="textArrow" href="/pricing?country=PK">VIEW PRICING <ArrowUpRight/></a></div></section>
<Footer/></main>}
