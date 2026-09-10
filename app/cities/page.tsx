import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CTAButton } from "@/components/CTAButton";
import { CITY_PAGES, getCityAreas } from "@/lib/city-pages";
import { ArrowUpRight } from "lucide-react";

export default function Cities(){return <main><Nav/>
<section className="innerHero compactHero"><div className="blob blobTwo"/><p className="eyebrow">MARKET BY MARKET</p><h1>CHOOSE<br/><span>YOUR CITY.</span></h1><p className="innerLead">Pakistan&apos;s property market is local. Our matching model starts with the city, then narrows to the actual area or society.</p></section>
<section className="marketGrid">{CITY_PAGES.map(city=><Link href={`/cities/${city.slug}`} className="marketCard" key={city.slug}><div><span>{city.number}</span><ArrowUpRight/></div><h2>{city.name.toUpperCase()}</h2><p>{city.statement}</p><div className="areaStrip">{getCityAreas(city.name).slice(0,5).map(area=><span key={area}>{area}</span>)}</div></Link>)}</section>
<section className="splitStatement"><div><p className="eyebrow">NOT SEEING YOUR MARKET?</p><h2>PAKISTAN<br/>EXPANDS NEXT.</h2></div><div><p>Karachi, Lahore, Islamabad and Rawalpindi are the launch markets. The location model is configurable so additional cities and societies can be added without rebuilding the platform.</p><CTAButton href="/get-started">SUBMIT REQUIREMENT</CTAButton></div></section>
<Footer/></main>}
