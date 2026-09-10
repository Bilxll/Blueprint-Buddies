import Image from "next/image";

type HeroArtworkProps = {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
};

export function HeroArtwork({ src, alt, priority = false, className = "" }: HeroArtworkProps) {
  return (
    <figure className={`heroArtwork ${className}`.trim()}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 900px) 100vw, 48vw"
        className="heroArtworkImage"
      />
      <span className="heroArtworkFrame" aria-hidden="true" />
    </figure>
  );
}
