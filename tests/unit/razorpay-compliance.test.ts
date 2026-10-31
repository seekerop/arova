import { describe, it, expect } from "vitest";
import { BUSINESS_CONFIG } from "@/lib/constants/business";
import sitemap from "@/app/sitemap";

describe("Razorpay Merchant Verification & Statutory Compliance Suite", () => {
  it("maintains complete corporate identity & physical operating address", () => {
    expect(BUSINESS_CONFIG.legalEntityName).toBeTruthy();
    expect(BUSINESS_CONFIG.brandName).toBe("Arova");
    expect(BUSINESS_CONFIG.registeredAddress.building).toBeTruthy();
    expect(BUSINESS_CONFIG.registeredAddress.city).toBe("Bengaluru");
    expect(BUSINESS_CONFIG.registeredAddress.state).toBe("Karnataka");
    expect(BUSINESS_CONFIG.registeredAddress.pincode).toBe("560103");
    expect(BUSINESS_CONFIG.registeredAddress.country).toBe("India");
    expect(BUSINESS_CONFIG.registeredAddress.formatted).toContain("560103");
  });

  it("maintains official support channels and operating hours", () => {
    expect(BUSINESS_CONFIG.contact.supportEmail).toBe("support@arenova.in");
    expect(BUSINESS_CONFIG.contact.billingEmail).toBe("billing@arenova.in");
    expect(BUSINESS_CONFIG.contact.helplinePhone).toMatch(/^\+91/);
    expect(BUSINESS_CONFIG.contact.operatingHours).toContain("IST");
    expect(BUSINESS_CONFIG.contact.ticketResolutionSLA).toContain("24 to 48");
  });

  it("maintains statutory Grievance Officer details per IT Rules 2021", () => {
    expect(BUSINESS_CONFIG.grievanceOfficer.name).toBeTruthy();
    expect(BUSINESS_CONFIG.grievanceOfficer.designation).toBeTruthy();
    expect(BUSINESS_CONFIG.grievanceOfficer.email).toBe("grievance@arenova.in");
    expect(BUSINESS_CONFIG.grievanceOfficer.phone).toMatch(/^\+91/);
    expect(BUSINESS_CONFIG.grievanceOfficer.responseSLA).toContain("48 hours");
  });

  it("explicitly specifies Razorpay refund timeline of 5 to 7 working days", () => {
    expect(BUSINESS_CONFIG.paymentGateway.partnerName).toBe("Razorpay");
    expect(BUSINESS_CONFIG.paymentGateway.payoutRefundTimeline).toContain("5 to 7 business working days");
    expect(BUSINESS_CONFIG.paymentGateway.currency).toContain("INR");
  });

  it("ensures all mandatory Razorpay audit URLs are present in sitemap", () => {
    const items = sitemap();
    const urls = items.map((i) => i.url);

    // Razorpay mandatory audit URLs:
    expect(urls).toContain("https://arova.arenova.in/about");
    expect(urls).toContain("https://arova.arenova.in/contact");
    expect(urls).toContain("https://arova.arenova.in/terms");
    expect(urls).toContain("https://arova.arenova.in/privacy");
    expect(urls).toContain("https://arova.arenova.in/refund-policy");
    expect(urls).toContain("https://arova.arenova.in/shipping-policy");
    expect(urls).toContain("https://arova.arenova.in/pricing");
  });
});
