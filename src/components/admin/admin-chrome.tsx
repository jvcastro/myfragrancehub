"use client";

import { usePathname } from "next/navigation";

import { AdminSidebar } from "@/components/admin/admin-sidebar";

export function AdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[calc(100dvh-4.5rem)] flex-1">
      <AdminSidebar />
      <div className="min-w-0 flex-1 bg-background">{children}</div>
    </div>
  );
}
