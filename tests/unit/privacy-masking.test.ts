import { describe, it, expect } from "vitest";
import { maskLeadForPreview } from "@/lib/leads/service";
import { Lead } from "@/lib/types/database";

describe("Lead Privacy & Contact Disclosure Masking", () => {
  const fullLead: Lead = {
    id: "lead_uuid_1234",
    business_name: "Confidential Enterprise Systems Pvt Ltd",
    contact_name: "Rohan Kapoor",
    phone: "+91 98200 44556",
    email: "rohan@confidentialsystems.com",
    website: "https://confidentialsystems.com",
    category_id: "cat_1",
    category: {
      id: "cat_1",
      slug: "programming-software",
      name: "Programming & Software",
      description: "Custom software",
      is_active: true,
      display_order: 1,
      created_at: new Date().toISOString(),
    },
    generalized_requirement: "Enterprise core banking API migration to microservices architecture.",
    estimated_value_paise: 9500000,
    estimated_value_currency: "INR",
    country: "India",
    state: "Maharashtra",
    city: "Mumbai",
    business_type: "Banking & Financial Technology",
    tags: ["Fintech", "Microservices"],
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

  it("strictly hides phone, email, website and contact names when user does NOT have active claim", () => {
    const preview = maskLeadForPreview(fullLead, false);

    expect(preview.is_locked).toBe(true);
    // Safe preview fields exist
    expect(preview.category_name).toBe("Programming & Software");
    expect(preview.generalized_requirement).toContain("banking API migration");
    expect(preview.city).toBe("Mumbai");
    expect(preview.estimated_value_paise).toBe(9500000);

    // Sensitive contact information must NOT be present on the masked object
    expect((preview as any).phone).toBeUndefined();
    expect((preview as any).email).toBeUndefined();
    expect((preview as any).website).toBeUndefined();
    expect((preview as any).contact_name).toBeUndefined();
    expect((preview as any).source_url).toBeUndefined();
  });

  it("reveals contact information when customer holds an authorized claim", () => {
    const revealed = maskLeadForPreview(fullLead, true);

    expect(revealed.is_locked).toBe(false);
    expect((revealed as Lead).phone).toBe("+91 98200 44556");
    expect((revealed as Lead).email).toBe("rohan@confidentialsystems.com");
    expect((revealed as Lead).website).toBe("https://confidentialsystems.com");
    expect((revealed as Lead).contact_name).toBe("Rohan Kapoor");
  });
});
