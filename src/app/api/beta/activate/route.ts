import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  isBetaModeEnabled,
  isValidBetaPasscode,
  activateBetaSubscription,
  seedSampleBetaLeads,
} from "@/lib/beta/service";
import { PlanCode } from "@/lib/constants/plans";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { planCode = "starter", passcode, autoSeedLeads = true } = body;

    // Validate beta authorization
    if (!isBetaModeEnabled() && !isValidBetaPasscode(passcode)) {
      return NextResponse.json(
        {
          error:
            "Beta Test Mode is currently restricted. Please provide a valid Beta Tester Passcode.",
        },
        { status: 403 }
      );
    }

    if (planCode !== "starter" && planCode !== "growth") {
      return NextResponse.json(
        { error: "Invalid plan code. Choose 'starter' or 'growth'." },
        { status: 400 }
      );
    }

    // 1. Activate plan and quota
    const result = await activateBetaSubscription({
      userId: user.id,
      planCode: planCode as PlanCode,
    });

    // 2. Optionally seed sample leads for immediate review testing
    let sampleLeadsResult = null;
    if (autoSeedLeads) {
      try {
        sampleLeadsResult = await seedSampleBetaLeads(user.id);
      } catch (seedErr: any) {
        console.warn("Auto-seeding sample leads note:", seedErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Beta Test Mode active: ${result.planName} activated with ${result.leadAllocation} leads quota.`,
      plan: result,
      sampleLeads: sampleLeadsResult,
    });
  } catch (err: any) {
    console.error("Beta activation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to activate beta subscription." },
      { status: 500 }
    );
  }
}
