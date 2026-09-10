import Link from "next/link";
import { ArrowUpRight, Building2 } from "lucide-react";
export function Nav(){return <nav className="nav"><Link className="brand" href="/">CREAIONX <span>PROPERTY</span></Link><div className="navlinks"><Link href="/#how">HOW IT WORKS</Link><Link href="/#cities">CITIES</Link><Link href="/join-realtor">FOR REALTORS</Link></div><Link className="navAction" href="/get-started">FIND PROPERTY <ArrowUpRight size={16}/></Link><Link className="mobileIcon" href="/join-realtor" aria-label="Realtor portal"><Building2 size={20}/></Link></nav>}
