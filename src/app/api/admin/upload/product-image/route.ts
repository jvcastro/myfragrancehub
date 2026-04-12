import { NextResponse } from "next/server";

import {
  PRODUCT_IMAGE_MAX_BYTES,
  isProductImageContentType,
} from "@/constants/product-images";
import { parseSessionTokenFromCookieHeader, verifyAdminToken } from "@/lib/auth/session";
import { isR2ProductUploadConfigured, uploadProductImagePutObject } from "@/lib/r2";

export const runtime = "nodejs";
/** Large images + R2 latency (Vercel / similar; no-op elsewhere). */
export const maxDuration = 60;

async function requireAdminSession(req: Request) {
  const token = parseSessionTokenFromCookieHeader(req.headers.get("cookie"));
  if (!token) return null;
  try {
    const session = await verifyAdminToken(token);
    return session?.adminUserId ? session : null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const session = await requireAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isR2ProductUploadConfigured()) {
    return NextResponse.json({ error: "Upload is not configured." }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing file field." }, { status: 400 });
  }

  if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
    return NextResponse.json(
      { error: `Each image must be at most ${PRODUCT_IMAGE_MAX_BYTES / (1024 * 1024)}MB.` },
      { status: 400 },
    );
  }

  if (!isProductImageContentType(file.type)) {
    return NextResponse.json({ error: "Use JPEG, PNG, WebP, or GIF." }, { status: 400 });
  }

  const buf = new Uint8Array(await file.arrayBuffer());

  try {
    const { publicUrl } = await uploadProductImagePutObject({
      body: buf,
      contentType: file.type,
    });
    return NextResponse.json({ publicUrl });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
