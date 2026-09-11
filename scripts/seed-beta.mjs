import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
const projectId=process.env.FIREBASE_PROJECT_ID;const clientEmail=process.env.FIREBASE_CLIENT_EMAIL;const privateKey=process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g,"\n");
if(!projectId||!clientEmail||!privateKey)throw new Error("Firebase Admin environment variables are required.");
const app=getApps()[0]||initializeApp({credential:cert({projectId,clientEmail,privateKey}),projectId});const db=getFirestore(app);const now=new Date().toISOString();
const packages=[
  {id:"pk-starter",country:"PK",name:"STARTER",kind:"subscription",currency:"PKR",price:5000,leadCap:30,billingInterval:"month",active:true,mode:"catalog"},
  {id:"pk-pro",country:"PK",name:"PRO",kind:"subscription",currency:"PKR",price:13000,leadCap:100,billingInterval:"month",active:true,mode:"catalog"},
  {id:"pk-payg",country:"PK",name:"PAY AS YOU GO",kind:"payg",currency:"PKR",price:1000,leadCap:1,billingInterval:"per_lead",active:true,mode:"catalog"},
];
for(const p of packages)await db.collection("packages").doc(p.id).set({...p,createdAt:now,updatedAt:now},{merge:true});
const allowTest=String(process.env.ALLOW_TEST_PURCHASES||"false").toLowerCase()==="true"&&process.env.BILLING_MODE==="test_credits";
await db.collection("settings").doc("platform").set({betaMode:true,billingMode:process.env.BILLING_MODE||"beta_credits",allowTestPurchases:allowTest,defaultMaxClaims:Number(process.env.DEFAULT_MAX_CLAIMS||3),defaultLeadCreditCost:1,pricingVersion:"pk-v1",updatedAt:now},{merge:true});
console.log(`Pakistan pricing seeded: Starter PKR 5,000 / 30 verified leads; Pro PKR 13,000 / 100; Pay-as-you-go PKR 1,000 / verified lead. Test activation: ${allowTest?"enabled":"disabled"}.`);
