import { NextRequest, NextResponse } from "next/server";
import { getRazorpayClient } from "@/lib/razorpay/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency = "INR", receipt, notes = {} } = body;

    // Validate amount (minimum 100 paise = ₹1.00 as per Razorpay standard)
    const amountInPaise = Number(amount);
    if (!amount || isNaN(amountInPaise) || amountInPaise < 100) {
      return NextResponse.json(
        { error: "Invalid amount. Minimum amount is 100 paise (₹1.00)." },
        { status: 400 }
      );
    }

    const keyId =
      process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const razorpay = getRazorpayClient();

    if (!razorpay || !keyId) {
      return NextResponse.json(
        { error: "Razorpay credentials are not configured on server." },
        { status: 500 }
      );
    }

    // Call Razorpay API to create standard order
    const options = {
      amount: Math.round(amountInPaise),
      currency: currency.toUpperCase(),
      receipt:
        receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      notes: {
        platform: "Arova",
        ...notes,
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: keyId,
    });
  } catch (err: any) {
    console.error("Razorpay create-order error:", err);
    return NextResponse.json(
      {
        error:
          err?.error?.description || err.message || "Failed to create Razorpay order.",
      },
      { status: 500 }
    );
  }
}
