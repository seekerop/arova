"use client";

import { useState, useEffect } from "react";
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
  RefreshCw,
  Clock,
  ShieldCheck,
  Download,
} from "lucide-react";

export default function AdminImportsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Real database import history
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/imports");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.batches || []);
      }
    } catch (err) {
      console.error("Failed to fetch import history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

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
    setSummary(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process import file.");
      }

      setSummary(data.summary);
      setFile(null);
      fetchHistory();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload and parse file.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="CSV & Excel Lead Imports"
        subtitle="Bulk ingest verified business leads with automatic deduplication against phone and email"
        actions={
          <Button variant="outline" size="sm" onClick={fetchHistory} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh History
          </Button>
        }
      />

      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* File Dropzone */}
        <Card className="p-8 bg-[#111110] border-[rgba(243,240,232,0.08)]">
          <div className="max-w-xl mx-auto text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#161514] border border-[rgba(232,75,44,0.3)] flex items-center justify-center mx-auto text-[#FFAA3D]">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-display text-lg font-bold text-[#F3F0E8]">
                Upload CSV or Excel Spreadsheet (.xlsx, .csv)
              </h3>
              <p className="text-xs text-[#A39E93] mt-1">
                Supports business name, contact name, phone, email, website, approved category, city, and requirement.
              </p>
            </div>

            <div className="p-6 border-2 border-dashed border-[rgba(243,240,232,0.1)] rounded-[12px] bg-[#161514]/40 hover:bg-[#161514]/70 transition-colors flex flex-col items-center justify-center">
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <FileSpreadsheet className="w-8 h-8 text-[#FFAA3D]" />
                <span className="text-xs text-[#F3F0E8] font-medium">
                  {file ? file.name : "Click to select file from disk"}
                </span>
                <span className="text-[10px] text-[#A39E93]">
                  {file ? `${(file.size / 1024).toFixed(1)} KB` : "Max file size: 10MB"}
                </span>
              </label>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-[8px] bg-[rgba(232,75,44,0.1)] border border-[rgba(232,75,44,0.3)] text-xs text-[#E84B2C] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {summary && (
              <div className="p-4 rounded-[10px] bg-[#161514] border border-[rgba(52,211,153,0.3)] text-left space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#34D399] font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Import Completed Successfully</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-technical pt-2 text-[#D0CBC1]">
                  <div>Total Rows: <span className="text-[#F3F0E8]">{summary.totalRows}</span></div>
                  <div>Imported: <span className="text-[#34D399]">{summary.importedRows}</span></div>
                  <div>Filtered Dupes: <span className="text-[#FFAA3D]">{summary.duplicateRows}</span></div>
                  <div>Invalid: <span className="text-[#E84B2C]">{summary.invalidRows}</span></div>
                </div>
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              disabled={!file}
              isLoading={uploading}
              onClick={handleUpload}
              className="w-full sm:w-auto"
            >
              Parse & Ingest Leads
            </Button>
          </div>
        </Card>

        {/* Import History Table */}
        <div className="space-y-4">
          <h3 className="font-display text-lg font-bold text-[#F3F0E8]">
            Historical Import Batches
          </h3>

          <Card className="bg-[#111110] border-[rgba(243,240,232,0.08)] overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-xs text-[#A39E93] flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-[#FFAA3D]" />
                <span>Loading import batches...</span>
              </div>
            ) : history.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#A39E93] space-y-2">
                <FileSpreadsheet className="w-8 h-8 text-[#A39E93] mx-auto opacity-40" />
                <p>No import batches recorded in database yet.</p>
                <p className="text-[11px] text-[#9E9B93]">Upload your first CSV or XLSX file above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#161514] text-[#A39E93] border-b border-[rgba(243,240,232,0.08)]">
                    <tr>
                      <th className="p-4 font-medium">Batch ID / Filename</th>
                      <th className="p-4 font-medium">Total Rows</th>
                      <th className="p-4 font-medium">Imported Valid</th>
                      <th className="p-4 font-medium">Duplicates Filtered</th>
                      <th className="p-4 font-medium">Invalid</th>
                      <th className="p-4 font-medium">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(243,240,232,0.06)]">
                    {history.map((h) => (
                      <tr key={h.id} className="hover:bg-[#161514]/40 transition-colors">
                        <td className="p-4">
                          <span className="font-technical text-[#FFAA3D] block">{h.id.slice(0, 8)}...</span>
                          <span className="text-[11px] text-[#D0CBC1]">{h.file_name}</span>
                        </td>
                        <td className="p-4 font-technical text-[#F3F0E8]">{h.total_rows}</td>
                        <td className="p-4 font-technical text-[#34D399] font-semibold">{h.imported_rows}</td>
                        <td className="p-4 font-technical text-[#FFAA3D]">{h.duplicate_rows}</td>
                        <td className="p-4 font-technical text-[#E84B2C]">{h.invalid_rows}</td>
                        <td className="p-4 text-[11px] text-[#A39E93]">{formatDate(h.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
