"use client";

import { useState, useEffect } from "react";
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
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

export default function AdminLeadsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);

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
  const [submittingLead, setSubmittingLead] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/leads?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [categoryFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLead(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: newBusinessName,
          contact_name: newContactName,
          phone: newPhone,
          email: newEmail,
          website: newWebsite,
          category_name: newCategory,
          city: newCity,
          requirement: newRequirement,
          estimated_value_paise: Math.round(Number(newEstimatedValue) * 100),
          source_name: newSource,
          availability_status: "available",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add lead.");
      }

      setAddModalOpen(false);
      // Reset form
      setNewBusinessName("");
      setNewContactName("");
      setNewPhone("");
      setNewEmail("");
      setNewWebsite("");
      setNewCity("");
      setNewRequirement("");
      fetchLeads();
    } catch (err: any) {
      setErrorMsg(err.message || "Error creating lead.");
    } finally {
      setSubmittingLead(false);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "archived" }),
      });
      if (res.ok) {
        fetchLeads();
      }
    } catch (err) {
      console.error("Archive error:", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Lead Inventory Management"
        subtitle="Review, filter, create, and audit platform business leads"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchLeads} disabled={loading}>
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setAddModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Lead
            </Button>
          </div>
        }
      />

      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Filters */}
        <div className="p-4 rounded-[12px] bg-[#111110] border border-[rgba(243,240,232,0.08)] flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Input
              type="text"
              placeholder="Search business, email, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs"
            />
            <Search className="w-4 h-4 text-[#A39E93] absolute left-3 top-3 pointer-events-none" />
          </form>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs w-48"
            >
              <option value="all">All Categories</option>
              {APPROVED_CATEGORIES.map((cat) => (
                <option key={cat.slug} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </Select>

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs w-36"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved (In Review)</option>
              <option value="claimed">Claimed</option>
              <option value="archived">Archived</option>
            </Select>
          </div>
        </div>

        {/* Leads Table */}
        <Card className="bg-[#111110] border-[rgba(243,240,232,0.08)] overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#A39E93] flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-[#FFAA3D]" />
              <span>Querying database inventory...</span>
            </div>
          ) : leads.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <Database className="w-10 h-10 text-[#A39E93] mx-auto opacity-40" />
              <h4 className="font-display text-base font-bold text-[#F3F0E8]">
                No Leads in Database
              </h4>
              <p className="text-xs text-[#A39E93] max-w-sm mx-auto">
                No records matched your search or the inventory is currently empty. Add a lead manually or use the CSV/XLSX import tool.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setAddModalOpen(true)}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add First Lead
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#161514] text-[#A39E93] border-b border-[rgba(243,240,232,0.08)]">
                  <tr>
                    <th className="p-4 font-medium">Business / Contact</th>
                    <th className="p-4 font-medium">Category</th>
                    <th className="p-4 font-medium">Location</th>
                    <th className="p-4 font-medium">Estimated Value</th>
                    <th className="p-4 font-medium">Source</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(243,240,232,0.06)]">
                  {leads.map((l) => (
                    <tr key={l.id} className="hover:bg-[#161514]/40 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-[#F3F0E8]">{l.business_name}</div>
                        <div className="text-[11px] text-[#A39E93] flex items-center gap-2 mt-0.5">
                          <span>{l.contact_name}</span>
                          <span>•</span>
                          <span className="font-technical text-[10px]">{l.email}</span>
                          <span>•</span>
                          <span className="font-technical text-[10px]">{l.phone}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" size="sm">
                          {l.category_name || l.category}
                        </Badge>
                      </td>
                      <td className="p-4 text-[#D0CBC1]">
                        {l.city}{l.state ? `, ${l.state}` : ""}
                      </td>
                      <td className="p-4 font-technical font-semibold text-[#FFAA3D]">
                        ₹{((l.estimated_value_paise || 0) / 100).toLocaleString("en-IN")}
                      </td>
                      <td className="p-4 text-[11px] text-[#A39E93]">
                        {l.source_name || "Direct Sourcing"}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            l.availability_status === "available"
                              ? "success"
                              : l.availability_status === "reserved"
                              ? "warning"
                              : l.availability_status === "claimed"
                              ? "default"
                              : "secondary"
                          }
                          size="sm"
                        >
                          {l.availability_status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        {l.availability_status !== "archived" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#E84B2C] hover:bg-[#E84B2C]/10 text-[11px] h-7 px-2"
                            onClick={() => handleArchive(l.id)}
                          >
                            <Archive className="w-3.5 h-3.5 mr-1" />
                            Archive
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Add Lead Dialog */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#111110] border border-[rgba(243,240,232,0.1)] rounded-[12px] p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Verified Business Lead</DialogTitle>
              <DialogDescription>
                Manually record a verified prospective client lead into the platform database.
              </DialogDescription>
            </DialogHeader>

            {errorMsg && (
              <div className="p-3 rounded-[8px] bg-[rgba(232,75,44,0.1)] border border-[rgba(232,75,44,0.3)] text-xs text-[#E84B2C]">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateLead} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#D0CBC1]">
                    Business / Entity Name *
                  </label>
                  <Input
                    required
                    value={newBusinessName}
                    onChange={(e) => setNewBusinessName(e.target.value)}
                    placeholder="e.g. Apex Retail Solutions Pvt Ltd"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#D0CBC1]">
                    Contact Person Name *
                  </label>
                  <Input
                    required
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    placeholder="e.g. Gaurav Sen"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#D0CBC1]">Phone Number *</label>
                  <Input
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 98200 11223"
                    className="text-xs font-technical"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#D0CBC1]">Email Address *</label>
                  <Input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="prospect@company.in"
                    className="text-xs font-technical"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#D0CBC1]">Website (Optional)</label>
                  <Input
                    value={newWebsite}
                    onChange={(e) => setNewWebsite(e.target.value)}
                    placeholder="https://company.in"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#D0CBC1]">Approved Category *</label>
                  <Select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="text-xs"
                  >
                    {APPROVED_CATEGORIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#D0CBC1]">City / Metro *</label>
                  <Input
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Mumbai / Bengaluru / Pune"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#D0CBC1]">Estimated Value (INR)</label>
                  <Input
                    type="number"
                    value={newEstimatedValue}
                    onChange={(e) => setNewEstimatedValue(e.target.value)}
                    placeholder="250000"
                    className="text-xs font-technical"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#D0CBC1]">
                  Generalized Project Requirement *
                </label>
                <Textarea
                  required
                  rows={3}
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  placeholder="Detailed project scope, technology requirements, or marketing goals..."
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#D0CBC1]">Source Provenance *</label>
                <Input
                  required
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="e.g. MCA Commercial Filing / Direct RFP"
                  className="text-xs"
                />
              </div>

              <DialogFooter className="pt-4 flex justify-end gap-3 border-t border-[rgba(243,240,232,0.08)]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={submittingLead}
                >
                  Commit Lead to Database
                </Button>
              </DialogFooter>
            </form>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
