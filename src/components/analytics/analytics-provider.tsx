"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { sendEvent, flushEventQueue, isAnalyticsDisabled } from "@/lib/analytics/tracker";

export function AnalyticsProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef<string | null>(null);
  const scrollMilestones = useRef<Set<number>>(new Set());

  // 1. Page View Tracking (Handles SPA navigation & avoid duplicates)
  useEffect(() => {
    if (isAnalyticsDisabled()) return;

    const fullPath = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    // Prevent duplicate pageview for identical consecutive path
    if (lastTrackedPath.current === fullPath) return;
    lastTrackedPath.current = fullPath;

    // Reset scroll milestones for new page
    scrollMilestones.current = new Set();

    // Small delay to allow document.title to update on client
    const timer = setTimeout(() => {
      sendEvent("page_view", {
        path: pathname,
        search: searchParams?.toString() || "",
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // 2. Scroll Depth Tracking
  useEffect(() => {
    if (isAnalyticsDisabled()) return;

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        ticking = false;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const winHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        const totalScrollable = docHeight - winHeight;

        if (totalScrollable <= 0) return;

        const currentPct = Math.min(100, Math.round(((scrollTop + winHeight) / docHeight) * 100));

        const milestones = [25, 50, 75, 90, 100];
        for (const m of milestones) {
          if (currentPct >= m && !scrollMilestones.current.has(m)) {
            scrollMilestones.current.add(m);
            sendEvent("scroll_depth", { scrollDepth: m });
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // 3. Outbound Link & CTA Click Tracking
  useEffect(() => {
    if (isAnalyticsDisabled()) return;

    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a, button, [data-cta]");
      if (!target) return;

      const tagName = target.tagName.toLowerCase();

      // Outbound Link Click
      if (tagName === "a") {
        const anchor = target as HTMLAnchorElement;
        const href = anchor.href;
        if (href && href.startsWith("http")) {
          try {
            const destHost = new URL(href).hostname.toLowerCase();
            const currHost = window.location.hostname.toLowerCase();
            if (destHost !== currHost && !destHost.includes(currHost)) {
              sendEvent("outbound_link_click", {
                destinationUrl: href,
                destinationDomain: destHost,
                linkText: anchor.textContent?.trim().slice(0, 100),
              });
            }
          } catch {
            // ignore malformed URLs
          }
        }
      }

      // CTA Click
      const isCta =
        target.hasAttribute("data-cta") ||
        target.getAttribute("role") === "button" ||
        target.classList.contains("btn") ||
        tagName === "button";

      if (isCta) {
        sendEvent("cta_click", {
          element: tagName,
          text: target.textContent?.trim().slice(0, 80),
          ctaName: target.getAttribute("data-cta") || undefined,
        });
      }
    };

    document.addEventListener("click", handleClick, { passive: true });
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // 4. Active Engagement Heartbeat & Page Unload
  useEffect(() => {
    if (isAnalyticsDisabled()) return;

    // Send a keep-alive ping every 25 seconds while tab is active and visible
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        sendEvent("session_ping", { active: true });
      }
    }, 25000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushEventQueue();
      }
    };

    const handleBeforeUnload = () => {
      flushEventQueue();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return null;
}
