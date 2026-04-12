import { buttonVariants } from "@/components/ui/button";
import { buildMessengerInquiryUrl } from "@/lib/messenger";
import { cn } from "@/lib/utils";

export function MessengerCta({
  messengerHref,
  productName,
  className,
  size = "lg",
  /** When set, overrides the default (outline when linked, secondary when placeholder). */
  buttonVariant,
}: {
  messengerHref: string | null | undefined;
  productName?: string;
  className?: string;
  size?: "default" | "lg";
  buttonVariant?: "default" | "outline" | "secondary" | "ghost";
}) {
  const message = productName
    ? `Hi, I'm interested in ${productName}. Is this still available?`
    : "Hi, I'd like to inquire about fragrances on your site.";
  const href = buildMessengerInquiryUrl(messengerHref, message);
  const isPlaceholder = !messengerHref?.trim();
  const variant =
    buttonVariant ?? (isPlaceholder ? "secondary" : "default");

  return (
    <a
      href={href}
      {...(!isPlaceholder ? {} : { "aria-disabled": true })}
      className={cn(
        buttonVariants({
          variant,
          size,
        }),
        !isPlaceholder && variant === "default" && "shadow-sm",
        className,
      )}
    >
      Inquire via Messenger
    </a>
  );
}
