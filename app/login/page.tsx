import { Nav } from "@/components/Nav";
import { LoginForm } from "@/components/LoginForm";
import { LockKeyhole, MapPinned, Workflow } from "lucide-react";

export default function Login(){return <main><Nav/><div className="loginPage"><section className="loginStatement"><p className="eyebrow">REALTOR PORTAL</p><h1>YOUR LEADS.<br/><span>YOUR PIPELINE.</span></h1><p className="largeCopy">Sign in with Google or email to access matching opportunities, protected contacts and your lead follow-up workflow.</p><div className="loginBenefits"><div><MapPinned/><span><strong>TERRITORY MATCHING</strong><small>See demand in the areas you serve.</small></span></div><div><LockKeyhole/><span><strong>PROTECTED CONTACTS</strong><small>Details unlock only after a valid claim.</small></span></div><div><Workflow/><span><strong>LEAD CRM</strong><small>Track each opportunity from new to won.</small></span></div></div></section><section className="loginPanel"><LoginForm/></section></div></main>}
