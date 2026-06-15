import {GoogleGenAI, ThinkingLevel, type Content} from "@google/genai";
import {NextResponse} from "next/server";

export const runtime = "nodejs";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 2_000;
const MAX_TOTAL_LENGTH = 10_000;
const MAX_AUDIO_BASE64_LENGTH = 12_000_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_REQUESTS = 10;

type SiteLang = "de" | "en";
type ChatMessage = {role: "user" | "assistant"; content: string};
type AudioMessage = {data: string; mimeType: string};
type ChatRequest = {locale?: string; messages?: ChatMessage[]; audio?: AudioMessage};
type RateLimitEntry = {count: number; resetAt: number};

const rateLimits = new Map<string, RateLimitEntry>();

function getClientId(request: Request) {
  return (
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anonymous"
  );
}

function isRateLimited(clientId: string) {
  const now = Date.now();
  const entry = rateLimits.get(clientId);

  if (!entry || entry.resetAt <= now) {
    rateLimits.set(clientId, {count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS});
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_REQUESTS;
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Partial<ChatMessage>;
  return (
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.trim().length > 0 &&
    message.content.length <= MAX_MESSAGE_LENGTH
  );
}

function isAudioMessage(value: unknown): value is AudioMessage {
  if (!value || typeof value !== "object") return false;
  const audio = value as Partial<AudioMessage>;
  return (
    typeof audio.data === "string" &&
    audio.data.length > 0 &&
    audio.data.length <= MAX_AUDIO_BASE64_LENGTH &&
    typeof audio.mimeType === "string" &&
    ["audio/webm", "audio/mp4", "audio/ogg", "audio/wav", "audio/mpeg"].includes(audio.mimeType)
  );
}

function systemInstruction(locale: SiteLang) {
  const language = locale === "de" ? "German" : "English";

  return `
You are the website assistant for "Make Success Your Habit" by Heike Ziegler.
Always answer in ${language}, unless the visitor explicitly asks for another language.

Your job:
- Help visitors understand Heike's work and choose a suitable next step.
- Be warm, concise, grounded, and professional. Ask at most one useful follow-up question.
- Never invent prices, dates, guarantees, credentials, availability, or testimonials.
- Do not claim to be Heike. You are an AI assistant.
- Do not provide medical, psychotherapeutic, legal, or financial advice.
- If information is missing, say so and direct the visitor to hello@make-success-your-habit.com.

Website context:
- Heike Ziegler supports ambitious founders, coaches and experts with personal development and responsible business leadership.
- The approach focuses on clarity, identity, self-leadership, inner stability, conscious decisions and sustainable change.
- Main pages: /method, /about-heike, /community, /blog.
- Offers include Instant Success Formula (/instant-success-formula), ISOBL (/isobl), ISA Alliance (/isa-alliance), and a Clarity Call via https://cal.com/heikeziegler/book-your-first-instant-success-formula-session.
- When recommending a page, include its relative link.
- Keep normal answers under 140 words and use short paragraphs or bullets when helpful.
`.trim();
}

function toGeminiContents(messages: ChatMessage[], audio?: AudioMessage): Content[] {
  return messages.map((message, index) => {
    const isLastVoiceMessage = Boolean(audio) && index === messages.length - 1 && message.role === "user";
    return {
      role: message.role === "assistant" ? "model" : "user",
      parts: isLastVoiceMessage
        ? [
            {text: "Listen to this voice message and answer its content in the requested language."},
            {inlineData: {data: audio!.data, mimeType: audio!.mimeType}},
          ]
        : [{text: message.content.trim()}],
    };
  });
}

export async function POST(request: Request) {
  let body: ChatRequest;

  try {
    body = (await request.json()) as ChatRequest;
  } catch {
    return NextResponse.json({error: "Invalid request."}, {status: 400});
  }

  const locale: SiteLang = body.locale === "en" ? "en" : "de";
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const audio = body.audio;
  const totalLength = messages.reduce(
    (sum, message) => sum + (typeof message?.content === "string" ? message.content.length : 0),
    0,
  );

  if (
    messages.length === 0 ||
    messages.length > MAX_MESSAGES ||
    totalLength > MAX_TOTAL_LENGTH ||
    !messages.every(isChatMessage) ||
    messages.at(-1)?.role !== "user" ||
    (audio !== undefined && !isAudioMessage(audio))
  ) {
    return NextResponse.json(
      {error: locale === "de" ? "Die Nachricht ist ungültig oder zu lang." : "The message is invalid or too long."},
      {status: 400},
    );
  }

  if (isRateLimited(getClientId(request))) {
    return NextResponse.json(
      {error: locale === "de" ? "Bitte warte kurz und versuche es erneut." : "Please wait a moment and try again."},
      {status: 429},
    );
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("Chat API is missing GEMINI_API_KEY.");
    return NextResponse.json(
      {error: locale === "de" ? "Der Assistent ist gerade nicht verfügbar." : "The assistant is currently unavailable."},
      {status: 503},
    );
  }

  try {
    const ai = new GoogleGenAI({apiKey});
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: toGeminiContents(messages, audio),
      config: {
        systemInstruction: systemInstruction(locale),
        temperature: 0.45,
        maxOutputTokens: 700,
        thinkingConfig: {thinkingLevel: ThinkingLevel.LOW},
      },
    });
    const answer = response.text?.trim();

    if (!answer) throw new Error("Gemini returned an empty response.");
    return NextResponse.json({message: answer});
  } catch (error) {
    console.error("Gemini chat request failed:", error);
    return NextResponse.json(
      {
        error:
          locale === "de"
            ? "Die Antwort konnte nicht erstellt werden. Bitte versuche es erneut."
            : "The response could not be generated. Please try again.",
      },
      {status: 502},
    );
  }
}
