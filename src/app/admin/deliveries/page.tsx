"use client";

import { useState } from "react";
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
  Clock,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

export default function AdminDeliveriesPage() {
  const [running, setRunning] = useState(false);
  const [runs, setRuns] = useState<any[]>([
    {
      id: "run_8819",
      trigger: "cron",
      status: "completed",
      offers_created: 14,
      offers_expired: 3,
      claims_expired: 2,
      errors_count: 0,
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "run_8818",
      trigger: "cron",
      status: "completed",
      offers_created: 18,
      offers_expired: 1,
      claims_expired: 4,
      errors_count: 0,
      date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "run_8817",
      trigger: "manual",
      status: "completed",
      offers_created: 8,
      offers_expired: 0,
      claims_expired: 1,
      errors_count: 0,
      date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const handleManualTrigger = async () => {
    setRunning(true);
    try {
      const res = await fetch("/api/admin/cron-trigger", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        const newRun = {
          id: data.result.runId,
          trigger: "manual",
          status: "completed",
          offers_created: data.result.offersDistributed,
          offers_expired: data.result.offersExpired,
          claims_expired: data.result.claimsExpired,
          errors_count: data.result.errorsCount,
          date: new Date().toISOString(),
        };
        setRuns([newRun, ...runs]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Delivery Engine Monitoring"
        subtitle="Track automated lead distribution runs, 48h offer deadlines, and 30-day claim expiries"
      />

      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Manual Run Box */}
        <div className="p-5 rounded-[12px] bg-[#161514] border border-[rgba(232,75,44,0.3)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-sm text-[#F3F0E8]">
              Automated Lead Distribution Engine
            </h3>
            <p className="text-xs text-[#A39E93]">
              Durable scheduled background worker. Evaluates subscriber category preferences and remaining quotas.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={handleManualTrigger}
            isLoading={running}
            className="text-xs gap-1.5 shrink-0"
          >
            <Play className="w-3.5 h-3.5" />
            Trigger Distribution Tick Now
          </Button>
        </div>

        {/* Engine Runs Table */}
        <div className="space-y-4">
          <h3 className="font-display text-base font-bold text-[#F3F0E8]">
            Job Run Execution History
          </h3>

          <div className="overflow-x-auto rounded-[12px] border border-[rgba(243,240,232,0.08)] bg-[#111110]">
            <table className="w-full text-left text-xs text-[#D0CBC1]">
              <thead className="border-b border-[rgba(243,240,232,0.08)] bg-[#161514] text-[#F3F0E8]">
                <tr>
                  <th className="p-4 font-semibold">Run ID</th>
                  <th className="p-4 font-semibold">Trigger Type</th>
                  <th className="p-4 font-semibold">Offers Created</th>
                  <th className="p-4 font-semibold">Offers Expired (48h)</th>
                  <th className="p-4 font-semibold">Claims Expired (30d)</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Execution Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(243,240,232,0.06)]">
                {runs.map((run) => (
                  <tr key={run.id} className="hover:bg-[#161514]/40">
                    <td className="p-4 font-technical text-[#F3F0E8]">
                      #{run.id}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" size="sm">
                        {run.trigger.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-4 font-technical text-[#34D399] font-medium">
                      +{run.offers_created}
                    </td>
                    <td className="p-4 font-technical text-[#FFAA3D]">
                      {run.offers_expired}
                    </td>
                    <td className="p-4 font-technical text-[#C86938]">
                      {run.claims_expired}
                    </td>
                    <td className="p-4">
                      <Badge variant="success" size="sm" className="gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </Badge>
                    </td>
                    <td className="p-4 text-right text-[#A39E93]">
                      {formatDate(run.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
