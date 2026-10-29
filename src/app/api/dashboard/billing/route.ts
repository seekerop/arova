import { NextResponse } from "next/server";
import { getPaymentsFromDb } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    let userId = "00000000-0000-0000-0000-000000000000";
    try {
      const supabase = await createSupabaseServerClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) userId = user.id;
    } catch {
      // Guest
    }

    const payments = await getPaymentsFromDb(userId);
    return NextResponse.json({ success: true, payments });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
