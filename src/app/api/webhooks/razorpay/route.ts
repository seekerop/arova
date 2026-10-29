import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay/client";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { buildQuotaIdempotencyKey } from "@/lib/quota/engine";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return NextResponse.json(
        { error: "Missing signature or webhook secret configuration" },
        { status: 400 }
      );
    }

    // 1. Authoritative HMAC SHA256 Signature Verification
    const isValid = verifyRazorpayWebhookSignature(rawBody, signature, secret);
    if (!isValid) {
      console.warn("Razorpay webhook signature verification failed.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event;
    const eventId = payload.account_id ? `${payload.account_id}_${payload.created_at}_${eventType}` : `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const supabase = createSupabaseAdminClient();

    // 2. Webhook Event Deduplication in database
    const { data: existingEvent } = await supabase
      .from("payment_webhook_events")
      .select("id, status")
      .eq("event_id", eventId)
      .single();

    if (existingEvent && existingEvent.status === "processed") {
      return NextResponse.json({ received: true, note: "Already processed" });
    }

    await supabase.from("payment_webhook_events").upsert(
      {
        provider: "razorpay",
        event_id: eventId,
        event_type: eventType,
        payload,
        signature,
        status: "received",
      },
      { onConflict: "event_id" }
    );

    // 3. Process Events
    switch (eventType) {
      case "subscription.charged": {
        const subEntity = payload.payload?.subscription?.entity;
        const paymentEntity = payload.payload?.payment?.entity;

        if (subEntity?.id) {
          const { data: dbSub } = await supabase
            .from("subscriptions")
            .select("*, plans(*)")
            .eq("razorpay_subscription_id", subEntity.id)
            .single();

          if (dbSub) {
            const plan = dbSub.plans;
            const allocation = plan?.lead_allocation || 40;
            const now = new Date();
            const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

            // Record payment
            if (paymentEntity?.id) {
              await supabase.from("payments").upsert(
                {
                  user_id: dbSub.user_id,
                  subscription_id: dbSub.id,
                  razorpay_payment_id: paymentEntity.id,
                  amount_paise: Number(paymentEntity.amount) || plan?.price_paise || 49900,
                  currency: "INR",
                  status: "captured",
                },
                { onConflict: "razorpay_payment_id" }
              );
            }

            // Create new quota period for renewal
            const idempotencyKey = buildQuotaIdempotencyKey(
              "sub_charge",
              `${subEntity.id}_${paymentEntity?.id || Date.now()}`
            );

            const { data: existingLedger } = await supabase
              .from("quota_ledger")
              .select("id")
              .eq("idempotency_key", idempotencyKey)
              .single();

            if (!existingLedger) {
              const { data: newPeriod } = await supabase
                .from("quota_periods")
                .insert({
                  user_id: dbSub.user_id,
                  subscription_id: dbSub.id,
                  period_start: now.toISOString(),
                  period_end: periodEnd.toISOString(),
                  total_allocation: allocation,
                  consumed_quota: 0,
                  reserved_quota: 0,
                  is_active: true,
                })
                .select()
                .single();

              if (newPeriod) {
                await supabase.from("quota_ledger").insert({
                  user_id: dbSub.user_id,
                  quota_period_id: newPeriod.id,
                  amount: allocation,
                  balance_after: allocation,
                  transaction_type: "grant",
                  idempotency_key: idempotencyKey,
                  reference_id: paymentEntity?.id || subEntity.id,
                  reference_type: "subscription_grant",
                  notes: `Subscription renewal charged. Quota refreshed: ${allocation} leads.`,
                });
              }
            }
          }
        }
        break;
      }

      case "subscription.cancelled": {
        const subEntity = payload.payload?.subscription?.entity;
        if (subEntity?.id) {
          await supabase
            .from("subscriptions")
            .update({
              status: "cancelled",
              cancelled_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("razorpay_subscription_id", subEntity.id);
        }
        break;
      }

      case "payment.failed": {
        const paymentEntity = payload.payload?.payment?.entity;
        if (paymentEntity?.id) {
          await supabase.from("payments").upsert(
            {
              user_id: paymentEntity.notes?.userId || "unknown",
              razorpay_payment_id: paymentEntity.id,
              amount_paise: Number(paymentEntity.amount) || 0,
              currency: "INR",
              status: "failed",
              error_code: paymentEntity.error_code,
              error_description: paymentEntity.error_description,
            },
            { onConflict: "razorpay_payment_id" }
          );
        }
        break;
      }

      default:
        break;
    }

    // Mark event processed
    await supabase
      .from("payment_webhook_events")
      .update({ status: "processed", processed_at: new Date().toISOString() })
      .eq("event_id", eventId);

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json(
      { error: "Internal processing error", message: err.message },
      { status: 500 }
    );
  }
}

