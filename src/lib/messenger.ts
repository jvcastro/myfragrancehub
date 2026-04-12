/**
 * Append prefilled text to Messenger / m.me style URLs when possible.
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
