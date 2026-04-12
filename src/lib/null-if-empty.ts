/** Normalize optional text for Prisma nullable string columns. */
export function nullIfEmpty(s: string | undefined | null): string | null {
  const t = typeof s === "string" ? s.trim() : "";
  return t ? t : null;
}
