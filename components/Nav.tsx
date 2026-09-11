"use client";

import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight, ChevronDown, Home, LogIn, Menu, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { COUNTRY_OPTIONS, getMarket, isCountryCode } from "@/lib/market";
import { getCityPage } from "@/lib/city-pages";

const LINKS = [
  ["HOW IT WORKS", "/how-it-works"],
  ["CITIES", "/cities"],
  ["FOR REALTORS", "/for-realtors"],
] as const;

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [countryOpen,setCountryOpen]=useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const citySlug=pathname.startsWith("/cities/")?pathname.split("/")[2]:"";
  const cityCountry=citySlug?getCityPage(citySlug)?.country:undefined;
  const country=useMemo(()=>{const q=searchParams.get("country");return isCountryCode(q)?q:(cityCountry||"PK")},[searchParams,cityCountry]);
  const market=getMarket(country);
  function withCountry(href:string){if(href.startsWith("/realtor")||href==="/login"||href==="/track")return href;const sep=href.includes("?")?"&":"?";return `${href}${sep}country=${country}`}
  function switchCountry(code:string){if(!isCountryCode(code))return;setCountryOpen(false);const params=new URLSearchParams(searchParams.toString());params.set("country",code);params.delete("city");params.delete("area");const base=pathname.startsWith("/cities/")?"/cities":pathname;router.push(`${base}?${params.toString()}`)}
  const active = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
  const showDock = !pathname.startsWith("/realtor/") && !pathname.startsWith("/admin") && pathname !== "/login" && pathname !== "/join-realtor" && pathname !== "/get-started";

  return (
    <>
      <nav className={`nav ${scrolled ? "navScrolled" : ""} ${open ? "navMenuOpen" : ""}`} aria-label="Primary navigation">
        <div className="brandWrap">
          <BrandLogo variant="horizontal" tone={open ? "inverse" : "default"} />
          <span className="brandBeta">BETA</span>
        </div>

        <div className="navlinks">
          {LINKS.map(([label, href]) => (
            <Link className={active(href) ? "active" : ""} href={withCountry(href)} key={href}>{label}</Link>
          ))}
          <Link className={active("/track") ? "active" : ""} href="/track">TRACK</Link>
        </div>

        <div className="navRight">
          <div className={`countrySwitcher ${countryOpen ? "open" : ""}`}>
            <button type="button" onClick={() => setCountryOpen(v => !v)} aria-expanded={countryOpen} aria-label={`Market: ${market.shortName}`}>
              <span className="countryCode">{market.code}</span>
              <span className="countryName">{market.shortName}</span>
              <ChevronDown size={13}/>
            </button>
            <div className="countryMenu">
              {COUNTRY_OPTIONS.map(opt => (
                <button type="button" key={opt.value} className={opt.value === country ? "active" : ""} onClick={() => switchCountry(opt.value)}>
                  <span className="countryCode">{opt.value}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
          <Link className="portalLink realtorPortalLink" href="/login"><LogIn size={14}/><span className="portalFull">REALTOR PORTAL</span><span className="portalShort">PORTAL</span></Link>
          <Link className="navAction" href={withCountry("/get-started")}><span>SUBMIT REQUIREMENT</span> <ArrowUpRight size={16}/></Link>
        </div>

        <button className="mobileMenuButton" onClick={() => setOpen(v => !v)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"}>
          {open ? <X size={22}/> : <Menu size={22}/>} 
        </button>
      </nav>

      <div id="mobile-menu" className={`mobileMenu ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="mobileMenuInner">
          <div className="mobileMenuHead"><BrandLogo variant="horizontal" tone="inverse" className="mobileMenuBrand"/><span>PUBLIC BETA</span></div>
          <div className="mobileMenuLinks">
            <Link href={withCountry("/")}><span>00</span>HOME<ArrowUpRight/></Link>
            {LINKS.map(([label, href], i) => (
              <Link href={withCountry(href)} key={href}><span>0{i + 1}</span>{label}<ArrowUpRight/></Link>
            ))}
            <Link href={withCountry("/about")}><span>04</span>ABOUT<ArrowUpRight/></Link>
          </div>
          <div className="mobileCountrySwitch" aria-label="Choose market">
            <span>MARKET</span>
            <div>
              {COUNTRY_OPTIONS.map(opt => (
                <button type="button" key={opt.value} className={opt.value === country ? "active" : ""} onClick={() => switchCountry(opt.value)}>
                  <b>{opt.value}</b>{opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mobileMenuActions">
            <Link className="mobilePrimary" href={withCountry("/get-started")}>SUBMIT REQUIREMENT <ArrowUpRight/></Link>
            <Link className="mobileSecondary" href="/login">REALTOR LOGIN <LogIn/></Link>
          </div>
        </div>
      </div>

      {showDock && <div className="mobileDock" aria-label="Quick actions">
        <Link href={withCountry("/")}><Home size={16}/><span>HOME</span></Link>
        <Link className="mobileDockPrimary" href={withCountry("/get-started")}><span>SUBMIT REQUIREMENT</span><ArrowUpRight size={16}/></Link>
        <Link href="/login"><LogIn size={16}/><span>PORTAL</span></Link>
      </div>}
    </>
  );
}
