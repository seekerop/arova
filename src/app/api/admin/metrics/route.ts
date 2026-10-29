import { NextResponse } from "next/server";
import { getAdminOverviewMetrics } from "@/lib/db";
import { verifyAdminSession } from "@/lib/security/roles";

export async function GET() {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized administrative access" },
        { status: 401 }
      );
    }

    const metrics = await getAdminOverviewMetrics();
    return NextResponse.json({ success: true, metrics });
  } catch (err: any) {
    console.error("Admin metrics error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to retrieve metrics" },
      { status: 500 }
    );
  }
}
