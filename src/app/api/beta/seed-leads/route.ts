import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isBetaModeEnabled, isValidBetaPasscode, seedSampleBetaLeads } from "@/lib/beta/service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { passcode } = body;

    if (!isBetaModeEnabled() && !isValidBetaPasscode(passcode)) {
      return NextResponse.json(
        { error: "Beta Test Mode is currently restricted." },
        { status: 403 }
      );
    }

    const result = await seedSampleBetaLeads(user.id);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: any) {
    console.error("Beta seed leads error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to deliver sample beta leads." },
      { status: 500 }
    );
  }
}
