"use client";

import { useState } from "react";
import { AdminHeader } from "@/components/navigation/admin-header";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ScrollText, Shield } from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs] = useState<any[]>([
    {
      id: "aud_991",
      actor_role: "admin",
      action: "lead_import_completed",
      target_entity: "import_batches",
      target_id: "batch_mumbai_q4",
      details: "Imported 104 valid leads, filtered 10 duplicates, skipped 6 invalid rows.",
      ip_address: "103.21.144.12",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "aud_990",
      actor_role: "admin",
      action: "manual_automation_triggered",
      target_entity: "delivery_runs",
      target_id: "run_8817",
      details: "Distributed 8 offers, closed 1 expired claim, released 0 expired offers.",
      ip_address: "103.21.144.12",
      date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "aud_989",
      actor_role: "admin",
      action: "customer_suspended",
      target_entity: "profiles",
      target_id: "usr_003",
      details: "Reason: Reported for unsolicited spam violations.",
      ip_address: "103.21.144.12",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "aud_988",
      actor_role: "system",
      action: "webhook_subscription_charged",
      target_entity: "subscriptions",
      target_id: "sub_rzp_9901",
      details: "Razorpay signature verified. 40 leads quota granted idempotently.",
      ip_address: "Razorpay Serverless Webhook",
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Administrative Audit Trail"
        subtitle="Immutable security logs of administrative interventions, imports, and system adjustments"
      />

      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="overflow-x-auto rounded-[12px] border border-[rgba(243,240,232,0.08)] bg-[#111110]">
          <table className="w-full text-left text-xs text-[#D0CBC1]">
            <thead className="border-b border-[rgba(243,240,232,0.08)] bg-[#161514] text-[#F3F0E8]">
              <tr>
                <th className="p-4 font-semibold">Log ID & Action</th>
                <th className="p-4 font-semibold">Actor Role</th>
                <th className="p-4 font-semibold">Target Entity</th>
                <th className="p-4 font-semibold">Operation Details</th>
                <th className="p-4 font-semibold">Origin / IP</th>
                <th className="p-4 font-semibold text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(243,240,232,0.06)]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#161514]/40">
                  <td className="p-4">
                    <span className="font-technical text-[10px] text-[#A39E93] block">
                      #{log.id}
                    </span>
                    <strong className="text-[#F3F0E8] font-technical">
                      {log.action}
                    </strong>
                  </td>

                  <td className="p-4">
                    <Badge
                      variant={log.actor_role === "admin" ? "flame" : "muted"}
                      size="sm"
                    >
                      {log.actor_role.toUpperCase()}
                    </Badge>
                  </td>

                  <td className="p-4 font-technical text-[#FFAA3D]">
                    {log.target_entity} ({log.target_id})
                  </td>

                  <td className="p-4 text-[11px] text-[#D0CBC1] max-w-md">
                    {log.details}
                  </td>

                  <td className="p-4 font-technical text-[#9E9B93]">
                    {log.ip_address}
                  </td>

                  <td className="p-4 text-right text-[#A39E93]">
                    {formatDate(log.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
