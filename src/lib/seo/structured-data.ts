import { SEO_CONFIG, getCanonicalUrl } from "./config";
import { SUBSCRIPTION_PLANS } from "@/lib/constants/plans";
import { APPROVED_CATEGORIES, ApprovedCategorySlug } from "@/lib/constants/categories";

/**
 * Builds Schema.org Organization structured data.
 */
export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SEO_CONFIG.brand.name,
    legalName: SEO_CONFIG.brand.legalName,
    url: SEO_CONFIG.siteUrl,
    logo: `${SEO_CONFIG.siteUrl}/arenova.png`,
    description: SEO_CONFIG.brand.description,
    parentOrganization: {
      "@type": "Organization",
      name: SEO_CONFIG.brand.parentOrganization,
      url: SEO_CONFIG.brand.parentUrl,
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: SEO_CONFIG.contact.email,
      url: SEO_CONFIG.contact.url,
      availableLanguage: ["English", "Hindi"],
    },
    sameAs: [SEO_CONFIG.brand.parentUrl],
  };
}

/**
 * Builds Schema.org WebSite structured data with SearchAction.
 */
export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SEO_CONFIG.brand.name,
    url: SEO_CONFIG.siteUrl,
    description: SEO_CONFIG.brand.description,
    publisher: {
      "@type": "Organization",
      name: SEO_CONFIG.brand.name,
      url: SEO_CONFIG.siteUrl,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SEO_CONFIG.siteUrl}/categories?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Builds Schema.org SoftwareApplication structured data for Arova.
 */
export function buildSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SEO_CONFIG.brand.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web Browser",
    url: SEO_CONFIG.siteUrl,
    description: SEO_CONFIG.brand.description,
    publisher: {
      "@type": "Organization",
      name: SEO_CONFIG.brand.parentOrganization,
      url: SEO_CONFIG.brand.parentUrl,
    },
    brand: {
      "@type": "Brand",
      name: SEO_CONFIG.brand.name,
    },
    offers: SUBSCRIPTION_PLANS.map((plan) => ({
      "@type": "Offer",
      name: `${plan.name} Plan`,
      price: plan.priceINR.toString(),
      priceCurrency: "INR",
      priceValidUntil: "2027-12-31",
      availability: "https://schema.org/InStock",
      url: getCanonicalUrl("/pricing"),
      description: `${plan.leadAllocation} verified B2B business leads per ${plan.billingPeriodDays} days with 30-day exclusive outreach claim.`,
    })),
  };
}

/**
 * Builds Schema.org BreadcrumbList structured data.
 */
export function buildBreadcrumbListSchema(
  items: Array<{ name: string; path: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: getCanonicalUrl("/"),
      },
      ...items.map((crumb, idx) => ({
        "@type": "ListItem",
        position: idx + 2,
        name: crumb.name,
        item: getCanonicalUrl(crumb.path),
      })),
    ],
  };
}

/**
 * Builds Schema.org FAQPage structured data from question/answer pairs.
 */
export function buildFAQPageSchema(
  faqList: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqList.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/**
 * Builds Schema.org Service structured data for a specific lead category.
 */
export function buildCategoryServiceSchema(slug: ApprovedCategorySlug) {
  const cat = APPROVED_CATEGORIES.find((c) => c.slug === slug);
  if (!cat) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: `B2B Lead Discovery — ${cat.name}`,
    name: `${cat.name} Lead Intelligence`,
    description: cat.description,
    url: getCanonicalUrl(`/categories/${cat.slug}`),
    provider: {
      "@type": "Organization",
      name: SEO_CONFIG.brand.name,
      url: SEO_CONFIG.siteUrl,
    },
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${cat.name} Lead Subscriptions`,
      itemListElement: SUBSCRIPTION_PLANS.map((plan) => ({
        "@type": "Offer",
        name: `${plan.name} Plan — ${cat.name}`,
        price: plan.priceINR.toString(),
        priceCurrency: "INR",
        url: getCanonicalUrl("/pricing"),
      })),
    },
  };
}

