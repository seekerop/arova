import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/security/roles";
import {
  enqueueJob,
  executeJob,
  pauseAgentWorkers,
  resumeAgentWorkers,
  setKillSwitch,
  stopJob,
  retryJob,
} from "@/lib/reddit/queue";

export async function POST(req: NextRequest) {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, jobId, active } = body;

    switch (action) {
      case "start_research": {
        // Enqueue opportunity scan job and execute it
        const job = await enqueueJob("opportunity_scan", { source: "manual_trigger" });
        // Execute synchronously in background or await immediately
        const completed = await executeJob(job.id);
        return NextResponse.json({ success: true, message: "Research completed", job: completed });
      }

      case "discover_communities": {
        const job = await enqueueJob("community_discovery");
        const completed = await executeJob(job.id);
        return NextResponse.json({ success: true, message: "Community discovery completed", job: completed });
      }

      case "generate_strategy": {
        const job = await enqueueJob("strategy_analysis");
        const completed = await executeJob(job.id);
        return NextResponse.json({ success: true, message: "Campaign strategy generated", job: completed });
      }

      case "pause": {
        await pauseAgentWorkers();
        return NextResponse.json({ success: true, message: "Agent workers paused" });
      }

      case "resume": {
        await resumeAgentWorkers();
        return NextResponse.json({ success: true, message: "Agent workers resumed" });
      }

      case "kill_switch": {
        await setKillSwitch(!!active);
        return NextResponse.json({
          success: true,
          message: active ? "Kill switch activated" : "Kill switch deactivated",
        });
      }

      case "stop_job": {
        if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });
        await stopJob(jobId);
        return NextResponse.json({ success: true, message: "Job stopped" });
      }

      case "retry_job": {
        if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });
        const job = await retryJob(jobId);
        return NextResponse.json({ success: true, message: "Job retried", job });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err: any) {
    console.error("[RedditAgentControlAPI] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to execute agent action" }, { status: 500 });
  }
}

