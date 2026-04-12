"use client";

/**
 * Fallback when the root layout fails. Keeps markup self-contained (no shared CSS).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="m-0 min-h-[100dvh] bg-[#faf9f6] px-6 py-16 font-sans text-[#1c1917] antialiased">
        <div className="mx-auto max-w-md text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#78716c]">
            Error
          </p>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">
            Something went wrong
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#57534e]">
            The app could not render. Try again, or refresh the page.
          </p>
          <button
            type="button"
            className="mt-8 inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-[#d6d3d1] bg-[#1c1917] px-4 text-sm font-medium text-[#fafaf9] transition-colors hover:bg-[#292524]"
            onClick={() => reset()}
          >
            Try again
          </button>
          {error.digest ? (
            <p className="mt-8 font-mono text-xs text-[#a8a29e]">{error.digest}</p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
