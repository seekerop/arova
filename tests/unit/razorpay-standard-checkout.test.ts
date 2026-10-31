import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { verifyRazorpayOrderSignature } from "@/lib/razorpay/client";

describe("Razorpay Standard Web Checkout Suite", () => {
  const testKeySecret = "CdQwyfUbfqrxa5Pc7DE0nhGh";
  const testOrderId = "order_O8zY1234567890";
  const testPaymentId = "pay_P8zY9876543210";

  it("calculates and authoritatively validates HMAC-SHA256 order signatures", () => {
    // Official algorithm: HMAC-SHA256(order_id + "|" + payment_id, secret)
    const payload = `${testOrderId}|${testPaymentId}`;
    const validSignature = crypto
      .createHmac("sha256", testKeySecret)
      .update(payload)
      .digest("hex");

    const isMatch = verifyRazorpayOrderSignature(
      testOrderId,
      testPaymentId,
      validSignature,
      testKeySecret
    );

    expect(isMatch).toBe(true);
  });

  it("strictly rejects tampered or fraudulent payment signatures", () => {
    const invalidSignature =
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

    const isMatch = verifyRazorpayOrderSignature(
      testOrderId,
      testPaymentId,
      invalidSignature,
      testKeySecret
    );

    expect(isMatch).toBe(false);
  });

  it("strictly rejects signatures if order_id or payment_id is manipulated", () => {
    const payload = `${testOrderId}|${testPaymentId}`;
    const validSignature = crypto
      .createHmac("sha256", testKeySecret)
      .update(payload)
      .digest("hex");

    // Altered order_id
    expect(
      verifyRazorpayOrderSignature(
        "order_ALTERED",
        testPaymentId,
        validSignature,
        testKeySecret
      )
    ).toBe(false);

    // Altered payment_id
    expect(
      verifyRazorpayOrderSignature(
        testOrderId,
        "pay_ALTERED",
        validSignature,
        testKeySecret
      )
    ).toBe(false);
  });

  it("rejects empty or missing parameters gracefully without throwing exceptions", () => {
    expect(verifyRazorpayOrderSignature("", testPaymentId, "sig", testKeySecret)).toBe(false);
    expect(verifyRazorpayOrderSignature(testOrderId, "", "sig", testKeySecret)).toBe(false);
    expect(verifyRazorpayOrderSignature(testOrderId, testPaymentId, "", testKeySecret)).toBe(false);
    expect(verifyRazorpayOrderSignature(testOrderId, testPaymentId, "sig", "")).toBe(false);
  });
});
