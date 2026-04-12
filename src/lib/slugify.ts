/** URL-safe slug from a display string (ASCII-ish; strips combining marks). */
export function slugify(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  const s = trimmed
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  return s;
}
