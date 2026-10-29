import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { rejectLeadOffer } from "@/lib/leads/service";

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
    const { deliveryId, reason } = body;

    if (!deliveryId) {
      return NextResponse.json(
        { error: "Delivery ID is required" },
        { status: 400 }
      );
    }

    const result = await rejectLeadOffer({
      userId: user.id,
      deliveryId,
      reason,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Reject lead error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to reject lead offer" },
      { status: 400 }
    );
  }
}

