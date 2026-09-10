import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CTAButton } from "@/components/CTAButton";
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Home as HomeIcon, KeyRound, TrendingUp, BadgeDollarSign } from "lucide-react";
import { CITY_PAGES } from "@/lib/city-pages";

const MOVES = [
  { type: "buy", label: "BUY", copy: "Tell us the city, area, property type and budget you want.", icon: HomeIcon },
  { type: "sell", label: "SELL", copy: "Put your property requirement in front of relevant local realtors.", icon: BadgeDollarSign },
  { type: "invest", label: "INVEST", copy: "Describe the budget, market and return profile you are targeting.", icon: TrendingUp },
  { type: "rent", label: "RENT", copy: "Share the location, size and rental requirement that fits your move.", icon: KeyRound },
] as const;

export default function Home(){
  return <main><Nav/>
    <section className="hero homeHero">
      <div className="blob blobOne"/><div className="blob blobTwo"/>
      <div className="heroMeta"><p className="heroTag"><span className="liveDot"/> PAKISTAN&apos;S PROPERTY DEMAND NETWORK</p><span className="betaStamp">BETA / 2026</span></div>
      <h1>REAL <span>BUYERS.</span><br/><em>REAL SELLERS.</em></h1>
      <div className="heroBottom">
        <div className="heroCopyBlock"><p>Start with the requirement — not another wall of listings. We structure what you need and route it toward participating realtors who actually work that market.</p><div className="heroSignals"><span>NO CONSUMER ACCOUNT</span><span>4 LAUNCH CITIES</span><span>CONTACTS STAY PRIVATE</span></div></div>
        <div className="heroCtas"><CTAButton href="/get-started">SUBMIT REQUIREMENT</CTAButton><CTAButton href="/for-realtors" secondary>FOR REALTORS</CTAButton></div>
      </div>
      <div className="scrollCue">CHOOSE YOUR MOVE <ArrowDownRight/></div>
    </section>

    <section className="moveSection">
      <div className="sectionIntro"><div><p className="eyebrow">START HERE</p><h2 className="sectionTitle">ONE BRIEF.<br/><span>FOUR MOVES.</span></h2></div><p className="sectionCopy">Pick the intent that matches what you are doing. The form changes around that move, so realtors receive context instead of a vague inquiry.</p></div>
      <div className="moveGrid">
        {MOVES.map(({type,label,copy,icon:Icon},i)=><Link href={`/get-started?type=${type}`} className="moveCard" key={type}><div><span>0{i+1}</span><Icon size={22}/></div><h3>{label}</h3><p>{copy}</p><span className="moveArrow">START <ArrowUpRight/></span></Link>)}
      </div>
    </section>

    <section className="proofStrip" aria-label="How the platform works">
      <div><span>01</span><strong>SUBMIT</strong><p>Structured property requirement.</p></div>
      <div><span>02</span><strong>QUALIFY</strong><p>Intent and verification kept separate.</p></div>
      <div><span>03</span><strong>MATCH</strong><p>Territory and specialty based.</p></div>
      <div><span>04</span><strong>CONNECT</strong><p>Private details unlock after claim.</p></div>
    </section>

    <section className="campaign">
      <div className="campaignMain"><p className="eyebrow">FOR REALTORS</p><h2>STOP CHASING<br/>EVERY INQUIRY.<br/><span>ACCESS FIT.</span></h2><p className="campaignCopy">Your dashboard is designed around the places and property segments you actually work. See useful context before deciding whether an opportunity deserves your time.</p></div>
      <div className="campaignLinks"><Link href="/for-realtors"><span>01</span><p>Territory-based opportunities</p><ArrowUpRight/></Link><Link href="/for-realtors"><span>02</span><p>Buyer & seller intent upfront</p><ArrowUpRight/></Link><Link href="/for-realtors"><span>03</span><p>Protected contact details</p><ArrowUpRight/></Link><Link href="/login"><span>04</span><p>Realtor portal & lead CRM</p><ArrowUpRight/></Link></div>
    </section>

    <section className="cities">
      <div className="sectionIntro compact"><div><p className="eyebrow">LAUNCH MARKETS</p><h2 className="sectionTitle">LOCAL<br/><span>BY DESIGN.</span></h2></div><Link className="textArrow" href="/cities">VIEW ALL MARKETS <ArrowUpRight/></Link></div>
      <div>{CITY_PAGES.map(city=><Link className="cityRow" href={`/cities/${city.slug}`} key={city.slug}><span>{city.number}</span><div><h3>{city.name.toUpperCase()}</h3><p>{city.statement}</p></div><CheckCircle2/></Link>)}</div>
    </section>

    <section className="finalCta"><div className="blob blobThree"/><p className="eyebrow">PROPERTY IS LOCAL. DEMAND SHOULD BE CLEAR.</p><h2>MAKE YOUR<br/><span>NEXT MOVE.</span></h2><div><CTAButton href="/get-started">SUBMIT REQUIREMENT</CTAButton><CTAButton href="/join-realtor" secondary>JOIN AS REALTOR</CTAButton></div></section>
    <Footer/>
  </main>
}
