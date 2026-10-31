import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserProfile, upsertUserProfile, updateUserProfile } from "@/lib/db";

export const dynamic = "force-dynamic";

function computeInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email && email.trim()) {
    const prefix = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
    if (prefix.length >= 2) {
      return prefix.slice(0, 2).toUpperCase();
    }
    return (prefix[0] || "U").toUpperCase();
  }
  return "U";
}

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let profile = await getUserProfile(user.id);

    // If profile does not exist yet (e.g. fresh OAuth or signup without profile row), auto-upsert
    if (!profile) {
      const metadata = user.user_metadata || {};
      const fallbackName = metadata.full_name || metadata.name || "";
      const fallbackCompany = metadata.company || "";

      profile = await upsertUserProfile({
        id: user.id,
        email: user.email || "",
        full_name: fallbackName,
        company: fallbackCompany,
      });
    }

    const initials = computeInitials(profile.full_name, profile.email || user.email);
    const isSubscriber = profile.subscription_status === "active";

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: profile.email || user.email,
        fullName: profile.full_name || "",
        company: profile.company || "",
        phone: profile.phone || "",
        initials,
        isSubscriber,
        subscription: isSubscriber
          ? {
              status: profile.subscription_status,
              planCode: profile.plan_code,
              planName: profile.plan_name,
              pricePaise: profile.price_paise,
              leadAllocation: profile.lead_allocation,
              currentPeriodStart: profile.current_period_start,
              currentPeriodEnd: profile.current_period_end,
            }
          : null,
      },
    });
  } catch (err: any) {
    console.error("Dashboard profile GET error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to retrieve profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : undefined;
    const company = typeof body.company === "string" ? body.company.trim() : undefined;
    const phone = typeof body.phone === "string" ? body.phone.trim() : undefined;

    // Check if profile exists; if not, upsert
    const existing = await getUserProfile(user.id);
    let updated;
    if (!existing) {
      updated = await upsertUserProfile({
        id: user.id,
        email: user.email || "",
        full_name: fullName || null,
        company: company || null,
        phone: phone || null,
      });
    } else {
      updated = await updateUserProfile(user.id, {
        full_name: fullName,
        company,
        phone,
      });
    }

    // Also sync metadata in Supabase Auth user record
    try {
      await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          company,
        },
      });
    } catch (metaErr) {
      console.warn("Failed to update user_metadata in auth:", metaErr);
    }

    const initials = computeInitials(updated.full_name, updated.email || user.email);
    const profile = await getUserProfile(user.id);
    const isSubscriber = profile?.subscription_status === "active";

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: updated.email || user.email,
        fullName: updated.full_name || "",
        company: updated.company || "",
        phone: updated.phone || "",
        initials,
        isSubscriber,
        subscription: isSubscriber
          ? {
              status: profile.subscription_status,
              planCode: profile.plan_code,
              planName: profile.plan_name,
              pricePaise: profile.price_paise,
              leadAllocation: profile.lead_allocation,
              currentPeriodStart: profile.current_period_start,
              currentPeriodEnd: profile.current_period_end,
            }
          : null,
      },
    });
  } catch (err: any) {
    console.error("Dashboard profile PATCH error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}

