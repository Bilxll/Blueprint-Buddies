const base=(process.env.APP_URL||process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000").replace(/\/$/,"");
const health=await fetch(`${base}/api/health`);const healthBody=await health.json().catch(()=>({}));console.log("HEALTH",health.status,JSON.stringify(healthBody,null,2));
if(!health.ok)process.exitCode=1;
const payload={type:"buy",city:"Karachi",area:"DHA",propertyType:"House",budgetMin:30000000,budgetMax:50000000,size:"500 sq yd",paymentMode:"Cash",purpose:"Smoke test",timeframe:"Within 30 days",name:"Blueprint Test Lead",phone:"03001234567",email:"",contactConsent:true,source:"smoke-test",utmSource:"production-smoke-test"};
const lead=await fetch(`${base}/api/leads`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});const leadBody=await lead.json().catch(()=>({}));console.log("LEAD",lead.status,JSON.stringify(leadBody,null,2));if(!lead.ok)process.exitCode=1;
