/**
 * AROVA CENTRALIZED SEO CONFIGURATION
 * Ecosystem: Arenova Brand Universe
 * Production Domain: https://arova.arenova.in
 */

export const SEO_CONFIG = {
  brand: {
    name: "Arova",
    legalName: "Arova Business Intelligence",
    parentOrganization: "Arenova",
    parentUrl: "https://arenova.in",
    tagline: "B2B Lead Intelligence & Qualified Business Leads",
    description:
      "Curated B2B lead intelligence and qualified prospect discovery platform under the Arenova ecosystem. Access verified business requirements with 30-day exclusive outreach.",
  },
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://arova.arenova.in"
      : process.env.APP_BASE_URL || "https://arova.arenova.in"),
  locale: "en_IN",
  locales: ["en_IN", "en_US"],
  defaultOgImage: "/arova.png",
  ogImageDimensions: {
    width: 1734,
    height: 907,
  },
  twitterHandle: "@arenovatech",
  themeColor: "#080505",
  contact: {
    email: "support@arenova.in",
    url: "https://arova.arenova.in/contact",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
  analytics: {
    gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "",
  },
} as const;

/**
 * Returns a fully-qualified, normalized canonical URL without trailing slashes.
 */
export function getCanonicalUrl(path: string = "/"): string {
  const base = SEO_CONFIG.siteUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  // Avoid trailing slash except for root
  if (normalizedPath === "/") return base;
  return `${base}${normalizedPath.replace(/\/+$/, "")}`;
}
