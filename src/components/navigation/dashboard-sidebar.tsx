"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useDashboardUser } from "@/components/providers/dashboard-user-context";
import {
  LayoutDashboard,
  Users,
  Send,
  CreditCard,
  Receipt,
  Sliders,
  Settings,
  Bell,
  LogOut,
  Sparkles,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Leads", href: "/dashboard/leads", icon: Users },
  { label: "Lead Requests", href: "/dashboard/requests", icon: Send },
  { label: "Subscription", href: "/dashboard/subscription", icon: CreditCard },
  { label: "Billing", href: "/dashboard/billing", icon: Receipt },
  { label: "Preferences", href: "/dashboard/preferences", icon: Sliders },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, loading, signOut } = useDashboardUser();

  return (
    <aside className="w-64 border-r border-[rgba(243,240,232,0.08)] bg-[#111110] flex flex-col justify-between shrink-0 h-full select-none z-30">
      <div className="space-y-6 p-4 overflow-y-auto min-h-0">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 px-2 py-1 group">
          <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[rgba(232,75,44,0.35)] flex items-center justify-center bg-[#161514]">
            <Image
              src="/arenova.png"
              alt="Arenova"
              width={22}
              height={22}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-base font-bold tracking-wider text-[#F3F0E8] group-hover:text-[#FFAA3D] transition-colors">
              AROVA
            </span>
            <span className="text-[9px] font-medium tracking-widest text-[#A39E93] uppercase">
              Dashboard
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-[8px] text-xs font-medium transition-colors select-none",
                  isActive
                    ? "bg-[#161514] text-[#F3F0E8] border border-[rgba(232,75,44,0.35)] shadow-[0_0_15px_rgba(232,75,44,0.1)]"
                    : "text-[#D0CBC1] hover:text-[#F3F0E8] hover:bg-[#161514]/60"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive ? "text-[#E84B2C]" : "text-[#A39E93]"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / Subscription & Logout */}
      <div className="p-4 border-t border-[rgba(243,240,232,0.06)] space-y-2 shrink-0">
        {loading ? (
          <div className="px-3 py-2.5 rounded-[8px] bg-[#161514] border border-[rgba(243,240,232,0.06)] animate-pulse">
            <div className="h-2.5 bg-[#252422] rounded w-20 mb-1.5" />
            <div className="h-2 bg-[#1f1e1c] rounded w-28" />
          </div>
        ) : user?.isSubscriber ? (
          <Link
            href="/dashboard/subscription"
            className="block px-3 py-2 rounded-[8px] bg-[#161514] border border-[rgba(52,211,153,0.2)] hover:border-[rgba(52,211,153,0.4)] text-[11px] text-[#A39E93] transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[#34D399] font-medium block">Active Subscriber</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
            </div>
            <span className="text-[10px] font-technical text-[#D0CBC1] group-hover:text-[#F3F0E8] transition-colors block mt-0.5">
              {user.subscription?.planName || "Starter Plan"} · Exclusive Pipeline
            </span>
          </Link>
        ) : (
          <Link
            href="/dashboard/subscription"
            className="block px-3 py-2 rounded-[8px] bg-[#161514] border border-[rgba(255,170,61,0.25)] hover:border-[rgba(255,170,61,0.5)] text-[11px] text-[#A39E93] transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[#FFAA3D] font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#FFAA3D]" />
                Free Account
              </span>
              <span className="text-[10px] text-[#FFAA3D] underline">Upgrade</span>
            </div>
            <span className="text-[10px] font-technical text-[#9E9B93] group-hover:text-[#D0CBC1] transition-colors block mt-0.5">
              No active subscription plan
            </span>
          </Link>
        )}

        <button
          onClick={signOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-xs font-medium text-[#A39E93] hover:text-[#E84B2C] hover:bg-[#161514] transition-colors text-left"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
