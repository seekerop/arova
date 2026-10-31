import type { MetadataRoute } from "next";
import { getCanonicalUrl } from "@/lib/seo/config";
import { APPROVED_CATEGORIES } from "@/lib/constants/categories";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // 1. Core public marketing routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: getCanonicalUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: getCanonicalUrl("/categories"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: getCanonicalUrl("/about"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: getCanonicalUrl("/pricing"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: getCanonicalUrl("/how-it-works"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: getCanonicalUrl("/faq"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: getCanonicalUrl("/contact"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: getCanonicalUrl("/privacy"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: getCanonicalUrl("/terms"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: getCanonicalUrl("/refund-policy"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: getCanonicalUrl("/shipping-policy"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // 2. Dedicated category landing pages
  const categoryRoutes: MetadataRoute.Sitemap = APPROVED_CATEGORIES.map(
    (cat) => ({
      url: getCanonicalUrl(`/categories/${cat.slug}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    })
  );

  return [...staticRoutes, ...categoryRoutes];
}

