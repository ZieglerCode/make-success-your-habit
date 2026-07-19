import {NextResponse} from "next/server";
import {currentAdmin} from "@/lib/auth";
import {deletePost, getPostById, updatePost} from "@/lib/content-store";

type RouteContext = {
  params: Promise<{id: string}>;
};

export async function GET(_request: Request, context: RouteContext) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({error: "Unauthorized."}, {status: 401});

  const {id} = await context.params;
  const post = await getPostById(id);

  if (!post) return NextResponse.json({error: "Not found."}, {status: 404});

  return NextResponse.json(post);
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({error: "Unauthorized."}, {status: 401});

  const {id} = await context.params;

  try {
    const post = await updatePost(id, await request.json(), admin.email);
    if (!post) return NextResponse.json({error: "Not found."}, {status: 404});

    return NextResponse.json(post);
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("UNIQUE")
        ? "Dieser Slug ist bereits vergeben."
        : "Der Beitrag konnte nicht gespeichert werden.";

    return NextResponse.json({error: message}, {status: 400});
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({error: "Unauthorized."}, {status: 401});

  const {id} = await context.params;
  const deleted = await deletePost(id);

  return NextResponse.json({ok: deleted});
}
