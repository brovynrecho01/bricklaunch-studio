import { GoogleGenAI, type GenerateContentResponse } from "@google/genai";

export const PRIMARY_MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash-lite";

/**
 * Fallback chain lintas bucket kuota (semua model aktif non-deprecated):
 * Memprioritaskan model cepat hemat kuota, lalu failover ke bucket lain jika kena 429/503.
 */
export const ORCHESTRATE_MODEL_CHAIN = Array.from(
  new Set([
    PRIMARY_MODEL,
    "gemini-3.1-flash-lite",
    "gemini-3.8-flash",
    "gemma-4-31b-it",
  ])
);

export const FAST_CHAT_MODEL_CHAIN = Array.from(
  new Set([
    process.env.GEMINI_CHAT_MODEL?.trim() || "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemma-4-26b-a4b-it",
    "gemini-3.8-flash",
  ])
);

export function getServerGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error(
      "GEMINI_API_KEY (atau GOOGLE_API_KEY) belum diatur di file .env.local pada server."
    );
  }
  return new GoogleGenAI({ apiKey: apiKey.trim() });
}

export function isQuotaOrRateLimitError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("429") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.toLowerCase().includes("exceeded your current quota") ||
    msg.toLowerCase().includes("rate limit")
  );
}

export function isTransientOverloadError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    isQuotaOrRateLimitError(err) ||
    msg.includes("503") ||
    msg.includes("UNAVAILABLE") ||
    msg.includes("high demand") ||
    msg.includes("overloaded") ||
    msg.includes("NOT_FOUND") ||
    msg.includes("404") ||
    msg.includes("TIMEOUT")
  );
}

export function formatReadableError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  let extracted = raw;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.error?.message) {
      extracted = parsed.error.message;
    }
  } catch {
    // Raw string
  }

  if (isQuotaOrRateLimitError(extracted)) {
    return (
      "Kuota Gemini API pada key kamu sedang habis (429 RESOURCE_EXHAUSTED) di semua model cadangan. " +
      "Cek batas pemakaian atau aktifkan billing di https://ai.dev/rate-limit, atau tunggu reset kuota per menit/hari."
    );
  }
  return extracted;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`TIMEOUT: ${label} melebihi ${timeoutMs}ms`));
    }, timeoutMs);

    promise.then(
      (val) => {
        clearTimeout(timer);
        resolve(val);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

/**
 * Resilient generateContent wrapper with per-agent temperature & expanded token budgets:
 * - Strictly standard config { temperature, maxOutputTokens, systemInstruction } — NO thinkingConfig
 * - Automatic failover across separate model quota buckets
 * - Optional Google Search Grounding (enabled when ENABLE_SEARCH_GROUNDING=true)
 */
export async function generateWithResilience(
  ai: GoogleGenAI,
  params: {
    contents: string;
    systemInstruction: string;
    useSearchGrounding?: boolean;
    profile?: "orchestrate" | "fast_chat";
    temperature?: number;
    maxOutputTokens?: number;
    responseMimeType?: string;
    timeoutMs?: number;
  }
): Promise<{ response: GenerateContentResponse; modelUsed: string }> {
  const profile = params.profile || "orchestrate";
  const chain =
    profile === "fast_chat" ? FAST_CHAT_MODEL_CHAIN : ORCHESTRATE_MODEL_CHAIN;
  const timeoutMs = params.timeoutMs ?? (profile === "fast_chat" ? 10000 : 35000);
  const maxOutputTokens =
    params.maxOutputTokens ?? (profile === "fast_chat" ? 500 : 4096);
  const temperature = params.temperature ?? 0.7;
  const allowGrounding =
    Boolean(params.useSearchGrounding) &&
    process.env.ENABLE_SEARCH_GROUNDING === "true";

  let lastError: unknown = null;

  for (const model of chain) {
    const isGemma = model.startsWith("gemma-");

    const effectiveContents = isGemma
      ? `${params.systemInstruction}\n\n${params.contents}`
      : params.contents;

    const baseConfig: {
      systemInstruction?: string;
      temperature: number;
      maxOutputTokens: number;
      responseMimeType?: string;
    } = {
      temperature,
      maxOutputTokens,
    };

    if (!isGemma) {
      baseConfig.systemInstruction = params.systemInstruction;
      if (params.responseMimeType && !allowGrounding) {
        baseConfig.responseMimeType = params.responseMimeType;
      }
    }

    if (allowGrounding && !isGemma) {
      try {
        const response = await withTimeout(
          ai.models.generateContent({
            model,
            contents: effectiveContents,
            config: {
              ...baseConfig,
              tools: [{ googleSearch: {} }],
            },
          }),
          timeoutMs,
          `${model} (grounding)`
        );
        if (response.text?.trim()) {
          return { response, modelUsed: model };
        }
      } catch (groundingErr) {
        lastError = groundingErr;
        if (isTransientOverloadError(groundingErr)) {
          console.warn(
            `[BrickLaunch] Failover from ${model} (grounding):`,
            formatReadableError(groundingErr)
          );
          continue;
        }
      }
    }

    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model,
          contents: effectiveContents,
          config: baseConfig,
        }),
        timeoutMs,
        model
      );
      if (response.text?.trim()) {
        return { response, modelUsed: model };
      }
      throw new Error(`Model ${model} mengembalikan respons kosong.`);
    } catch (err) {
      lastError = err;
      if (isTransientOverloadError(err)) {
        console.warn(
          `[BrickLaunch] Failover from ${model}:`,
          err instanceof Error ? err.message.slice(0, 140) : String(err)
        );
        continue;
      }
      throw err;
    }
  }

  throw (
    lastError ||
    new Error("Semua model Gemini sedang sibuk atau kehabisan kuota sementara.")
  );
}

export function extractJsonObject<T>(rawText: string): T {
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1)) as T;
    }
    throw new Error("Format JSON dari model tidak valid.");
  }
}
