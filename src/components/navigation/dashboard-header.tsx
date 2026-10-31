"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useDashboardUser } from "@/components/providers/dashboard-user-context";

export function DashboardHeader({
  title,
  subtitle,
  actions,
}: {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  const { user, loading } = useDashboardUser();

  return (
    <header className="h-16 border-b border-[rgba(243,240,232,0.08)] bg-[#111110] px-6 flex items-center justify-between sticky top-0 z-30">
      <div>
        {title && (
          <h1 className="font-display text-lg font-bold text-[#F3F0E8] leading-tight">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-xs text-[#A39E93]">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {actions}
        <Link
          href="/dashboard/subscription"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(255,170,61,0.12)] border border-[rgba(255,170,61,0.25)] text-[10px] font-medium text-[#FFAA3D] hover:bg-[rgba(255,170,61,0.2)] transition-colors"
          title="Beta Sandbox Test Mode Active"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFAA3D] animate-pulse" />
          <span>Beta Test Mode</span>
        </Link>
        <Link
          href="/dashboard/notifications"
          className="p-2 rounded-[8px] text-[#A39E93] hover:text-[#F3F0E8] hover:bg-[#161514] transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#E84B2C] absolute top-1.5 right-1.5" />
        </Link>

        <div className="flex items-center gap-2 pl-2 border-l border-[rgba(243,240,232,0.08)]">
          <Link
            href="/dashboard/settings"
            title={user?.fullName ? `${user.fullName} (${user.email})` : user?.email || "Account Settings"}
            className="w-8 h-8 rounded-full bg-[#161514] border border-[rgba(243,240,232,0.12)] hover:border-[rgba(232,75,44,0.4)] flex items-center justify-center font-technical text-xs font-bold text-[#FFAA3D] transition-colors"
          >
            {loading ? (
              <span className="w-3 h-3 rounded-full bg-[#252422] animate-pulse" />
            ) : (
              user?.initials || "U"
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
