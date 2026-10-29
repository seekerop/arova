"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Database,
  UploadCloud,
  Inbox,
  Send,
  Users,
  CreditCard,
  Receipt,
  MessageSquareWarning,
  BarChart3,
  ScrollText,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";

const adminNavItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Lead Inventory", href: "/admin/leads", icon: Database },
  { label: "CSV/XLSX Imports", href: "/admin/imports", icon: UploadCloud },
  { label: "Lead Requests", href: "/admin/requests", icon: Inbox },
  { label: "Deliveries & Jobs", href: "/admin/deliveries", icon: Send },
  { label: "Customer Accounts", href: "/admin/customers", icon: Users },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { label: "Payments & Webhooks", href: "/admin/payments", icon: Receipt },
  { label: "Quality Feedback", href: "/admin/feedback", icon: MessageSquareWarning },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
  { label: "Admin Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-[rgba(243,240,232,0.08)] bg-[#0D0D0C] flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div className="space-y-5 p-4 overflow-y-auto">
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
            <span className="text-[9px] font-semibold tracking-widest text-[#E84B2C] uppercase flex items-center gap-1">
              <Shield className="w-2.5 h-2.5" />
              Admin Portal
            </span>
          </div>
        </Link>

        {/* Nav list */}
        <nav className="space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
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

      <div className="p-4 border-t border-[rgba(243,240,232,0.06)] space-y-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] text-xs text-[#FFAA3D] hover:underline"
        >
          Switch to Customer View →
        </Link>
        <Link
          href="/login"
          className="flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-xs font-medium text-[#A39E93] hover:text-[#E84B2C] hover:bg-[#161514] transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Admin</span>
        </Link>
      </div>
    </aside>
  );
}
