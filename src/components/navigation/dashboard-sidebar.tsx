"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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

  return (
    <aside className="w-64 border-r border-[rgba(243,240,232,0.08)] bg-[#111110] flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div className="space-y-6 p-4">
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

      {/* Bottom Profile / Logout */}
      <div className="p-4 border-t border-[rgba(243,240,232,0.06)] space-y-2">
        <div className="px-3 py-2 rounded-[8px] bg-[#161514] border border-[rgba(243,240,232,0.06)] text-[11px] text-[#A39E93]">
          <span className="text-[#34D399] font-medium block">Active Subscriber</span>
          <span className="text-[10px] font-technical text-[#9E9B93]">30-Day Exclusive Claim Active</span>
        </div>
        <Link
          href="/login"
          className="flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-xs font-medium text-[#A39E93] hover:text-[#E84B2C] hover:bg-[#161514] transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </Link>
      </div>
    </aside>
  );
}

