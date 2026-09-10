import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CTAButton } from "@/components/CTAButton";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { HeroArtwork } from "@/components/HeroArtwork";

const steps=[
  ["01","SUBMIT","Tell us whether you want to buy, sell, invest or rent. Add the city, area, property type, budget and timeframe."],
  ["02","QUALIFY","The requirement is structured and scored by intent. Verification status remains separate so we never present unverified details as verified."],
  ["03","MATCH","The platform compares the opportunity with participating realtor territories, specialties and access rules."],
  ["04","CONNECT","When an authorized realtor claims the opportunity, the protected contact details become available to that realtor."],
];

export default function HowItWorks(){return <main><Nav/>
<section className="innerHero hasHeroArtwork"><div className="blob blobOne"/><p className="eyebrow">THE SYSTEM</p><h1>LESS NOISE.<br/><span>MORE INTENT.</span></h1><p className="innerLead">We turn property inquiries into structured opportunities before they reach participating realtors.</p><HeroArtwork src="/images/heroes/how-it-works.webp" alt="A property requirement moving through matching and connection stages" priority/><div className="scrollCue">THE FLOW <ArrowDownRight/></div></section>
<section className="processList">{steps.map(([n,title,copy])=><article className="processRow" key={n}><span>{n}</span><h2>{title}</h2><p>{copy}</p></article>)}</section>
<section className="splitStatement"><div><p className="eyebrow">FOR PROPERTY SEEKERS</p><h2>NO ACCOUNT.<br/>NO LISTING MAZE.</h2></div><div><p>You do not need to create an account to submit a property requirement. Complete one focused brief and let the matching process begin.</p><CTAButton href="/get-started">SUBMIT REQUIREMENT</CTAButton></div></section>
<section className="splitStatement alt"><div><p className="eyebrow">FOR REALTORS</p><h2>YOUR LOGIN.<br/><span>YOUR PIPELINE.</span></h2></div><div><p>Realtors create verified accounts because leads, claims, territory access, subscriptions, credits and CRM activity all belong to an individual business profile.</p><a className="textArrow" href="/for-realtors">EXPLORE REALTOR ACCESS <ArrowUpRight/></a></div></section>
<Footer/></main>}
