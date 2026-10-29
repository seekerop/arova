import { getRazorpayClient, verifyRazorpaySubscriptionPaymentSignature } from "./client";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { SUBSCRIPTION_PLANS, PlanCode } from "@/lib/constants/plans";
import { buildQuotaIdempotencyKey } from "@/lib/quota/engine";

export interface CreateSubscriptionResult {
  subscriptionId: string;
  planId: string;
  keyId: string;
  amountPaise: number;
}

/**
 * Creates a Razorpay Subscription for a user after validating plan & disclosure acknowledgement.
 */
export async function createSubscriptionOrder(
  userId: string,
  userEmail: string,
  planCode: PlanCode,
  disclosureVersion: string
): Promise<CreateSubscriptionResult> {
  const planConfig = SUBSCRIPTION_PLANS.find((p) => p.code === planCode);
  if (!planConfig) {
    throw new Error(`Invalid plan: ${planCode}`);
  }

  const razorpay = getRazorpayClient();
  const keyId = process.env.RAZORPAY_KEY_ID;

  if (!razorpay || !keyId) {
    throw new Error(
      "Razorpay credentials are not configured. Please check your environment variables."
    );
  }

  // Get the Razorpay plan ID from env or fallback
  const rzpPlanId =
    planCode === "starter"
      ? process.env.RAZORPAY_STARTER_PLAN_ID || "plan_starter_monthly_499"
      : process.env.RAZORPAY_GROWTH_PLAN_ID || "plan_growth_monthly_999";

  // Create subscription on Razorpay
  const subscription = await razorpay.subscriptions.create({
    plan_id: rzpPlanId,
    total_count: 12, // 12 billing cycles (monthly)
    quantity: 1,
    customer_notify: 1,
    notes: {
      userId,
      userEmail,
      planCode,
      disclosureVersion,
      platform: "Arova",
    },
  });

  const supabase = createSupabaseAdminClient();

  // Look up plan record in database
  const { data: dbPlan } = await supabase
    .from("plans")
    .select("id")
    .eq("code", planCode)
    .single();

  const planId = dbPlan ? dbPlan.id : planConfig.code;

  // Insert or update subscription record with 'created' status
  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      plan_id: planId,
      razorpay_subscription_id: subscription.id,
      status: "created",
      disclosure_ack_at: new Date().toISOString(),
      disclosure_version: disclosureVersion,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "razorpay_subscription_id" }
  );

  return {
    subscriptionId: subscription.id,
    planId: subscription.plan_id,
    keyId,
    amountPaise: planConfig.pricePaise,
  };
}

/**
 * Authoritatively verifies payment callback and activates subscription.
 * Idempotently creates a quota period and records ledger entry.
 */
export async function verifyAndActivateSubscription(params: {
  userId: string;
  subscriptionId: string;
  paymentId: string;
  signature: string;
}) {
  const { userId, subscriptionId, paymentId, signature } = params;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    throw new Error("RAZORPAY_KEY_SECRET is not configured on server.");
  }

  // Verify signature
  const isValid = verifyRazorpaySubscriptionPaymentSignature(
    paymentId,
    subscriptionId,
    signature,
    keySecret
  );

  if (!isValid) {
    throw new Error("Invalid payment signature verification failed.");
  }

  const razorpay = getRazorpayClient();
  if (!razorpay) {
    throw new Error("Razorpay client unavailable.");
  }

  // Fetch authoritative state from Razorpay
  const rzpSub = await razorpay.subscriptions.fetch(subscriptionId);
  const rzpPayment = await razorpay.payments.fetch(paymentId);

  if (rzpPayment.status !== "captured") {
    throw new Error(
      `Payment is not captured on Razorpay. Current status: ${rzpPayment.status}`
    );
  }

  const supabase = createSupabaseAdminClient();

  // Find subscription and plan in database
  const { data: subData } = await supabase
    .from("subscriptions")
    .select("*, plans(*)")
    .eq("razorpay_subscription_id", subscriptionId)
    .single();

  if (!subData) {
    throw new Error(`Subscription not found in database: ${subscriptionId}`);
  }

  const plan = subData.plans;
  const leadAllocation = plan?.lead_allocation || (subData.plan_id.includes("growth") ? 100 : 40);

  const now = new Date();
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // 1. Update subscription status to active
  await supabase
    .from("subscriptions")
    .update({
      status: "active",
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq("id", subData.id);

  // 2. Record payment in payments table
  await supabase.from("payments").upsert(
    {
      user_id: userId,
      subscription_id: subData.id,
      razorpay_payment_id: paymentId,
      amount_paise: Number(rzpPayment.amount) || plan?.price_paise || 49900,
      currency: "INR",
      status: "captured",
      updated_at: now.toISOString(),
    },
    { onConflict: "razorpay_payment_id" }
  );

  // 3. Idempotently create Quota Period
  const idempotencyKey = buildQuotaIdempotencyKey(
    "sub_grant",
    `${subscriptionId}_${paymentId}`
  );

  const { data: existingLedger } = await supabase
    .from("quota_ledger")
    .select("id")
    .eq("idempotency_key", idempotencyKey)
    .single();

  if (!existingLedger) {
    // Check if quota period already exists for this exact cycle
    const { data: newPeriod, error: periodErr } = await supabase
      .from("quota_periods")
      .insert({
        user_id: userId,
        subscription_id: subData.id,
        period_start: now.toISOString(),
        period_end: periodEnd.toISOString(),
        total_allocation: leadAllocation,
        consumed_quota: 0,
        reserved_quota: 0,
        is_active: true,
      })
      .select()
      .single();

    if (!periodErr && newPeriod) {
      // Record in ledger
      await supabase.from("quota_ledger").insert({
        user_id: userId,
        quota_period_id: newPeriod.id,
        amount: leadAllocation,
        balance_after: leadAllocation,
        transaction_type: "grant",
        idempotency_key: idempotencyKey,
        reference_id: paymentId,
        reference_type: "subscription_grant",
        notes: `Plan allocation: ${leadAllocation} leads for 30 days`,
      });

      // Send in-app notification
      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Subscription Activated",
        message: `Your ${plan?.name || "Arova"} subscription is active with ${leadAllocation} leads quota.`,
        type: "subscription",
        link_url: "/dashboard",
      });
    }
  }

  return { success: true, subscriptionId, paymentId };
}
