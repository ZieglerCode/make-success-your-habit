import {NextResponse} from "next/server";
import {countPublishedPosts, listPosts} from "@/lib/content-store";
import {
  PUBLIC_RESPONSE_HEADERS,
  PublicBlogApiError,
  buildPublicPostList,
  parsePublicPostListQuery,
} from "@/lib/public-blog-api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const query = parsePublicPostListQuery(new URL(request.url).searchParams);
    const offset = (query.page - 1) * query.pageSize;
    const [posts, total] = await Promise.all([
      listPosts({
        locale: query.locale,
        publishedOnly: true,
        limit: query.pageSize,
        offset,
        sort: "newest",
      }),
      countPublishedPosts(query.locale),
    ]);

    return NextResponse.json(buildPublicPostList(posts, {...query, total}), {
      headers: PUBLIC_RESPONSE_HEADERS,
    });
  } catch (error) {
    const status = error instanceof PublicBlogApiError ? error.status : 500;
    const message = status === 400 ? "Invalid request." : "Public posts are temporarily unavailable.";
    return NextResponse.json({error: message}, {status});
  }
}
