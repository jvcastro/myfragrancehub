/**
 * Next.js Image Optimization fetches remotes on the server. R2’s S3 API hostname
 * (`*.r2.cloudflarestorage.com`) often returns 400 for those GETs even when the
 * object is readable in the browser. Skip the optimizer in that case.
 *
 * Prefer `R2_PUBLIC_BASE_URL` pointing at `https://pub-*.r2.dev` or your custom
 * domain so optimization can run.
 */
export function remoteImageShouldBypassNextOptimizer(src: string): boolean {
  try {
    return new URL(src).hostname.endsWith(".r2.cloudflarestorage.com");
  } catch {
    return false;
  }
}
