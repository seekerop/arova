"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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
  ShieldCheck,
  TrendingUp,
  Globe,
  Target,
  FileText,
  CheckSquare,
  Calendar,
  Bot,
  Sliders,
  Compass,
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

const redditNavItems = [
  { label: "Reddit Overview", href: "/admin/reddit", icon: TrendingUp },
  { label: "Campaigns", href: "/admin/reddit/campaigns", icon: Compass },
  { label: "Communities", href: "/admin/reddit/communities", icon: Globe },
  { label: "Opportunities", href: "/admin/reddit/opportunities", icon: Target },
  { label: "Content Drafts", href: "/admin/reddit/content", icon: FileText },
  { label: "Approvals", href: "/admin/reddit/approvals", icon: CheckSquare },
  { label: "Calendar", href: "/admin/reddit/calendar", icon: Calendar },
  { label: "Attribution", href: "/admin/reddit/analytics", icon: BarChart3 },
  { label: "Live Agents", href: "/admin/reddit/agents", icon: Bot },
  { label: "Growth Settings", href: "/admin/reddit/settings", icon: Sliders },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/auth/admin-logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  };

  return (
    <aside className="w-64 border-r border-[rgba(243,240,232,0.08)] bg-[#0D0D0C] flex flex-col justify-between shrink-0 h-full select-none z-30">
      <div className="space-y-5 p-4 overflow-y-auto min-h-0">
        {/* Brand */}
        <Link href="/admin" className="flex items-center gap-2.5 px-2 py-1 group">
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
              Admin Console
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <div className="space-y-4">
          <nav className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-semibold tracking-wider text-[#A39E93] uppercase">
              Core Operations
            </div>
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href) && !pathname.startsWith("/admin/reddit");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-xs font-medium transition-colors select-none",
                    isActive
                      ? "bg-[#161514] text-[#FFAA3D] border border-[rgba(232,75,44,0.4)] shadow-[0_0_15px_rgba(232,75,44,0.1)]"
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

          <nav className="space-y-1 pt-2 border-t border-[rgba(243,240,232,0.06)]">
            <div className="px-3 pb-1 flex items-center justify-between">
              <span className="text-[10px] font-semibold tracking-wider text-[#E84B2C] uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E84B2C] animate-pulse" />
                Reddit Growth
              </span>
              <span className="text-[9px] font-technical px-1.5 py-0.5 rounded bg-[rgba(232,75,44,0.15)] text-[#FFAA3D] border border-[rgba(232,75,44,0.3)]">
                AI Agent
              </span>
            </div>
            {redditNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin/reddit"
                  ? pathname === "/admin/reddit"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-xs font-medium transition-colors select-none",
                    isActive
                      ? "bg-[#161514] text-[#FFAA3D] border border-[rgba(232,75,44,0.4)] shadow-[0_0_15px_rgba(232,75,44,0.1)]"
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
      </div>

      {/* Admin Profile & Logout */}
      <div className="p-4 border-t border-[rgba(243,240,232,0.06)] space-y-2 shrink-0">
        <div className="px-3 py-2 rounded-[8px] bg-[#161514] border border-[rgba(232,75,44,0.2)] text-[11px] text-[#A39E93]">
          <span className="text-[#FFAA3D] font-medium block flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
            Single Admin Owner
          </span>
          <span className="text-[10px] font-technical text-[#9E9B93] block truncate mt-0.5">
            avi@arenova.in
          </span>
        </div>
        <button
          onClick={handleLogout}
          type="button"
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-xs font-medium text-[#A39E93] hover:text-[#E84B2C] hover:bg-[#161514] transition-colors text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Admin Session</span>
        </button>
      </div>
    </aside>
  );
}
