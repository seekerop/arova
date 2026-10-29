import { NextResponse } from "next/server";
import { getCustomerLeadsList } from "@/lib/db";
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
      // Fallback
    }

    const leads = await getCustomerLeadsList(userId);
    return NextResponse.json({ success: true, leads });
  } catch (err: any) {
    console.error("Dashboard leads error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load leads" },
      { status: 500 }
    );
  }
}
