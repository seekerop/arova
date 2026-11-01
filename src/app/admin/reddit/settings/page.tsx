"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import {
  Sliders,
  ShieldCheck,
  ShieldAlert,
  Bot,
  Key,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Lock,
} from "lucide-react";

export default function RedditSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [detectingModels, setDetectingModels] = useState(false);
  const [detectedModels, setDetectedModels] = useState<string[]>([]);
  const [modelMessage, setModelMessage] = useState<string | null>(null);

  // Form State
  const [aiModel, setAiModel] = useState("openai/gpt-oss-120b");
  const [groqApiKey, setGroqApiKey] = useState("");
  const [publishingMode, setPublishingMode] = useState<"manual" | "api">("manual");
  const [minScoringThreshold, setMinScoringThreshold] = useState(65);
  const [dailyPostLimit, setDailyPostLimit] = useState(3);
  const [dailyCommentLimit, setDailyCommentLimit] = useState(8);
  const [autoSchedule, setAutoSchedule] = useState(false);
  const [redditClientId, setRedditClientId] = useState("");
  const [redditClientSecret, setRedditClientSecret] = useState("");
  const [redditUsername, setRedditUsername] = useState("");
  const [killSwitchActive, setKillSwitchActive] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reddit/settings");
      if (res.ok) {
        const data = await res.json();
        const s = data.settings;
        if (s) {
          setAiModel(s.ai_model || "openai/gpt-oss-120b");
          setGroqApiKey(s.groq_api_key || "");
          setPublishingMode(s.publishing_mode || "manual");
          setMinScoringThreshold(s.min_scoring_threshold ?? 65);
          setDailyPostLimit(s.daily_post_limit ?? 3);
          setDailyCommentLimit(s.daily_comment_limit ?? 8);
          setAutoSchedule(!!s.auto_schedule);
          setRedditClientId(s.reddit_client_id || "");
          setRedditClientSecret(s.reddit_client_secret || "");
          setRedditUsername(s.reddit_username || "");
          setKillSwitchActive(!!s.kill_switch_active);
        }
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDetectModels = async () => {
    setDetectingModels(true);
    setModelMessage(null);
    try {
      const res = await fetch("/api/admin/reddit/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "detect_models",
          groq_api_key: groqApiKey,
        }),
      });

      const data = await res.json();
      if (res.ok && Array.isArray(data.models) && data.models.length > 0) {
        setDetectedModels(data.models);
        setModelMessage(`✔ Successfully detected ${data.models.length} active models on your Groq account.`);
        if (!data.models.includes(aiModel)) {
          setAiModel(data.models[0]);
        }
      } else {
        setModelMessage(`⚠ Could not retrieve models: ${data.error || "No active text models found"}`);
      }
    } catch (err: any) {
      setModelMessage(`⚠ Error querying Groq: ${err.message}`);
    } finally {
      setDetectingModels(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/reddit/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ai_model: aiModel,
          groq_api_key: groqApiKey,
          publishing_mode: publishingMode,
          min_scoring_threshold: minScoringThreshold,
          daily_post_limit: dailyPostLimit,
          daily_comment_limit: dailyCommentLimit,
          auto_schedule: autoSchedule,
          reddit_client_id: redditClientId,
          reddit_client_secret: redditClientSecret,
          reddit_username: redditUsername,
          kill_switch_active: killSwitchActive,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to update settings:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[rgba(243,240,232,0.08)]">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#F3F0E8]">
            Reddit Growth Agent Configuration
          </h1>
          <p className="text-xs text-[#A39E93] mt-1">
            Configure Groq AI keys, model routing, publishing safeguards, and operational thresholds.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          isLoading={saving}
          className="text-xs"
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-[#34D399]" />
              Saved to Database
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Save Configuration
            </>
          )}
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Groq AI Model Configuration */}
        <Card className="p-6 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-[#F3F0E8] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#E84B2C]" />
              Groq AI Intelligence Engine
            </h3>
            <Badge variant="outline" className="text-[10px] bg-[#161514] text-[#FFAA3D]">
              Ultra-low Latency Inference
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#D0CBC1]">
                Groq AI Model Selection *
              </label>
              <Select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="text-xs font-mono"
              >
                <option value="openai/gpt-oss-120b">openai/gpt-oss-120b (Recommended - 120B High Nuance)</option>
                <option value="openai/gpt-oss-20b">openai/gpt-oss-20b (Ultra Fast - 20B)</option>
                <option value="qwen/qwen3.8-27b">qwen/qwen3.8-27b (Qwen 27B)</option>
                <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Meta Llama 3.3)</option>
                <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Fastest)</option>
                {detectedModels
                  .filter((m) => !["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b", "llama-3.3-70b-versatile", "llama-3.1-8b-instant"].includes(m))
                  .map((m) => (
                    <option key={m} value={m}>{m} (Detected on your Groq)</option>
                  ))}
              </Select>
              <p className="text-[10px] text-[#A39E93]">
                The agent automatically switches to your account&apos;s active open-weight models if the preferred model is not accessible.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#D0CBC1]">
                  Groq API Key
                </label>
                <button
                  type="button"
                  onClick={handleDetectModels}
                  disabled={detectingModels}
                  className="text-[10px] text-[#FFAA3D] hover:underline flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${detectingModels ? "animate-spin" : ""}`} />
                  {detectingModels ? "Checking..." : "Detect Account Models"}
                </button>
              </div>
              <Input
                type="text"
                placeholder="gsk_..."
                value={groqApiKey}
                onChange={(e) => setGroqApiKey(e.target.value)}
                className="text-xs font-mono"
              />
              <p className="text-[10px] text-[#A39E93]">
                Stored securely in database settings or loaded via <code className="text-[#FFAA3D]">GROQ_API_KEY</code>.
              </p>
              {modelMessage && (
                <p className="text-[11px] text-[#34D399] font-mono mt-1">
                  {modelMessage}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Publishing Mode & Credentials */}
        <Card className="p-6 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-[#F3F0E8] flex items-center gap-2">
              <Key className="w-4 h-4 text-[#FFAA3D]" />
              Publishing Mode &amp; Safety Adapter
            </h3>

            <span className="text-[10px] font-mono text-[#34D399]">
              Manual Provider Active (Safe)
            </span>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium text-[#D0CBC1] block">Publishing Execution Mode</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                publishingMode === "manual"
                  ? "bg-[#161514] border-[rgba(232,75,44,0.4)]"
                  : "bg-[#111110] border-[rgba(243,240,232,0.06)]"
              }`}>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="pub_mode"
                    value="manual"
                    checked={publishingMode === "manual"}
                    onChange={() => setPublishingMode("manual")}
                    className="text-[#E84B2C] focus:ring-0"
                  />
                  <span className="text-xs font-bold text-[#F3F0E8]">Manual Mode (Recommended)</span>
                </div>
                <p className="text-[11px] text-[#A39E93] mt-2">
                  Generates drafts and compliance checks; operator copies and submits to Reddit with 1-click live URL tracking. Zero account suspension risk.
                </p>
              </label>

              <label className={`p-4 rounded-lg border cursor-pointer transition-colors opacity-75 ${
                publishingMode === "api"
                  ? "bg-[#161514] border-[rgba(232,75,44,0.4)]"
                  : "bg-[#111110] border-[rgba(243,240,232,0.06)]"
              }`}>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="pub_mode"
                    value="api"
                    checked={publishingMode === "api"}
                    onChange={() => setPublishingMode("api")}
                    className="text-[#E84B2C] focus:ring-0"
                  />
                  <span className="text-xs font-bold text-[#F3F0E8]">Direct Reddit API Mode</span>
                </div>
                <p className="text-[11px] text-[#A39E93] mt-2">
                  Requires authorized Reddit Developer Application with commercial access approval. Disabled by default until verified.
                </p>
              </label>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#0D0D0C] border border-[rgba(243,240,232,0.04)] space-y-3">
            <span className="text-xs font-semibold text-[#D0CBC1] block flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#A39E93]" />
              Reddit API Credentials (Optional)
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-[#A39E93]">Client ID</label>
                <Input
                  type="text"
                  placeholder="Reddit Client ID"
                  value={redditClientId}
                  onChange={(e) => setRedditClientId(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-[#A39E93]">Client Secret</label>
                <Input
                  type="password"
                  placeholder="Reddit Secret"
                  value={redditClientSecret}
                  onChange={(e) => setRedditClientSecret(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-[#A39E93]">Reddit Username</label>
                <Input
                  type="text"
                  placeholder="u/YourAccount"
                  value={redditUsername}
                  onChange={(e) => setRedditUsername(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Operational Thresholds & Kill Switch */}
        <Card className="p-6 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-4">
          <h3 className="font-display text-sm font-bold text-[#F3F0E8] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#FFAA3D]" />
            Safety Thresholds &amp; Rate Limits
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#D0CBC1]">
                Min Scoring Threshold (0-100)
              </label>
              <Input
                type="number"
                min={10}
                max={100}
                value={minScoringThreshold}
                onChange={(e) => setMinScoringThreshold(Number(e.target.value))}
                className="text-xs font-technical"
              />
              <p className="text-[10px] text-[#A39E93]">
                Opportunities below this score are filtered from high-intent queues.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#D0CBC1]">
                Max Daily Posts
              </label>
              <Input
                type="number"
                min={1}
                max={10}
                value={dailyPostLimit}
                onChange={(e) => setDailyPostLimit(Number(e.target.value))}
                className="text-xs font-technical"
              />
              <p className="text-[10px] text-[#A39E93]">
                Prevents community spam flags (recommended: 2-3 per day).
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#D0CBC1]">
                Max Daily Comments
              </label>
              <Input
                type="number"
                min={1}
                max={25}
                value={dailyCommentLimit}
                onChange={(e) => setDailyCommentLimit(Number(e.target.value))}
                className="text-xs font-technical"
              />
              <p className="text-[10px] text-[#A39E93]">
                Daily ceiling across all active subreddits (recommended: 5-8).
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[rgba(243,240,232,0.06)] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-rose-400 block">
                Emergency Kill Switch
              </span>
              <span className="text-[11px] text-[#A39E93] block">
                Instantly aborts all active and queued background jobs. Blocks all publishing attempts.
              </span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={killSwitchActive}
                onChange={(e) => setKillSwitchActive(e.target.checked)}
                className="w-5 h-5 rounded bg-[#161514] border-rose-500 text-rose-600 focus:ring-0"
              />
              <span className="text-xs font-bold font-mono text-rose-400">
                {killSwitchActive ? "ACTIVE" : "STANDBY"}
              </span>
            </label>
          </div>
        </Card>
      </form>
    </div>
  );
}

