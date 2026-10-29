import { NextRequest, NextResponse } from "next/server";
import { getLeadRequestsFromDb, getDbPool } from "@/lib/db";
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

    const requests = await getLeadRequestsFromDb(userId);
    return NextResponse.json({ success: true, requests });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let userId = "00000000-0000-0000-0000-000000000000";
    try {
      const supabase = await createSupabaseServerClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) userId = user.id;
    } catch {
      // Guest
    }

    const body = await req.json();
    const { categoryName, quantity, locationPreference, notes } = body;

    const pool = getDbPool();
    // Resolve category id
    const catRes = await pool.query(
      `SELECT id FROM categories WHERE name = $1 OR slug = $1 LIMIT 1`,
      [categoryName || "Website & E-commerce"]
    );
    const categoryId = catRes.rows[0]?.id;

    const res = await pool.query(
      `INSERT INTO lead_requests (user_id, category_id, requested_quantity, target_locations, notes, status)
       VALUES ($1, $2, $3, $4, $5, 'Submitted')
       RETURNING *`,
      [
        userId,
        categoryId,
        quantity || 5,
        locationPreference ? [locationPreference] : [],
        notes || "",
      ]
    );

    return NextResponse.json({ success: true, request: res.rows[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
