"use client";

import { useState, useEffect } from "react";
import { AdminHeader } from "@/components/navigation/admin-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import {
  Send,
  Play,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

export default function AdminDeliveriesPage() {
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [runs, setRuns] = useState<any[]>([]);
  const [jobNotice, setJobNotice] = useState<string | null>(null);

  const fetchRuns = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/deliveries");
      if (res.ok) {
        const data = await res.json();
        setRuns(data.runs || []);
      }
    } catch (err) {
      console.error("Failed to load delivery runs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const handleRunNow = async () => {
    setRunning(true);
    setJobNotice(null);
    try {
      const res = await fetch("/api/admin/cron-trigger", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setJobNotice(
          `Delivery cycle finished: ${data.result.offersDistributed} offers distributed, ${data.result.offersExpired} offers expired, ${data.result.claimsExpired} claims closed.`
        );
        fetchRuns();
      } else {
        setJobNotice(`Failed: ${data.error}`);
      }
    } catch (err: any) {
      setJobNotice(`Error: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Delivery Cycles & Scheduled Automation"
        subtitle="Monitor execution logs for 48h review expiries, 30-day claim closures, and automated pacing"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchRuns} disabled={loading}>
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="primary" size="sm" onClick={handleRunNow} isLoading={running}>
              <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
              Trigger Cycle Now
            </Button>
          </div>
        }
      />

      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {jobNotice && (
          <div className="p-3 rounded-[8px] bg-[#111110] border border-[rgba(232,75,44,0.3)] text-xs text-[#FFAA3D] font-technical">
            {jobNotice}
          </div>
        )}

        <Card className="bg-[#111110] border-[rgba(243,240,232,0.08)] overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#A39E93] flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-[#FFAA3D]" />
              <span>Loading delivery logs...</span>
            </div>
          ) : runs.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <Send className="w-10 h-10 text-[#A39E93] mx-auto opacity-40" />
              <h4 className="font-display text-base font-bold text-[#F3F0E8]">
                No Delivery Runs Recorded
              </h4>
              <p className="text-xs text-[#A39E93] max-w-sm mx-auto">
                Automated cron and manual trigger cycles log their executions here. Click &quot;Trigger Cycle Now&quot; to run the first cycle.
              </p>
              <div className="pt-2">
                <Button variant="primary" size="sm" onClick={handleRunNow} isLoading={running}>
                  <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                  Run Initial Automation Cycle
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#161514] text-[#A39E93] border-b border-[rgba(243,240,232,0.08)]">
                  <tr>
                    <th className="p-4 font-medium">Run ID</th>
                    <th className="p-4 font-medium">Trigger Source</th>
                    <th className="p-4 font-medium">Offers Distributed</th>
                    <th className="p-4 font-medium">Offers Expired (48h)</th>
                    <th className="p-4 font-medium">Claims Closed (30d)</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Executed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(243,240,232,0.06)]">
                  {runs.map((r) => (
                    <tr key={r.id} className="hover:bg-[#161514]/40 transition-colors">
                      <td className="p-4 font-technical text-[#FFAA3D]">
                        {r.id.slice(0, 8)}...
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" size="sm" className="capitalize">
                          {r.trigger_source || "cron"}
                        </Badge>
                      </td>
                      <td className="p-4 font-technical text-[#34D399] font-semibold">
                        {r.offers_created || 0}
                      </td>
                      <td className="p-4 font-technical text-[#FFAA3D]">
                        {r.offers_expired || 0}
                      </td>
                      <td className="p-4 font-technical text-[#D0CBC1]">
                        {r.claims_expired || 0}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={r.status === "completed" ? "success" : "default"}
                          size="sm"
                        >
                          {r.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-[11px] text-[#A39E93]">
                        {formatDate(r.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
