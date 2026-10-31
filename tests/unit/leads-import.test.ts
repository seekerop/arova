import { describe, it, expect } from "vitest";
import {
  normalizePhone,
  normalizeEmail,
  normalizeUrl,
  analyzeLeadImport,
  parseSpreadsheet,
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

  it("applies target category specification when importing leads without category column", () => {
    const rawRows: RawLeadRow[] = [
      {
        business_name: "Acme Web Solutions",
        city: "Mumbai",
        phone: "+91 91111 22222",
        // No category column in CSV!
      },
      {
        business_name: "Apex Storefronts",
        city: "Delhi",
        email: "contact@apexstorefronts.in",
        category: "unstructured web design note", // Non-standard category
      },
    ];

    // Specify target category as Website & E-commerce
    const result = analyzeLeadImport(rawRows, [], "Website & E-commerce");
    expect(result.validRows).toHaveLength(2);
    expect(result.invalidRows).toHaveLength(0);
    expect(result.validRows[0].category).toBe("Website & E-commerce");
    expect(result.validRows[1].category).toBe("Website & E-commerce");
  });

  it("approximates earnings per lead within expected category and tier ranges", () => {
    const rawRows: RawLeadRow[] = [
      {
        business_name: "Local Tailor Shop",
        location: "Lucknow, Uttar Pradesh, India",
        lead_type: "Local Business",
        problem: "Needs responsive 3-page website with order inquiry form.",
      },
      {
        business_name: "Mamaearth (Honasa Consumer Ltd)",
        location: "Gurugram, Haryana, India",
        lead_type: "Enterprise",
        problem: "Requires rapid iteration of UGC hook variations and vertical video ads.",
      },
    ];

    const resultWeb = analyzeLeadImport([rawRows[0]], [], "Website & E-commerce");
    expect(resultWeb.validRows).toHaveLength(1);
    expect(resultWeb.validRows[0].city).toBe("Lucknow");
    expect(resultWeb.validRows[0].state).toBe("Uttar Pradesh");
    expect(resultWeb.validRows[0].generalized_requirement).toContain("Needs responsive 3-page website");
    // Local web development lead should be between 12k and 25k (1200000 to 2500000 paise)
    expect(resultWeb.validRows[0].estimated_value_paise).toBeGreaterThanOrEqual(1200000);
    expect(resultWeb.validRows[0].estimated_value_paise).toBeLessThanOrEqual(2500000);

    const resultVideo = analyzeLeadImport([rawRows[1]], [], "Video Editing & Production");
    expect(resultVideo.validRows).toHaveLength(1);
    expect(resultVideo.validRows[0].city).toBe("Gurugram");
    expect(resultVideo.validRows[0].website).toBe("https://mamaearth.in");
    // Enterprise video editing should be between 85k and 200k (8500000 to 20000000 paise)
    expect(resultVideo.validRows[0].estimated_value_paise).toBeGreaterThanOrEqual(8500000);
    expect(resultVideo.validRows[0].estimated_value_paise).toBeLessThanOrEqual(20000000);
  });

  it("parses headerless prospect CSVs and extracts standard fields", () => {
    const csvContent = `"Mamaearth (Honasa Consumer Ltd)","Gurugram, Haryana, India","4.1/5 (1850 reviews)","Enterprise","E-commerce","Requires rapid iteration of UGC hook variations."\n"boAt (Imagine Marketing Ltd)","Mumbai, Maharashtra, India","4.3/5 (3420 reviews)","Enterprise","E-commerce","Over-relies on celebrity brand films."`;
    const buffer = Buffer.from(csvContent, "utf-8");

    const parsed = parseSpreadsheet(buffer, "leads.csv");
    expect(parsed).toHaveLength(2);
    expect(parsed[0].business_name).toBe("Mamaearth (Honasa Consumer Ltd)");
    expect(parsed[0].location).toBe("Gurugram, Haryana, India");
    expect(parsed[0].lead_type).toBe("Enterprise");
    expect(parsed[0].problem).toContain("Requires rapid iteration");
  });
});

