import Link from "next/link";

const cities = [
  ["Karachi", "/cities/karachi"],
  ["Lahore", "/cities/lahore"],
  ["Islamabad", "/cities/islamabad"],
  ["Rawalpindi", "/cities/rawalpindi"],
];

export function Footer() {
  return (
    <footer>
      <div className="footerGrid">
        <div>
          <div className="footerBrand">CREAIONX<br/>PROPERTY</div>
          <p>Qualified property demand.<br/>Pakistan, market by market.</p>
        </div>
        <div>
          <strong>PLATFORM</strong>
          <Link href="/get-started">Submit Requirement</Link>
          <Link href="/how-it-works">How It Works</Link>
          <Link href="/for-realtors">For Realtors</Link>
          <Link href="/login">Realtor Login</Link>
        </div>
        <div>
          <strong>MARKETS</strong>
          {cities.map(([name, href]) => <Link href={href} key={name}>{name}</Link>)}
        </div>
        <div>
          <strong>COMPANY</strong>
          <Link href="/about">About</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/lead-policy">Lead Policy</Link>
        </div>
      </div>
      <div className="footerBottom"><span>2026</span><p>© CREAIONX PROPERTY. BETA.</p></div>
    </footer>
  );
}
