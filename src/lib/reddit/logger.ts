import { getDbPool } from "@/lib/db";
import { RedditAgentLog } from "./types";

export async function logAgentActivity(
  agentName: string,
  action: string,
  level: "info" | "warn" | "error" | "success" = "info",
  details: Record<string, any> = {}
): Promise<RedditAgentLog | null> {
  try {
    const pool = getDbPool();
    const res = await pool.query(
      `INSERT INTO reddit_agent_logs (agent_name, level, action, details, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [agentName, level, action, JSON.stringify(details)]
    );
    return res.rows[0] as RedditAgentLog;
  } catch (err) {
    if (process.env.NODE_ENV !== "test") {
      console.error("[RedditAgentLogger] Failed to write log:", err);
    }
    return null;
  }
}

export async function getRecentAgentLogs(limit: number = 50, since?: string): Promise<RedditAgentLog[]> {
  const pool = getDbPool();
  let query = `SELECT * FROM reddit_agent_logs`;
  const params: any[] = [];

  if (since) {
    query += ` WHERE created_at > $1`;
    params.push(since);
  }

  query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
  params.push(limit);

  const res = await pool.query(query, params);
  return res.rows as RedditAgentLog[];
}
