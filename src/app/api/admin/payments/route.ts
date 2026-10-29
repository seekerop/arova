import { NextResponse } from "next/server";
import { getPaymentsFromDb, getWebhookEventsFromDb } from "@/lib/db";
import { verifyAdminSession } from "@/lib/security/roles";

export async function GET() {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [payments, webhooks] = await Promise.all([
      getPaymentsFromDb(),
      getWebhookEventsFromDb(),
    ]);

    return NextResponse.json({ success: true, payments, webhooks });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
