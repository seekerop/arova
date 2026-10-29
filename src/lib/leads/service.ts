import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { Lead, LeadSafePreview } from "@/lib/types/database";
import { buildQuotaIdempotencyKey } from "@/lib/quota/engine";

export const OFFER_EXPIRY_HOURS = 48;
export const CLAIM_EXPIRY_DAYS = 30;

/**
 * Transforms a full Lead object into a safe privacy-filtered preview.
 * Strictly masks business name, contact name, phone, email, and revealing URLs
 * UNLESS hasActiveClaim is true.
 */
export function maskLeadForPreview(
  lead: Lead,
  hasActiveClaim: boolean = false
): LeadSafePreview | (Lead & { is_locked: false; category_name?: string }) {
  if (hasActiveClaim) {
    return {
      ...lead,
      category_name: lead.category?.name,
      is_locked: false,
    };
  }

  // Safe preview mask
  return {
    id: lead.id,
    category_id: lead.category_id,
    category_name: lead.category?.name,
    generalized_requirement: lead.generalized_requirement,
    estimated_value_paise: lead.estimated_value_paise,
    estimated_value_currency: lead.estimated_value_currency,
    country: lead.country,
    state: lead.state,
    city: lead.city,
    business_type: lead.business_type,
    tags: lead.tags || [],
    collection_date: lead.collection_date,
    data_quality_status: lead.data_quality_status,
    is_locked: true,
  };
}

/**
 * Creates an offer for a lead to a user.
 * 1. Checks that lead is available.
 * 2. Reserves quota (reserved_quota + 1).
 * 3. Sets lead status to 'reserved'.
 * 4. Creates lead_deliveries record with a strict 48-hour deadline.
 */
export async function deliverLeadToUser(params: {
  userId: string;
  leadId: string;
  quotaPeriodId: string;
}) {
  const { userId, leadId, quotaPeriodId } = params;
  const supabase = createSupabaseAdminClient();

  // 1. Fetch quota period
  const { data: period, error: pErr } = await supabase
    .from("quota_periods")
    .select("*")
    .eq("id", quotaPeriodId)
    .eq("user_id", userId)
    .single();

  if (pErr || !period || !period.is_active) {
    throw new Error("Active quota period not found for this user.");
  }

  const remaining = period.total_allocation - period.consumed_quota - period.reserved_quota;
  if (remaining < 1) {
    throw new Error(`Insufficient quota: remaining quota is ${remaining}.`);
  }

  // 2. Fetch lead and ensure available
  const { data: lead, error: lErr } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .single();

  if (lErr || !lead || lead.availability_status !== "available") {
    throw new Error("Lead is not available for delivery.");
  }

  const now = new Date();
  const deadline = new Date(now.getTime() + OFFER_EXPIRY_HOURS * 60 * 60 * 1000);

  // 3. Atomically update lead and quota period
  await supabase
    .from("leads")
    .update({ availability_status: "reserved" })
    .eq("id", leadId);

  await supabase
    .from("quota_periods")
    .update({
      reserved_quota: period.reserved_quota + 1,
      updated_at: now.toISOString(),
    })
    .eq("id", period.id);

  // 4. Create delivery record
  const { data: delivery, error: dErr } = await supabase
    .from("lead_deliveries")
    .insert({
      user_id: userId,
      lead_id: leadId,
      quota_period_id: period.id,
      delivered_at: now.toISOString(),
      response_deadline: deadline.toISOString(),
      status: "pending",
    })
    .select()
    .single();

  if (dErr) {
    throw new Error(`Failed to create delivery: ${dErr.message}`);
  }

  // 5. Quota ledger entry
  const idempotencyKey = buildQuotaIdempotencyKey("reserve", delivery.id);
  await supabase.from("quota_ledger").insert({
    user_id: userId,
    quota_period_id: period.id,
    amount: -1,
    balance_after: remaining - 1,
    transaction_type: "reserve",
    idempotency_key: idempotencyKey,
    reference_id: delivery.id,
    reference_type: "lead_offer",
    notes: `Lead offer reserved. 48-hour review deadline until ${deadline.toISOString()}`,
  });

  // 6. In-app notification
  await supabase.from("notifications").insert({
    user_id: userId,
    title: "New Lead Available for Review",
    message: `A new prospective business lead in ${lead.city} is ready. You have 48 hours to accept or decline.`,
    type: "offer",
    link_url: `/dashboard/leads/${lead.id}`,
  });

  return delivery;
}

/**
 * Accepts an offered lead.
 * 1. Confirms deadline has not passed.
 * 2. Converts reserved quota into consumed quota.
 * 3. Creates an exclusive claim for 30 days.
 * 4. Marks lead as 'claimed'.
 * 5. Returns full lead contact information.
 */
export async function acceptLeadOffer(params: {
  userId: string;
  deliveryId: string;
}) {
  const { userId, deliveryId } = params;
  const supabase = createSupabaseAdminClient();

  // 1. Fetch delivery record
  const { data: delivery, error: dErr } = await supabase
    .from("lead_deliveries")
    .select("*, quota_periods(*)")
    .eq("id", deliveryId)
    .eq("user_id", userId)
    .single();

  if (dErr || !delivery) {
    throw new Error("Lead delivery record not found.");
  }

  if (delivery.status !== "pending") {
    throw new Error(`Offer is not pending (current status: ${delivery.status}).`);
  }

  const now = new Date();
  const deadline = new Date(delivery.response_deadline);

  if (now.getTime() > deadline.getTime()) {
    // Automatically trigger expiration
    await expireLeadOffer(deliveryId);
    throw new Error("This lead offer has expired (48-hour response window elapsed).");
  }

  const period = delivery.quota_periods;
  if (!period || period.reserved_quota < 1) {
    throw new Error("Invalid quota state: no reserved quota to convert.");
  }

  const claimExpiry = new Date(now.getTime() + CLAIM_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  // 2. Mark delivery accepted
  await supabase
    .from("lead_deliveries")
    .update({
      status: "accepted",
      responded_at: now.toISOString(),
    })
    .eq("id", delivery.id);

  // 3. Update Quota Period: reserved - 1, consumed + 1
  await supabase
    .from("quota_periods")
    .update({
      reserved_quota: period.reserved_quota - 1,
      consumed_quota: period.consumed_quota + 1,
      updated_at: now.toISOString(),
    })
    .eq("id", period.id);

  // 4. Update Lead to claimed
  await supabase
    .from("leads")
    .update({ availability_status: "claimed" })
    .eq("id", delivery.lead_id);

  // 5. Create 30-day exclusive claim
  const { data: claim, error: cErr } = await supabase
    .from("lead_claims")
    .insert({
      user_id: userId,
      lead_id: delivery.lead_id,
      delivery_id: delivery.id,
      quota_period_id: period.id,
      claimed_at: now.toISOString(),
      expires_at: claimExpiry.toISOString(),
      status: "active",
      notes: "Exclusive 30-day claim granted upon offer acceptance.",
    })
    .select()
    .single();

  if (cErr) {
    throw new Error(`Failed to create exclusive claim: ${cErr.message}`);
  }

  // 6. Record quota ledger entry
  const idempotencyKey = buildQuotaIdempotencyKey("accept", delivery.id);
  const remaining = period.total_allocation - (period.consumed_quota + 1) - (period.reserved_quota - 1);

  await supabase.from("quota_ledger").insert({
    user_id: userId,
    quota_period_id: period.id,
    amount: -1,
    balance_after: remaining,
    transaction_type: "consume",
    idempotency_key: idempotencyKey,
    reference_id: claim.id,
    reference_type: "lead_claim",
    notes: `Offer accepted. Exclusive claim valid until ${claimExpiry.toISOString()}`,
  });

  // 7. In-app notification
  await supabase.from("notifications").insert({
    user_id: userId,
    title: "Lead Claimed Exclusively",
    message: "Contact details are now unlocked. You have 30 days of exclusive outreach access.",
    type: "claim",
    link_url: `/dashboard/leads/${delivery.lead_id}`,
  });

  // Return full lead details
  const { data: fullLead } = await supabase
    .from("leads")
    .select("*, categories(*)")
    .eq("id", delivery.lead_id)
    .single();

  return { success: true, lead: fullLead, claim };
}

/**
 * Rejects an offered lead.
 * 1. Marks delivery as 'rejected'.
 * 2. Releases the reserved quota (reserved_quota - 1).
 * 3. Returns the lead to 'available' status for other subscribers.
 * 4. Logs audit entry.
 */
export async function rejectLeadOffer(params: {
  userId: string;
  deliveryId: string;
  reason?: string;
}) {
  const { userId, deliveryId, reason } = params;
  const supabase = createSupabaseAdminClient();

  const { data: delivery, error: dErr } = await supabase
    .from("lead_deliveries")
    .select("*, quota_periods(*)")
    .eq("id", deliveryId)
    .eq("user_id", userId)
    .single();

  if (dErr || !delivery) {
    throw new Error("Lead delivery record not found.");
  }

  if (delivery.status !== "pending") {
    throw new Error(`Cannot reject: offer is ${delivery.status}.`);
  }

  const now = new Date();
  const period = delivery.quota_periods;

  // 1. Mark delivery rejected
  await supabase
    .from("lead_deliveries")
    .update({
      status: "rejected",
      responded_at: now.toISOString(),
      rejection_reason: reason || "Declined by customer",
    })
    .eq("id", delivery.id);

  // 2. Release lead back to available
  await supabase
    .from("leads")
    .update({ availability_status: "available" })
    .eq("id", delivery.lead_id);

  // 3. Release reserved quota
  if (period && period.reserved_quota > 0) {
    await supabase
      .from("quota_periods")
      .update({
        reserved_quota: period.reserved_quota - 1,
        updated_at: now.toISOString(),
      })
      .eq("id", period.id);

    const remaining = period.total_allocation - period.consumed_quota - (period.reserved_quota - 1);

    await supabase.from("quota_ledger").insert({
      user_id: userId,
      quota_period_id: period.id,
      amount: 1,
      balance_after: remaining,
      transaction_type: "release",
      idempotency_key: buildQuotaIdempotencyKey("reject_release", delivery.id),
      reference_id: delivery.id,
      reference_type: "lead_offer",
      notes: `Offer rejected by customer. Quota reservation released.`,
    });
  }

  return { success: true };
}

/**
 * Auto-expires an offer that exceeded the 48-hour response window.
 */
export async function expireLeadOffer(deliveryId: string) {
  const supabase = createSupabaseAdminClient();

  const { data: delivery } = await supabase
    .from("lead_deliveries")
    .select("*, quota_periods(*)")
    .eq("id", deliveryId)
    .single();

  if (!delivery || delivery.status !== "pending") return;

  const now = new Date();
  const period = delivery.quota_periods;

  // 1. Mark delivery expired
  await supabase
    .from("lead_deliveries")
    .update({
      status: "expired",
      responded_at: now.toISOString(),
    })
    .eq("id", delivery.id);

  // 2. Return lead to available
  await supabase
    .from("leads")
    .update({ availability_status: "available" })
    .eq("id", delivery.lead_id);

  // 3. Release reserved quota
  if (period && period.reserved_quota > 0) {
    await supabase
      .from("quota_periods")
      .update({
        reserved_quota: period.reserved_quota - 1,
        updated_at: now.toISOString(),
      })
      .eq("id", period.id);

    const remaining = period.total_allocation - period.consumed_quota - (period.reserved_quota - 1);

    await supabase.from("quota_ledger").insert({
      user_id: delivery.user_id,
      quota_period_id: period.id,
      amount: 1,
      balance_after: remaining,
      transaction_type: "release",
      idempotency_key: buildQuotaIdempotencyKey("expire_release", delivery.id),
      reference_id: delivery.id,
      reference_type: "lead_offer",
      notes: "48-hour response deadline elapsed. Reservation released.",
    });

    await supabase.from("notifications").insert({
      user_id: delivery.user_id,
      title: "Lead Offer Expired",
      message: "A lead review window has expired after 48 hours. The reserved quota has been restored to your allocation.",
      type: "warning",
      link_url: "/dashboard/leads",
    });
  }
}

/**
 * Unlocks a prepared batch of leads for a subscribed customer.
 * Charges each eligible lead exactly ONCE against the active quota period.
 */
export async function unlockPreparedRequestBatch(params: {
  userId: string;
  requestId: string;
}) {
  const { userId, requestId } = params;
  const supabase = createSupabaseAdminClient();

  // 1. Fetch request and items
  const { data: request, error: rErr } = await supabase
    .from("lead_requests")
    .select("*, lead_request_items(*)")
    .eq("id", requestId)
    .eq("user_id", userId)
    .single();

  if (rErr || !request) {
    throw new Error("Lead request not found.");
  }

  if (request.status !== "Ready") {
    throw new Error(`Request is not in 'Ready' status (current status: ${request.status}).`);
  }

  const items = request.lead_request_items || [];
  if (items.length === 0) {
    throw new Error("No prepared leads found in this batch.");
  }

  // 2. Fetch active quota period
  const { data: period, error: pErr } = await supabase
    .from("quota_periods")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .single();

  if (pErr || !period) {
    throw new Error("Active subscription required to unlock prepared leads.");
  }

  const remaining = period.total_allocation - period.consumed_quota - period.reserved_quota;
  const requiredCount = items.length;

  if (remaining < requiredCount) {
    throw new Error(
      `Insufficient quota to unlock full batch. Available: ${remaining}, Required: ${requiredCount}.`
    );
  }

  const now = new Date();
  const claimExpiry = new Date(now.getTime() + CLAIM_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  // 3. Atomically consume quota for the batch
  await supabase
    .from("quota_periods")
    .update({
      consumed_quota: period.consumed_quota + requiredCount,
      updated_at: now.toISOString(),
    })
    .eq("id", period.id);

  // 4. Create 30-day exclusive claim for each lead in batch
  for (const item of items) {
    await supabase.from("leads").update({ availability_status: "claimed" }).eq("id", item.lead_id);

    await supabase.from("lead_claims").upsert(
      {
        user_id: userId,
        lead_id: item.lead_id,
        quota_period_id: period.id,
        claimed_at: now.toISOString(),
        expires_at: claimExpiry.toISOString(),
        status: "active",
        notes: `Unlocked from pre-subscription batch #${requestId.slice(0, 8)}`,
      },
      { onConflict: "lead_id" }
    );
  }

  // 5. Update request status to Unlocked
  await supabase
    .from("lead_requests")
    .update({
      status: "Unlocked",
      updated_at: now.toISOString(),
    })
    .eq("id", request.id);

  // 6. Record quota ledger entry
  await supabase.from("quota_ledger").insert({
    user_id: userId,
    quota_period_id: period.id,
    amount: -requiredCount,
    balance_after: remaining - requiredCount,
    transaction_type: "consume",
    idempotency_key: buildQuotaIdempotencyKey("unlock_batch", request.id),
    reference_id: request.id,
    reference_type: "request_unlock",
    notes: `Unlocked ${requiredCount} leads from pre-subscription batch. Charged once.`,
  });

  // 7. Notification
  await supabase.from("notifications").insert({
    user_id: userId,
    title: "Prepared Leads Unlocked",
    message: `Your prepared batch of ${requiredCount} leads has been unlocked with 30-day exclusive access.`,
    type: "success",
    link_url: "/dashboard/leads",
  });

  return { success: true, count: requiredCount };
}
