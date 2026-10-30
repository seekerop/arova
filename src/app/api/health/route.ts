import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "not_configured";
  let dbLatencyMs: number | null = null;

  if (process.env.DATABASE_URL) {
    try {
      const dbStart = Date.now();
      const pool = getDbPool();
      await pool.query("SELECT 1");
      dbLatencyMs = Date.now() - dbStart;
      dbStatus = "connected";
    } catch (err: any) {
      dbStatus = "error";
    }
  }

  const responseTimeMs = Date.now() - startTime;

  return NextResponse.json(
    {
      status: "ok",
      service: "arova",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      responseTimeMs,
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "X-Health-Check": "arova-alive",
      },
    }
  );
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Health-Check": "arova-alive",
    },
  });
}
