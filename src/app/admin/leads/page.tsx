"use client";

import { useState } from "react";
import { AdminHeader } from "@/components/navigation/admin-header";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { APPROVED_CATEGORIES } from "@/lib/constants/categories";
import { formatDate } from "@/lib/utils";
import {
  Plus,
  Search,
  Database,
  Archive,
  AlertTriangle,
  Edit,
  Trash2,
  CheckCircle2,
} from "lucide-react";

export default function AdminLeadsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Form states for manual lead addition
  const [newBusinessName, setNewBusinessName] = useState("");
  const [newContactName, setNewContactName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newWebsite, setNewWebsite] = useState("");
  const [newCategory, setNewCategory] = useState("Programming & Software");
  const [newCity, setNewCity] = useState("");
  const [newRequirement, setNewRequirement] = useState("");
  const [newEstimatedValue, setNewEstimatedValue] = useState("250000");
  const [newSource, setNewSource] = useState("MCA Commercial Registry");

  const [leads, setLeads] = useState<any[]>([
    {
      id: "lead_001",
      business_name: "Apex Retail Solutions Pvt Ltd",
      contact_name: "Gaurav Sen",
      phone: "+91 98200 11223",
      email: "gaurav@apexretail.in",
      website: "https://apexretail.in",
      category: "Website & E-commerce",
      city: "Mumbai",
      requirement: "Shopify 2.0 headless storefront migration & checkout speed optimization.",
      estimated_value_paise: 8500000,
      source_name: "Registrar of Companies Filing",
      status: "reserved",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "lead_002",
      business_name: "Karan Media Labs",
      contact_name: "Karan Nair",
      phone: "+91 97410 44556",
      email: "karan@karanmedia.tv",
      website: "https://karanmedia.tv",
      category: "Video Editing & Production",
      city: "Bengaluru",
      requirement: "Long-form YouTube documentary post-production and motion branding.",
      estimated_value_paise: 4500000,
      source_name: "Media Industry Directory",
      status: "available",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "lead_003",
      business_name: "Zenith FinTech Systems",
      contact_name: "Vikram Malhotra",
      phone: "+91 98201 44921",
      email: "vikram@zenithfintech.in",
      website: "https://zenithfintech.in",
      category: "Programming & Software",
      city: "Pune",
      requirement: "Next.js internal admin dashboard and real-time ledger settlement microservices.",
      estimated_value_paise: 4500000,
      source_name: "Direct Procurement Tender",
      status: "claimed",
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "lead_004",
      business_name: "Solaris Solar Energy Ltd",
      contact_name: "Pooja Reddy",
      phone: "+91 94480 32190",
      email: "pooja@solarissolar.com",
      website: "https://solarissolar.com",
      category: "Digital Marketing & SEO",
      city: "Hyderabad",
      requirement: "B2B Google Search & Meta lead generation campaign for commercial installations.",
      estimated_value_paise: 3000000,
      source_name: "State Clean Energy Expo Registry",
      status: "claimed",
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "lead_005",
      business_name: "Omni Logistics Automation",
      contact_name: "Arjun Verma",
      phone: "+91 98190 77881",
      email: "arjun@omnilogistics.in",
      website: "https://omnilogistics.in",
      category: "Business Automation & AI",
      city: "Delhi NCR",
      requirement: "Automated warehouse dispatch notifications and CRM n8n workflows.",
      estimated_value_paise: 6000000,
      source_name: "Logistics India Trade Directory",
      status: "available",
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = {
      id: `lead_${Date.now().toString().slice(-4)}`,
      business_name: newBusinessName,
      contact_name: newContactName || null,
      phone: newPhone,
      email: newEmail,
      website: newWebsite,
      category: newCategory,
      city: newCity,
      requirement: newRequirement,
      estimated_value_paise: Number(newEstimatedValue) * 100,
      source_name: newSource,
      status: "available",
      created_at: new Date().toISOString(),
    };
    setLeads([newEntry, ...leads]);
    setAddModalOpen(false);
    // Reset
    setNewBusinessName("");
    setNewCity("");
    setNewRequirement("");
  };

  const handleArchive = (id: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "archived" } : l))
    );
  };

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.requirement.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === "all" || l.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Lead Inventory Management"
        subtitle="Search, add, inspect provenance, and manage commercial lead records"
      />

      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 max-w-2xl">
            <div className="relative">
              <Input
                placeholder="Search business, city, or requirement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
              <Search className="w-4 h-4 text-[#A39E93] absolute left-3 top-3 pointer-events-none" />
            </div>

            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All 5 Categories</option>
              {APPROVED_CATEGORIES.map((c) => (
                <option key={c.slug} value={c.name}>
                  {c.name}
                </option>
              ))}
            </Select>

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Availability Statuses</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved (In Offer)</option>
              <option value="claimed">Claimed (Active)</option>
              <option value="archived">Archived</option>
            </Select>
          </div>

          <Button
            variant="primary"
            onClick={() => setAddModalOpen(true)}
            className="text-xs gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Manual Lead
          </Button>
        </div>

        {/* Inventory Table */}
        <div className="overflow-x-auto rounded-[12px] border border-[rgba(243,240,232,0.08)] bg-[#111110]">
          <table className="w-full text-left text-xs text-[#D0CBC1]">
            <thead className="border-b border-[rgba(243,240,232,0.08)] bg-[#161514] text-[#F3F0E8]">
              <tr>
                <th className="p-4 font-semibold">Lead ID & Business</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Contact Info</th>
                <th className="p-4 font-semibold">Location</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Source</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(243,240,232,0.06)]">
              {filteredLeads.map((item) => (
                <tr key={item.id} className="hover:bg-[#161514]/40">
                  <td className="p-4">
                    <span className="font-technical text-[10px] text-[#A39E93] block">
                      #{item.id}
                    </span>
                    <strong className="text-[#F3F0E8]">{item.business_name}</strong>
                    <p className="text-[11px] text-[#A39E93] line-clamp-1 max-w-xs mt-0.5">
                      {item.requirement}
                    </p>
                  </td>

                  <td className="p-4">
                    <Badge variant="category" size="sm">
                      {item.category}
                    </Badge>
                  </td>

                  <td className="p-4 font-technical">
                    <span className="text-[#F3F0E8] block">{item.phone}</span>
                    <span className="text-[#A39E93] block text-[10px]">{item.email}</span>
                  </td>

                  <td className="p-4 text-[#F3F0E8]">{item.city}</td>

                  <td className="p-4">
                    {item.status === "available" && (
                      <Badge variant="success" size="sm">Available</Badge>
                    )}
                    {item.status === "reserved" && (
                      <Badge variant="amber" size="sm">Reserved (Offer)</Badge>
                    )}
                    {item.status === "claimed" && (
                      <Badge variant="flame" size="sm">Claimed</Badge>
                    )}
                    {item.status === "archived" && (
                      <Badge variant="muted" size="sm">Archived</Badge>
                    )}
                  </td>

                  <td className="p-4 text-[#A39E93] text-[11px]">
                    {item.source_name}
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {item.status !== "archived" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleArchive(item.id)}
                          className="text-[11px] text-[#A39E93] hover:text-[#E84B2C]"
                        >
                          Archive
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Add Lead Dialog */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogHeader>
          <DialogTitle>Add Manual Commercial Lead</DialogTitle>
          <DialogDescription>
            Manually enter a verified business prospect. Must belong to one of the 5 approved flat categories.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAddLead} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#D0CBC1]">Business Name *</label>
              <Input
                required
                value={newBusinessName}
                onChange={(e) => setNewBusinessName(e.target.value)}
                placeholder="E.g., Nexus Infotech Pvt Ltd"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#D0CBC1]">Contact Person</label>
              <Input
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                placeholder="E.g., Rajiv Mehra (CEO)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#D0CBC1]">Phone Number *</label>
              <Input
                required
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+91 98000 00000"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#D0CBC1]">Email Address</label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="contact@company.in"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#D0CBC1]">Approved Category *</label>
              <Select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                {APPROVED_CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#D0CBC1]">City *</label>
              <Input
                required
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="E.g., Pune, Mumbai, Delhi..."
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#D0CBC1]">Generalized Requirement *</label>
            <Textarea
              required
              rows={3}
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              placeholder="Describe what services this business prospect requires..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#D0CBC1]">Estimated Project Value (INR)</label>
              <Input
                type="number"
                value={newEstimatedValue}
                onChange={(e) => setNewEstimatedValue(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#D0CBC1]">Source Provenance</label>
              <Input
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Lead to Inventory
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
