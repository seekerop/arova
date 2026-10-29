import { describe, it, expect } from "vitest";
import { formatTimeRemaining, formatDate } from "@/lib/utils";
import { OFFER_EXPIRY_HOURS, CLAIM_EXPIRY_DAYS } from "@/lib/leads/service";
import { buildQuotaIdempotencyKey } from "@/lib/quota/engine";

describe("Lead Delivery & Exclusivity Workflow Rules", () => {
  it("enforces 48-hour offer deadline and 30-day claim window constants", () => {
    expect(OFFER_EXPIRY_HOURS).toBe(48);
    expect(CLAIM_EXPIRY_DAYS).toBe(30);
  });

  it("calculates countdown and expiration accurately", () => {
    const futureDate20h = new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString();
    const result20h = formatTimeRemaining(futureDate20h);
    expect(result20h.isExpired).toBe(false);
    expect(result20h.hours).toBeGreaterThanOrEqual(19);

    const pastDate = new Date(Date.now() - 1000).toISOString();
    const resultPast = formatTimeRemaining(pastDate);
    expect(resultPast.isExpired).toBe(true);
    expect(resultPast.text).toBe("Expired");
  });

  it("generates deterministic and unique idempotency keys", () => {
    const key1 = buildQuotaIdempotencyKey("reserve", "del_123");
    const key2 = buildQuotaIdempotencyKey("reserve", "del_123");
    expect(key1).toBe(key2);
    expect(key1).toBe("arova_quota_reserve_del_123");

    const keyWithDate = buildQuotaIdempotencyKey("charge", "sub_456", 1729000000000);
    expect(keyWithDate).toContain("arova_quota_charge_sub_456");
  });
});
