import Link from "next/link";

import { LoginForm } from "@/components/admin/login-form";
import { SiteLogo } from "@/components/layout/site-logo";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <div className="mb-6 flex justify-center">
        <SiteLogo size={72} alt="" />
      </div>
      <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
        Admin
      </p>
      <h1 className="mt-2 font-heading text-3xl tracking-tight text-foreground">
        Sign in
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Manage catalog content and site copy. Storefront visitors never see this
        screen.
      </p>
      <LoginForm configError={sp.error === "config"} />
      <p className="mt-8 text-center text-xs text-muted-foreground">
        <Link href="/" className="underline-offset-4 hover:underline">
          Back to site
        </Link>
      </p>
    </div>
  );
}
