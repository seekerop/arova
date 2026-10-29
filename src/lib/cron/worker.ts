import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { expireLeadOffer, deliverLeadToUser } from "@/lib/leads/service";

export interface ScheduledJobResult {
  runId: string;
  offersExpired: number;
  claimsExpired: number;
  offersDistributed: number;
  errorsCount: number;
  logs: string[];
}

/**
 * Runs scheduled automation jobs idempotently:
 * 1. Expire offers exceeding 48h deadline
 * 2. Expire claims exceeding 30-day window
 * 3. Distribute leads to active subscribers with remaining quota
 */
export async function runScheduledAutomation(
  triggerType: "cron" | "manual" = "cron"
): Promise<ScheduledJobResult> {
  const supabase = createSupabaseAdminClient();
  const logs: string[] = [];
  let offersExpired = 0;
  let claimsExpired = 0;
  let offersDistributed = 0;
  let errorsCount = 0;

  // 1. Start a delivery_run entry
  const { data: run, error: runErr } = await supabase
    .from("delivery_runs")
    .insert({
      trigger_type: triggerType,
      status: "started",
    })
    .select()
    .single();

  const runId = run?.id || `run_${Date.now()}`;
  logs.push(`[${new Date().toISOString()}] Started automation run #${runId}`);

  try {
    const now = new Date();

    // -------------------------------------------------------------
    // Task 1: Expire pending offers where response_deadline < now
    // -------------------------------------------------------------
    const { data: expiredOffers } = await supabase
      .from("lead_deliveries")
      .select("id, user_id, lead_id, response_deadline")
      .eq("status", "pending")
      .lt("response_deadline", now.toISOString());

    if (expiredOffers && expiredOffers.length > 0) {
      logs.push(`Found ${expiredOffers.length} expired offers to process.`);
      for (const offer of expiredOffers) {
        try {
          await expireLeadOffer(offer.id);
          offersExpired++;
          await supabase.from("delivery_logs").insert({
            run_id: runId,
            user_id: offer.user_id,
            lead_id: offer.lead_id,
            action: "offer_expired",
            status: "success",
            message: `Offer #${offer.id} expired past deadline ${offer.response_deadline}`,
          });
        } catch (err: any) {
          errorsCount++;
          logs.push(`Error expiring offer #${offer.id}: ${err.message}`);
        }
      }
    }

    // -------------------------------------------------------------
    // Task 2: Expire claims where expires_at < now
    // -------------------------------------------------------------
    const { data: expiredClaims } = await supabase
      .from("lead_claims")
      .select("id, lead_id, user_id")
      .eq("status", "active")
      .lt("expires_at", now.toISOString());

    if (expiredClaims && expiredClaims.length > 0) {
      logs.push(`Found ${expiredClaims.length} claims past 30-day window.`);
      for (const claim of expiredClaims) {
        try {
          await supabase
            .from("lead_claims")
            .update({ status: "expired", updated_at: now.toISOString() })
            .eq("id", claim.id);

          // Archive lead or move to review (do NOT automatically resell)
          await supabase
            .from("leads")
            .update({ availability_status: "archived" })
            .eq("id", claim.lead_id);

          claimsExpired++;
          await supabase.from("delivery_logs").insert({
            run_id: runId,
            user_id: claim.user_id,
            lead_id: claim.lead_id,
            action: "claim_expired",
            status: "success",
            message: `Claim #${claim.id} expired after 30-day exclusivity. Lead archived.`,
          });
        } catch (err: any) {
          errorsCount++;
          logs.push(`Error expiring claim #${claim.id}: ${err.message}`);
        }
      }
    }

    // -------------------------------------------------------------
    // Task 3: Automated lead distribution
    // Distribute paced leads to active subscribers who have remaining quota
    // -------------------------------------------------------------
    const { data: activePeriods } = await supabase
      .from("quota_periods")
      .select("*, user_preferences(*)")
      .eq("is_active", true)
      .gt("period_end", now.toISOString());

    if (activePeriods && activePeriods.length > 0) {
      logs.push(`Evaluating ${activePeriods.length} active subscriber quota periods.`);

      for (const period of activePeriods) {
        const remaining = period.total_allocation - period.consumed_quota - period.reserved_quota;
        if (remaining <= 0) continue;

        // Check user preferences
        const pref = Array.isArray(period.user_preferences)
          ? period.user_preferences[0]
          : period.user_preferences;

        let query = supabase
          .from("leads")
          .select("id, category_id, city, availability_status")
          .eq("availability_status", "available");

        if (pref?.category_id) {
          query = query.eq("category_id", pref.category_id);
        }

        // Exclude leads already offered or claimed by this user
        const { data: existingDeliveries } = await supabase
          .from("lead_deliveries")
          .select("lead_id")
          .eq("user_id", period.user_id);

        const excludeLeadIds = (existingDeliveries || []).map((d) => d.lead_id);

        if (excludeLeadIds.length > 0) {
          query = query.not("id", "in", `(${excludeLeadIds.join(",")})`);
        }

        // Limit to 1 lead per scheduled tick for smooth paced distribution
        const { data: matchingLeads } = await query.limit(1);

        if (matchingLeads && matchingLeads.length > 0) {
          const leadToDeliver = matchingLeads[0];
          try {
            await deliverLeadToUser({
              userId: period.user_id,
              leadId: leadToDeliver.id,
              quotaPeriodId: period.id,
            });
            offersDistributed++;
            logs.push(`Distributed lead #${leadToDeliver.id} to user #${period.user_id}`);
          } catch (err: any) {
            errorsCount++;
            logs.push(`Error delivering lead #${leadToDeliver.id}: ${err.message}`);
          }
        } else {
          logs.push(`Inventory shortage notice: No available leads for user #${period.user_id} category preference.`);
        }
      }
    }

    // 4. Update delivery_run entry
    await supabase
      .from("delivery_runs")
      .update({
        status: "completed",
        offers_expired: offersExpired,
        claims_expired: claimsExpired,
        offers_created: offersDistributed,
        errors_count: errorsCount,
        log_summary: { logs },
        completed_at: new Date().toISOString(),
      })
      .eq("id", runId);

  } catch (globalErr: any) {
    errorsCount++;
    logs.push(`Fatal error during scheduled automation: ${globalErr.message}`);
    await supabase
      .from("delivery_runs")
      .update({
        status: "failed",
        errors_count: errorsCount,
        log_summary: { logs, error: globalErr.message },
        completed_at: new Date().toISOString(),
      })
      .eq("id", runId);
  }

  return {
    runId,
    offersExpired,
    claimsExpired,
    offersDistributed,
    errorsCount,
    logs,
  };
}

