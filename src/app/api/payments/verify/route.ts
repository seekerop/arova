import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { verifyAndActivateSubscription } from "@/lib/razorpay/service";

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
    const { subscriptionId, paymentId, signature } = body;

    if (!subscriptionId || !paymentId || !signature) {
      return NextResponse.json(
        { error: "Missing required payment verification parameters" },
        { status: 400 }
      );
    }

    const result = await verifyAndActivateSubscription({
      userId: user.id,
      subscriptionId,
      paymentId,
      signature,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Payment verification failed:", err);
    return NextResponse.json(
      { error: err.message || "Payment verification failed" },
      { status: 400 }
    );
  }
}
