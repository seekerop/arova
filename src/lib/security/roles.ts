import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";

export async function verifyAdminSession(): Promise<{
  isAdmin: boolean;
  userId: string | null;
  email: string | null;
}> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { isAdmin: false, userId: null, email: null };
    }

    const adminClient = createSupabaseAdminClient();
    const { data: roleRow } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    const isAdmin = roleRow?.role === "admin";
    return { isAdmin, userId: user.id, email: user.email || null };
  } catch (err) {
    console.error("Admin verification error:", err);
    return { isAdmin: false, userId: null, email: null };
  }
}

