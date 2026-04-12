/**
 * Append prefilled text to Messenger / m.me style URLs when possible.
 *
 * Links should open in the **same tab** (no `target="_blank"`) so phones can
 * hand off `https://m.me/…` to the Messenger app via universal links / OS
 * routing. Use an `https://m.me/PageUsername` URL in site settings for best results.
 */
export function buildMessengerInquiryUrl(
  baseUrl: string | null | undefined,
  prefilledMessage: string,
): string {
  if (!baseUrl?.trim()) return "#";
  try {
    const u = new URL(baseUrl);
    if (prefilledMessage.trim()) {
      u.searchParams.set("text", prefilledMessage);
    }
    return u.toString();
  } catch {
    const sep = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${sep}text=${encodeURIComponent(prefilledMessage)}`;
  }
}
