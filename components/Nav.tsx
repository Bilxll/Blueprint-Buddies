"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Home, LogIn, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const LINKS = [
  ["HOW IT WORKS", "/how-it-works"],
  ["CITIES", "/cities"],
  ["FOR REALTORS", "/for-realtors"],
] as const;

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
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

  const active = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
  const showDock = !pathname.startsWith("/realtor/") && !pathname.startsWith("/admin") && pathname !== "/login" && pathname !== "/join-realtor" && pathname !== "/get-started";

  return (
    <>
      <nav className={`nav ${scrolled ? "navScrolled" : ""}`} aria-label="Primary navigation">
        <Link className="brand" href="/" aria-label="Blueprint Buddies home">
          <span className="brandDot" aria-hidden="true" />
          <span className="brandWords">BLUEPRINT <b>BUDDIES</b></span>
          <small>BETA</small>
        </Link>

        <div className="navlinks">
          {LINKS.map(([label, href]) => (
            <Link className={active(href) ? "active" : ""} href={href} key={href}>{label}</Link>
          ))}
        </div>

        <div className="navRight">
          <Link className="portalLink" href="/login"><LogIn size={14}/> REALTOR PORTAL</Link>
          <Link className="navAction" href="/get-started">SUBMIT REQUIREMENT <ArrowUpRight size={16}/></Link>
        </div>

        <button className="mobileMenuButton" onClick={() => setOpen(v => !v)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"}>
          {open ? <X size={22}/> : <Menu size={22}/>} 
        </button>
      </nav>

      <div id="mobile-menu" className={`mobileMenu ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="mobileMenuInner">
          <div className="mobileMenuHead"><p className="eyebrow">NAVIGATION</p><span>BLUEPRINT / BUDDIES</span></div>
          <div className="mobileMenuLinks">
            <Link href="/"><span>00</span>HOME<ArrowUpRight/></Link>
            {LINKS.map(([label, href], i) => (
              <Link href={href} key={href}><span>0{i + 1}</span>{label}<ArrowUpRight/></Link>
            ))}
            <Link href="/about"><span>04</span>ABOUT<ArrowUpRight/></Link>
          </div>
          <div className="mobileMenuActions">
            <Link className="mobilePrimary" href="/get-started">SUBMIT REQUIREMENT <ArrowUpRight/></Link>
            <Link className="mobileSecondary" href="/login">REALTOR LOGIN <LogIn/></Link>
          </div>
        </div>
      </div>

      {showDock && <div className="mobileDock" aria-label="Quick actions">
        <Link href="/"><Home size={16}/><span>HOME</span></Link>
        <Link className="mobileDockPrimary" href="/get-started"><span>SUBMIT REQUIREMENT</span><ArrowUpRight size={16}/></Link>
        <Link href="/login"><LogIn size={16}/><span>PORTAL</span></Link>
      </div>}
    </>
  );
}
