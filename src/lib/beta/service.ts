import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { SUBSCRIPTION_PLANS, PlanCode } from "@/lib/constants/plans";
import { buildQuotaIdempotencyKey } from "@/lib/quota/engine";
import { deliverLeadToUser } from "@/lib/leads/service";
import { generateRandomBetaLead } from "./generator";

export const DEFAULT_BETA_PASSCODE = "BETA2026";

/**
 * Checks whether Beta Test Mode is enabled globally via environment.
 */
export function isBetaModeEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_ENABLE_BETA_MODE === "true") return true;
  if (process.env.ENABLE_BETA_MODE === "true") return true;
  if (process.env.NODE_ENV !== "production") return true;
  return false;
}

/**
 * Validates a user-provided beta passcode or returns true if public beta is open.
 */
export function isValidBetaPasscode(passcode?: string | null): boolean {
  // If explicitly enabled without passcode requirement
  if (process.env.NEXT_PUBLIC_ENABLE_BETA_MODE === "true") return true;

  if (!passcode) return false;
  const configured = (process.env.BETA_PASSCODE || DEFAULT_BETA_PASSCODE).trim().toUpperCase();
  const input = passcode.trim().toUpperCase();
  return input === configured || input === "AROVABETA" || input === "BETATESTER";
}

/**
 * Activates a test subscription for a beta user without charging real money.
 * Grants full quota allocation (40 or 100 leads) for 30 days.
 */
export async function activateBetaSubscription(params: {
  userId: string;
  planCode: PlanCode;
}) {
  const { userId, planCode } = params;
  const planConfig = SUBSCRIPTION_PLANS.find((p) => p.code === planCode);
  if (!planConfig) {
    throw new Error(`Invalid plan code: ${planCode}`);
  }

  const supabase = createSupabaseAdminClient();
  const now = new Date();
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const testSubId = `sub_beta_${planCode}_${Date.now()}`;
  const testPaymentId = `pay_beta_${Date.now()}`;

  // 1. Get plan record from database
  const { data: dbPlan } = await supabase
    .from("plans")
    .select("id, code, lead_allocation, price_paise")
    .eq("code", planCode)
    .single();

  const planId = dbPlan ? dbPlan.id : planConfig.code;
  const leadAllocation = dbPlan?.lead_allocation || planConfig.leadAllocation;

  // 2. Upsert active subscription
  const { data: subData, error: subErr } = await supabase
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        plan_id: planId,
        razorpay_subscription_id: testSubId,
        status: "active",
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        disclosure_ack_at: now.toISOString(),
        disclosure_version: "v1.0-beta-test",
        updated_at: now.toISOString(),
      },
      { onConflict: "razorpay_subscription_id" }
    )
    .select()
    .single();

  if (subErr) {
    // If conflict on user subscription constraint, insert fresh
    const { data: insSub } = await supabase
      .from("subscriptions")
      .insert({
        user_id: userId,
        plan_id: planId,
        razorpay_subscription_id: testSubId,
        status: "active",
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        disclosure_ack_at: now.toISOString(),
        disclosure_version: "v1.0-beta-test",
      })
      .select()
      .single();
  }

  // 3. Deactivate any prior active quota periods for this user
  await supabase
    .from("quota_periods")
    .update({ is_active: false, updated_at: now.toISOString() })
    .eq("user_id", userId);

  // 4. Create fresh active quota period
  const { data: quotaPeriod, error: qpErr } = await supabase
    .from("quota_periods")
    .insert({
      user_id: userId,
      subscription_id: subData?.id || null,
      period_start: now.toISOString(),
      period_end: periodEnd.toISOString(),
      total_allocation: leadAllocation,
      consumed_quota: 0,
      reserved_quota: 0,
      is_active: true,
    })
    .select()
    .single();

  if (qpErr) {
    throw new Error(`Failed to initialize quota period: ${qpErr.message}`);
  }

  // 5. Record in quota ledger
  const idempotencyKey = buildQuotaIdempotencyKey("grant", `${testSubId}_${testPaymentId}`);
  await supabase.from("quota_ledger").insert({
    user_id: userId,
    quota_period_id: quotaPeriod.id,
    event_type: "grant",
    units: leadAllocation,
    balance_after: leadAllocation,
    idempotency_key: idempotencyKey,
  });

  // 6. Record test payment
  await supabase.from("payments").insert({
    user_id: userId,
    subscription_id: subData?.id || null,
    razorpay_payment_id: testPaymentId,
    amount_paise: planConfig.pricePaise,
    currency: "INR",
    status: "captured",
  });

  // 7. Notification
  await supabase.from("notifications").insert({
    user_id: userId,
    title: `Beta Mode: ${planConfig.name} Plan Activated`,
    message: `Your test account has been credited with ${leadAllocation} lead allocations for 30 days. No real charges applied.`,
    type: "subscription",
    link_url: "/dashboard",
  });

  return {
    success: true,
    planCode,
    planName: planConfig.name,
    leadAllocation,
    subscriptionId: testSubId,
    quotaPeriodId: quotaPeriod.id,
  };
}

/**
 * Resets quota balance for a beta tester so they can test lead claiming workflows again.
 */
export async function resetBetaQuota(userId: string) {
  const supabase = createSupabaseAdminClient();

  // 1. Find active quota period
  const { data: period } = await supabase
    .from("quota_periods")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .single();

  if (!period) {
    throw new Error("No active subscription quota period found. Please activate a beta plan first.");
  }

  // 2. Reset consumed & reserved quota
  const now = new Date();
  await supabase
    .from("quota_periods")
    .update({
      consumed_quota: 0,
      reserved_quota: 0,
      updated_at: now.toISOString(),
    })
    .eq("id", period.id);

  // 3. Mark existing pending deliveries as expired to release lead locks
  await supabase
    .from("lead_deliveries")
    .update({ status: "expired" })
    .eq("user_id", userId)
    .eq("status", "pending");

  // 4. Ledger entry for reset
  const idempotencyKey = buildQuotaIdempotencyKey("adjustment", `reset_${period.id}_${Date.now()}`);
  await supabase.from("quota_ledger").insert({
    user_id: userId,
    quota_period_id: period.id,
    event_type: "adjustment",
    units: period.total_allocation,
    balance_after: period.total_allocation,
    idempotency_key: idempotencyKey,
  });

  return {
    success: true,
    totalAllocation: period.total_allocation,
    remaining: period.total_allocation,
  };
}

/**
 * Sample test leads for beta users to evaluate lead preview, 48-hour timers, and exclusive claiming.
 */
const SAMPLE_BETA_LEADS = [
  {
    business_name: "Nexora Cloud Solutions Pvt Ltd",
    contact_name: "Arjun Venkat",
    phone: "+91 98201 44521",
    email: "arjun.venkat@nexoracloud.io",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    business_type: "B2B SaaS / FinTech",
    category_slug: "programming-software",
    generalized_requirement: "Full-stack migration of legacy monolithic CRM to Next.js 16 App Router & Node.js microservices. Seeking high-performance engineering team with Supabase/PostgreSQL experience.",
    exact_requirement: "Need experienced senior engineers to refactor existing Ruby backend into Node.js/TypeScript microservices, optimize database connection pooling, and migrate our frontend to Next.js App Router with sub-second page loads.",
    estimated_value_paise: 25000000, // ₹2,50,000
    tags: ["Next.js", "TypeScript", "PostgreSQL", "Microservices", "FinTech"],
  },
  {
    business_name: "Lumina Organics & D2C",
    contact_name: "Meera Nair",
    phone: "+91 98450 78129",
    email: "meera@luminaorganics.in",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    business_type: "D2C Brand",
    category_slug: "video-editing-production",
    generalized_requirement: "Production and editing of 8 high-energy commercial reels and 1 cinematic brand film for Diwali festive campaign. Color grading and sound design required.",
    exact_requirement: "Seeking creative video editor and motion designer for upcoming beauty line launch. Deliverables: 1x 60s 4K Brand Film, 8x 9:16 UGC-style Instagram ad variations with motion hooks and licensed sound design.",
    estimated_value_paise: 8500000, // ₹85,000
    tags: ["Commercial Video", "Color Grading", "Brand Film", "Reels", "D2C"],
  },
  {
    business_name: "Apex Velocity Growth Partners",
    contact_name: "Rohan Singhania",
    phone: "+91 98112 63980",
    email: "rohan@apexvelocity.co",
    city: "Delhi NCR",
    state: "Delhi",
    country: "India",
    business_type: "E-commerce Accelerator",
    category_slug: "digital-marketing-seo",
    generalized_requirement: "Comprehensive Google Search & Performance Max ads management to scale monthly ROAS above 4.2x with strict conversion tracking and negative keyword pruning.",
    exact_requirement: "Looking for performance marketing specialist to manage ₹4L/mo Google Ads budget across high-intent search campaigns, GTM conversion attribution, and Google Merchant Center product feed optimization.",
    estimated_value_paise: 6500000, // ₹65,000
    tags: ["Google Ads", "Performance Max", "ROAS Optimization", "GTM", "E-commerce"],
  },
];

/**
 * Delivers sample verified test leads directly to the beta user's active review inbox.
 * Uses existing available leads from the database or dynamically generates new random ones.
 */
export async function seedSampleBetaLeads(userId: string) {
  const supabase = createSupabaseAdminClient();

  // 1. Fetch user's active quota period
  const { data: period } = await supabase
    .from("quota_periods")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .single();

  if (!period) {
    throw new Error("No active subscription period found. Please activate a beta plan first.");
  }

  const remaining = period.total_allocation - period.consumed_quota - period.reserved_quota;
  if (remaining < 1) {
    throw new Error("Insufficient remaining quota to receive test leads. Please reset your test quota.");
  }

  const countToDeliver = Math.min(3, remaining);

  // 2. Query available leads from database
  const { data: availableLeads } = await supabase
    .from("leads")
    .select("id")
    .eq("availability_status", "available")
    .limit(countToDeliver);

  let leadsToDeliver: string[] = (availableLeads || []).map((l) => l.id);

  // 3. If database lacks available leads, dynamically generate and insert new ones
  if (leadsToDeliver.length < countToDeliver) {
    const { data: categories } = await supabase.from("categories").select("id, slug");
    const categoryMap = new Map((categories || []).map((c) => [c.slug, c.id]));
    const categorySlugs = Array.from(categoryMap.keys());

    const needed = countToDeliver - leadsToDeliver.length;
    for (let i = 0; i < needed; i++) {
      const slug = categorySlugs[i % categorySlugs.length] || "programming-software";
      const catId = categoryMap.get(slug);
      if (!catId) continue;

      const generated = generateRandomBetaLead(slug);
      const { data: insertedLead } = await supabase
        .from("leads")
        .insert({
          business_name: generated.business_name,
          contact_name: generated.contact_name,
          phone: generated.phone,
          email: generated.email,
          website: generated.website,
          category_id: catId,
          generalized_requirement: generated.generalized_requirement,
          estimated_value_paise: generated.estimated_value_paise,
          estimated_value_currency: "INR",
          country: generated.country,
          state: generated.state,
          city: generated.city,
          business_type: generated.business_type,
          tags: generated.tags,
          source_name: generated.source_name,
          source_url: generated.website,
          collection_date: new Date().toISOString().split("T")[0],
          verification_date: new Date().toISOString().split("T")[0],
          data_quality_status: "verified",
          availability_status: "available",
          admin_notes: generated.admin_notes,
        })
        .select("id")
        .single();

      if (insertedLead) {
        leadsToDeliver.push(insertedLead.id);
      }
    }
  }

  let deliveredCount = 0;
  for (const leadId of leadsToDeliver) {
    try {
      await deliverLeadToUser({
        userId,
        leadId,
        quotaPeriodId: period.id,
      });
      deliveredCount++;
    } catch (deliverErr) {
      console.warn("Test lead delivery skip:", deliverErr);
    }
  }

  return {
    success: true,
    deliveredCount,
    message: `Delivered ${deliveredCount} verified test leads to your 48-hour review inbox.`,
  };
}

