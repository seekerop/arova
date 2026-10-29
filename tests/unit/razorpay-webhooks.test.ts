import { describe, it, expect } from "vitest";
import crypto from "crypto";
import {
  verifyRazorpayWebhookSignature,
  verifyRazorpaySubscriptionPaymentSignature,
} from "@/lib/razorpay/client";

describe("Razorpay Signature Verification & Security", () => {
  const secret = "test_webhook_secret_key_12345";
  const rawBody = JSON.stringify({
    entity: "event",
    event: "subscription.charged",
    created_at: 1729000000,
  });

  it("authoritatively verifies valid HMAC SHA256 webhook signatures", () => {
    const validSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    const result = verifyRazorpayWebhookSignature(rawBody, validSignature, secret);
    expect(result).toBe(true);
  });

  it("strictly rejects fraudulent or modified webhook signatures", () => {
    const badSignature = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    const result = verifyRazorpayWebhookSignature(rawBody, badSignature, secret);
    expect(result).toBe(false);

    // Modified body
    const validSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");
    const tamperedBody = rawBody + " ";
    expect(verifyRazorpayWebhookSignature(tamperedBody, validSignature, secret)).toBe(false);
  });

  it("verifies client subscription payment callback signatures", () => {
    const paymentId = "pay_123456789";
    const subscriptionId = "sub_987654321";
    const keySecret = "rzp_secret_abc123";

    const payload = `${paymentId}|${subscriptionId}`;
    const validSig = crypto
      .createHmac("sha256", keySecret)
      .update(payload)
      .digest("hex");

    expect(
      verifyRazorpaySubscriptionPaymentSignature(
        paymentId,
        subscriptionId,
        validSig,
        keySecret
      )
    ).toBe(true);

    expect(
      verifyRazorpaySubscriptionPaymentSignature(
        paymentId,
        subscriptionId,
        "tampered_sig",
        keySecret
      )
    ).toBe(false);
  });
});

