import {NextResponse} from "next/server";
import {currentAdmin} from "@/lib/auth";
import {
  BlogTranslationError,
  GoogleGeminiTranslationClient,
  generateBlogTranslationDraft,
  type BlogTranslationRepository,
} from "@/lib/blog-translation";
import {
  beginPostTranslation,
  completePostTranslation,
  failPostTranslation,
  getPostById,
} from "@/lib/content-store";
import {parseBlogLocale} from "@/lib/blog-localization";

type RouteContext = {
  params: Promise<{id: string}>;
};

const repository: BlogTranslationRepository = {
  getSource: getPostById,
  begin: beginPostTranslation,
  complete: completePostTranslation,
  fail: failPostTranslation,
};

export async function POST(request: Request, context: RouteContext) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({error: "Unauthorized."}, {status: 401});

  const body = await request.json().catch(() => null);
  const targetLocale = parseBlogLocale(body?.targetLocale);
  if (!targetLocale || typeof body?.confirmOverwrite !== "boolean") {
    return NextResponse.json({error: "Ungültige Übersetzungsanfrage."}, {status: 400});
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({error: "Der Übersetzungsdienst ist nicht konfiguriert."}, {status: 503});
  }

  const {id} = await context.params;
  try {
    const target = await generateBlogTranslationDraft({
      sourceId: id,
      targetLocale,
      confirmOverwrite: body.confirmOverwrite,
      repository,
      client: new GoogleGeminiTranslationClient(apiKey),
      actor: admin.email,
    });
    return NextResponse.json({target}, {status: 201});
  } catch (error) {
    if (error instanceof BlogTranslationError) {
      const messages: Record<BlogTranslationError["code"], string> = {
        not_found: "Der Ausgangsbeitrag wurde nicht gefunden.",
        invalid_target: "Die Zielsprache ist ungültig.",
        overwrite_required: "Die vorhandene Übersetzung muss ausdrücklich überschrieben werden.",
        translation_in_progress: "Für diesen Beitrag läuft bereits eine Übersetzung.",
        invalid_model_output: "Die Übersetzung hatte ein ungültiges Format und wurde nicht gespeichert.",
        provider_unavailable: "Die Übersetzung konnte nicht erstellt werden.",
      };
      return NextResponse.json(
        {error: messages[error.code], code: error.code},
        {status: error.status},
      );
    }

    return NextResponse.json({error: "Die Übersetzung konnte nicht erstellt werden."}, {status: 500});
  }
}
