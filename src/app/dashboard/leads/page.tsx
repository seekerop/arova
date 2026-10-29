"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/navigation/dashboard-header";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MandatoryDisclaimerBanner } from "@/components/ui/disclaimer";
import { APPROVED_CATEGORIES } from "@/lib/constants/categories";
import { formatTimeRemaining, formatDate } from "@/lib/utils";
import {
  Search,
  Clock,
  ShieldCheck,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Lock,
} from "lucide-react";

export default function MyLeadsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [leadsList, setLeadsList] = useState<any[]>([
    {
      id: "del_1",
      leadId: "lead_101",
      business_name: "Apex Retail Solutions",
      contact_name: "Hidden until accepted",
      phone: "•••• ••••••",
      email: "•••••@••••.in",
      category: "Website & E-commerce",
      city: "Mumbai",
      requirement: "Shopify 2.0 headless storefront migration & checkout speed optimization.",
      delivered_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      response_deadline: new Date(Date.now() + 38 * 60 * 60 * 1000).toISOString(),
      claim_expires_at: null,
      status: "pending",
      is_locked: true,
    },
    {
      id: "del_2",
      leadId: "lead_102",
      business_name: "Karan Media Labs",
      contact_name: "Hidden until accepted",
      phone: "•••• ••••••",
      email: "•••••@••••.in",
      category: "Video Editing & Production",
      city: "Bengaluru",
      requirement: "Long-form YouTube documentary post-production and motion branding.",
      delivered_at: new Date(Date.now() - 29 * 60 * 60 * 1000).toISOString(),
      response_deadline: new Date(Date.now() + 19 * 60 * 60 * 1000).toISOString(),
      claim_expires_at: null,
      status: "pending",
      is_locked: true,
    },
    {
      id: "claim_1",
      leadId: "lead_201",
      business_name: "Zenith FinTech Systems",
      contact_name: "Vikram Malhotra",
      phone: "+91 98201 44921",
      email: "vikram@zenithfintech.in",
      category: "Programming & Software",
      city: "Pune",
      requirement: "Next.js internal admin dashboard and real-time ledger settlement microservices.",
      delivered_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      response_deadline: null,
      claim_expires_at: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      status: "accepted",
      is_locked: false,
    },
    {
      id: "claim_2",
      leadId: "lead_202",
      business_name: "Solaris Solar Energy",
      contact_name: "Pooja Reddy",
      phone: "+91 94480 32190",
      email: "pooja@solarissolar.com",
      category: "Digital Marketing & SEO",
      city: "Hyderabad",
      requirement: "B2B Google Search & Meta lead generation campaign for commercial solar installations.",
      delivered_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      response_deadline: null,
      claim_expires_at: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
      status: "accepted",
      is_locked: false,
    },
  ]);

  const filteredLeads = leadsList.filter((item) => {
    const matchesSearch =
      item.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.requirement.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat =
      selectedCategory === "all" || item.category === selectedCategory;

    const matchesStatus =
      selectedStatus === "all" || item.status === selectedStatus;

    return matchesSearch && matchesCat && matchesStatus;
  });

  const handleAccept = async (id: string, leadId: string) => {
    try {
      const res = await fetch("/api/leads/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryId: id }),
      });
      if (res.ok) {
        setLeadsList((prev) =>
          prev.map((l) =>
            l.id === id
              ? {
                  ...l,
                  status: "accepted",
                  is_locked: false,
                  contact_name: "Revealed Contact",
                  phone: "+91 98110 22334",
                  email: "contact@prospect.com",
                  claim_expires_at: new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000
                  ).toISOString(),
                }
              : l
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch("/api/leads/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryId: id }),
      });
      if (res.ok) {
        setLeadsList((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: "rejected" } : l))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader
        title="My Leads"
        subtitle="Manage delivered prospect offers, active claims, and contact disclosure"
      />

      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <MandatoryDisclaimerBanner variant="short" />

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by city, requirement, or business..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            <Search className="w-4 h-4 text-[#A39E93] absolute left-3 top-3 pointer-events-none" />
          </div>

          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All 5 Approved Categories</option>
            {APPROVED_CATEGORIES.map((c) => (
              <option key={c.slug} value={c.name}>
                {c.name}
              </option>
            ))}
          </Select>

          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Review (48h)</option>
            <option value="accepted">Claimed (30 Days)</option>
            <option value="rejected">Declined</option>
            <option value="expired">Expired</option>
          </Select>
        </div>

        {/* Leads Table */}
        <div className="overflow-x-auto rounded-[12px] border border-[rgba(243,240,232,0.08)] bg-[#111110]">
          <table className="w-full text-left text-xs text-[#D0CBC1]">
            <thead className="border-b border-[rgba(243,240,232,0.08)] bg-[#161514] text-[#F3F0E8]">
              <tr>
                <th className="p-4 font-semibold">Business Prospect</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Location</th>
                <th className="p-4 font-semibold">Offer / Claim Status</th>
                <th className="p-4 font-semibold">Window Remaining</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(243,240,232,0.06)]">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#A39E93]">
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((item) => {
                  const deadlineInfo = item.response_deadline
                    ? formatTimeRemaining(item.response_deadline)
                    : null;
                  const claimInfo = item.claim_expires_at
                    ? formatTimeRemaining(item.claim_expires_at)
                    : null;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#161514]/40 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {item.is_locked ? (
                            <Lock className="w-3.5 h-3.5 text-[#FFAA3D] shrink-0" />
                          ) : (
                            <ShieldCheck className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
                          )}
                          <div>
                            <span className="font-semibold text-[#F3F0E8] block">
                              {item.business_name}
                            </span>
                            <span className="text-[11px] text-[#A39E93] line-clamp-1 max-w-xs">
                              {item.requirement}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <Badge variant="category" size="sm">
                          {item.category}
                        </Badge>
                      </td>

                      <td className="p-4 text-[#F3F0E8]">{item.city}</td>

                      <td className="p-4">
                        {item.status === "pending" && (
                          <Badge variant="amber" size="sm">
                            Pending Review
                          </Badge>
                        )}
                        {item.status === "accepted" && (
                          <Badge variant="success" size="sm">
                            Exclusively Claimed
                          </Badge>
                        )}
                        {item.status === "rejected" && (
                          <Badge variant="muted" size="sm">
                            Declined
                          </Badge>
                        )}
                        {item.status === "expired" && (
                          <Badge variant="muted" size="sm">
                            Expired
                          </Badge>
                        )}
                      </td>

                      <td className="p-4 font-technical">
                        {item.status === "pending" && deadlineInfo && (
                          <span className="text-[#FFAA3D]">
                            {deadlineInfo.text}
                          </span>
                        )}
                        {item.status === "accepted" && claimInfo && (
                          <span className="text-[#34D399]">
                            {claimInfo.text}
                          </span>
                        )}
                        {item.status !== "pending" && item.status !== "accepted" && (
                          <span className="text-[#9E9B93]">Closed</span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dashboard/leads/${item.leadId}`}>
                            <Button variant="ghost" size="sm" className="text-xs">
                              View
                            </Button>
                          </Link>

                          {item.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReject(item.id)}
                                className="text-xs text-[#A39E93] hover:text-[#E84B2C]"
                              >
                                Decline
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleAccept(item.id, item.leadId)}
                                className="text-xs"
                              >
                                Accept
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

