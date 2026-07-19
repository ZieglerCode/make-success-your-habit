import {NextResponse} from "next/server";
import {listPublishedPostSitemapEntries} from "@/lib/content-store";
import {PUBLIC_RESPONSE_HEADERS} from "@/lib/public-blog-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(
      {items: await listPublishedPostSitemapEntries()},
      {headers: PUBLIC_RESPONSE_HEADERS},
    );
  } catch {
    return NextResponse.json(
      {error: "The public sitemap data is temporarily unavailable."},
      {status: 500},
    );
  }
}
