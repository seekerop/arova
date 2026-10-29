import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  verifyAdminCredentials,
  createAdminSessionToken,
  verifyAdminSessionToken,
  getExpectedAdminEmail,
  getExpectedAdminPassword,
} from "@/lib/security/admin-auth";

describe("Administrative Single-Owner Authentication", () => {
  const originalMail = process.env.ADMIN_MAIL;
  const originalPass = process.env.ADMIN_PASS;

  beforeEach(() => {
    process.env.ADMIN_MAIL = "avi@arenova.in";
    process.env.ADMIN_PASS = "seekerop1@";
  });

  afterEach(() => {
    process.env.ADMIN_MAIL = originalMail;
    process.env.ADMIN_PASS = originalPass;
  });

  it("reads single-owner credentials from environment variables", () => {
    expect(getExpectedAdminEmail()).toBe("avi@arenova.in");
    expect(getExpectedAdminPassword()).toBe("seekerop1@");
  });

  it("authenticates valid admin credentials using constant-time comparison", () => {
    expect(verifyAdminCredentials("avi@arenova.in", "seekerop1@")).toBe(true);
    expect(verifyAdminCredentials("AVI@ARENOVA.IN", "seekerop1@")).toBe(true); // case-insensitive email
  });

  it("rejects unauthorized emails or incorrect passwords", () => {
    expect(verifyAdminCredentials("hacker@malicious.com", "seekerop1@")).toBe(false);
    expect(verifyAdminCredentials("avi@arenova.in", "wrongpassword")).toBe(false);
    expect(verifyAdminCredentials("", "")).toBe(false);
    expect(verifyAdminCredentials(undefined, undefined)).toBe(false);
  });

  it("creates and cryptographically verifies an HMAC-signed session token", () => {
    const token = createAdminSessionToken("avi@arenova.in");
    expect(token).toBeDefined();
    expect(token).toContain(".");

    const session = verifyAdminSessionToken(token);
    expect(session).not.toBeNull();
    expect(session?.email).toBe("avi@arenova.in");
    expect(session?.role).toBe("admin");
  });

  it("rejects forged or tampered session tokens", () => {
    const validToken = createAdminSessionToken("avi@arenova.in");
    const tampered = validToken.slice(0, -4) + "AAAA";

    expect(verifyAdminSessionToken(tampered)).toBeNull();
    expect(verifyAdminSessionToken("invalid.token")).toBeNull();
    expect(verifyAdminSessionToken("")).toBeNull();
  });
});
