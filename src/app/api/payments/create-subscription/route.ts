import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSubscriptionOrder } from "@/lib/razorpay/service";
import { PlanCode } from "@/lib/constants/plans";
import { MANDATORY_DISCLOSURE_VERSION } from "@/components/ui/disclaimer";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { planCode, disclosureAcknowledged } = body;

    // Strict validation: Mandatory disclaimer must be acknowledged before subscription creation
    if (!disclosureAcknowledged) {
      return NextResponse.json(
        {
          error:
            "Mandatory disclosure must be explicitly acknowledged before subscribing.",
        },
        { status: 400 }
      );
    }

    if (!planCode || (planCode !== "starter" && planCode !== "growth")) {
      return NextResponse.json(
        { error: "Invalid plan code. Choose 'starter' or 'growth'." },
        { status: 400 }
      );
    }

    const result = await createSubscriptionOrder(
      user.id,
      user.email || "subscriber@arova.io",
      planCode as PlanCode,
      MANDATORY_DISCLOSURE_VERSION
    );

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Create subscription error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create subscription" },
      { status: 500 }
    );
  }
}
