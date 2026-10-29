import { describe, it, expect } from "vitest";
import {
  APPROVED_CATEGORIES,
  normalizeCategoryName,
  isApprovedCategory,
} from "@/lib/constants/categories";

describe("Approved Categories Specification", () => {
  it("enforces exactly 5 flat categories with no subcategories", () => {
    expect(APPROVED_CATEGORIES).toHaveLength(5);
    const names = APPROVED_CATEGORIES.map((c) => c.name);

    expect(names).toContain("Programming & Software");
    expect(names).toContain("Video Editing & Production");
    expect(names).toContain("Digital Marketing & SEO");
    expect(names).toContain("Website & E-commerce");
    expect(names).toContain("Business Automation & AI");

    // Prohibited categories must not exist
    expect(names).not.toContain("Design & Branding");
    expect(names).not.toContain("Content & Photography");
    expect(names).not.toContain("Business & Professional Services");
  });

  it("normalizes case-insensitive and variant category strings", () => {
    expect(normalizeCategoryName("programming & software")).toBe("Programming & Software");
    expect(normalizeCategoryName("video editing")).toBe("Video Editing & Production");
    expect(normalizeCategoryName("seo")).toBe("Digital Marketing & SEO");
    expect(normalizeCategoryName("ecommerce")).toBe("Website & E-commerce");
    expect(normalizeCategoryName("automation")).toBe("Business Automation & AI");
  });

  it("rejects invalid, unknown, or fabricated categories", () => {
    expect(normalizeCategoryName("Graphic Design & Logos")).toBeNull();
    expect(normalizeCategoryName("Random Category 123")).toBeNull();
    expect(normalizeCategoryName("")).toBeNull();
    expect(normalizeCategoryName(null)).toBeNull();
  });
});

