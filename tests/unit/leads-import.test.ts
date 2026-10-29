import { describe, it, expect } from "vitest";
import {
  normalizePhone,
  normalizeEmail,
  normalizeUrl,
  analyzeLeadImport,
  RawLeadRow,
} from "@/lib/leads/import";

describe("CSV / XLSX Lead Imports & Deduplication", () => {
  it("normalizes phone numbers, emails, and website URLs cleanly", () => {
    expect(normalizePhone("+91 (98200) 11-223")).toBe("+919820011223");
    expect(normalizePhone("09820011223")).toBe("09820011223");
    expect(normalizePhone("123")).toBeNull(); // too short

    expect(normalizeEmail("  TEST.User@Domain.COM  ")).toBe("test.user@domain.com");
    expect(normalizeEmail("invalid-email")).toBeNull();

    expect(normalizeUrl("https://www.AgencySite.in/")).toBe("agencysite.in");
    expect(normalizeUrl("http://company.com/page/")).toBe("company.com/page");
  });

  it("validates categories and flags unauthorized categories", () => {
    const rawRows: RawLeadRow[] = [
      {
        business_name: "Valid Software Co",
        category: "Programming & Software",
        city: "Mumbai",
        phone: "+91 98000 11111",
      },
      {
        business_name: "Invalid Category Studio",
        category: "Content & Photography", // Forbidden
        city: "Pune",
        phone: "+91 98000 22222",
      },
    ];

    const result = analyzeLeadImport(rawRows);
    expect(result.validRows).toHaveLength(1);
    expect(result.validRows[0].business_name).toBe("Valid Software Co");
    expect(result.invalidRows).toHaveLength(1);
    expect(result.invalidRows[0].reasons[0]).toContain("Invalid category");
  });

  it("detects in-batch duplicates by phone and business name in same city", () => {
    const rawRows: RawLeadRow[] = [
      {
        business_name: "Alpha Design & Web",
        category: "Website & E-commerce",
        city: "Bengaluru",
        phone: "+91 98888 11111",
      },
      {
        business_name: "Duplicate Phone Co",
        category: "Website & E-commerce",
        city: "Delhi",
        phone: "+91 98888 11111", // Same phone!
      },
      {
        business_name: "Alpha Design & Web", // Same name and city!
        category: "Website & E-commerce",
        city: "Bengaluru",
        phone: "+91 99999 22222",
      },
    ];

    const result = analyzeLeadImport(rawRows);
    expect(result.validRows).toHaveLength(1);
    expect(result.duplicateRows).toHaveLength(2);
    expect(result.duplicateRows[0].matchType).toBe("phone");
    expect(result.duplicateRows[1].matchType).toBe("business_city");
  });

  it("detects duplicates against existing database inventory", () => {
    const existing = [
      {
        phone: "+919811122233",
        email: "founder@existing.in",
        website: "existing.in",
        business_name: "Existing Tech",
        city: "Hyderabad",
      },
    ];

    const rawRows: RawLeadRow[] = [
      {
        business_name: "Fresh Company",
        category: "Digital Marketing & SEO",
        city: "Hyderabad",
        email: "FOUNDER@existing.in", // Matches existing lead email
      },
    ];

    const result = analyzeLeadImport(rawRows, existing);
    expect(result.validRows).toHaveLength(0);
    expect(result.duplicateRows).toHaveLength(1);
    expect(result.duplicateRows[0].matchType).toBe("email");
  });
});

