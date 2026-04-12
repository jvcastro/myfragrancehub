import Image from "next/image";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type SiteLogoProps = {
  size?: number;
  className?: string;
  /** Empty string when the logo sits inside a control with an accessible name (e.g. home link). */
  alt?: string;
  priority?: boolean;
};

export function SiteLogo({
  size = 40,
  className,
  alt = "",
  priority = false,
}: SiteLogoProps) {
  return (
    <Image
      src={siteConfig.logoPath}
      alt={alt}
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
      priority={priority}
    />
  );
}
