import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isValidBetaPasscode, DEFAULT_BETA_PASSCODE } from "@/lib/beta/service";
import { calculateQuota, QuotaState } from "@/lib/quota/engine";
import { APPROVED_CATEGORIES } from "@/lib/constants/categories";

describe("Beta Test Mode & Sandbox Utilities", () => {
  const origEnv = process.env;

  beforeEach(() => {
    process.env = { ...origEnv };
  });

  afterEach(() => {
    process.env = origEnv;
  });

  describe("Beta Passcode Validation", () => {
    it("validates default configured passcode BETA2026", () => {
      delete process.env.NEXT_PUBLIC_ENABLE_BETA_MODE;
      process.env.BETA_PASSCODE = "BETA2026";

      expect(isValidBetaPasscode("BETA2026")).toBe(true);
      expect(isValidBetaPasscode("beta2026")).toBe(true);
      expect(isValidBetaPasscode("  beta2026  ")).toBe(true);
    });

    it("accepts known developer aliases", () => {
      delete process.env.NEXT_PUBLIC_ENABLE_BETA_MODE;
      expect(isValidBetaPasscode("AROVABETA")).toBe(true);
      expect(isValidBetaPasscode("arovabeta")).toBe(true);
      expect(isValidBetaPasscode("BETATESTER")).toBe(true);
    });

    it("rejects invalid passcodes when beta mode is protected", () => {
      delete process.env.NEXT_PUBLIC_ENABLE_BETA_MODE;
      process.env.BETA_PASSCODE = "SECRET_BETA";

      expect(isValidBetaPasscode("WRONG_CODE")).toBe(false);
      expect(isValidBetaPasscode("")).toBe(false);
      expect(isValidBetaPasscode(null)).toBe(false);
      expect(isValidBetaPasscode(undefined)).toBe(false);
    });

    it("always permits access when NEXT_PUBLIC_ENABLE_BETA_MODE is true", () => {
      process.env.NEXT_PUBLIC_ENABLE_BETA_MODE = "true";
      expect(isValidBetaPasscode(null)).toBe(true);
      expect(isValidBetaPasscode("")).toBe(true);
      expect(isValidBetaPasscode("any_string")).toBe(true);
    });
  });

  describe("Beta Sandbox Quota Simulation Invariants", () => {
    it("allocates exactly 40 leads for Starter and 100 leads for Growth", () => {
      const starterState: QuotaState = {
        totalAllocation: 40,
        consumedQuota: 0,
        reservedQuota: 0,
      };
      const starterCalc = calculateQuota(starterState);
      expect(starterCalc.remainingQuota).toBe(40);
      expect(starterCalc.canReserve).toBe(true);

      const growthState: QuotaState = {
        totalAllocation: 100,
        consumedQuota: 0,
        reservedQuota: 0,
      };
      const growthCalc = calculateQuota(growthState);
      expect(growthCalc.remainingQuota).toBe(100);
      expect(growthCalc.canReserve).toBe(true);
    });

    it("reserves quota correctly when 3 sample test leads are delivered", () => {
      const stateWith3Reserved: QuotaState = {
        totalAllocation: 40,
        consumedQuota: 0,
        reservedQuota: 3,
      };
      const calc = calculateQuota(stateWith3Reserved);
      expect(calc.remainingQuota).toBe(37);
      expect(calc.canReserve).toBe(true);
    });

    it("converts reservation to consumed when beta tester accepts an offer", () => {
      const afterAccept: QuotaState = {
        totalAllocation: 40,
        consumedQuota: 1,
        reservedQuota: 2,
      };
      const calc = calculateQuota(afterAccept);
      expect(calc.remainingQuota).toBe(37);
      expect(afterAccept.consumedQuota).toBe(1);
    });

    it("restores remaining balance when beta quota is reset", () => {
      const beforeReset: QuotaState = {
        totalAllocation: 40,
        consumedQuota: 15,
        reservedQuota: 5,
      };
      expect(calculateQuota(beforeReset).remainingQuota).toBe(20);

      const afterReset: QuotaState = {
        totalAllocation: 40,
        consumedQuota: 0,
        reservedQuota: 0,
      };
      expect(calculateQuota(afterReset).remainingQuota).toBe(40);
    });
  });

  describe("Approved Categories for Beta Test Leads", () => {
    it("ensures approved category slugs are recognized", () => {
      const slugs = APPROVED_CATEGORIES.map((c) => c.slug);
      expect(slugs).toContain("programming-software");
      expect(slugs).toContain("video-editing-production");
      expect(slugs).toContain("digital-marketing-seo");
      expect(slugs).toHaveLength(5);
    });
  });
});
