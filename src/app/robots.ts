import type { MetadataRoute } from "next";
import { SEO_CONFIG } from "@/lib/seo/config";

export default function robots(): MetadataRoute.Robots {
  const isProduction =
    process.env.NODE_ENV === "production" &&
    !process.env.VERCEL_ENV?.includes("preview") &&
    !process.env.NEXT_PUBLIC_VERCEL_ENV?.includes("preview");

  // In non-production or preview deployments, block all crawlers
  if (!isProduction && process.env.VERCEL_ENV === "preview") {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  const sitemapUrl = `${SEO_CONFIG.siteUrl.replace(/\/+$/, "")}/sitemap.xml`;

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/categories",
          "/categories/*",
          "/pricing",
          "/how-it-works",
          "/faq",
          "/contact",
          "/privacy",
          "/terms",
          "/refund-policy",
          "/llms.txt",
          "/health",
          "/api/health",
        ],
        disallow: [
          "/admin",
          "/admin/*",
          "/dashboard",
          "/dashboard/*",
          "/api/*",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
        ],
      },
      // Specifically guide AI agents while preserving privacy
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "Google-Extended",
          "ClaudeBot",
          "PerplexityBot",
          "CCBot",
        ],
        allow: [
          "/",
          "/categories",
          "/categories/*",
          "/pricing",
          "/how-it-works",
          "/faq",
          "/contact",
          "/privacy",
          "/terms",
          "/refund-policy",
          "/llms.txt",
          "/health",
          "/api/health",
        ],
        disallow: ["/admin/*", "/dashboard/*", "/api/*"],
      },
    ],
    sitemap: sitemapUrl,
    host: SEO_CONFIG.siteUrl,
  };
}

