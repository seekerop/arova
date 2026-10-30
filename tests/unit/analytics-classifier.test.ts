import { describe, it, expect } from "vitest";
import {
  classifyTrafficSource,
  parseUserAgent,
  resolveGeolocation,
  extractHostname,
} from "@/lib/analytics/classifier";

describe("Analytics Traffic Source Classification", () => {
  it("classifies direct visits when referrer is absent", () => {
    const res = classifyTrafficSource({
      referrer: undefined,
      siteHost: "arova.io",
    });
    expect(res.category).toBe("direct");
    expect(res.sourceName).toBe("Direct");
  });

  it("classifies direct visits when referrer is the same domain", () => {
    const res = classifyTrafficSource({
      referrer: "https://arova.io/pricing",
      siteHost: "arova.io",
    });
    expect(res.category).toBe("direct");
  });

  it("identifies organic search engines from referrer", () => {
    const google = classifyTrafficSource({
      referrer: "https://www.google.com/search?q=business+leads+india",
      siteHost: "arova.io",
    });
    expect(google.category).toBe("organic_search");
    expect(google.sourceName).toBe("Google Organic");

    const bing = classifyTrafficSource({
      referrer: "https://www.bing.com/search?q=lead+generation",
      siteHost: "arova.io",
    });
    expect(bing.category).toBe("organic_search");
    expect(bing.sourceName).toBe("Bing Organic");
  });

  it("identifies social media referrers", () => {
    const twitter = classifyTrafficSource({
      referrer: "https://t.co/xyz123",
      siteHost: "arova.io",
    });
    expect(twitter.category).toBe("social");
    expect(twitter.sourceName).toBe("X / Twitter");

    const linkedin = classifyTrafficSource({
      referrer: "https://www.linkedin.com/feed/",
      siteHost: "arova.io",
    });
    expect(linkedin.category).toBe("social");
    expect(linkedin.sourceName).toBe("LinkedIn");
  });

  it("prioritizes paid search UTM medium over organic referrer", () => {
    const paid = classifyTrafficSource({
      referrer: "https://www.google.com/",
      siteHost: "arova.io",
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "lead_gen_q4",
    });
    expect(paid.category).toBe("paid_search");
    expect(paid.campaign).toBe("lead_gen_q4");
    expect(paid.medium).toBe("cpc");
  });

  it("classifies email newsletter campaigns", () => {
    const email = classifyTrafficSource({
      referrer: "https://mail.google.com/",
      siteHost: "arova.io",
      utmSource: "newsletter",
      utmMedium: "email",
      utmCampaign: "weekly_roundup",
    });
    expect(email.category).toBe("email");
    expect(email.medium).toBe("email");
  });

  it("classifies general web referrers", () => {
    const ref = classifyTrafficSource({
      referrer: "https://techcrunch.com/2026/10/startup-news",
      siteHost: "arova.io",
    });
    expect(ref.category).toBe("referral");
    expect(ref.referringDomain).toBe("techcrunch.com");
  });
});

describe("Analytics User Agent & Device Classifier", () => {
  it("detects desktop Chrome on Windows", () => {
    const ua =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    const res = parseUserAgent(ua);

    expect(res.deviceType).toBe("desktop");
    expect(res.browser).toBe("Chrome");
    expect(res.operatingSystem).toBe("Windows 10/11");
    expect(res.isBot).toBe(false);
  });

  it("detects mobile Safari on iPhone", () => {
    const ua =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1";
    const res = parseUserAgent(ua);

    expect(res.deviceType).toBe("mobile");
    expect(res.browser).toBe("Safari");
    expect(res.operatingSystem).toBe("iOS 17.4.1");
    expect(res.isBot).toBe(false);
  });

  it("detects tablet iPad", () => {
    const ua =
      "Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";
    const res = parseUserAgent(ua);

    expect(res.deviceType).toBe("tablet");
    expect(res.isBot).toBe(false);
  });

  it("identifies automated search bot crawlers", () => {
    const googleBot = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
    expect(parseUserAgent(googleBot).isBot).toBe(true);

    const headless = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 HeadlessChrome/120.0.0.0";
    expect(parseUserAgent(headless).isBot).toBe(true);
  });
});

describe("Privacy Geolocation Header Resolution", () => {
  it("extracts country and city from Cloudflare and Vercel headers without storing IP", () => {
    const headers = new Headers({
      "cf-ipcountry": "IN",
      "cf-region": "MH",
      "cf-ipcity": "Mumbai",
      "x-forwarded-for": "103.21.144.12",
    });

    const geo = resolveGeolocation(headers);
    expect(geo.country).toBe("IN");
    expect(geo.city).toBe("Mumbai");
    // Verify no IP property is returned or retained in geo
    expect((geo as any).ip).toBeUndefined();
  });
});
