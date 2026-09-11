import { Nav } from "@/components/Nav";
import { RealtorSignup } from "@/components/RealtorSignup";
import { CheckCircle2, LockKeyhole, MapPin } from "lucide-react";

export default function Join(){return <main><Nav/><div className="splitPage realtorJoinPage"><section className="joinStatement"><p className="eyebrow">REALTOR BETA ACCESS</p><h1>CLAIM<br/>THE RIGHT<br/><span>DEMAND.</span></h1><p className="largeCopy">Sign up securely with Google or email, choose your country and define the territories you actually serve and enter the verification queue.</p><div className="joinTrust"><div><MapPin/><span>Territory-based matching</span></div><div><LockKeyhole/><span>Protected lead contacts</span></div><div><CheckCircle2/><span>Free beta access while we validate quality</span></div></div></section><section className="formPanel"><RealtorSignup/></section></div></main>}
