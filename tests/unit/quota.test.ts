import { describe, it, expect } from "vitest";
import {
  calculateQuota,
  transitionOfferLead,
  transitionAcceptLead,
  transitionReleaseReservation,
  transitionUnlockPreparedBatch,
  QuotaState,
} from "@/lib/quota/engine";

describe("Quota Accounting Engine Invariant & State Transitions", () => {
  it("strictly enforces invariant: remaining = total - consumed - reserved", () => {
    const starterState: QuotaState = {
      totalAllocation: 40,
      consumedQuota: 0,
      reservedQuota: 0,
    };
    const calc = calculateQuota(starterState);
    expect(calc.remainingQuota).toBe(40);
    expect(calc.canReserve).toBe(true);

    // If 5 leads have already been charged against Starter, remaining is 35
    const fiveConsumed: QuotaState = {
      totalAllocation: 40,
      consumedQuota: 5,
      reservedQuota: 0,
    };
    expect(calculateQuota(fiveConsumed).remainingQuota).toBe(35);

    // If 5 leads charged against Growth (100 total), remaining is 95
    const growthState: QuotaState = {
      totalAllocation: 100,
      consumedQuota: 5,
      reservedQuota: 0,
    };
    expect(calculateQuota(growthState).remainingQuota).toBe(95);
  });

  it("handles lead offer reservation correctly", () => {
    const initial: QuotaState = {
      totalAllocation: 40,
      consumedQuota: 5,
      reservedQuota: 0,
    };
    const afterOffer = transitionOfferLead(initial);
    expect(afterOffer.reservedQuota).toBe(1);
    expect(afterOffer.consumedQuota).toBe(5);

    // Remaining quota should now be 40 - 5 - 1 = 34
    expect(calculateQuota(afterOffer).remainingQuota).toBe(34);
  });

  it("converts reserved quota into consumed quota on acceptance", () => {
    const state: QuotaState = {
      totalAllocation: 40,
      consumedQuota: 5,
      reservedQuota: 1,
    };
    const accepted = transitionAcceptLead(state);
    expect(accepted.reservedQuota).toBe(0);
    expect(accepted.consumedQuota).toBe(6);
    expect(calculateQuota(accepted).remainingQuota).toBe(34);
  });

  it("releases reserved quota back to remaining balance on rejection or expiration", () => {
    const state: QuotaState = {
      totalAllocation: 40,
      consumedQuota: 5,
      reservedQuota: 1,
    };
    const released = transitionReleaseReservation(state);
    expect(released.reservedQuota).toBe(0);
    expect(released.consumedQuota).toBe(5);
    // Remaining returns to 35
    expect(calculateQuota(released).remainingQuota).toBe(35);
  });

  it("unlocks prepared batch charging each eligible lead exactly once without double counting", () => {
    const state: QuotaState = {
      totalAllocation: 40,
      consumedQuota: 5, // remaining is 35
      reservedQuota: 0,
    };

    // Unlock prepared batch of 5 leads
    const unlocked = transitionUnlockPreparedBatch(state, 5);
    expect(unlocked.consumedQuota).toBe(10);
    expect(unlocked.reservedQuota).toBe(0);
    expect(calculateQuota(unlocked).remainingQuota).toBe(30);

    // Attempting to unlock more than remaining quota throws
    expect(() => transitionUnlockPreparedBatch(unlocked, 35)).toThrowError(
      /Insufficient quota/
    );
  });
});
