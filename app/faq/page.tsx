import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
export const metadata={title:"Frequently Asked Questions"};
const FAQ=[
["DO CONSUMERS NEED AN ACCOUNT?","No. Buyers, sellers, investors and renters submit a structured requirement as a guest. Keep the private reference and original phone number to track it later."],
["WHO CAN SEE MY PHONE NUMBER?","Your contact details are not public. They become available only to an authenticated, approved realtor after that realtor successfully claims your verified opportunity."],
["HOW ARE REALTORS MATCHED?","Matching uses city, selected areas, opportunity type, property type, verification status and available claim capacity."],
["DO REALTORS NEED VERIFICATION?","Yes. Realtor accounts require authentication and profile review before lead discovery and protected contact access are enabled."],
["ARE SUBSCRIPTIONS LIVE?","The current public beta uses controlled lead credits. Real paid checkout is not represented as live until a payment provider and payment verification workflow are connected."],
["HOW DO I TRACK A REQUIREMENT?","Open Track Requirement and enter the private LEAD reference plus the same phone number used in the original submission."],
];
export default function FAQPage(){return <><Nav/><main className="faqPage"><header><p className="eyebrow">FAQ / PUBLIC BETA</p><h1>QUESTIONS,<br/><span>ANSWERED.</span></h1></header><section className="faqList">{FAQ.map(([q,a],i)=><details key={q} open={i===0}><summary><span>{String(i+1).padStart(2,"0")}</span>{q}</summary><p>{a}</p></details>)}</section></main><Footer/></>}
