import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  variant?: "horizontal" | "mark" | "stacked";
  tone?: "default" | "inverse";
  className?: string;
};

export function BrandLogo({ variant = "horizontal", tone = "default", className = "" }: BrandLogoProps) {
  const file = `${variant}${tone === "inverse" ? "-inverse" : ""}.png`;
  const dimensions = variant === "mark"
    ? { width: 182, height: 100 }
    : variant === "stacked"
      ? { width: 225, height: 174 }
      : { width: 480, height: 83 };

  return (
    <Link href="/" className={`brandLogo brandLogo--${variant} ${className}`.trim()} aria-label="Blueprint Buddies home">
      <Image
        src={`/images/brand/${file}`}
        alt="Blueprint Buddies"
        width={dimensions.width}
        height={dimensions.height}
        priority={variant === "horizontal"}
      />
    </Link>
  );
}
