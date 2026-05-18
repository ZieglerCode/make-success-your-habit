import {NextResponse} from "next/server";
import {currentAdmin} from "@/lib/auth";
import {createPost, listPosts, type PostStatus} from "@/lib/content-store";

const postStatuses = new Set(["draft", "review", "scheduled", "published", "archived"]);

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const admin = await currentAdmin();
  const include = searchParams.get("include");
  const status = searchParams.get("status");
  const sort = searchParams.get("sort");
  const limit = Number(searchParams.get("limit") || 0);
  const offset = Number(searchParams.get("offset") || 0);

  return NextResponse.json({
    posts: await listPosts({
      includeArchived: Boolean(admin && include === "all"),
      publishedOnly: !admin,
      q: admin ? searchParams.get("q") || undefined : undefined,
      status: admin && status && postStatuses.has(status) ? (status as PostStatus) : status === "all" ? "all" : undefined,
      sort:
        admin && (sort === "oldest" || sort === "updated" || sort === "title" || sort === "newest")
          ? sort
          : undefined,
      limit: admin && Number.isFinite(limit) ? limit : undefined,
      offset: admin && Number.isFinite(offset) ? offset : undefined,
    }),
  });
}

export async function POST(request: Request) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({error: "Unauthorized."}, {status: 401});

  try {
    const post = await createPost(await request.json());
    return NextResponse.json(post, {status: 201});
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("UNIQUE")
        ? "Dieser Slug ist bereits vergeben."
        : "Der Beitrag konnte nicht erstellt werden.";

    return NextResponse.json({error: message}, {status: 400});
  }
}
