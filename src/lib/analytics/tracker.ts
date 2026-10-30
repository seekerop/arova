"use client";

import { AnalyticsEventPayload } from "./types";

const VISITOR_ID_KEY = "_arova_vid";
const SESSION_ID_KEY = "_arova_sid";
const SESSION_EXPIRY_KEY = "_arova_sexp";
const SESSION_UTM_KEY = "_arova_sutm";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    let vid = localStorage.getItem(VISITOR_ID_KEY);
    if (!vid) {
      vid = generateUUID();
      localStorage.setItem(VISITOR_ID_KEY, vid);
    }
    return vid;
  } catch {
    return generateUUID();
  }
}

export function getOrCreateSessionId(): { sessionId: string; isNew: boolean } {
  if (typeof window === "undefined") return { sessionId: "", isNew: false };
  try {
    const now = Date.now();
    const expStr = localStorage.getItem(SESSION_EXPIRY_KEY);
    const exp = expStr ? parseInt(expStr, 10) : 0;
    let sid = sessionStorage.getItem(SESSION_ID_KEY);

    if (!sid || !exp || now > exp) {
      sid = generateUUID();
      sessionStorage.setItem(SESSION_ID_KEY, sid);
      localStorage.setItem(SESSION_EXPIRY_KEY, (now + SESSION_TIMEOUT_MS).toString());
      return { sessionId: sid, isNew: true };
    }

    // Refresh expiry
    localStorage.setItem(SESSION_EXPIRY_KEY, (now + SESSION_TIMEOUT_MS).toString());
    return { sessionId: sid, isNew: false };
  } catch {
    return { sessionId: generateUUID(), isNew: true };
  }
}

export function captureAndStoreUTMs(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
    const found: Record<string, string> = {};

    let hasUtm = false;
    for (const k of utmKeys) {
      const val = params.get(k);
      if (val) {
        found[k] = val;
        hasUtm = true;
      }
    }

    if (hasUtm) {
      sessionStorage.setItem(SESSION_UTM_KEY, JSON.stringify(found));
      return found;
    }

    const saved = sessionStorage.getItem(SESSION_UTM_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export function isAnalyticsDisabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    // Exclude admin pages from public website traffic tracking
    if (window.location.pathname.startsWith("/admin")) {
      return true;
    }
    // Check opt-out
    if (localStorage.getItem("_arova_disable_analytics") === "true") {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

let eventQueue: AnalyticsEventPayload[] = [];
let flushTimeout: NodeJS.Timeout | null = null;

export async function flushEventQueue() {
  if (eventQueue.length === 0) return;
  const eventsToSend = [...eventQueue];
  eventQueue = [];

  try {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify({ events: eventsToSend })], {
        type: "application/json",
      });
      navigator.sendBeacon("/api/analytics/track", blob);
    } else {
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: eventsToSend }),
        keepalive: true,
      });
    }
  } catch (err) {
    console.warn("Analytics flush failed:", err);
  }
}

export function sendEvent(
  eventName: string,
  properties: Record<string, any> = {},
  immediate = false
) {
  if (isAnalyticsDisabled()) return;

  const visitorId = getOrCreateVisitorId();
  const { sessionId } = getOrCreateSessionId();
  const utms = captureAndStoreUTMs();

  const payload: AnalyticsEventPayload = {
    eventName,
    visitorId,
    sessionId,
    pagePath: window.location.pathname,
    pageTitle: document.title,
    referrer: document.referrer || undefined,
    eventProperties: properties,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    viewportSize: `${window.innerWidth}x${window.innerHeight}`,
    scrollDepth: properties.scrollDepth,
    utmSource: utms.utm_source,
    utmMedium: utms.utm_medium,
    utmCampaign: utms.utm_campaign,
    utmTerm: utms.utm_term,
    utmContent: utms.utm_content,
    timestamp: new Date().toISOString(),
  };

  if (immediate) {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      navigator.sendBeacon("/api/analytics/track", blob);
    } else {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  } else {
    eventQueue.push(payload);
    if (!flushTimeout) {
      flushTimeout = setTimeout(() => {
        flushTimeout = null;
        flushEventQueue();
      }, 1500); // 1.5s batching
    }
  }
}

/**
 * Public helper for developers to track custom events
 */
export function trackEvent(name: string, properties: Record<string, any> = {}) {
  sendEvent(name, properties, false);
}

// Expose on global window object
if (typeof window !== "undefined") {
  (window as any).arovaAnalytics = {
    trackEvent,
    getVisitorId: getOrCreateVisitorId,
    getSessionId: () => getOrCreateSessionId().sessionId,
  };
}
