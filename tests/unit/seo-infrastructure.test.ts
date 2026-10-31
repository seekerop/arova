import { describe, it, expect } from "vitest";
import { SEO_CONFIG, getCanonicalUrl } from "@/lib/seo/config";
import { createPageMetadata } from "@/lib/seo/metadata";
import {
  buildOrganizationSchema,
  buildWebSiteSchema,
  buildSoftwareApplicationSchema,
  buildBreadcrumbListSchema,
  buildFAQPageSchema,
  buildCategoryServiceSchema,
} from "@/lib/seo/structured-data";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { APPROVED_CATEGORIES } from "@/lib/constants/categories";

describe("Arova SEO Infrastructure & Metadata Engine", () => {
  it("enforces canonical URL resolution on https://arova.arenova.in without trailing slashes", () => {
    expect(SEO_CONFIG.siteUrl).toBe("https://arova.arenova.in");

    expect(getCanonicalUrl("/")).toBe("https://arova.arenova.in");
    expect(getCanonicalUrl("/pricing")).toBe("https://arova.arenova.in/pricing");
    expect(getCanonicalUrl("/categories/")).toBe(
      "https://arova.arenova.in/categories"
    );
    expect(getCanonicalUrl("how-it-works")).toBe(
      "https://arova.arenova.in/how-it-works"
    );
  });

  it("generates correct public page metadata with canonicals and OpenGraph", () => {
    const meta = createPageMetadata({
      title: "Pricing Plans",
      description: "Custom lead subscription plans",
      path: "/pricing",
    });

    expect(meta.title).toBe("Pricing Plans | Arova");
    expect(meta.description).toBe("Custom lead subscription plans");
    expect(meta.alternates?.canonical).toBe(
      "https://arova.arenova.in/pricing"
    );
    expect((meta.robots as any)?.index).toBe(true);
    expect((meta.robots as any)?.follow).toBe(true);

    const og = meta.openGraph as any;
    expect(og.title).toBe("Pricing Plans | Arova");
    expect(og.url).toBe("https://arova.arenova.in/pricing");
    expect(og.siteName).toBe("Arova");
    expect(og.images[0].url).toContain("/metadata.png");
  });

  it("enforces strict noindex on private or auth pages", () => {
    const meta = createPageMetadata({
      title: "Dashboard Overview",
      path: "/dashboard",
      noindex: true,
    });

    const robotsMeta = meta.robots as any;
    expect(robotsMeta.index).toBe(false);
    expect(robotsMeta.follow).toBe(false);
    expect(robotsMeta.googleBot.index).toBe(false);
    expect(robotsMeta.googleBot.follow).toBe(false);
  });

  it("builds valid Schema.org SoftwareApplication schema with real pricing", () => {
    const appSchema = buildSoftwareApplicationSchema();

    expect(appSchema["@context"]).toBe("https://schema.org");
    expect(appSchema["@type"]).toBe("SoftwareApplication");
    expect(appSchema.name).toBe("Arova");
    expect(appSchema.publisher.name).toBe("Arenova");
    expect(appSchema.publisher.url).toBe("https://arenova.in");

    // Real pricing verification
    expect(appSchema.offers).toHaveLength(2);
    expect(appSchema.offers[0].name).toBe("Starter Plan");
    expect(appSchema.offers[0].price).toBe("499");
    expect(appSchema.offers[0].priceCurrency).toBe("INR");
    expect(appSchema.offers[1].name).toBe("Growth Plan");
    expect(appSchema.offers[1].price).toBe("999");
  });

  it("builds valid BreadcrumbList schema with sequential positions", () => {
    const breadcrumbs = buildBreadcrumbListSchema([
      { name: "Categories", path: "/categories" },
      { name: "Programming & Software", path: "/categories/programming-software" },
    ]);

    expect(breadcrumbs["@type"]).toBe("BreadcrumbList");
    expect(breadcrumbs.itemListElement).toHaveLength(3);
    expect(breadcrumbs.itemListElement[0].position).toBe(1);
    expect(breadcrumbs.itemListElement[0].name).toBe("Home");
    expect(breadcrumbs.itemListElement[1].position).toBe(2);
    expect(breadcrumbs.itemListElement[1].name).toBe("Categories");
    expect(breadcrumbs.itemListElement[2].position).toBe(3);
    expect(breadcrumbs.itemListElement[2].name).toBe("Programming & Software");
    expect(breadcrumbs.itemListElement[2].item).toBe(
      "https://arova.arenova.in/categories/programming-software"
    );
  });

  it("builds valid Service schemas for all 5 approved categories", () => {
    for (const cat of APPROVED_CATEGORIES) {
      const service = buildCategoryServiceSchema(cat.slug);
      expect(service).not.toBeNull();
      expect(service?.["@type"]).toBe("Service");
      expect(service?.name).toBe(`${cat.name} Lead Intelligence`);
      expect(service?.url).toBe(`https://arova.arenova.in/categories/${cat.slug}`);
    }
  });

  it("builds valid FAQPage schema", () => {
    const faqSchema = buildFAQPageSchema([
      { question: "What is Arova?", answer: "Arova is a B2B lead intelligence service." },
    ]);

    expect(faqSchema["@type"]).toBe("FAQPage");
    expect(faqSchema.mainEntity).toHaveLength(1);
    expect(faqSchema.mainEntity[0].name).toBe("What is Arova?");
    expect(faqSchema.mainEntity[0].acceptedAnswer.text).toBe(
      "Arova is a B2B lead intelligence service."
    );
  });

  it("generates an XML sitemap with all public marketing & category URLs, excluding private routes", () => {
    const items = sitemap();
    const urls = items.map((i) => i.url);

    // Verify all core routes
    expect(urls).toContain("https://arova.arenova.in");
    expect(urls).toContain("https://arova.arenova.in/about");
    expect(urls).toContain("https://arova.arenova.in/categories");
    expect(urls).toContain("https://arova.arenova.in/pricing");
    expect(urls).toContain("https://arova.arenova.in/how-it-works");
    expect(urls).toContain("https://arova.arenova.in/faq");
    expect(urls).toContain("https://arova.arenova.in/contact");
    expect(urls).toContain("https://arova.arenova.in/privacy");
    expect(urls).toContain("https://arova.arenova.in/terms");
    expect(urls).toContain("https://arova.arenova.in/refund-policy");
    expect(urls).toContain("https://arova.arenova.in/shipping-policy");

    // Verify all 5 category landing routes
    for (const cat of APPROVED_CATEGORIES) {
      expect(urls).toContain(`https://arova.arenova.in/categories/${cat.slug}`);
    }

    // Verify ZERO private or auth routes exist
    for (const url of urls) {
      expect(url).not.toContain("/admin");
      expect(url).not.toContain("/dashboard");
      expect(url).not.toContain("/api");
      expect(url).not.toContain("/login");
      expect(url).not.toContain("/signup");
      expect(url).not.toContain("/forgot-password");
      expect(url).not.toContain("/reset-password");
    }

    // Total URLs must be exactly 11 static + 5 categories = 16
    expect(items).toHaveLength(16);
  });

  it("generates robots.txt disallowing private routes and pointing to sitemap", () => {
    const robotsObj = robots();
    expect(robotsObj.sitemap).toBe("https://arova.arenova.in/sitemap.xml");
    expect(robotsObj.host).toBe("https://arova.arenova.in");

    const rules = Array.isArray(robotsObj.rules)
      ? robotsObj.rules[0]
      : robotsObj.rules;
    expect(rules.disallow).toContain("/admin/*");
    expect(rules.disallow).toContain("/dashboard/*");
    expect(rules.disallow).toContain("/api/*");
    expect(rules.disallow).toContain("/login");
    expect(rules.disallow).toContain("/signup");
  });
});

