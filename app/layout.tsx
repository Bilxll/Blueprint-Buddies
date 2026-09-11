import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata={
  title:{default:"BLUEPRINT BUDDIES — Qualified Property Demand",template:"%s — BLUEPRINT BUDDIES"},
  description:"Pakistan's property-demand network connecting structured buyer, seller, investor and rental requirements with participating realtors.",
  metadataBase:new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  icons:{icon:"/icon.png",apple:"/apple-icon.png"},
  openGraph:{title:"BLUEPRINT BUDDIES",description:"Property demand, structured.",type:"website",images:[{url:"/images/heroes/home.webp",width:1672,height:941,alt:"Blueprint Buddies property demand network"}]}
};
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:"#E4E2DD"};

export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
