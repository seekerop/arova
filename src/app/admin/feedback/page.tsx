"use client";

import { useState } from "react";
import { AdminHeader } from "@/components/navigation/admin-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { MessageSquareWarning, CheckCircle2, XCircle } from "lucide-react";

export default function AdminFeedbackPage() {
  const [complaints, setComplaints] = useState<any[]>([
    {
      id: "fb_001",
      customer: "siddharth@studio.com",
      lead_name: "Apex Retail Solutions",
      issue_type: "inaccurate_phone",
      description: "Automated telecom operator message indicates mobile number is out of service.",
      status: "pending",
      date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "fb_002",
      customer: "karan@agencypoint.in",
      lead_name: "Bright Studios Ltd",
      issue_type: "inaccurate_email",
      description: "Email returned 550 Mailbox does not exist.",
      status: "resolved",
      resolution: "Replacement lead credited to quota.",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const handleResolve = (id: string) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "resolved",
              resolution: "Replacement quota unit granted via durable ledger.",
            }
          : c
      )
    );
  };

  const handleDismiss = (id: string) => {
    const reason = prompt("Enter administrative dismissal reason:") || "Prospect merely unresponsive (not invalid data)";
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "dismissed", resolution: reason } : c
      )
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Lead Quality & Data Accuracy Feedback"
        subtitle="Review reported inaccurate leads, verify bounces, and issue auditable quota replacements"
      />

      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="overflow-x-auto rounded-[12px] border border-[rgba(243,240,232,0.08)] bg-[#111110]">
          <table className="w-full text-left text-xs text-[#D0CBC1]">
            <thead className="border-b border-[rgba(243,240,232,0.08)] bg-[#161514] text-[#F3F0E8]">
              <tr>
                <th className="p-4 font-semibold">Report ID & Lead</th>
                <th className="p-4 font-semibold">Reporting Customer</th>
                <th className="p-4 font-semibold">Issue Category</th>
                <th className="p-4 font-semibold">Customer Notes</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Admin Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(243,240,232,0.06)]">
              {complaints.map((item) => (
                <tr key={item.id} className="hover:bg-[#161514]/40">
                  <td className="p-4">
                    <span className="font-technical text-[10px] text-[#A39E93] block">
                      #{item.id}
                    </span>
                    <strong className="text-[#F3F0E8]">{item.lead_name}</strong>
                    <span className="text-[10px] text-[#9E9B93] block">
                      {formatDate(item.date)}
                    </span>
                  </td>

                  <td className="p-4 text-[#F3F0E8]">{item.customer}</td>

                  <td className="p-4">
                    <Badge variant="amber" size="sm">
                      {item.issue_type.replace(/_/g, " ")}
                    </Badge>
                  </td>

                  <td className="p-4 max-w-xs text-[11px] text-[#D0CBC1]">
                    {item.description}
                  </td>

                  <td className="p-4">
                    {item.status === "pending" && (
                      <Badge variant="amber" size="sm">Under Investigation</Badge>
                    )}
                    {item.status === "resolved" && (
                      <Badge variant="success" size="sm">Credit Issued</Badge>
                    )}
                    {item.status === "dismissed" && (
                      <Badge variant="muted" size="sm">Dismissed</Badge>
                    )}
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {item.status === "pending" && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleResolve(item.id)}
                            className="text-xs"
                          >
                            Credit Replacement
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDismiss(item.id)}
                            className="text-xs text-[#A39E93]"
                          >
                            Dismiss
                          </Button>
                        </>
                      )}
                      {item.status !== "pending" && (
                        <span className="text-[10px] text-[#9E9B93]">
                          {item.resolution}
                        </span>
                      )}
                    </div>
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

