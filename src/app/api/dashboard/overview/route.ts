import { NextResponse } from "next/server";
import { getCustomerDashboardData } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    let userId = "00000000-0000-0000-0000-000000000000";

    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      }
    } catch {
      // Fallback guest/test user id
    }

    const data = await getCustomerDashboardData(userId);
    return NextResponse.json({ success: true, ...data });
  } catch (err: any) {
    console.error("Dashboard overview error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load dashboard overview" },
      { status: 500 }
    );
  }
}
