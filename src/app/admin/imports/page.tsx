"use client";

import { useState } from "react";
import { AdminHeader } from "@/components/navigation/admin-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldCheck,
  Download,
} from "lucide-react";

export default function AdminImportsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [summary, setSummary] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Recent import history
  const [history] = useState<any[]>([
    {
      id: "imp_902",
      filename: "mumbai_ecommerce_q4.xlsx",
      total_rows: 120,
      imported_rows: 104,
      invalid_rows: 6,
      duplicate_rows: 10,
      admin: "super_admin",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "imp_899",
      filename: "bengaluru_tech_leads.csv",
      total_rows: 85,
      imported_rows: 78,
      invalid_rows: 2,
      duplicate_rows: 5,
      admin: "super_admin",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSummary(null);
      setErrorMsg(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Import failed");
      }

      setSummary(data.summary);
      setFile(null);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process import");
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadSample = () => {
    const csvContent =
      "business_name,contact_name,phone,email,website,category,generalized_requirement,estimated_value,city,state,source_name\n" +
      "Zenith Retail Pvt Ltd,Rajesh Sen,+91 98200 11223,rajesh@zenithretail.in,https://zenithretail.in,Website & E-commerce,Shopify 2.0 migration and speed optimization,250000,Mumbai,Maharashtra,MCA Commercial Registry\n" +
      "Karan Media Production,Karan Nair,+91 97410 44556,karan@karanmedia.tv,https://karanmedia.tv,Video Editing & Production,Corporate documentary editing and motion graphics,350000,Bengaluru,Karnataka,Media Industry Directory\n" +
      "CodeCraft Labs,Vikas Gupta,+91 98110 99887,vikas@codecraft.io,https://codecraft.io,Programming & Software,Next.js frontend and Supabase PostgreSQL development,450000,Pune,Maharashtra,Tech Industry Filings\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "arova_leads_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="CSV / XLSX Lead Imports"
        subtitle="Batch validate, normalize, deduplicate, and persist sourced commercial leads"
      />

      <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto w-full">
        {/* Upload Container */}
        <Card className="p-8 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(243,240,232,0.06)]">
            <div>
              <h3 className="font-display font-bold text-base text-[#F3F0E8]">
                Upload New Lead Spreadsheet
              </h3>
              <p className="text-xs text-[#A39E93]">
                Supports .csv and .xlsx files up to 10MB. Columns are automatically mapped and deduplicated.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadSample}
              className="text-xs gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-[#FFAA3D]" />
              Download Template CSV
            </Button>
          </div>

          {/* Drag & Drop Input */}
          <div className="p-8 rounded-[12px] border-2 border-dashed border-[rgba(243,240,232,0.12)] hover:border-[rgba(232,75,44,0.4)] bg-[#161514]/60 text-center space-y-3 transition-colors">
            <UploadCloud className="w-10 h-10 text-[#E84B2C] mx-auto opacity-80" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#F3F0E8]">
                {file ? file.name : "Click to select or drag and drop lead spreadsheet"}
              </p>
              <p className="text-xs text-[#A39E93]">
                Accepts .csv, .xlsx, .xls (Structured columns: business_name, category, city, phone/email)
              </p>
            </div>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload-input"
            />
            <label htmlFor="file-upload-input" className="inline-block pt-2">
              <Button variant="secondary" size="sm" type="button" onClick={() => document.getElementById("file-upload-input")?.click()}>
                Browse File
              </Button>
            </label>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-[8px] bg-[rgba(232,75,44,0.1)] border border-[rgba(232,75,44,0.3)] text-xs text-[#E84B2C] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {file && (
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={handleUpload}
                isLoading={uploading}
                className="gap-2"
              >
                Validate & Process Import
              </Button>
            </div>
          )}
        </Card>

        {/* Detailed Import Analysis Summary */}
        {summary && (
          <Card className="p-6 bg-[#161514] border-[rgba(52,211,153,0.3)] space-y-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#34D399]" />
              <div>
                <h3 className="font-display font-bold text-base text-[#F3F0E8]">
                  Import Processing Completed
                </h3>
                <p className="text-xs text-[#A39E93]">
                  All rows evaluated against the 5 approved flat categories and deduplicated.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 rounded-[8px] bg-[#111110] border border-[rgba(243,240,232,0.06)] text-xs">
                <span className="text-[#A39E93] block">Total Rows:</span>
                <strong className="font-technical text-lg text-[#F3F0E8]">{summary.totalRows}</strong>
              </div>
              <div className="p-3 rounded-[8px] bg-[#111110] border border-[rgba(52,211,153,0.2)] text-xs">
                <span className="text-[#34D399] block">Imported to Inventory:</span>
                <strong className="font-technical text-lg text-[#34D399]">{summary.importedRows}</strong>
              </div>
              <div className="p-3 rounded-[8px] bg-[#111110] border border-[rgba(255,170,61,0.2)] text-xs">
                <span className="text-[#FFAA3D] block">Duplicates Filtered:</span>
                <strong className="font-technical text-lg text-[#FFAA3D]">{summary.duplicateRowsCount}</strong>
              </div>
              <div className="p-3 rounded-[8px] bg-[#111110] border border-[rgba(232,75,44,0.2)] text-xs">
                <span className="text-[#E84B2C] block">Invalid Rows Skipped:</span>
                <strong className="font-technical text-lg text-[#E84B2C]">{summary.invalidRowsCount}</strong>
              </div>
            </div>
          </Card>
        )}

        {/* Historical Batches Table */}
        <div className="space-y-4">
          <h3 className="font-display text-base font-bold text-[#F3F0E8]">
            Recent Import Batches
          </h3>

          <div className="overflow-x-auto rounded-[12px] border border-[rgba(243,240,232,0.08)] bg-[#111110]">
            <table className="w-full text-left text-xs text-[#D0CBC1]">
              <thead className="border-b border-[rgba(243,240,232,0.08)] bg-[#161514] text-[#F3F0E8]">
                <tr>
                  <th className="p-4 font-semibold">Batch ID & Filename</th>
                  <th className="p-4 font-semibold">Total Rows</th>
                  <th className="p-4 font-semibold">Imported</th>
                  <th className="p-4 font-semibold">Duplicates</th>
                  <th className="p-4 font-semibold">Invalid</th>
                  <th className="p-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(243,240,232,0.06)]">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-[#161514]/40">
                    <td className="p-4">
                      <span className="font-technical text-[10px] text-[#A39E93] block">#{h.id}</span>
                      <strong className="text-[#F3F0E8]">{h.filename}</strong>
                    </td>
                    <td className="p-4 font-technical">{h.total_rows}</td>
                    <td className="p-4 font-technical text-[#34D399] font-medium">{h.imported_rows}</td>
                    <td className="p-4 font-technical text-[#FFAA3D]">{h.duplicate_rows}</td>
                    <td className="p-4 font-technical text-[#E84B2C]">{h.invalid_rows}</td>
                    <td className="p-4 text-[#A39E93]">{formatDate(h.date)}</td>
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

