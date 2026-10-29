import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "arova_admin_session";

export interface AdminSessionPayload {
  email: string;
  role: "admin";
  iat: number;
  exp: number;
}

export function getExpectedAdminEmail(): string {
  const mail = process.env.ADMIN_MAIL || process.env.ADMIN_EMAIL || "avi@arenova.in";
  return mail.trim().toLowerCase();
}

export function getExpectedAdminPassword(): string {
  return process.env.ADMIN_PASS || process.env.ADMIN_PASSWORD || "seekerop1@";
}

export function getSessionSecret(): string {
  return (
    process.env.APP_ENCRYPTION_KEY ||
    process.env.CRON_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "arova_executive_master_secret_key_2026_arenova"
  );
}

export function timingSafeEqualStr(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Validates admin credentials against configured .env.local variables using constant-time comparison.
 * Strictly limits admin access to the single authorized owner account.
 */
export function verifyAdminCredentials(email?: string, password?: string): boolean {
  if (!email || !password) return false;

  const expectedEmail = getExpectedAdminEmail();
  const expectedPassword = getExpectedAdminPassword();

  const providedEmail = email.trim().toLowerCase();
  const providedPassword = password;

  const emailMatch = timingSafeEqualStr(providedEmail, expectedEmail);
  const passwordMatch = timingSafeEqualStr(providedPassword, expectedPassword);

  return emailMatch && passwordMatch;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str).toString("base64url");
}

function base64UrlDecode(str: string): string {
  return Buffer.from(str, "base64url").toString("utf8");
}

/**
 * Creates a signed JWT-style administrative session token.
 */
export function createAdminSessionToken(email: string): string {
  const secret = getSessionSecret();
  const now = Date.now();
  const payload: AdminSessionPayload = {
    email: email.trim().toLowerCase(),
    role: "admin",
    iat: now,
    exp: now + 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies a signed administrative session token.
 */
export function verifyAdminSessionToken(token?: string | null): AdminSessionPayload | null {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;
  const secret = getSessionSecret();

  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payloadB64)
      .digest("base64url");

    if (!timingSafeEqualStr(expectedSignature, signature)) {
      return null;
    }

    const jsonStr = base64UrlDecode(payloadB64);
    const payload: AdminSessionPayload = JSON.parse(jsonStr);

    if (!payload || payload.role !== "admin" || !payload.exp) {
      return null;
    }

    if (Date.now() > payload.exp) {
      return null; // Expired
    }

    const expectedEmail = getExpectedAdminEmail();
    if (payload.email.toLowerCase() !== expectedEmail) {
      return null; // Mismatched single-owner email
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Server-side helper to check if the current request has an active valid admin session.
 */
export async function getAdminSessionFromCookies(): Promise<AdminSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    return verifyAdminSessionToken(token);
  } catch {
    return null;
  }
}
