import { NextRequest, NextResponse } from "next/server";
import { getCustomersFromDb, getDbPool } from "@/lib/db";
import { verifyAdminSession } from "@/lib/security/roles";

export async function GET() {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customers = await getCustomersFromDb();
    return NextResponse.json({ success: true, customers });
  } catch (err: any) {
    console.error("Fetch customers error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, isSuspended, suspensionReason } = body;
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const pool = getDbPool();
    const res = await pool.query(
      `UPDATE profiles SET is_suspended = $1, suspension_reason = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
      [Boolean(isSuspended), suspensionReason || null, userId]
    );

    return NextResponse.json({ success: true, profile: res.rows[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
