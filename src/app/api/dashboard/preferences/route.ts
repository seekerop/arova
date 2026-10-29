import { NextRequest, NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
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

    const pool = getDbPool();
    const res = await pool.query(
      `SELECT * FROM user_preferences WHERE user_id = $1 LIMIT 1`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      preferences: res.rows[0] || {
        target_categories: ["website-ecommerce"],
        target_locations: ["Mumbai", "Bengaluru", "Pune", "Hyderabad"],
        weekly_pacing: true,
      },
    });
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
    const { target_categories, target_locations, weekly_pacing } = body;

    const pool = getDbPool();
    const res = await pool.query(
      `INSERT INTO user_preferences (user_id, target_categories, target_locations, weekly_pacing, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         target_categories = EXCLUDED.target_categories,
         target_locations = EXCLUDED.target_locations,
         weekly_pacing = EXCLUDED.weekly_pacing,
         updated_at = NOW()
       RETURNING *`,
      [userId, target_categories || [], target_locations || [], weekly_pacing ?? true]
    );

    return NextResponse.json({ success: true, preferences: res.rows[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
