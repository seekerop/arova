import { getRedditSettings, updateRedditSettings } from "./db";
import { logAgentActivity } from "./logger";

export interface GroqChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CallGroqChatOptions {
  messages: GroqChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface GroqChatResult {
  ok: boolean;
  content: string;
  modelUsed?: string;
  error?: string;
}

// Ordered list of candidate models to try if the requested model returns model_not_found
const FALLBACK_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.8-27b",
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "allam-2-7b",
];

export async function callGroqChat(options: CallGroqChatOptions): Promise<GroqChatResult> {
  const settings = await getRedditSettings();
  const apiKey = settings.groq_api_key || process.env.GROQ_API_KEY;

  if (!apiKey) {
    return {
      ok: false,
      content: "",
      error: "Groq API key is not configured. Please add your key in Reddit Settings.",
    };
  }

  let preferredModel = options.model || settings.ai_model || "openai/gpt-oss-120b";
  // If settings had the old unavailable default, use openai/gpt-oss-120b as first attempt
  if (preferredModel === "llama-3.3-70b-versatile" || preferredModel === "gemini-1.5-flash") {
    preferredModel = "openai/gpt-oss-120b";
  }

  const modelsToTry = [
    preferredModel,
    ...FALLBACK_MODELS.filter((m) => m !== preferredModel),
  ];

  let lastError = "";

  for (const modelToAttempt of modelsToTry) {
    try {
      const body: Record<string, any> = {
        model: modelToAttempt,
        messages: options.messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.maxTokens ?? 1000,
      };

      if (options.jsonMode) {
        body.response_format = { type: "json_object" };
      }

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content || "";

        // If we succeeded with a fallback model different from the DB settings, persist it
        if (modelToAttempt !== settings.ai_model) {
          try {
            await updateRedditSettings({ ai_model: modelToAttempt });
            await logAgentActivity(
              "Groq AI Engine",
              `Automatically updated active Groq model to ${modelToAttempt}`,
              "info",
              { previousModel: settings.ai_model, currentModel: modelToAttempt }
            );
          } catch {
            // Non-critical if DB save fails
          }
        }

        return {
          ok: true,
          content,
          modelUsed: modelToAttempt,
        };
      }

      const errData = await res.json().catch(() => null);
      const code = errData?.error?.code || "";
      const msg = errData?.error?.message || `HTTP ${res.status}`;
      lastError = msg;

      // If it's model_not_found or invalid_request_error related to model, try next candidate
      if (
        code === "model_not_found" ||
        msg.toLowerCase().includes("does not exist") ||
        msg.toLowerCase().includes("access to it")
      ) {
        continue;
      }

      // If it's an auth error (401), stop immediately
      if (res.status === 401) {
        return {
          ok: false,
          content: "",
          error: `Groq Authentication Failed (401): ${msg}`,
        };
      }

      // Rate limit or other error - continue trying fallback if available
      continue;
    } catch (err: any) {
      lastError = err.message || "Network request failed";
    }
  }

  return {
    ok: false,
    content: "",
    error: `Groq AI request failed across all models: ${lastError}`,
  };
}

export async function detectAvailableGroqModels(apiKey: string): Promise<string[]> {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data.data)) return [];

    return data.data
      .filter(
        (m: any) =>
          m.active &&
          !m.id.includes("whisper") &&
          !m.id.includes("prompt-guard") &&
          !m.id.includes("orpheus") &&
          !m.id.includes("safeguard")
      )
      .map((m: any) => m.id);
  } catch {
    return [];
  }
}
