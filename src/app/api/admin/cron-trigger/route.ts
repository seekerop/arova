import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/security/roles";
import { runScheduledAutomation } from "@/lib/cron/worker";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { isAdmin, userId, email } = await verifyAdminSession();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Administrator role required" },
        { status: 403 }
      );
    }

    const isValidUuid = (val: string | null | undefined): boolean =>
      typeof val === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    const actorId = isValidUuid(userId) ? userId : null;

    const result = await runScheduledAutomation("manual");

    const supabase = createSupabaseAdminClient();
    await supabase.from("audit_logs").insert({
      actor_id: actorId,
      actor_role: "admin",
      action: "manual_automation_triggered",
      target_entity: "delivery_runs",
      target_id: result.runId,
      details: {
        admin_email: email,
        actor_id_raw: userId,
        offersExpired: result.offersExpired,
        claimsExpired: result.claimsExpired,
        offersDistributed: result.offersDistributed,
      },
    });

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error("Admin cron trigger error:", err);
    return NextResponse.json(
      { error: err.message || "Manual automation failed" },
      { status: 500 }
    );
  }
}

