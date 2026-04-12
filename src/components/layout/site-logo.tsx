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
  const common = cn("shrink-0 object-contain", className);
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <Image
        src={siteConfig.logoPath}
        alt={alt}
        width={size}
        height={size}
        className={cn(common, "dark:hidden")}
        priority={priority}
      />
      <Image
        src={siteConfig.logoPathDark}
        alt={alt}
        width={size}
        height={size}
        className={cn(common, "absolute inset-0 hidden dark:block")}
        priority={false}
      />
    </span>
  );
}
