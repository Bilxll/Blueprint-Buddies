import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
const projectId=process.env.FIREBASE_PROJECT_ID;const clientEmail=process.env.FIREBASE_CLIENT_EMAIL;const privateKey=process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g,"\n");
if(!projectId||!clientEmail||!privateKey)throw new Error("Firebase Admin environment variables are required.");
const app=getApps()[0]||initializeApp({credential:cert({projectId,clientEmail,privateKey}),projectId});const db=getFirestore(app);const now=new Date().toISOString();
const packages=[{id:"beta-10",name:"BETA 10",credits:10,pricePkr:0},{id:"beta-25",name:"BETA 25",credits:25,pricePkr:0},{id:"beta-50",name:"BETA 50",credits:50,pricePkr:0}];
for(const p of packages)await db.collection("packages").doc(p.id).set({...p,active:true,mode:"test",createdAt:now,updatedAt:now},{merge:true});
await db.collection("settings").doc("platform").set({betaMode:true,billingMode:"test_credits",defaultMaxClaims:Number(process.env.DEFAULT_MAX_CLAIMS||3),defaultLeadCreditCost:Number(process.env.DEFAULT_LEAD_CREDIT_COST||1),updatedAt:now},{merge:true});
console.log("Beta packages and platform settings seeded.");
