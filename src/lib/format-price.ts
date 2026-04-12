/** Store currency — prices in DB are stored as decimal amounts in this currency. */
export const STORE_CURRENCY_CODE = "PHP" as const;

const LOCALE = "en-PH";

/**
 * Format a numeric product price for display (Philippine peso).
 */
export function formatPhp(amount: string | number): string {
  const n = typeof amount === "string" ? Number.parseFloat(amount) : amount;
  if (!Number.isFinite(n)) {
    return new Intl.NumberFormat(LOCALE, {
      style: "currency",
      currency: STORE_CURRENCY_CODE,
    }).format(0);
  }
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: STORE_CURRENCY_CODE,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}
