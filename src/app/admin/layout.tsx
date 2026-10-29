"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/navigation/admin-sidebar";
import { RefreshCw } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setChecking(false);
      return;
    }

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/admin-session");
        const data = await res.json();
        if (data.isAdmin) {
          setIsAuthorized(true);
        } else {
          router.push("/admin/login");
        }
      } catch {
        router.push("/admin/login");
      } finally {
        setChecking(false);
      }
    }

    checkAuth();
  }, [pathname, router]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#080505] text-xs text-[#A39E93] gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-[#FFAA3D]" />
        <span>Verifying administrative authorization...</span>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-[#080505] relative">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
