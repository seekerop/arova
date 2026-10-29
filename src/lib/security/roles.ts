import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";
import { getAdminSessionFromCookies, getExpectedAdminEmail } from "./admin-auth";

export async function verifyAdminSession(): Promise<{
  isAdmin: boolean;
  userId: string | null;
  email: string | null;
}> {
  try {
    // 1. Check signed single-user admin cookie first (primary owner gate)
    const adminSession = await getAdminSessionFromCookies();
    if (adminSession && adminSession.role === "admin") {
      return {
        isAdmin: true,
        userId: "admin_owner",
        email: adminSession.email,
      };
    }

    // 2. Fallback to Supabase auth user check if cookie isn't present
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { isAdmin: false, userId: null, email: null };
    }

    // Check if the user's email matches the configured single admin email
    const expectedAdminEmail = getExpectedAdminEmail();
    if (user.email && user.email.toLowerCase() === expectedAdminEmail) {
      return { isAdmin: true, userId: user.id, email: user.email };
    }

    // Check user_roles table
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
