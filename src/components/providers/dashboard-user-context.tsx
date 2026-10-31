"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export interface DashboardUserSubscription {
  status: string;
  planCode: string;
  planName: string;
  pricePaise: number;
  leadAllocation: number;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
}

export interface DashboardUserProfile {
  id: string;
  email: string;
  fullName: string;
  company: string;
  phone: string;
  initials: string;
  isSubscriber: boolean;
  subscription: DashboardUserSubscription | null;
}

interface DashboardUserContextValue {
  user: DashboardUserProfile | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  updateProfile: (data: {
    fullName?: string;
    company?: string;
    phone?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const DashboardUserContext = createContext<DashboardUserContextValue | undefined>(undefined);

export function DashboardUserProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<DashboardUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/dashboard/profile", {
        cache: "no-store",
      });

      if (!res.ok) {
        if (res.status === 401) {
          // User not logged in, but we don't necessarily crash here
          setUser(null);
          return;
        }
        throw new Error("Failed to fetch profile");
      }

      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
      }
    } catch (err: any) {
      console.error("Dashboard user provider load error:", err);
      setError(err.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (data: {
    fullName?: string;
    company?: string;
    phone?: string;
  }) => {
    try {
      const res = await fetch("/api/dashboard/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to update profile");
      }

      if (resData.success && resData.user) {
        setUser(resData.user);
        return { success: true };
      }
      return { success: false, error: "Invalid response" };
    } catch (err: any) {
      return { success: false, error: err.message || "Update failed" };
    }
  };

  const signOut = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Supabase sign out error:", err);
    } finally {
      setUser(null);
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <DashboardUserContext.Provider
      value={{
        user,
        loading,
        error,
        refreshUser: fetchProfile,
        updateProfile,
        signOut,
      }}
    >
      {children}
    </DashboardUserContext.Provider>
  );
}

export function useDashboardUser() {
  const context = useContext(DashboardUserContext);
  if (!context) {
    throw new Error("useDashboardUser must be used within a DashboardUserProvider");
  }
  return context;
}

