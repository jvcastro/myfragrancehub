export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PRODUCT_IMAGE_MAX_COUNT = 5;

export const PRODUCT_IMAGE_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type ProductImageContentType = (typeof PRODUCT_IMAGE_ALLOWED_TYPES)[number];

export function isProductImageContentType(v: string): v is ProductImageContentType {
  return (PRODUCT_IMAGE_ALLOWED_TYPES as readonly string[]).includes(v);
}
