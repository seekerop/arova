import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isBetaModeEnabled, isValidBetaPasscode, resetBetaQuota } from "@/lib/beta/service";

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

    const result = await resetBetaQuota(user.id);

    return NextResponse.json({
      success: true,
      message: `Test quota successfully reset to ${result.totalAllocation} leads balance.`,
      result,
    });
  } catch (err: any) {
    console.error("Beta quota reset error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to reset beta quota." },
      { status: 500 }
    );
  }
}

