import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { PricingPlans } from "@/components/PricingPlans";

export const metadata = { title: "Realtor Pricing | BLUEPRINT BUDDIES", description: "Verified property lead pricing and realtor subscription plans for Blueprint Buddies." };

export default function PricingPage(){return <main><Nav/><section className="pricingPageHero"><p className="eyebrow">REALTOR ACCESS</p><h1>PRICING THAT<br/><span>FOLLOWS VALUE.</span></h1><p>Choose a monthly verified-lead allowance or buy individual verified opportunities when you need them.</p></section><PricingPlans/><Footer/></main>}
