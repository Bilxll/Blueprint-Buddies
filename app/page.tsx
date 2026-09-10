import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CTAButton } from "@/components/CTAButton";
import { ArrowDownRight, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { CITY_PAGES } from "@/lib/city-pages";

export default function Home(){return <main><Nav/>
<section className="hero"><div className="blob blobOne"/><div className="blob blobTwo"/><p className="heroTag">PAKISTAN&apos;S PROPERTY DEMAND NETWORK — BETA</p><h1>REAL <span>BUYERS.</span><br/><em>REAL SELLERS.</em></h1><div className="heroBottom"><p>Tell us exactly what you need. We structure the requirement and connect it to participating realtors who work that market.</p><div className="heroCtas"><CTAButton href="/get-started">SUBMIT REQUIREMENT</CTAButton><CTAButton href="/for-realtors" secondary>FOR REALTORS</CTAButton></div></div><div className="scrollCue">EXPLORE <ArrowDownRight/></div></section>

<section className="homeIntro"><p className="eyebrow">ONE NETWORK. FOUR MOVES.</p><div className="homeIntroGrid"><h2>BUY.<br/>SELL.<br/><span>INVEST.</span><br/>RENT.</h2><div><p>CREAIONX PROPERTY is not another listing wall. Consumers submit a structured property requirement; realtors receive opportunities relevant to the markets they serve.</p><Link className="textArrow" href="/how-it-works">SEE HOW THE SYSTEM WORKS <ArrowUpRight/></Link></div></div></section>

<section className="campaign"><div className="campaignMain"><p className="eyebrow">FOR REALTORS</p><h2>STOP CHASING<br/>EVERY INQUIRY.<br/><span>ACCESS FIT.</span></h2></div><div className="campaignLinks"><Link href="/for-realtors"><span>01</span><p>Territory-based opportunities</p><ArrowUpRight/></Link><Link href="/for-realtors"><span>02</span><p>Buyer & seller intent upfront</p><ArrowUpRight/></Link><Link href="/for-realtors"><span>03</span><p>Contact details after claim</p><ArrowUpRight/></Link><Link href="/login"><span>04</span><p>Realtor portal & lead CRM</p><ArrowUpRight/></Link></div></section>

<section className="cities"><div className="sectionIntro"><p className="eyebrow">LAUNCH MARKETS</p><Link className="textArrow" href="/cities">VIEW ALL MARKETS <ArrowUpRight/></Link></div><div>{CITY_PAGES.map(city=><Link className="cityRow" href={`/cities/${city.slug}`} key={city.slug}><span>{city.number}</span><h3>{city.name.toUpperCase()}</h3><CheckCircle2/></Link>)}</div></section>

<section className="finalCta"><div className="blob blobThree"/><p className="eyebrow">PROPERTY IS LOCAL. DEMAND SHOULD BE CLEAR.</p><h2>MAKE YOUR<br/><span>NEXT MOVE.</span></h2><div><CTAButton href="/get-started">SUBMIT REQUIREMENT</CTAButton><CTAButton href="/join-realtor" secondary>JOIN AS REALTOR</CTAButton></div></section>
<Footer/></main>}
