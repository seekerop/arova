"use client";

import { useState } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, CreditCard, Lock } from "lucide-react";

interface RazorpayCheckoutButtonProps {
  amount: number; // in paise (e.g. 49900 = ₹499)
  currency?: string;
  name?: string;
  description?: string;
  receipt?: string;
  notes?: Record<string, string>;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  buttonText?: string;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onSuccess?: (data: { orderId: string; paymentId: string }) => void;
  onError?: (errorMessage: string) => void;
}

export function RazorpayCheckoutButton({
  amount,
  currency = "INR",
  name = "AROVA by Arenova",
  description = "Qualified Lead Intelligence",
  receipt,
  notes = {},
  customerName,
  customerEmail,
  customerPhone,
  buttonText,
  className,
  variant = "primary",
  size = "md",
  disabled = false,
  onSuccess,
  onError,
}: RazorpayCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const displayAmountINR = (amount / 100).toLocaleString("en-IN", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  });

  const handlePayment = async () => {
    setLoading(true);
    setStatusMessage(null);

    try {
      // 1. Call Backend Order Creation API
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency,
          receipt,
          notes,
        }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to create payment order.");
      }

      // Check if Razorpay script is loaded in browser window
      if (typeof window === "undefined" || !(window as any).Razorpay) {
        throw new Error(
          "Razorpay Checkout SDK is still loading. Please check your internet connection and try again."
        );
      }

      const keyId =
        orderData.key_id ||
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        "rzp_test_TuR0a3WEl8ZXNW";

      // 2. Configure and Open Razorpay Checkout Modal
      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: name,
        description: description,
        image: "/arenova.png",
        order_id: orderData.order_id,
        prefill: {
          name: customerName || "",
          email: customerEmail || "",
          contact: customerPhone || "",
        },
        notes: {
          platform: "Arova",
          ...notes,
        },
        theme: {
          color: "#E84B2C", // Arenova Flame Orange
          backdrop_color: "#080505",
        },
        // Handlers
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            // 3. Send payment signature to backend verification endpoint
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(
                verifyData.error ||
                  "Payment signature verification failed. Please contact support."
              );
            }

            setStatusMessage({
              type: "success",
              text: `Payment successful! Payment ID: ${response.razorpay_payment_id}`,
            });

            if (onSuccess) {
              onSuccess({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
              });
            }
          } catch (verifyErr: any) {
            const msg = verifyErr.message || "Payment verification error.";
            setStatusMessage({ type: "error", text: msg });
            if (onError) onError(msg);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setStatusMessage({
              type: "info",
              text: "Payment window closed by user.",
            });
          },
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);

      // Listen for payment failure events
      razorpayInstance.on("payment.failed", function (response: any) {
        const failureReason =
          response?.error?.description ||
          response?.error?.reason ||
          "Payment failed. Please try a different card or UPI.";
        setStatusMessage({
          type: "error",
          text: `Payment Failed: ${failureReason}`,
        });
        if (onError) onError(failureReason);
        setLoading(false);
      });

      razorpayInstance.open();
    } catch (err: any) {
      const errText = err.message || "Unable to initiate payment.";
      setStatusMessage({ type: "error", text: errText });
      if (onError) onError(errText);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 w-full">
      {/* Official Razorpay Checkout Script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={handlePayment}
        isLoading={loading}
        disabled={disabled || loading}
        className={`w-full ${className || ""}`}
      >
        <Lock className="w-3.5 h-3.5 mr-1.5 shrink-0" />
        <span>{buttonText || `Pay ${displayAmountINR}`}</span>
      </Button>

      {statusMessage && (
        <div
          className={`p-3 rounded-[8px] text-xs flex items-center gap-2 ${
            statusMessage.type === "success"
              ? "bg-[rgba(52,211,153,0.1)] border border-[rgba(52,211,153,0.3)] text-[#34D399]"
              : statusMessage.type === "error"
              ? "bg-[rgba(232,75,44,0.1)] border border-[rgba(232,75,44,0.3)] text-[#E84B2C]"
              : "bg-[#161514] border border-[rgba(243,240,232,0.1)] text-[#D0CBC1]"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}
    </div>
  );
}
