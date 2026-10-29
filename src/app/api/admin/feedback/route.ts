import { NextRequest, NextResponse } from "next/server";
import { getLeadFeedbackFromDb, getDbPool } from "@/lib/db";
import { verifyAdminSession } from "@/lib/security/roles";

export async function GET() {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const feedback = await getLeadFeedbackFromDb();
    return NextResponse.json({ success: true, feedback });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, status, resolutionNotes } = body;
    if (!id || !status) {
      return NextResponse.json({ error: "id and status required" }, { status: 400 });
    }

    const pool = getDbPool();
    const res = await pool.query(
      `UPDATE lead_feedback SET status = $1, admin_resolution_notes = $2, resolved_at = NOW(), updated_at = NOW() WHERE id = $3 RETURNING *`,
      [status, resolutionNotes || null, id]
    );

    return NextResponse.json({ success: true, item: res.rows[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
