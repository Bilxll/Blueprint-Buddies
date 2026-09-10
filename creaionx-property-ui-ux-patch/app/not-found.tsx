import Link from "next/link";
import { Nav } from "@/components/Nav";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

export default function NotFound(){return <main><Nav/><section className="innerHero compactHero"><div className="blob blobThree"/><p className="eyebrow">404 / OFF MARKET</p><h1>THIS PAGE<br/><span>MOVED.</span></h1><p className="innerLead">The page you requested is not available. Return home or submit a property requirement instead.</p><div className="heroCtas" style={{justifyContent:"flex-start",marginTop:30}}><Link className="secondaryLink" href="/"><ArrowLeft size={18}/> BACK HOME</Link><Link className="textArrow" href="/get-started">SUBMIT REQUIREMENT <ArrowUpRight size={18}/></Link></div></section></main>}
