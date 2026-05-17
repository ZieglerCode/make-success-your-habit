import {NextResponse} from "next/server";
import {currentAdmin} from "@/lib/auth";
import {createPost, listPosts} from "@/lib/content-store";

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const admin = await currentAdmin();
  const include = searchParams.get("include");

  return NextResponse.json({
    posts: await listPosts({
      includeArchived: Boolean(admin && include === "all"),
      publishedOnly: !admin,
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
