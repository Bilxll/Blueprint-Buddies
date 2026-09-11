import type { MetadataRoute } from "next";
import { appConfig } from "@/lib/config";
export default function sitemap():MetadataRoute.Sitemap{
 const base=appConfig.appUrl.replace(/\/$/,"");
 const routes=["","/how-it-works","/cities","/cities/karachi","/cities/lahore","/cities/islamabad","/cities/rawalpindi","/for-realtors","/pricing","/about","/get-started","/track","/faq","/contact","/privacy","/terms","/lead-policy","/join-realtor","/login"];
 return routes.map(url=>{
   const changeFrequency: "weekly"|"monthly"=url.startsWith("/cities")?"weekly":"monthly";
   return {url:`${base}${url}`,lastModified:new Date(),changeFrequency,priority:url===""?1:url==="/get-started"?0.9:0.7};
 });
}
