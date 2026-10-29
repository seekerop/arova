"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/navigation/dashboard-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import {
  Bell,
  Clock,
  RefreshCw,
} from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await fetch("/api/dashboard/notifications", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader
        title="Notifications"
        subtitle="In-app alerts for lead offers, claim expirations, and subscription renewals"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchNotifications} disabled={loading}>
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllRead}>
                Mark all as read
              </Button>
            )}
          </div>
        }
      />

      <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#A39E93]">
            {unreadCount} unread alert{unreadCount !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <Card className="p-12 bg-[#111110] border-[rgba(243,240,232,0.08)] text-center text-xs text-[#A39E93]">
            <RefreshCw className="w-5 h-5 animate-spin text-[#FFAA3D] mx-auto mb-2" />
            Loading notifications...
          </Card>
        ) : notifications.length === 0 ? (
          <Card className="p-16 bg-[#111110] border-[rgba(243,240,232,0.08)] text-center space-y-3">
            <Bell className="w-8 h-8 text-[#A39E93] mx-auto opacity-40" />
            <h4 className="font-display text-base font-bold text-[#F3F0E8]">
              No Notifications
            </h4>
            <p className="text-xs text-[#A39E93] max-w-sm mx-auto">
              Alerts regarding new lead offers, 48-hour expiration warnings, and quota renewals will be displayed here.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <Card
                key={n.id}
                className={`p-4 bg-[#111110] border transition-all ${
                  n.is_read
                    ? "border-[rgba(243,240,232,0.06)] opacity-70"
                    : "border-[rgba(232,75,44,0.35)] shadow-[0_0_15px_rgba(232,75,44,0.05)]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[#F3F0E8]">
                        {n.title}
                      </span>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[#E84B2C]" />
                      )}
                    </div>
                    <p className="text-xs text-[#D0CBC1] leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                  <span className="text-[10px] text-[#A39E93] shrink-0 font-technical">
                    {formatDate(n.created_at)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
