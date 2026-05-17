import {NextResponse} from "next/server";
import {loginAdmin, setSession} from "@/lib/auth";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LoginBody;
  const user = await loginAdmin(body.email || "", body.password || "");

  if (!user) {
    return NextResponse.json({error: "Die Zugangsdaten sind nicht korrekt."}, {status: 401});
  }

  await setSession(user);
  return NextResponse.json({user});
}
