import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CTAButton } from "@/components/CTAButton";
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Home as HomeIcon, KeyRound, TrendingUp, BadgeDollarSign, LockKeyhole, MapPinned, Workflow } from "lucide-react";
import { getCityPagesByCountry } from "@/lib/city-pages";
import { getMarket, isCountryCode } from "@/lib/market";
import { HeroArtwork } from "@/components/HeroArtwork";

const MOVES = [
  { type: "buy", label: "BUY", copy: "Tell us the city, area, property type and budget you want.", icon: HomeIcon },
  { type: "sell", label: "SELL", copy: "Put your property requirement in front of relevant local realtors.", icon: BadgeDollarSign },
  { type: "invest", label: "INVEST", copy: "Describe the budget, market and return profile you are targeting.", icon: TrendingUp },
  { type: "rent", label: "RENT", copy: "Share the location, size and rental requirement that fits your move.", icon: KeyRound },
] as const;

export default async function Home({searchParams}:{searchParams:Promise<{country?:string}>}){
  const params=await searchParams;const country=isCountryCode(params.country)?params.country:"PK";const market=getMarket(country);const cityPages=getCityPagesByCountry(country);const quickMarkets=cityPages.map(c=>c.name);
  const q=(path:string)=>`${path}${path.includes("?")?"&":"?"}country=${country}`;
  return <main><Nav/>
    <section className="hero homeHero hasHeroArtwork">
      <div className="blob blobOne"/><div className="blob blobTwo"/>
      <div className="heroGhostWord" aria-hidden="true">DEMAND</div>
      <div className="heroMeta"><p className="heroTag"><span className="liveDot"/> {market.shortName}&apos;S PROPERTY DEMAND NETWORK</p><span className="betaStamp">BETA / 2026</span></div>
      <div className="heroIndex" aria-hidden="true">01 / HOME</div>
      <h1>REAL <span>BUYERS.</span><br/><em>REAL SELLERS.</em></h1>
      <div className="heroBottom">
        <div className="heroCopyBlock"><p>Start with the requirement — not another wall of listings. We structure what you need and route it toward participating realtors who actually work that market.</p><div className="heroSignals"><span>NO CONSUMER ACCOUNT</span><span>{cityPages.length} LAUNCH CITIES</span><span>CONTACTS STAY PRIVATE</span></div></div>
        <div className="heroCtas"><CTAButton href={q("/get-started")}>SUBMIT REQUIREMENT</CTAButton><CTAButton href={q("/for-realtors")} secondary>FOR REALTORS</CTAButton></div>
      </div>
      <HeroArtwork src="/images/heroes/home.webp" alt="Property buyers, city markets and realtors connected across Pakistan" priority className="homeArtwork"/>
      <div className="heroQuickStart" aria-label="Quick start">
        <span>I WANT TO</span>
        {MOVES.map(move=><Link href={`/get-started?country=${country}&type=${move.type}`} key={move.type}>{move.label}<ArrowUpRight size={14}/></Link>)}
      </div>
      <div className="scrollCue">EXPLORE THE NETWORK <ArrowDownRight/></div>
    </section>

    <div className="marketTicker" aria-label="Launch markets"><div><strong>LIVE BETA</strong>{quickMarkets.map(city=><Link href={`/get-started?country=${country}&city=${encodeURIComponent(city)}`} key={city}>{city.toUpperCase()} <span>↗</span></Link>)}<strong>BUY · SELL · INVEST · RENT</strong></div></div>

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

    <section className="differenceSection">
      <div className="differenceHead"><p className="eyebrow">WHY THIS FEELS DIFFERENT</p><h2>START WITH<br/><span>DEMAND.</span></h2></div>
      <div className="differenceGrid">
        <article className="differenceMuted"><span>OLD FLOW</span><h3>LISTINGS → SCROLL → MESSAGE → REPEAT.</h3><p>Consumers bounce between posts, portals and agents while repeating the same requirement again and again.</p></article>
        <article className="differenceAccent"><span>BLUEPRINT FLOW</span><h3>REQUIREMENT → MATCH → REALTOR.</h3><p>One structured brief carries the market, budget, property type and timeframe into the matching process.</p></article>
      </div>
      <div className="differenceSignals"><div><LockKeyhole/><span><strong>PRIVATE</strong>Contact details stay protected.</span></div><div><MapPinned/><span><strong>LOCAL</strong>Matching begins with territory.</span></div><div><Workflow/><span><strong>TRACKABLE</strong>Realtors manage follow-up in one pipeline.</span></div></div>
    </section>

    <section className="campaign">
      <div className="campaignMain"><p className="eyebrow">FOR REALTORS</p><h2>STOP CHASING<br/>EVERY INQUIRY.<br/><span>ACCESS FIT.</span></h2><p className="campaignCopy">Your dashboard is designed around the places and property segments you actually work. See useful context before deciding whether an opportunity deserves your time.</p></div>
      <div className="campaignLinks"><Link href={q("/for-realtors")}><span>01</span><p>Territory-based opportunities</p><ArrowUpRight/></Link><Link href={q("/for-realtors")}><span>02</span><p>Buyer & seller intent upfront</p><ArrowUpRight/></Link><Link href={q("/for-realtors")}><span>03</span><p>Protected contact details</p><ArrowUpRight/></Link><Link href="/login"><span>04</span><p>Realtor portal & lead CRM</p><ArrowUpRight/></Link></div>
    </section>

    <section className="cities">
      <div className="sectionIntro compact"><div><p className="eyebrow">LAUNCH MARKETS</p><h2 className="sectionTitle">LOCAL<br/><span>BY DESIGN.</span></h2></div><Link className="textArrow" href={q("/cities")}>VIEW ALL MARKETS <ArrowUpRight/></Link></div>
      <div>{cityPages.map(city=><Link className="cityRow" href={`/cities/${city.slug}?country=${country}`} key={city.slug}><span>{city.number}</span><div><h3>{city.name.toUpperCase()}</h3><p>{city.statement}</p></div><CheckCircle2/></Link>)}</div>
    </section>

    <section className="finalCta"><div className="blob blobThree"/><p className="eyebrow">PROPERTY IS LOCAL. DEMAND SHOULD BE CLEAR.</p><h2>MAKE YOUR<br/><span>NEXT MOVE.</span></h2><div><CTAButton href={q("/get-started")}>SUBMIT REQUIREMENT</CTAButton><CTAButton href="/join-realtor" secondary>JOIN AS REALTOR</CTAButton></div></section>
    <Footer/>
  </main>
}
