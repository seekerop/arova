import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { GoogleAnalytics } from "@/components/seo/google-analytics";
import { SEO_CONFIG, getCanonicalUrl } from "@/lib/seo/config";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#080505",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SEO_CONFIG.siteUrl),
  title: {
    default: `${SEO_CONFIG.brand.name} — ${SEO_CONFIG.brand.tagline}`,
    template: `%s | ${SEO_CONFIG.brand.name}`,
  },
  description: SEO_CONFIG.brand.description,
  applicationName: SEO_CONFIG.brand.name,
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/arenova.png",
  },
  alternates: {
    canonical: getCanonicalUrl("/"),
  },
  openGraph: {
    title: `${SEO_CONFIG.brand.name} — ${SEO_CONFIG.brand.tagline}`,
    description: SEO_CONFIG.brand.description,
    url: SEO_CONFIG.siteUrl,
    siteName: SEO_CONFIG.brand.name,
    locale: SEO_CONFIG.locale,
    type: "website",
    images: [
      {
        url: `${SEO_CONFIG.siteUrl}/metadata.png`,
        width: 1200,
        height: 630,
        alt: `${SEO_CONFIG.brand.name} — B2B Lead Intelligence`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SEO_CONFIG.brand.name} — ${SEO_CONFIG.brand.tagline}`,
    description: SEO_CONFIG.brand.description,
    creator: SEO_CONFIG.twitterHandle,
    site: SEO_CONFIG.twitterHandle,
    images: [`${SEO_CONFIG.siteUrl}/metadata.png`],
  },
  robots: {
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
  ...(SEO_CONFIG.verification.google
    ? {
        verification: {
          google: SEO_CONFIG.verification.google,
        },
      }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-[#080505] text-[#F3F0E8] antialiased selection:bg-[#E84B2C] selection:text-[#F3F0E8] min-h-screen">
        <GoogleAnalytics />
        <Suspense fallback={null}>
          <AnalyticsProvider />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
