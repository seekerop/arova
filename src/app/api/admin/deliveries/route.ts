import { NextResponse } from "next/server";
import { getDeliveryRunsFromDb } from "@/lib/db";
import { verifyAdminSession } from "@/lib/security/roles";

export async function GET() {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const runs = await getDeliveryRunsFromDb();
    return NextResponse.json({ success: true, runs });
  } catch (err: any) {
    console.error("Fetch runs error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch delivery runs" },
      { status: 500 }
    );
  }
}
