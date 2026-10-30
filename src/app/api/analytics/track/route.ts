import { NextRequest, NextResponse } from "next/server";
import { ingestAnalyticsEvent, ingestBatchAnalyticsEvents } from "@/lib/analytics/service";
import { AnalyticsEventPayload } from "@/lib/analytics/types";

// In-memory rate limiting map for basic ingestion flood protection (IP -> count)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 }); // 1 min window
    return false;
  }
  entry.count++;
  return entry.count > 300; // max 300 analytics events per minute per IP
}

export async function POST(req: NextRequest) {
  try {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    let body: any;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      // Handle sendBeacon plain text or URL-encoded
      const text = await req.text();
      try {
        body = JSON.parse(text);
      } catch {
        return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
      }
    }

    const host = req.headers.get("host") || null;

    // Check if batch
    if (Array.isArray(body?.events)) {
      const res = await ingestBatchAnalyticsEvents(body.events as AnalyticsEventPayload[], req.headers, host);
      return NextResponse.json(res);
    }

    // Single event
    if (body?.eventName && body?.visitorId && body?.sessionId) {
      const res = await ingestAnalyticsEvent(body as AnalyticsEventPayload, req.headers, host);
      return NextResponse.json(res);
    }

    return NextResponse.json({ error: "Missing required event fields" }, { status: 400 });
  } catch (err: any) {
    console.error("Analytics track error:", err);
    // Always return 200 or graceful response so visitor browser never breaks
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
