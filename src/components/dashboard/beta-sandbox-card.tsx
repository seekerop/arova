"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useDashboardUser } from "@/components/providers/dashboard-user-context";
import {
  FlaskConical,
  Zap,
  Sparkles,
  RefreshCw,
  Inbox,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
} from "lucide-react";

export function BetaSandboxCard({ onActionComplete }: { onActionComplete?: () => void }) {
  const { user, refreshUser } = useDashboardUser();
  const [passcode, setPasscode] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const isBetaActive = user?.subscription?.status === "active";
  const activePlan = user?.subscription?.planName || null;

  const handleActivateBetaPlan = async (planCode: "starter" | "growth") => {
    setLoadingAction(`activate_${planCode}`);
    setFeedback(null);

    try {
      const res = await fetch("/api/beta/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode,
          passcode: passcode || undefined,
          autoSeedLeads: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to activate beta plan");
      }

      await refreshUser();
      if (onActionComplete) onActionComplete();

      setFeedback({
        type: "success",
        message: data.message || `Successfully activated ${planCode} plan for beta testing!`,
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Activation failed. Please check passcode.",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleResetQuota = async () => {
    setLoadingAction("reset_quota");
    setFeedback(null);

    try {
      const res = await fetch("/api/beta/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: passcode || undefined }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset quota");
      }

      await refreshUser();
      if (onActionComplete) onActionComplete();

      setFeedback({
        type: "success",
        message: data.message || "Test quota has been reset to 100% full balance.",
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Quota reset failed.",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeliverSampleLeads = async () => {
    setLoadingAction("deliver_leads");
    setFeedback(null);

    try {
      const res = await fetch("/api/beta/seed-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: passcode || undefined }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to deliver sample leads");
      }

      await refreshUser();
      if (onActionComplete) onActionComplete();

      setFeedback({
        type: "success",
        message:
          data.result?.message ||
          "Delivered 3 sample verified leads with 48h countdown timers to your review inbox!",
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Lead delivery failed. Ensure you have an active beta plan.",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <Card className="p-6 bg-[#111110] border border-[rgba(255,170,61,0.25)] shadow-[0_0_35px_-8px_rgba(255,170,61,0.12)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[rgba(243,240,232,0.06)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[8px] bg-[rgba(255,170,61,0.12)] border border-[rgba(255,170,61,0.3)] flex items-center justify-center shrink-0">
            <FlaskConical className="w-5 h-5 text-[#FFAA3D]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base text-[#F3F0E8]">
                Beta Testing Sandbox
              </h3>
              <Badge variant="amber" size="sm">
                TEST MODE
              </Badge>
            </div>
            <p className="text-xs text-[#A39E93] mt-0.5">
              Simulate full subscription allocations and test lead claim workflows without real payment charges.
            </p>
          </div>
        </div>

        {isBetaActive && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(52,211,153,0.1)] border border-[rgba(52,211,153,0.25)] text-[11px] text-[#34D399]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
            <span>Active: {activePlan}</span>
          </div>
        )}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-[8px] text-xs flex items-center gap-2.5 border ${
            feedback.type === "success"
              ? "bg-[rgba(52,211,153,0.1)] border-[rgba(52,211,153,0.3)] text-[#34D399]"
              : "bg-[rgba(232,75,44,0.1)] border-[rgba(232,75,44,0.3)] text-[#E84B2C]"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Passcode (Optional override) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 rounded-[8px] bg-[#161514] border border-[rgba(243,240,232,0.06)]">
        <div className="flex items-center gap-2 text-xs text-[#D0CBC1] shrink-0">
          <KeyRound className="w-4 h-4 text-[#FFAA3D]" />
          <span>Beta Passcode:</span>
        </div>
        <Input
          type="text"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Optional: BETA2026 (Unlocked by default in beta mode)"
          className="text-xs h-8 bg-[#111110] border-[rgba(243,240,232,0.1)]"
        />
        <span className="text-[10px] text-[#A39E93] shrink-0">
          Default: <strong className="text-[#FFAA3D]">BETA2026</strong>
        </span>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Starter Plan Simulation */}
        <div className="p-3.5 rounded-[8px] bg-[#161514] border border-[rgba(243,240,232,0.06)] space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#F3F0E8]">Starter Plan</span>
              <span className="text-[10px] font-technical text-[#34D399]">₹0 (Test)</span>
            </div>
            <p className="text-[11px] text-[#A39E93] mt-1">
              40 Verified Leads quota allocation with 30-day exclusive protection.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs border-[rgba(255,170,61,0.3)] hover:border-[#FFAA3D] text-[#FFAA3D]"
            isLoading={loadingAction === "activate_starter"}
            onClick={() => handleActivateBetaPlan("starter")}
          >
            <Zap className="w-3.5 h-3.5 mr-1" />
            Test Starter (40)
          </Button>
        </div>

        {/* Growth Plan Simulation */}
        <div className="p-3.5 rounded-[8px] bg-[#161514] border border-[rgba(243,240,232,0.06)] space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#F3F0E8]">Growth Plan</span>
              <span className="text-[10px] font-technical text-[#34D399]">₹0 (Test)</span>
            </div>
            <p className="text-[11px] text-[#A39E93] mt-1">
              100 Verified Leads quota allocation with priority delivery pacing.
            </p>
          </div>
          <Button
            size="sm"
            variant="primary"
            className="w-full text-xs bg-[#E84B2C] hover:bg-[#D94022]"
            isLoading={loadingAction === "activate_growth"}
            onClick={() => handleActivateBetaPlan("growth")}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Test Growth (100)
          </Button>
        </div>

        {/* Deliver Sample Leads */}
        <div className="p-3.5 rounded-[8px] bg-[#161514] border border-[rgba(243,240,232,0.06)] space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#F3F0E8]">Deliver Test Leads</span>
              <span className="text-[10px] font-technical text-[#FFAA3D]">3 Offers</span>
            </div>
            <p className="text-[11px] text-[#A39E93] mt-1">
              Simulates 3 fresh verified leads in your 48h review window to test accepting & claims.
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="w-full text-xs"
            isLoading={loadingAction === "deliver_leads"}
            onClick={handleDeliverSampleLeads}
          >
            <Inbox className="w-3.5 h-3.5 mr-1" />
            Deliver 3 Leads
          </Button>
        </div>

        {/* Reset Quota */}
        <div className="p-3.5 rounded-[8px] bg-[#161514] border border-[rgba(243,240,232,0.06)] space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#F3F0E8]">Reset Test Quota</span>
              <span className="text-[10px] font-technical text-[#A39E93]">Full Reset</span>
            </div>
            <p className="text-[11px] text-[#A39E93] mt-1">
              Clears consumed and reserved units back to 100% available test balance.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs text-[#D0CBC1] hover:text-[#F3F0E8]"
            isLoading={loadingAction === "reset_quota"}
            onClick={handleResetQuota}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Reset Quota
          </Button>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="text-[11px] text-[#A39E93] flex items-center gap-2 pt-1">
        <ShieldCheck className="w-4 h-4 text-[#34D399] shrink-0" />
        <span>
          Test Mode operations write safe sandbox records to your personal test profile. Real payments via Razorpay remain accessible anytime below.
        </span>
      </div>
    </Card>
  );
}

