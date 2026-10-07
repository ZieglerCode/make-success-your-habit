import path from "node:path";
import {NextResponse} from "next/server";
import {
  createGeminiGenerator,
  createGeminiStreamGenerator,
  fallback,
  handleChat,
  parseRequest,
} from "@/lib/ai/chat-service";
import {answerDeterministically, parseAssistantReply} from "@/lib/ai/response";
import {retrieveKnowledge} from "@/lib/ai/retrieval";
import {
  AiUsageStore,
  createClientIdentity,
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
    perIpMinute: boundedLimit("AI_IP_MINUTE_REQUEST_LIMIT", DEFAULT_AI_USAGE_LIMITS.perIpMinute ?? 10),
    perIpDay: boundedLimit("AI_IP_DAILY_REQUEST_LIMIT", DEFAULT_AI_USAGE_LIMITS.perIpDay ?? 50),
    globalDay: boundedLimit("AI_DAILY_REQUEST_LIMIT", DEFAULT_AI_USAGE_LIMITS.globalDay),
    globalMonth: boundedLimit("AI_MONTHLY_REQUEST_LIMIT", DEFAULT_AI_USAGE_LIMITS.globalMonth),
  };
}

const production = process.env.NODE_ENV === "production";

function defaultUsagePath(): string {
  if (process.env.AI_USAGE_DB_PATH) return process.env.AI_USAGE_DB_PATH;
  if (process.env.UPLOAD_DIR) {
    return path.join(path.dirname(process.env.UPLOAD_DIR), "ai-usage.sqlite");
  }
  return path.join(process.cwd(), "content-db", "ai-usage.sqlite");
}

const usagePath = defaultUsagePath();
const fingerprintSecret =
  process.env.AI_RATE_LIMIT_SECRET ||
  process.env.AUTH_SECRET ||
  process.env.PAYLOAD_SECRET ||
  "msyh-ai-rate-limit-secret-production";
const usage = usagePath && fingerprintSecret
  ? new AiUsageStore({path: usagePath, limits: configuredLimits()})
  : null;
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const generate = apiKey ? createGeminiGenerator(apiKey) : null;
const generateStream = apiKey ? createGeminiStreamGenerator(apiKey) : null;

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 16_384) {
    return NextResponse.json({error: "Payload too large"}, {status: 413});
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const rawClientToken = request.headers.get("x-msyh-ai-client") || "";
  const clientToken = /^[a-zA-Z0-9_-]{8,100}$/.test(rawClientToken) ? rawClientToken : "";
  const clientIdentity = createClientIdentity(request, fingerprintSecret, clientToken);

  const parsed = parseRequest(body);
  const wantsStream = parsed?.stream === true;

  if (!wantsStream) {
    const response = await handleChat(body, clientIdentity, {usage, generate});
    if (response.status >= 500 && (!usage || !generate)) {
      console.warn("[ai/chat] service unavailable due to unconfigured dependencies:", {
        hasUsage: Boolean(usage),
        hasGenerate: Boolean(generate),
        hasApiKey: Boolean(apiKey),
      });
    }

    return NextResponse.json(response.body, {
      status: response.status,
      headers: {"Cache-Control": "no-store"},
    });
  }

  const requestedLocale =
    body && typeof body === "object" && (body as {locale?: unknown}).locale === "en" ? "en" : "de";

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      if (!parsed) {
        const reply = fallback(requestedLocale, "invalid");
        send({type: "error", message: reply.answer, destination: reply.destination, navigation: reply.navigation});
        controller.close();
        return;
      }

      if (!usage || !generateStream) {
        console.warn("[ai/chat] stream service unavailable due to missing dependencies:", {
          hasUsage: Boolean(usage),
          hasGenerateStream: Boolean(generateStream),
          hasApiKey: Boolean(apiKey),
        });
        const reply = fallback(parsed.locale, "unavailable");
        send({type: "error", message: reply.answer, destination: reply.destination, navigation: reply.navigation});
        controller.close();
        return;
      }

      const usageDecision = await usage.consume(clientIdentity);
      if (!usageDecision.allowed) {
        const kind =
          usageDecision.reason === "visitor_minute" || usageDecision.reason === "ip_minute"
            ? "rate_limited"
            : "limit";
        const reply = fallback(parsed.locale, kind);
        send({type: "error", message: reply.answer, destination: reply.destination, navigation: reply.navigation});
        controller.close();
        return;
      }

      const question = parsed.messages.at(-1)!.content.trim();
      const localReply = answerDeterministically(question, parsed.locale, parsed.messages);
      if (localReply) {
        send({type: "delta", text: localReply.answer});
        send({
          type: "done",
          message: localReply.answer,
          destination: localReply.destination,
          navigation: localReply.navigation,
          source: localReply.source,
        });
        controller.close();
        return;
      }

      try {
        const prevText = parsed.messages.length > 1
          ? parsed.messages.slice(-3, -1).map((m) => m.content).join(" ")
          : "";
        const retrievalQuery = [prevText, question].filter(Boolean).join(" ");

        const rawReply = await generateStream(
          {
            locale: parsed.locale,
            question,
            messages: parsed.messages,
            knowledge: retrieveKnowledge(retrievalQuery, parsed.locale, 4),
          },
          (delta) => {
            send({type: "delta", text: delta});
          },
        );

        const reply = parseAssistantReply(rawReply, parsed.locale);
        if (!reply) {
          console.warn("[ai/chat] parseAssistantReply returned null for stream response:", rawReply);
          const errReply = fallback(parsed.locale, "unavailable");
          send({type: "error", message: errReply.answer, destination: errReply.destination, navigation: errReply.navigation});
        } else {
          send({
            type: "done",
            message: reply.answer,
            destination: reply.destination,
            navigation: reply.navigation,
            source: reply.source,
          });
        }
      } catch (error) {
        console.error("[ai/chat] streaming error:", error);
        const errReply = fallback(parsed.locale, "unavailable");
        send({type: "error", message: errReply.answer, destination: errReply.destination, navigation: errReply.navigation});
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
