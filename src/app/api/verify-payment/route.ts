import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpayOrderSignature } from "@/lib/razorpay/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Accept both standard and Razorpay response parameter formats
    const orderId = body.order_id || body.razorpay_order_id;
    const paymentId = body.payment_id || body.razorpay_payment_id;
    const signature = body.signature || body.razorpay_signature;

    // Validate missing fields
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required payment verification fields (order_id, payment_id, signature).",
        },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { success: false, error: "Razorpay secret is not configured on server." },
        { status: 500 }
      );
    }

    // Cryptographic signature check: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const isValid = verifyRazorpayOrderSignature(
      orderId,
      paymentId,
      signature,
      keySecret
    );

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Payment verification failed. Invalid signature. Transaction not authenticated.",
        },
        { status: 400 }
      );
    }

    // Signature matches authoritatively
    return NextResponse.json({
      success: true,
      message: "Payment signature verified successfully.",
      order_id: orderId,
      payment_id: paymentId,
    });
  } catch (err: any) {
    console.error("Razorpay verify-payment error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to process payment verification.",
      },
      { status: 500 }
    );
  }
}

