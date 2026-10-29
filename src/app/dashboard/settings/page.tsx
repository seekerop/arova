"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/navigation/dashboard-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ShieldCheck, User, Lock, Mail, Bell, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [name, setName] = useState("Siddharth Mehta");
  const [company, setCompany] = useState("Studio Nova");
  const [email] = useState("siddharth@studio.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader
        title="Account Settings"
        subtitle="Manage your profile, security credentials, and communication preferences"
      />

      <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto w-full">
        {/* Profile Card */}
        <Card className="p-6 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-6">
          <div className="pb-3 border-b border-[rgba(243,240,232,0.06)]">
            <h3 className="font-display font-bold text-base text-[#F3F0E8]">
              Personal & Company Information
            </h3>
            <p className="text-xs text-[#A39E93]">
              Your agency details are used for billing invoices and account identification
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#D0CBC1]">Full Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#D0CBC1]">Company / Agency</label>
                <Input value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#D0CBC1]">Email Address</label>
              <Input disabled value={email} className="text-[#A39E93]" />
              <span className="text-[10px] text-[#9E9B93]">Email cannot be changed directly for security.</span>
            </div>

            <div className="flex items-center justify-between pt-2">
              {saved && (
                <span className="text-xs text-[#34D399] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Profile updated
                </span>
              )}
              <Button type="submit" variant="primary" size="sm" className="ml-auto">
                Save Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Security Card */}
        <Card className="p-6 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-6">
          <div className="pb-3 border-b border-[rgba(243,240,232,0.06)]">
            <h3 className="font-display font-bold text-base text-[#F3F0E8]">
              Security & Authentication
            </h3>
            <p className="text-xs text-[#A39E93]">
              Update your account password
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#D0CBC1]">Current Password</label>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#D0CBC1]">New Password</label>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="secondary" size="sm">
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
