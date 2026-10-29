import { describe, it, expect } from "vitest";
import { maskLeadForPreview } from "@/lib/leads/service";
import { Lead } from "@/lib/types/database";

describe("Lead Privacy & Contact Disclosure Masking", () => {
  const fullLead: Lead = {
    id: "lead_uuid_1234",
    business_name: "Apex Retail Solutions Pvt Ltd",
    contact_name: "Rohan Kapoor",
    phone: "+91 98200 44556",
    email: "rohan@apexretail.in",
    website: "https://apexretail.in",
    category_id: "cat_1",
    category: {
      id: "cat_1",
      slug: "website-ecommerce",
      name: "Website & E-commerce",
      description: "E-commerce stores",
      is_active: true,
      display_order: 4,
      created_at: new Date().toISOString(),
    },
    generalized_requirement: "Shopify 2.0 headless storefront migration & checkout speed optimization.",
    estimated_value_paise: 8500000,
    estimated_value_currency: "INR",
    country: "India",
    state: "Maharashtra",
    city: "Mumbai",
    business_type: "Retail & E-commerce",
    tags: ["Shopify", "Headless"],
    source_name: "MCA Public Corporate Filing",
    source_url: "https://mca.gov.in/filing/1234",
    collection_date: "2026-10-25",
    verification_date: "2026-10-26",
    data_quality_status: "verified",
    availability_status: "available",
    import_batch_id: "batch_1",
    admin_notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  it("strictly hides business_name, phone, email, website and contact names when user does NOT have active claim", () => {
    const preview = maskLeadForPreview(fullLead, false);

    expect(preview.is_locked).toBe(true);
    // Safe preview fields exist
    expect(preview.category_name).toBe("Website & E-commerce");
    expect(preview.generalized_requirement).toContain("Shopify 2.0");
    expect(preview.city).toBe("Mumbai");
    expect(preview.estimated_value_paise).toBe(8500000);

    // CRITICAL REQUIREMENT: Business name and contact details must NOT be disclosed before acceptance!
    expect((preview as any).business_name).toBeUndefined();
    expect((preview as any).phone).toBeUndefined();
    expect((preview as any).email).toBeUndefined();
    expect((preview as any).website).toBeUndefined();
    expect((preview as any).contact_name).toBeUndefined();
    expect((preview as any).source_url).toBeUndefined();
  });

  it("discloses full unmasked lead contact details ONLY when user holds verified active claim", () => {
    const revealed = maskLeadForPreview(fullLead, true);

    expect(revealed.is_locked).toBe(false);
    expect((revealed as any).business_name).toBe("Apex Retail Solutions Pvt Ltd");
    expect((revealed as any).phone).toBe("+91 98200 44556");
    expect((revealed as any).email).toBe("rohan@apexretail.in");
    expect((revealed as any).website).toBe("https://apexretail.in");
    expect((revealed as any).contact_name).toBe("Rohan Kapoor");
  });
});
