import { DeviceType, TrafficSourceCategory } from "./types";

const SEARCH_ENGINE_DOMAINS = [
  "google.",
  "bing.com",
  "yahoo.com",
  "duckduckgo.com",
  "baidu.com",
  "yandex.",
  "ecosia.org",
  "ask.com",
  "qwant.com",
  "naver.com",
  "sogou.com",
];

const SOCIAL_DOMAINS = [
  "twitter.com",
  "t.co",
  "x.com",
  "linkedin.com",
  "lnkd.in",
  "facebook.com",
  "m.facebook.com",
  "l.facebook.com",
  "lm.facebook.com",
  "fb.com",
  "instagram.com",
  "l.instagram.com",
  "reddit.com",
  "youtube.com",
  "youtu.be",
  "tiktok.com",
  "pinterest.com",
  "threads.net",
  "web.whatsapp.com",
  "t.me",
  "telegram.org",
];

const EMAIL_DOMAINS = [
  "mail.google.com",
  "outlook.live.com",
  "mail.yahoo.com",
  "webmail.",
  "mail.aol.com",
  "proton.me",
  "mail.proton.me",
];

export function extractHostname(url?: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Classifies traffic source given referrer and UTM parameters.
 */
export function classifyTrafficSource(params: {
  referrer?: string | null;
  siteHost?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}): {
  category: TrafficSourceCategory;
  sourceName: string;
  medium: string | null;
  campaign: string | null;
  referringDomain: string | null;
} {
  const { referrer, siteHost, utmSource, utmMedium, utmCampaign } = params;
  const refHost = extractHostname(referrer);
  const normalizedSiteHost = siteHost ? extractHostname(siteHost) : null;

  const medium = utmMedium ? utmMedium.trim().toLowerCase() : null;
  const source = utmSource ? utmSource.trim().toLowerCase() : null;
  const campaign = utmCampaign ? utmCampaign.trim() : null;

  // 1. Paid Search Check
  if (
    medium === "cpc" ||
    medium === "ppc" ||
    medium === "paid" ||
    medium === "paidsearch" ||
    medium === "cpa" ||
    medium === "cpv"
  ) {
    return {
      category: "paid_search",
      sourceName: source || refHost || "paid_search",
      medium,
      campaign,
      referringDomain: refHost,
    };
  }

  // 2. Email Campaign Check
  if (medium === "email" || (refHost && EMAIL_DOMAINS.some((d) => refHost.includes(d)))) {
    return {
      category: "email",
      sourceName: source || refHost || "email",
      medium: medium || "email",
      campaign,
      referringDomain: refHost,
    };
  }

  // 3. Social Media Check
  if (
    medium === "social" ||
    medium === "sm" ||
    medium === "social-network" ||
    (refHost && SOCIAL_DOMAINS.some((d) => refHost.includes(d)))
  ) {
    let socialName = source || refHost || "social";
    if (refHost) {
      if (refHost.includes("twitter") || refHost.includes("t.co") || refHost === "x.com") socialName = "X / Twitter";
      else if (refHost.includes("linkedin") || refHost.includes("lnkd.in")) socialName = "LinkedIn";
      else if (refHost.includes("facebook") || refHost.includes("fb.com")) socialName = "Facebook";
      else if (refHost.includes("instagram")) socialName = "Instagram";
      else if (refHost.includes("reddit")) socialName = "Reddit";
      else if (refHost.includes("youtube") || refHost.includes("youtu.be")) socialName = "YouTube";
      else if (refHost.includes("tiktok")) socialName = "TikTok";
      else if (refHost.includes("pinterest")) socialName = "Pinterest";
      else if (refHost.includes("threads")) socialName = "Threads";
    }
    return {
      category: "social",
      sourceName: socialName,
      medium: medium || "social",
      campaign,
      referringDomain: refHost,
    };
  }

  // 4. Organic Search Check
  if (refHost && SEARCH_ENGINE_DOMAINS.some((d) => refHost.includes(d))) {
    let engineName = "Search Engine";
    if (refHost.includes("google")) engineName = "Google Organic";
    else if (refHost.includes("bing")) engineName = "Bing Organic";
    else if (refHost.includes("yahoo")) engineName = "Yahoo Organic";
    else if (refHost.includes("duckduckgo")) engineName = "DuckDuckGo";
    else if (refHost.includes("baidu")) engineName = "Baidu";
    else if (refHost.includes("yandex")) engineName = "Yandex";
    else if (refHost.includes("ecosia")) engineName = "Ecosia";

    return {
      category: "organic_search",
      sourceName: engineName,
      medium: medium || "organic",
      campaign,
      referringDomain: refHost,
    };
  }

  // 5. Custom Campaign
  if (source || campaign) {
    return {
      category: "campaign",
      sourceName: source || "campaign",
      medium,
      campaign,
      referringDomain: refHost,
    };
  }

  // 6. Direct Traffic (No referrer, or internal self-referral)
  if (!refHost || (normalizedSiteHost && refHost === normalizedSiteHost)) {
    return {
      category: "direct",
      sourceName: "Direct",
      medium: null,
      campaign: null,
      referringDomain: null,
    };
  }

  // 7. General Web Referral
  return {
    category: "referral",
    sourceName: refHost,
    medium: "referral",
    campaign: null,
    referringDomain: refHost,
  };
}

/**
 * Lightweight, zero-dependency User-Agent analyzer.
 */
export function parseUserAgent(userAgent?: string | null): {
  deviceType: DeviceType;
  browser: string;
  browserVersion: string;
  operatingSystem: string;
  isBot: boolean;
} {
  const ua = userAgent || "";

  // Bot detection
  const isBot = /bot|crawler|spider|crawling|googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou|exabot|facebot|facebookexternalhit|ia_archiver|headlesschrome|lighthouse|bytespider/i.test(
    ua
  );

  // Device classification
  let deviceType: DeviceType = "desktop";
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) {
    deviceType = "tablet";
  } else if (/Android/i.test(ua) && !/Mobile/i.test(ua)) {
    deviceType = "tablet";
  } else if (/Mobi|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    deviceType = "mobile";
  }

  // Browser detection
  let browser = "Other";
  let browserVersion = "";

  if (/Edg(?:e|A|iOS)?\/([0-9.]+)/i.test(ua)) {
    browser = "Microsoft Edge";
    browserVersion = RegExp.$1.split(".")[0];
  } else if (/OPR\/([0-9.]+)|Opera\/([0-9.]+)/i.test(ua)) {
    browser = "Opera";
    browserVersion = (RegExp.$1 || RegExp.$2).split(".")[0];
  } else if (/SamsungBrowser\/([0-9.]+)/i.test(ua)) {
    browser = "Samsung Internet";
    browserVersion = RegExp.$1.split(".")[0];
  } else if (/Brave\/([0-9.]+)/i.test(ua)) {
    browser = "Brave";
    browserVersion = RegExp.$1.split(".")[0];
  } else if (/Chrome\/([0-9.]+)/i.test(ua)) {
    browser = "Chrome";
    browserVersion = RegExp.$1.split(".")[0];
  } else if (/Firefox\/([0-9.]+)/i.test(ua)) {
    browser = "Firefox";
    browserVersion = RegExp.$1.split(".")[0];
  } else if (/Version\/([0-9.]+).*Safari/i.test(ua)) {
    browser = "Safari";
    browserVersion = RegExp.$1.split(".")[0];
  } else if (/Safari\/([0-9.]+)/i.test(ua)) {
    browser = "Safari";
    browserVersion = RegExp.$1.split(".")[0];
  }

  // Operating System detection
  let operatingSystem = "Other";
  if (/Windows NT 10.0/i.test(ua)) operatingSystem = "Windows 10/11";
  else if (/Windows NT 6.3/i.test(ua)) operatingSystem = "Windows 8.1";
  else if (/Windows NT 6.1/i.test(ua)) operatingSystem = "Windows 7";
  else if (/Windows/i.test(ua)) operatingSystem = "Windows";
  else if (/iPhone OS ([0-9_]+)/i.test(ua)) operatingSystem = `iOS ${RegExp.$1.replace(/_/g, ".")}`;
  else if (/iPad.*OS ([0-9_]+)/i.test(ua)) operatingSystem = `iPadOS ${RegExp.$1.replace(/_/g, ".")}`;
  else if (/Mac OS X ([0-9_]+)/i.test(ua)) operatingSystem = `macOS`;
  else if (/Android ([0-9.]+)/i.test(ua)) operatingSystem = `Android ${RegExp.$1}`;
  else if (/CrOS/i.test(ua)) operatingSystem = "Chrome OS";
  else if (/Linux/i.test(ua)) operatingSystem = "Linux";

  return {
    deviceType,
    browser,
    browserVersion,
    operatingSystem,
    isBot,
  };
}

/**
 * Privacy-conscious transient geolocation lookup.
 * Derives approximate Country, Region, City from request headers or IP,
 * and DISCARDS the IP address immediately without permanent storage.
 */
export function resolveGeolocation(headers: Headers): {
  country: string;
  region: string;
  city: string;
} {
  // Cloudflare headers
  const cfCountry = headers.get("cf-ipcountry");
  const cfRegion = headers.get("cf-region");
  const cfCity = headers.get("cf-ipcity");

  // Vercel headers
  const vercelCountry = headers.get("x-vercel-ip-country");
  const vercelRegion = headers.get("x-vercel-ip-country-region");
  const vercelCity = headers.get("x-vercel-ip-city");

  let country = cfCountry || vercelCountry;
  let region = cfRegion || vercelRegion;
  let city = cfCity || vercelCity;

  if (country) {
    return {
      country: country === "XX" ? "Unknown" : country,
      region: region || "Unknown",
      city: city ? decodeURIComponent(city) : "Unknown",
    };
  }

  // Check client IP for local loopback / development
  const forwardedFor = headers.get("x-forwarded-for");
  const realIp = headers.get("x-real-ip");
  const clientIp = (forwardedFor ? forwardedFor.split(",")[0].trim() : realIp) || "";

  if (
    clientIp === "127.0.0.1" ||
    clientIp === "::1" ||
    clientIp.startsWith("192.168.") ||
    clientIp.startsWith("10.") ||
    clientIp.startsWith("172.") ||
    !clientIp
  ) {
    return {
      country: "India",
      region: "Maharashtra",
      city: "Mumbai",
    };
  }

  return {
    country: "Unknown",
    region: "Unknown",
    city: "Unknown",
  };
}
