import Link from "next/link";
import { ArrowRight } from "lucide-react";
export function CTAButton({href,children,secondary=false}:{href:string;children:React.ReactNode;secondary?:boolean}){if(secondary)return <Link className="secondaryLink" href={href}>{children}<ArrowRight size={18}/></Link>;return <Link className="ctaButton" href={href}><span className="ctaFill"/><span className="ctaText">{children}<ArrowRight size={18}/></span></Link>}
