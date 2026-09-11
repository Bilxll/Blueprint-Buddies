import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CTAButton } from "@/components/CTAButton";
import { getCityAreas, getCityPagesByCountry } from "@/lib/city-pages";
import { COUNTRY_OPTIONS, getMarket, isCountryCode } from "@/lib/market";
import { ArrowUpRight } from "lucide-react";
import { HeroArtwork } from "@/components/HeroArtwork";

export default async function Cities({searchParams}:{searchParams:Promise<{country?:string}>}){const params=await searchParams;const country=isCountryCode(params.country)?params.country:"PK";const market=getMarket(country);const cities=getCityPagesByCountry(country);return <main><Nav/>
<section className="innerHero compactHero hasHeroArtwork"><div className="blob blobTwo"/><p className="eyebrow">MARKET BY MARKET</p><h1>CHOOSE<br/><span>YOUR CITY.</span></h1><p className="innerLead">{market.name}&apos;s property market is local. Our matching model starts with the city, then narrows to the actual neighborhood or area.</p><HeroArtwork src="/images/heroes/cities.webp" alt="Major property markets connected across Pakistan" priority/></section>
<div className="countryMarketTabs">{COUNTRY_OPTIONS.map(c=><Link className={c.value===country?"active":""} href={`/cities?country=${c.value}`} key={c.value}>{c.label}</Link>)}</div><section className="marketGrid">{cities.map(city=><Link href={`/cities/${city.slug}?country=${country}`} className="marketCard" key={city.slug}><div><span>{city.number}</span><ArrowUpRight/></div><h2>{city.name.toUpperCase()}</h2><p>{city.statement}</p><div className="areaStrip">{getCityAreas(city.name,city.country).slice(0,5).map(area=><span key={area}>{area}</span>)}</div></Link>)}</section>
<section className="splitStatement"><div><p className="eyebrow">NOT SEEING YOUR MARKET?</p><h2>{market.shortName}<br/>EXPANDS NEXT.</h2></div><div><p>{cities.map(c=>c.name).join(", ")} are the current {market.shortName} launch markets. The market model is configurable so more cities can be added without rebuilding the platform.</p><CTAButton href={`/get-started?country=${country}`}>SUBMIT REQUIREMENT</CTAButton></div></section>
<Footer/></main>}
