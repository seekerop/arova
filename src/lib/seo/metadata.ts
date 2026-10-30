import type { Metadata } from "next";
import { SEO_CONFIG, getCanonicalUrl } from "./config";

export interface PageMetadataOptions {
  title?: string;
  description?: string;
  path?: string;
  noindex?: boolean;
  ogType?: "website" | "article";
  image?: string;
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
}

/**
 * Creates standardized, fully-formed Next.js App Router Metadata.
 */
export function createPageMetadata(options: PageMetadataOptions = {}): Metadata {
  const {
    title,
    description = SEO_CONFIG.brand.description,
    path = "/",
    noindex = false,
    ogType = "website",
    image = SEO_CONFIG.defaultOgImage,
    keywords = [
      "B2B leads",
      "qualified business leads",
      "lead intelligence",
      "verified prospect discovery",
      "exclusive leads India",
      "software leads",
      "digital marketing leads",
      "video production leads",
      "web development leads",
      "business automation leads",
      "Arenova ecosystem",
      "Arova",
    ],
  } = options;

  const canonical = getCanonicalUrl(path);
  const fullTitle = title
    ? `${title} | ${SEO_CONFIG.brand.name}`
    : `${SEO_CONFIG.brand.name} — ${SEO_CONFIG.brand.tagline}`;

  const imageUrl = image.startsWith("http")
    ? image
    : `${SEO_CONFIG.siteUrl.replace(/\/+$/, "")}${image.startsWith("/") ? "" : "/"}${image}`;

  return {
    title: fullTitle,
    description,
    keywords,
    alternates: {
      canonical,
    },
    robots: noindex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: SEO_CONFIG.brand.name,
      locale: SEO_CONFIG.locale,
      type: ogType,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${SEO_CONFIG.brand.name} — ${SEO_CONFIG.brand.tagline}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      creator: SEO_CONFIG.twitterHandle,
      site: SEO_CONFIG.twitterHandle,
      images: [imageUrl],
    },
    ...(SEO_CONFIG.verification.google
      ? {
          verification: {
            google: SEO_CONFIG.verification.google,
          },
        }
      : {}),
  };
}

