import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CTAButton } from "@/components/CTAButton";
import { CITY_PAGES, getCityAreas, getCityPage } from "@/lib/city-pages";
import { ArrowUpRight } from "lucide-react";

export function generateStaticParams(){return CITY_PAGES.map(city=>({city:city.slug}));}

export default async function CityPageRoute({params}:{params:Promise<{city:string}>}){
  const {city:slug}=await params; const city=getCityPage(slug); if(!city) notFound(); const areas=getCityAreas(city.name);
  return <main><Nav/>
    <section className="cityHero"><div className="cityNumber">{city.number}</div><p className="eyebrow">CREAIONX PROPERTY / {city.name.toUpperCase()}</p><h1>{city.name.toUpperCase()}<br/><span>DEMAND.</span></h1><p>{city.intro}</p></section>
    <section className="areaSection"><div className="areaHeader"><p className="eyebrow">ACTIVE TERRITORIES</p><h2>AREA BY<br/>AREA.</h2></div><div className="areaRows">{areas.map((area,i)=><div className="areaRow" key={area}><span>{String(i+1).padStart(2,"0")}</span><strong>{area}</strong><ArrowUpRight/></div>)}</div></section>
    <section className="demandTypes"><p className="eyebrow">WHAT ENTERS THE NETWORK</p><div className="demandTypeGrid">{city.demand.map((item,i)=><div key={item}><span>0{i+1}</span><h3>{item}</h3></div>)}</div></section>
    <section className="splitStatement alt"><div><p className="eyebrow">FOR {city.name.toUpperCase()} REALTORS</p><h2>WORK YOUR<br/><span>ACTUAL MARKET.</span></h2></div><div><p>{city.realtorCopy}</p><div className="stackedActions"><CTAButton href="/join-realtor">JOIN AS REALTOR</CTAButton><a className="textArrow" href="/login">ALREADY A MEMBER? LOGIN <ArrowUpRight/></a></div></div></section>
    <section className="finalCta shortCta"><p className="eyebrow">LOOKING IN {city.name.toUpperCase()}?</p><h2>TELL US<br/><span>WHAT MOVES YOU.</span></h2><CTAButton href={`/get-started?city=${encodeURIComponent(city.name)}`}>SUBMIT REQUIREMENT</CTAButton></section>
    <Footer/>
  </main>
}
