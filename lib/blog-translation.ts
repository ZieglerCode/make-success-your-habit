import {GoogleGenAI} from "@google/genai";
import {oppositeBlogLocale, type BlogLocale} from "@/lib/blog-localization";
import type {BlogPost} from "@/lib/content-store";

export const BLOG_TRANSLATION_FIELDS = [
  "title",
  "excerpt",
  "content",
  "coverAlt",
  "seoTitle",
  "seoDescription",
] as const;

export type BlogTranslationFields = Pick<BlogPost, (typeof BLOG_TRANSLATION_FIELDS)[number]>;

export type GeminiTranslationRequest = {
  source: BlogTranslationFields;
  sourceLocale: BlogLocale;
  targetLocale: BlogLocale;
  model: string;
  systemInstruction: string;
};

export type GeminiTranslationClient = {
  generate(request: GeminiTranslationRequest): Promise<string>;
};

export type CompleteBlogTranslation = {
  sourceId: string;
  targetLocale: BlogLocale;
  operationId: string;
  translated: BlogTranslationFields;
  actor: string;
};

export type BlogTranslationRepository = {
  getSource(sourceId: string): Promise<BlogPost | undefined>;
  begin(
    sourceId: string,
    targetLocale: BlogLocale,
    confirmOverwrite: boolean,
  ): Promise<{operationId: string}>;
  complete(operation: CompleteBlogTranslation): Promise<BlogPost>;
  fail(sourceId: string, operationId: string, message: string): Promise<void>;
};

export type BlogTranslationErrorCode =
  | "not_found"
  | "invalid_target"
  | "overwrite_required"
  | "translation_in_progress"
  | "invalid_model_output"
  | "provider_unavailable";

export class BlogTranslationError extends Error {
  constructor(
    readonly code: BlogTranslationErrorCode,
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "BlogTranslationError";
  }
}

export const BLOG_TRANSLATION_SYSTEM_INSTRUCTION = [
  "Translate faithfully from the source locale into the target locale.",
  "Preserve headings, paragraphs, links, markup, and order exactly.",
  "Do not summarize, expand, optimize SEO, alter offers, change names, or add claims.",
  "Return only the requested JSON object with all six string fields.",
].join(" ");

export const DEFAULT_GEMINI_TRANSLATION_MODEL = "gemini-3.1-flash-lite";

function translationSource(post: BlogPost): BlogTranslationFields {
  return Object.fromEntries(
    BLOG_TRANSLATION_FIELDS.map((field) => [field, post[field]]),
  ) as BlogTranslationFields;
}

function parseTranslatedFields(raw: string): BlogTranslationFields {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new BlogTranslationError("invalid_model_output", "The translation response was not valid JSON.", 422);
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new BlogTranslationError("invalid_model_output", "The translation response did not match the required schema.", 422);
  }

  const record = parsed as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  const expected = [...BLOG_TRANSLATION_FIELDS].sort();
  if (
    keys.length !== expected.length ||
    keys.some((key, index) => key !== expected[index]) ||
    BLOG_TRANSLATION_FIELDS.some((field) => typeof record[field] !== "string")
  ) {
    throw new BlogTranslationError("invalid_model_output", "The translation response did not match the required schema.", 422);
  }

  return Object.fromEntries(
    BLOG_TRANSLATION_FIELDS.map((field) => [field, String(record[field])]),
  ) as BlogTranslationFields;
}

export function sanitizeTranslationError(error: unknown) {
  const raw = error instanceof Error ? error.message : "Translation failed.";
  return raw
    .replace(/[\r\n\t]+/g, " ")
    .replace(/(key|token|secret|password)\s*[:=]\s*\S+/gi, "$1=[redacted]")
    .trim()
    .slice(0, 300) || "Translation failed.";
}

export class GoogleGeminiTranslationClient implements GeminiTranslationClient {
  constructor(private readonly apiKey: string) {}

  async generate(request: GeminiTranslationRequest) {
    const ai = new GoogleGenAI({apiKey: this.apiKey});
    const response = await ai.models.generateContent({
      model: request.model,
      contents: JSON.stringify({
        sourceLocale: request.sourceLocale,
        targetLocale: request.targetLocale,
        source: request.source,
      }),
      config: {
        systemInstruction: request.systemInstruction,
        temperature: 0,
        responseMimeType: "application/json",
        responseJsonSchema: {
          type: "object",
          additionalProperties: false,
          required: [...BLOG_TRANSLATION_FIELDS],
          properties: Object.fromEntries(
            BLOG_TRANSLATION_FIELDS.map((field) => [field, {type: "string"}]),
          ),
        },
      },
    });
    if (!response.text?.trim()) {
      throw new BlogTranslationError("invalid_model_output", "The translation response was empty.", 422);
    }
    return response.text;
  }
}

export async function generateBlogTranslationDraft({
  sourceId,
  targetLocale,
  confirmOverwrite,
  repository,
  client,
  actor = "System",
  model = process.env.GEMINI_TRANSLATION_MODEL || DEFAULT_GEMINI_TRANSLATION_MODEL,
}: {
  sourceId: string;
  targetLocale: BlogLocale;
  confirmOverwrite: boolean;
  repository: BlogTranslationRepository;
  client: GeminiTranslationClient;
  actor?: string;
  model?: string;
}) {
  const source = await repository.getSource(sourceId);
  if (!source) throw new BlogTranslationError("not_found", "Source post not found.", 404);
  if (targetLocale !== oppositeBlogLocale(source.locale)) {
    throw new BlogTranslationError("invalid_target", "Target locale must be the opposite source locale.", 400);
  }

  const {operationId} = await repository.begin(sourceId, targetLocale, confirmOverwrite);
  try {
    const raw = await client.generate({
      source: translationSource(source),
      sourceLocale: source.locale,
      targetLocale,
      model,
      systemInstruction: BLOG_TRANSLATION_SYSTEM_INSTRUCTION,
    });
    const translated = parseTranslatedFields(raw);
    return await repository.complete({sourceId, targetLocale, operationId, translated, actor});
  } catch (error) {
    const message = error instanceof BlogTranslationError
      ? sanitizeTranslationError(error)
      : "Translation provider request failed.";
    await repository.fail(sourceId, operationId, message);
    if (error instanceof BlogTranslationError) throw error;
    throw new BlogTranslationError("provider_unavailable", "The translation could not be generated.", 422);
  }
}
