import path from "node:path";
import {NextResponse} from "next/server";
import {createGeminiGenerator, handleChat} from "@/lib/ai/chat-service";
import {
  AiUsageStore,
  createClientFingerprint,
  DEFAULT_AI_USAGE_LIMITS,
  type AiUsageLimits,
} from "@/lib/ai/usage-store";

export const runtime = "nodejs";

function boundedLimit(name: string, approvedMaximum: number) {
  const configured = Number.parseInt(process.env[name] || "", 10);
  if (!Number.isFinite(configured) || configured < 1) return approvedMaximum;
  return Math.min(configured, approvedMaximum);
}

function configuredLimits(): AiUsageLimits {
  return {
    perMinute: boundedLimit("AI_VISITOR_MINUTE_REQUEST_LIMIT", DEFAULT_AI_USAGE_LIMITS.perMinute),
    perVisitorDay: boundedLimit("AI_VISITOR_DAILY_REQUEST_LIMIT", DEFAULT_AI_USAGE_LIMITS.perVisitorDay),
    globalDay: boundedLimit("AI_DAILY_REQUEST_LIMIT", DEFAULT_AI_USAGE_LIMITS.globalDay),
    globalMonth: boundedLimit("AI_MONTHLY_REQUEST_LIMIT", DEFAULT_AI_USAGE_LIMITS.globalMonth),
  };
}

const production = process.env.NODE_ENV === "production";
const usagePath =
  process.env.AI_USAGE_DB_PATH ||
  (production ? "" : path.join(process.cwd(), "content-db", "ai-usage.sqlite"));
const fingerprintSecret =
  process.env.AI_RATE_LIMIT_SECRET || (production ? "" : "development-only-ai-rate-limit-secret");
const usage = usagePath && fingerprintSecret
  ? new AiUsageStore({path: usagePath, limits: configuredLimits()})
  : null;
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const generate = apiKey ? createGeminiGenerator(apiKey) : null;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const rawClientToken = request.headers.get("x-msyh-ai-client") || "";
  const clientToken = /^[a-zA-Z0-9_-]{8,100}$/.test(rawClientToken) ? rawClientToken : "";
  const clientId = fingerprintSecret
    ? createClientFingerprint(request, fingerprintSecret, clientToken)
    : "unconfigured";
  const response = await handleChat(body, clientId, {usage, generate});

  return NextResponse.json(response.body, {
    status: response.status,
    headers: {"Cache-Control": "no-store"},
  });
}
