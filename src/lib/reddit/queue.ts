import { getDbPool } from "@/lib/db";
import { getRedditSettings, updateRedditSettings, getOpportunities } from "./db";
import { logAgentActivity } from "./logger";
import { runCommunityDiscoveryAgent } from "./agents/discovery";
import { runOpportunityScannerAgent } from "./agents/scanner";
import { generateRedditContent } from "./agents/content";
import { runCampaignStrategyAgent } from "./agents/strategy";
import { scoreOpportunity } from "./agents/scoring";
import { RedditScanJob } from "./types";

export async function enqueueJob(
  jobType: RedditScanJob["job_type"],
  parameters: Record<string, any> = {},
  targetCommunity?: string
): Promise<RedditScanJob> {
  const pool = getDbPool();
  const res = await pool.query(
    `INSERT INTO reddit_scan_jobs (job_type, status, target_community, parameters, created_at)
     VALUES ($1, 'queued', $2, $3, NOW())
     RETURNING *`,
    [jobType, targetCommunity || null, JSON.stringify(parameters)]
  );

  const job = res.rows[0] as RedditScanJob;
  await logAgentActivity(
    "Queue Worker",
    `Enqueued background job [${job.id.slice(0, 8)}] (${jobType})`,
    "info",
    { jobId: job.id, jobType, parameters }
  );

  return job;
}

export async function executeJob(jobId: string): Promise<RedditScanJob> {
  const pool = getDbPool();
  const settings = await getRedditSettings();

  if (settings.kill_switch_active) {
    await pool.query(
      `UPDATE reddit_scan_jobs SET status = 'cancelled', error_message = 'Execution blocked: Kill switch is active' WHERE id = $1`,
      [jobId]
    );
    await logAgentActivity("Queue Worker", `Job [${jobId.slice(0, 8)}] aborted: Kill switch active`, "warn");
    const res = await pool.query(`SELECT * FROM reddit_scan_jobs WHERE id = $1`, [jobId]);
    return res.rows[0] as RedditScanJob;
  }

  if (settings.is_paused) {
    await logAgentActivity("Queue Worker", `Job [${jobId.slice(0, 8)}] held: Agent processing is paused`, "info");
    const res = await pool.query(`SELECT * FROM reddit_scan_jobs WHERE id = $1`, [jobId]);
    return res.rows[0] as RedditScanJob;
  }

  // Mark job running
  await pool.query(
    `UPDATE reddit_scan_jobs SET status = 'running', started_at = NOW() WHERE id = $1`,
    [jobId]
  );

  const jobRes = await pool.query(`SELECT * FROM reddit_scan_jobs WHERE id = $1`, [jobId]);
  const job = jobRes.rows[0] as RedditScanJob;

  try {
    let resultsCount = 0;

    switch (job.job_type) {
      case "community_discovery": {
        const disc = await runCommunityDiscoveryAgent(job.parameters?.category);
        resultsCount = disc.discovered;
        break;
      }

      case "opportunity_scan": {
        const scan = await runOpportunityScannerAgent({
          category: job.parameters?.category,
          community_name: job.target_community || job.parameters?.community_name,
          manual_url: job.parameters?.manual_url,
          manual_title: job.parameters?.manual_title,
          manual_content: job.parameters?.manual_content,
          min_score_threshold: settings.min_scoring_threshold,
        });
        resultsCount = scan.scannedCount;
        break;
      }

      case "scoring": {
        const opps = await getOpportunities({ status: "discovered" });
        for (const opp of opps) {
          const scored = scoreOpportunity({
            title: opp.title,
            content: opp.content || "",
            community_name: opp.community_name,
            minThreshold: settings.min_scoring_threshold,
          });
          await pool.query(
            `UPDATE reddit_opportunities
             SET score = $1, intent_score = $2, urgency_score = $3, reach_score = $4, is_high_intent = $5
             WHERE id = $6`,
            [scored.score, scored.intent_score, scored.urgency_score, scored.reach_score, scored.is_high_intent, opp.id]
          );
        }
        resultsCount = opps.length;
        break;
      }

      case "content_generation": {
        const opps = await getOpportunities({ is_high_intent: true, status: "discovered" });
        const targets = opps.slice(0, 3); // generate drafts for top 3 high intent
        for (const opp of targets) {
          await generateRedditContent({ opportunity: opp });
          await pool.query(`UPDATE reddit_opportunities SET status = 'drafted' WHERE id = $1`, [opp.id]);
        }
        resultsCount = targets.length;
        break;
      }

      case "strategy_analysis": {
        const categories = [
          "Website & E-commerce",
          "Programming & Software",
          "Digital Marketing & SEO",
          "Video Editing & Production",
          "Design & Creative",
        ];
        for (const cat of categories) {
          await runCampaignStrategyAgent(cat);
        }
        resultsCount = categories.length;
        break;
      }
    }

    await pool.query(
      `UPDATE reddit_scan_jobs
       SET status = 'completed', results_count = $1, completed_at = NOW()
       WHERE id = $2`,
      [resultsCount, jobId]
    );

    await logAgentActivity(
      "Queue Worker",
      `Job [${jobId.slice(0, 8)}] completed successfully with ${resultsCount} results`,
      "success",
      { jobId, resultsCount }
    );
  } catch (err: any) {
    await pool.query(
      `UPDATE reddit_scan_jobs
       SET status = 'failed', error_message = $1, completed_at = NOW()
       WHERE id = $2`,
      [err.message || "Unknown error", jobId]
    );

    await logAgentActivity(
      "Queue Worker",
      `Job [${jobId.slice(0, 8)}] failed: ${err.message}`,
      "error",
      { jobId, error: err.message }
    );
  }

  const finalRes = await pool.query(`SELECT * FROM reddit_scan_jobs WHERE id = $1`, [jobId]);
  return finalRes.rows[0] as RedditScanJob;
}

export async function stopJob(jobId: string): Promise<void> {
  const pool = getDbPool();
  await pool.query(
    `UPDATE reddit_scan_jobs SET status = 'cancelled', error_message = 'Cancelled by operator' WHERE id = $1`,
    [jobId]
  );
  await logAgentActivity("Queue Worker", `Job [${jobId.slice(0, 8)}] manually stopped`, "warn", { jobId });
}

export async function retryJob(jobId: string): Promise<RedditScanJob> {
  const pool = getDbPool();
  await pool.query(
    `UPDATE reddit_scan_jobs SET status = 'queued', error_message = NULL, started_at = NULL, completed_at = NULL WHERE id = $1`,
    [jobId]
  );
  await logAgentActivity("Queue Worker", `Job [${jobId.slice(0, 8)}] requeued for retry`, "info", { jobId });
  return executeJob(jobId);
}

export async function pauseAgentWorkers(): Promise<void> {
  await updateRedditSettings({ is_paused: true });
  await logAgentActivity("System", "Agent execution PAUSED by operator", "warn");
}

export async function resumeAgentWorkers(): Promise<void> {
  await updateRedditSettings({ is_paused: false });
  await logAgentActivity("System", "Agent execution RESUMED by operator", "info");
}

export async function setKillSwitch(active: boolean): Promise<void> {
  await updateRedditSettings({ kill_switch_active: active });
  await logAgentActivity(
    "Security",
    active ? "EMERGENCY KILL SWITCH ACTIVATED — all outbound tasks cancelled" : "Emergency Kill Switch deactivated",
    active ? "error" : "info"
  );
}

export async function getRecentJobs(limit: number = 20): Promise<RedditScanJob[]> {
  const pool = getDbPool();
  const res = await pool.query(
    `SELECT * FROM reddit_scan_jobs ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
  return res.rows as RedditScanJob[];
}

