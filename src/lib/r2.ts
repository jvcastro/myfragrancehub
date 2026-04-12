import "server-only";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import {
  PRODUCT_IMAGE_ALLOWED_TYPES,
  PRODUCT_IMAGE_MAX_BYTES,
  type ProductImageContentType,
} from "@/constants/product-images";

let cachedClient: S3Client | null = null;

function getBucket(): string {
  const bucket = process.env.R2_BUCKET_NAME?.trim();
  if (!bucket) throw new Error("R2_BUCKET_NAME is not set.");
  return bucket;
}

function getS3Client(): S3Client {
  if (cachedClient) return cachedClient;

  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2 credentials are incomplete. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY.",
    );
  }

  cachedClient = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return cachedClient;
}

/**
 * When `R2_PUBLIC_BASE_URL` is set but wrong for browser reads, returns a short error message; otherwise null.
 * (The S3 API host requires SigV4; opening it in a tab returns InvalidArgument / Authorization XML.)
 */
export function getR2PublicUrlConfigurationIssue(): string | null {
  const raw = process.env.R2_PUBLIC_BASE_URL?.trim();
  if (!raw) return null;
  const base = raw.replace(/\/$/, "");
  try {
    const u = new URL(base);
    if (u.protocol !== "https:") {
      return "R2_PUBLIC_BASE_URL must use https.";
    }
    if (u.hostname.endsWith(".r2.cloudflarestorage.com")) {
      return (
        "Do not use *.r2.cloudflarestorage.com — that URL is for the S3 API only. " +
        "Use the bucket’s public r2.dev URL (R2 → bucket → Settings → Public access) or a custom domain."
      );
    }
  } catch {
    return "R2_PUBLIC_BASE_URL must be a valid https URL (no trailing slash).";
  }
  return null;
}

export function getR2PublicBaseUrl(): string {
  const base = process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/$/, "");
  if (!base) {
    throw new Error(
      "R2_PUBLIC_BASE_URL is not set. Use your R2 public bucket URL (https, no trailing slash).",
    );
  }
  const issue = getR2PublicUrlConfigurationIssue();
  if (issue) {
    throw new Error(issue);
  }
  return base;
}

export function isR2ProductUploadConfigured(): boolean {
  if (
    !(
      process.env.R2_ACCOUNT_ID?.trim() &&
      process.env.R2_ACCESS_KEY_ID?.trim() &&
      process.env.R2_SECRET_ACCESS_KEY?.trim() &&
      process.env.R2_BUCKET_NAME?.trim() &&
      process.env.R2_PUBLIC_BASE_URL?.trim()
    )
  ) {
    return false;
  }
  return getR2PublicUrlConfigurationIssue() === null;
}

function extensionForContentType(contentType: ProductImageContentType): string {
  switch (contentType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
  }
}

/** Server-side PutObject (same-origin upload proxy). Avoids browser→R2 CORS. */
export async function uploadProductImagePutObject(input: {
  body: Uint8Array;
  contentType: ProductImageContentType;
}): Promise<{ publicUrl: string }> {
  if (input.body.byteLength > PRODUCT_IMAGE_MAX_BYTES) {
    throw new Error(`Image exceeds ${PRODUCT_IMAGE_MAX_BYTES / (1024 * 1024)}MB limit.`);
  }
  if (!PRODUCT_IMAGE_ALLOWED_TYPES.includes(input.contentType)) {
    throw new Error("Unsupported image type.");
  }

  const publicBase = getR2PublicBaseUrl();

  const bucket = getBucket();
  const key = `products/${crypto.randomUUID()}.${extensionForContentType(input.contentType)}`;

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: input.body,
      ContentType: input.contentType,
      ContentLength: input.body.byteLength,
    }),
  );

  return { publicUrl: `${publicBase}/${key}` };
}
