import { NextRequest, NextResponse } from "next/server";
import { runScheduledAutomation } from "@/lib/cron/worker";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        { error: "Server CRON_SECRET is not configured" },
        { status: 500 }
      );
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing Bearer token" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    if (token !== cronSecret) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    const result = await runScheduledAutomation("cron");
    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error("Cron automation error:", err);
    return NextResponse.json(
      { error: err.message || "Scheduled job failed" },
      { status: 500 }
    );
  }
}

