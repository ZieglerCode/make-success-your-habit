import {NextResponse} from "next/server";
import {
  getPublishedPostByLocaleSlug,
  getTranslationCounterpart,
} from "@/lib/content-store";
import {
  PUBLIC_RESPONSE_HEADERS,
  buildPublicPostDetail,
} from "@/lib/public-blog-api";
import {parseBlogLocale} from "@/lib/blog-localization";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{locale: string; slug: string}>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const {locale: rawLocale, slug} = await context.params;
    const locale = parseBlogLocale(rawLocale);
    if (!locale) return NextResponse.json({error: "Invalid locale."}, {status: 400});

    const post = await getPublishedPostByLocaleSlug(locale, slug);
    const counterpart = post ? await getTranslationCounterpart(post.id) : undefined;
    const response = buildPublicPostDetail(post, counterpart);
    if (!response) return NextResponse.json({error: "Not found."}, {status: 404});

    return NextResponse.json(response, {headers: PUBLIC_RESPONSE_HEADERS});
  } catch {
    return NextResponse.json(
      {error: "The public article is temporarily unavailable."},
      {status: 500},
    );
  }
}
