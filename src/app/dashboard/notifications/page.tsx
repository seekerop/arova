"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/navigation/dashboard-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import {
  Bell,
  Clock,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: "notif_1",
      title: "New Lead Available for Review",
      message: "A new prospective business lead in Bengaluru is ready. You have 48 hours to accept or decline.",
      type: "offer",
      is_read: false,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "notif_2",
      title: "Lead Claimed Exclusively",
      message: "Contact details for Apex Retail Solutions unlocked. 30-day exclusive outreach window started.",
      type: "claim",
      is_read: false,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "notif_3",
      title: "Subscription Activated",
      message: "Your Starter Plan subscription was activated. 40 leads quota allocated for 30 days.",
      type: "subscription",
      is_read: true,
      created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader
        title="Notifications"
        subtitle="In-app alerts for lead offers, claim expirations, and subscription renewals"
      />

      <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#A39E93]">
            {notifications.filter((n) => !n.is_read).length} unread alerts
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllRead}
            className="text-xs text-[#FFAA3D] hover:text-[#F3F0E8]"
          >
            Mark all as read
          </Button>
        </div>

        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`p-4 border transition-colors ${
                !n.is_read
                  ? "bg-[#161514] border-[rgba(232,75,44,0.3)] shadow-[0_0_15px_rgba(232,75,44,0.08)]"
                  : "bg-[#111110] border-[rgba(243,240,232,0.06)]"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-[6px] bg-[#211B17] shrink-0 text-[#FFAA3D] mt-0.5">
                  {n.type === "offer" && <Clock className="w-4 h-4 text-[#FFAA3D]" />}
                  {n.type === "claim" && <ShieldCheck className="w-4 h-4 text-[#34D399]" />}
                  {n.type === "subscription" && <CreditCard className="w-4 h-4 text-[#E84B2C]" />}
                  {n.type === "warning" && <AlertTriangle className="w-4 h-4 text-[#FFAA3D]" />}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-semibold text-xs text-[#F3F0E8]">
                      {n.title}
                    </h4>
                    <span className="text-[10px] font-technical text-[#9E9B93]">
                      {formatDate(n.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-[#D0CBC1] leading-relaxed">
                    {n.message}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

