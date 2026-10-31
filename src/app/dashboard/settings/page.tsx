"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/navigation/dashboard-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useDashboardUser } from "@/components/providers/dashboard-user-context";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  ShieldCheck,
  User,
  Lock,
  Mail,
  Building,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function SettingsPage() {
  const { user, loading, updateProfile } = useDashboardUser();

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Sync state when user object loads or updates
  useEffect(() => {
    if (user) {
      setName(user.fullName || "");
      setCompany(user.company || "");
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    const res = await updateProfile({
      fullName: name,
      company: company,
    });

    if (res.success) {
      setProfileSuccess("Profile updated successfully");
      setTimeout(() => setProfileSuccess(null), 3000);
    } else {
      setProfileError(res.error || "Failed to update profile");
    }
    setSavingProfile(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setUpdatingPassword(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setPasswordSuccess("Password successfully updated.");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password. Please try again.");
    } finally {
      setUpdatingPassword(false);
    }
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
          <div className="pb-3 border-b border-[rgba(243,240,232,0.06)] flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-[#F3F0E8] flex items-center gap-2">
                <User className="w-4 h-4 text-[#FFAA3D]" />
                Personal & Company Information
              </h3>
              <p className="text-xs text-[#A39E93]">
                Your agency details are used for billing invoices and account identification
              </p>
            </div>
            {loading && <RefreshCw className="w-4 h-4 animate-spin text-[#FFAA3D]" />}
          </div>

          {profileError && (
            <div className="p-3 rounded-[8px] bg-[rgba(232,75,44,0.1)] border border-[rgba(232,75,44,0.3)] text-xs text-[#E84B2C] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#D0CBC1]">Full Name</label>
                <div className="relative">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    disabled={loading}
                    className="pl-9"
                  />
                  <User className="w-4 h-4 text-[#A39E93] absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#D0CBC1]">Company / Agency</label>
                <div className="relative">
                  <Input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Enter company or agency name"
                    disabled={loading}
                    className="pl-9"
                  />
                  <Building className="w-4 h-4 text-[#A39E93] absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#D0CBC1]">Email Address</label>
              <div className="relative">
                <Input
                  disabled
                  value={user?.email || ""}
                  placeholder="Loading account email..."
                  className="text-[#A39E93] bg-[#161514] pl-9"
                />
                <Mail className="w-4 h-4 text-[#A39E93] absolute left-3 top-3 pointer-events-none" />
              </div>
              <span className="text-[10px] text-[#9E9B93]">
                Email is tied to your login credentials and verified account identity.
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              {profileSuccess && (
                <span className="text-xs text-[#34D399] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {profileSuccess}
                </span>
              )}
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="ml-auto text-xs"
                isLoading={savingProfile}
                disabled={loading || savingProfile}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Security Card */}
        <Card className="p-6 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-6">
          <div className="pb-3 border-b border-[rgba(243,240,232,0.06)]">
            <h3 className="font-display font-bold text-base text-[#F3F0E8] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#FFAA3D]" />
              Security & Authentication
            </h3>
            <p className="text-xs text-[#A39E93]">
              Update your account password for secure dashboard access
            </p>
          </div>

          {passwordSuccess && (
            <div className="p-3 rounded-[8px] bg-[rgba(52,211,153,0.1)] border border-[rgba(52,211,153,0.3)] text-xs text-[#34D399] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3 rounded-[8px] bg-[rgba(232,75,44,0.1)] border border-[rgba(232,75,44,0.3)] text-xs text-[#E84B2C] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#D0CBC1]">New Password</label>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-9"
                    minLength={6}
                    required
                  />
                  <Lock className="w-4 h-4 text-[#A39E93] absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#D0CBC1]">Confirm New Password</label>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9"
                    minLength={6}
                    required
                  />
                  <Lock className="w-4 h-4 text-[#A39E93] absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                className="text-xs"
                isLoading={updatingPassword}
                disabled={updatingPassword || !newPassword || !confirmPassword}
              >
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
