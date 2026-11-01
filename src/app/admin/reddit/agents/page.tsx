"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Play,
  Pause,
  AlertOctagon,
  RefreshCw,
  Cpu,
  Activity,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Terminal,
  Key,
} from "lucide-react";
import { RedditAgentLog } from "@/lib/reddit/types";

export default function RedditAgentsLiveConsolePage() {
  const [logs, setLogs] = useState<RedditAgentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "warn" | "error"; message: string } | null>(null);

  const fetchLogsAndStatus = async () => {
    try {
      const [logsRes, overviewRes] = await Promise.all([
        fetch("/api/admin/reddit/logs?limit=60"),
        fetch("/api/admin/reddit/overview"),
      ]);

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData.logs || []);
      }
      if (overviewRes.ok) {
        const overviewData = await overviewRes.json();
        setSettings(overviewData.settings);
      }
    } catch (err) {
      console.error("Failed to load logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogsAndStatus();
    if (!autoRefresh) return;
    const interval = setInterval(fetchLogsAndStatus, 4000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleAgentControl = async (action: string, payload: any = {}) => {
    setActionLoading(action);
    setFeedback({ type: "warn", message: `Executing ${action.replace(/_/g, " ")}...` });
    try {
      const res = await fetch("/api/admin/reddit/agents/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.warning) {
          setFeedback({ type: "warn", message: `${data.message} (${data.warning})` });
        } else {
          setFeedback({ type: "success", message: data.message || "Action completed successfully!" });
        }
        await fetchLogsAndStatus();
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to execute action." });
      }
    } catch (err: any) {
      console.error("Control action error:", err);
      setFeedback({ type: "error", message: err.message || "Network error executing action." });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[rgba(243,240,232,0.08)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#F3F0E8]">
              Autonomous Agent Console &amp; Execution Logs
            </h1>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34D399]"></span>
            </span>
          </div>
          <p className="text-xs text-[#A39E93] mt-1">
            Real-time telemetry and supervisory controls for the 6 modular Reddit Growth Agents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-[#A39E93] cursor-pointer mr-2 select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-[#161514] border-[rgba(243,240,232,0.2)] text-[#E84B2C] focus:ring-0"
            />
            <span>Live Auto-Poll (4s)</span>
          </label>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogsAndStatus}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Feedback / Notification Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-lg border text-xs flex items-center justify-between gap-3 ${
            feedback.type === "success"
              ? "bg-[#34D399]/10 border-[#34D399]/30 text-[#34D399]"
              : feedback.type === "warn"
              ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#34D399]" />
            ) : feedback.type === "warn" ? (
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            ) : (
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{feedback.message}</span>
          </div>

          <button
            onClick={() => setFeedback(null)}
            className="text-xs opacity-75 hover:opacity-100 font-mono px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Groq Key Configuration Warning */}
      {settings && !settings.has_groq_key && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-amber-300">
          <div className="flex items-center gap-2.5">
            <Key className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Groq API Key is not configured.</strong> The agents will execute using pre-configured deterministic category templates. To enable live Groq LLM inference, configure your key.
            </span>
          </div>
          <Link href="/admin/reddit/settings">
            <Button variant="secondary" size="sm" className="h-7 text-xs text-[#FFAA3D] shrink-0 border border-amber-500/30">
              Configure Groq Key →
            </Button>
          </Link>
        </div>
      )}

      {/* Control Station & Live Status Bar */}
      <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[rgba(232,75,44,0.15)] border border-[rgba(232,75,44,0.3)] flex items-center justify-center text-[#E84B2C]">
              <Bot className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#F3F0E8]">
                  Groq AI Engine:
                </span>
                <span className="text-xs font-mono text-[#FFAA3D]">
                  {settings?.ai_model || "llama-3.3-70b-versatile"}
                </span>

                {settings?.kill_switch_active ? (
                  <Badge variant="destructive" className="text-[10px]">KILL SWITCH ACTIVE</Badge>
                ) : settings?.is_paused ? (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">PAUSED</Badge>
                ) : !settings?.has_groq_key ? (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] flex items-center gap-1">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    KEY MISSING (TEMPLATE FALLBACK)
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-[#34D399]/10 text-[#34D399] border-[#34D399]/20 text-[10px]">OPERATIONAL (GROQ ACTIVE)</Badge>
                )}
              </div>
              <p className="text-[11px] text-[#A39E93] mt-0.5">
                6 Autonomous Agents: Community Discovery • Opportunity Scanner • Scoring Engine • Content Generator • Compliance Guard • Campaign Strategy
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleAgentControl("start_research")}
              isLoading={actionLoading === "start_research"}
              disabled={settings?.kill_switch_active}
              className="text-xs"
            >
              <Play className="w-3.5 h-3.5 mr-1.5" />
              Start Research
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleAgentControl("discover_communities")}
              isLoading={actionLoading === "discover_communities"}
              disabled={settings?.kill_switch_active}
              className="text-xs"
            >
              <Activity className="w-3.5 h-3.5 mr-1.5" />
              Scan Communities
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleAgentControl("generate_strategy")}
              isLoading={actionLoading === "generate_strategy"}
              disabled={settings?.kill_switch_active}
              className="text-xs"
            >
              <Cpu className="w-3.5 h-3.5 mr-1.5" />
              Strategy Agent
            </Button>

            {settings?.is_paused ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAgentControl("resume")}
                isLoading={actionLoading === "resume"}
                className="text-xs text-[#34D399]"
              >
                <Play className="w-3.5 h-3.5 mr-1.5" />
                Resume Workers
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAgentControl("pause")}
                isLoading={actionLoading === "pause"}
                className="text-xs text-amber-400"
              >
                <Pause className="w-3.5 h-3.5 mr-1.5" />
                Pause Workers
              </Button>
            )}

            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleAgentControl("kill_switch", { active: !settings?.kill_switch_active })}
              isLoading={actionLoading === "kill_switch"}
              className="text-xs"
            >
              <AlertOctagon className="w-3.5 h-3.5 mr-1.5" />
              {settings?.kill_switch_active ? "Deactivate Kill Switch" : "Emergency Kill Switch"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Terminal Live Activity Log Window */}
      <Card className="bg-[#0D0D0C] border-[rgba(243,240,232,0.08)] overflow-hidden font-mono text-xs">
        <div className="px-4 py-3 bg-[#111110] border-b border-[rgba(243,240,232,0.06)] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#A39E93]">
            <Terminal className="w-4 h-4 text-[#E84B2C]" />
            <span className="font-semibold text-[#F3F0E8] text-xs">Live Backend Agent Execution Stream</span>
          </div>

          <span className="text-[10px] text-[#A39E93]">
            {logs.length} events logged to database
          </span>
        </div>

        <div className="p-4 max-h-[550px] overflow-y-auto space-y-2 divide-y divide-[rgba(243,240,232,0.04)]">
          {loading && logs.length === 0 ? (
            <div className="py-12 text-center text-[#A39E93]">
              <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-[#E84B2C]" />
              Connecting to agent log stream...
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-[#A39E93]">
              No agent events logged yet. Click &quot;Start Research&quot; above to initialize the workflow.
            </div>
          ) : (
            logs.map((log) => {
              const levelColor =
                log.level === "success"
                  ? "text-[#34D399]"
                  : log.level === "warn"
                  ? "text-amber-400"
                  : log.level === "error"
                  ? "text-rose-400"
                  : "text-blue-400";

              return (
                <div key={log.id} className="pt-2 flex items-start gap-3">
                  <span className="text-[10px] text-[#A39E93] shrink-0 font-mono mt-0.5">
                    {new Date(log.created_at).toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>

                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase shrink-0 ${levelColor} bg-[#161514] border border-[rgba(243,240,232,0.08)]`}>
                    {log.agent_name}
                  </span>

                  <div className="space-y-0.5 flex-1 min-w-0">
                    <p className="text-xs text-[#F3F0E8] leading-tight">
                      {log.action}
                    </p>

                    {log.details && Object.keys(log.details).length > 0 && (
                      <pre className="text-[10px] text-[#A39E93] overflow-x-auto bg-[#141312] p-1.5 rounded mt-1 border border-[rgba(243,240,232,0.04)]">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}

