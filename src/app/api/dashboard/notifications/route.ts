import { NextResponse } from "next/server";
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
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [userId]
    );

    return NextResponse.json({ success: true, notifications: res.rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH() {
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
    await pool.query(
      `UPDATE notifications SET is_read = true WHERE user_id = $1`,
      [userId]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
