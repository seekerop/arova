import { NextRequest, NextResponse } from "next/server";
import { getLeadRequestsFromDb, getDbPool } from "@/lib/db";
import { verifyAdminSession } from "@/lib/security/roles";

export async function GET() {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requests = await getLeadRequestsFromDb();
    return NextResponse.json({ success: true, requests });
  } catch (err: any) {
    console.error("Fetch requests error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch lead requests" },
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
    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json({ error: "id and status required" }, { status: 400 });
    }

    const pool = getDbPool();
    const res = await pool.query(
      `UPDATE lead_requests SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );

    return NextResponse.json({ success: true, request: res.rows[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
