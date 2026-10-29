import { NextResponse } from "next/server";
import { getSubscriptionsFromDb } from "@/lib/db";
import { verifyAdminSession } from "@/lib/security/roles";

export async function GET() {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriptions = await getSubscriptionsFromDb();
    return NextResponse.json({ success: true, subscriptions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
