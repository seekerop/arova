"use client";

import { useState, useEffect } from "react";
import { AdminHeader } from "@/components/navigation/admin-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { ScrollText, RefreshCw } from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/audit-logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Administrative Security & Audit Trail"
        subtitle="Immutable records of administrative actions, imports, and system events"
        actions={
          <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <Card className="bg-[#111110] border-[rgba(243,240,232,0.08)] overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#A39E93] flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-[#FFAA3D]" />
              <span>Loading audit trail...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <ScrollText className="w-10 h-10 text-[#A39E93] mx-auto opacity-40" />
              <h4 className="font-display text-base font-bold text-[#F3F0E8]">
                No Audit Logs Recorded
              </h4>
              <p className="text-xs text-[#A39E93] max-w-sm mx-auto">
                Platform actions and webhook operations will be immutably recorded here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#161514] text-[#A39E93] border-b border-[rgba(243,240,232,0.08)]">
                  <tr>
                    <th className="p-4 font-medium">Action</th>
                    <th className="p-4 font-medium">Actor</th>
                    <th className="p-4 font-medium">Target Entity</th>
                    <th className="p-4 font-medium">IP / Source</th>
                    <th className="p-4 font-medium">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(243,240,232,0.06)]">
                  {logs.map((l) => (
                    <tr key={l.id} className="hover:bg-[#161514]/40 transition-colors">
                      <td className="p-4 font-technical font-semibold text-[#FFAA3D]">{l.action}</td>
                      <td className="p-4">
                        <Badge variant="outline" size="sm">{l.actor_role || "system"}</Badge>
                      </td>
                      <td className="p-4 text-[#D0CBC1]">{l.target_entity || "—"}</td>
                      <td className="p-4 text-[11px] text-[#A39E93]">{l.ip_address || "Internal"}</td>
                      <td className="p-4 text-[11px] text-[#A39E93]">{formatDate(l.created_at)}</td>
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
