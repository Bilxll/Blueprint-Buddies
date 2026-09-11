import { google } from "googleapis";
const spreadsheetId=process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const email=process.env.GOOGLE_CLIENT_EMAIL||process.env.FIREBASE_CLIENT_EMAIL;
const key=(process.env.GOOGLE_PRIVATE_KEY||process.env.FIREBASE_PRIVATE_KEY)?.replace(/\\n/g,"\n");
if(!spreadsheetId||!email||!key)throw new Error("Set GOOGLE_SHEETS_SPREADSHEET_ID and service-account credentials first.");
const auth=new google.auth.JWT({email,key,scopes:["https://www.googleapis.com/auth/spreadsheets"]});const sheets=google.sheets({version:"v4",auth});
const schema={
Leads:["id","country","type","city","area","propertyType","budgetMin","budgetMax","size","bedrooms","paymentMode","purpose","timeframe","ownerConfirmed","expectedPrice","investmentGoal","name","phone","email","temperature","leadScore","verificationStatus","status","maxClaims","claimCount","creditCost","source","campaign","contentId","utmSource","utmMedium","utmCampaign","createdAt","updatedAt","contactConsent"],
Realtors:["id","country","uid","fullName","agencyName","phone","whatsapp","email","city","areas","propertyTypes","leadTypes","experience","website","instagram","facebook","logoDriveFileId","about","verificationStatus","status","planId","subscriptionStatus","creditsBalance","createdAt","updatedAt","authProvider","termsAccepted","termsAcceptedAt"],
LeadClaims:["id","leadId","realtorId","realtorUid","status","notes","creditCost","claimedAt","updatedAt"],
LeadFeedback:["id","leadId","realtorId","valid","reason","comment","createdAt"],
Cities:["id","name","active","createdAt"],Areas:["id","city","name","active","createdAt"],PropertyTypes:["id","name","active","createdAt"],Sources:["id","source","campaign","contentId","notes","createdAt"],
Conversions:["id","leadId","realtorId","status","dealEstimate","propertyShown","nextFollowUp","createdAt","updatedAt","claimId","notes","eventType"],
CreditLedger:["id","realtorId","realtorUid","amount","balanceAfter","type","referenceId","note","createdAt"],
Packages:["id","country","name","kind","currency","price","leadCap","billingInterval","active","mode","createdAt","updatedAt"],Subscriptions:["id","realtorId","country","packageId","status","mode","leadCap","leadsUsed","periodStart","periodEnd","startedAt","renewsAt","createdAt","updatedAt","externalPaymentId","note"],
Notifications:["id","userId","type","title","message","read","createdAt"],AuditLog:["id","actorUid","action","entityType","entityId","payload","createdAt"],Uploads:["id","ownerUid","realtorId","purpose","driveFileId","name","mimeType","size","createdAt"],BulkImports:["id","fileName","sheetName","source","defaultCountry","campaign","totalRows","validRows","importedRows","duplicateRows","invalidRows","actorUid","createdAt"],Settings:["key","value","updatedAt"]};
const meta=await sheets.spreadsheets.get({spreadsheetId});const existing=new Set(meta.data.sheets?.map(s=>s.properties?.title));const add=Object.keys(schema).filter(n=>!existing.has(n)).map(title=>({addSheet:{properties:{title}}}));if(add.length)await sheets.spreadsheets.batchUpdate({spreadsheetId,requestBody:{requests:add}});for(const [name,headers] of Object.entries(schema)){await sheets.spreadsheets.values.update({spreadsheetId,range:`${name}!A1`,valueInputOption:"RAW",requestBody:{values:[headers]}})}console.log("Sheets schema ready.");
