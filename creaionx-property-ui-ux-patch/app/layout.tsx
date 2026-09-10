import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata={
  title:{default:"CREAIONX PROPERTY — Qualified Property Demand",template:"%s — CREAIONX PROPERTY"},
  description:"Pakistan's property-demand network connecting structured buyer, seller, investor and rental requirements with participating realtors.",
  metadataBase:new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph:{title:"CREAIONX PROPERTY",description:"Property demand, structured.",type:"website"}
};
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:"#E4E2DD"};

export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
