import {listPublishedPostSitemapEntries} from "@/lib/content-store";
import {
  PUBLIC_RESPONSE_HEADERS,
  buildPublicSitemapXml,
} from "@/lib/public-blog-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const xml = buildPublicSitemapXml(await listPublishedPostSitemapEntries());
    return new Response(xml, {
      headers: {
        ...PUBLIC_RESPONSE_HEADERS,
        "Content-Type": "application/xml; charset=utf-8",
      },
    });
  } catch {
    return new Response("Public sitemap temporarily unavailable.", {
      status: 500,
      headers: {"Content-Type": "text/plain; charset=utf-8"},
    });
  }
}
