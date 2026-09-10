import Link from "next/link";
import { ArrowUpRight, LogIn } from "lucide-react";

export function Nav(){
  return <nav className="nav">
    <Link className="brand" href="/">CREAIONX <span>PROPERTY</span></Link>
    <div className="navlinks">
      <Link href="/how-it-works">HOW IT WORKS</Link>
      <Link href="/cities">CITIES</Link>
      <Link href="/for-realtors">FOR REALTORS</Link>
    </div>
    <div className="navRight">
      <Link className="portalLink" href="/login">REALTOR LOGIN</Link>
      <Link className="navAction" href="/get-started">SUBMIT REQUIREMENT <ArrowUpRight size={16}/></Link>
    </div>
    <Link className="mobileIcon" href="/login" aria-label="Realtor login"><LogIn size={20}/></Link>
  </nav>
}
