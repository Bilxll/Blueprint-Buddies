import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CTAButton } from "@/components/CTAButton";
import { ArrowUpRight, Check } from "lucide-react";

const features=[
  ["01","TERRITORIES","Select the cities and areas you actually serve."],
  ["02","QUALIFIED CONTEXT","See property type, budget, timeframe and intent before deciding whether an opportunity fits."],
  ["03","CONTROLLED CLAIMS","Contact information remains protected until an authorized realtor claims the lead."],
  ["04","PIPELINE","Move claimed leads through contacted, qualified, viewing, negotiating, won or lost stages."],
  ["05","FEEDBACK","Report invalid or poor-quality opportunities so the network improves."],
  ["06","READY FOR PACKAGES","Accounts are designed for future subscriptions, lead credits and territory access without changing the core product."],
];

export default function ForRealtors(){return <main><Nav/>
<section className="realtorHero"><div className="blob blobOne"/><p className="eyebrow">REALTOR NETWORK — BETA</p><h1>DON&apos;T BUY<br/><span>ATTENTION.</span><br/>ACCESS DEMAND.</h1><div className="heroBottom"><p>Create one realtor profile, define your markets and manage matching property opportunities from one portal.</p><div className="heroCtas"><CTAButton href="/join-realtor">JOIN THE BETA</CTAButton><CTAButton href="/login" secondary>REALTOR LOGIN</CTAButton></div></div></section>
<section className="featureGrid">{features.map(([n,title,copy])=><article key={n}><span>{n}</span><Check/><h2>{title}</h2><p>{copy}</p></article>)}</section>
<section className="realtorJourney"><div><p className="eyebrow">YOUR WORKFLOW</p><h2>ACCOUNT →<br/>VERIFY →<br/><span>MATCH → CLAIM.</span></h2></div><div className="journeyRows"><div><span>01</span><p>Create your realtor account and choose areas served.</p></div><div><span>02</span><p>Admin reviews and verifies the realtor profile.</p></div><div><span>03</span><p>Matching opportunities appear in your dashboard.</p></div><div><span>04</span><p>Claim a lead to unlock contact details and manage follow-up.</p></div></div></section>
<section className="betaBanner"><p className="eyebrow">BETA ACCESS</p><h2>PACKAGES COME AFTER<br/><span>WE PROVE VALUE.</span></h2><p>During beta, monetization can remain disabled while we measure lead quality, claim behavior and real conversion outcomes. Subscription and credit architecture can then be activated around actual usage.</p><div><CTAButton href="/join-realtor">CREATE REALTOR ACCOUNT</CTAButton><a className="textArrow" href="/login">LOGIN <ArrowUpRight/></a></div></section>
<Footer/></main>}
