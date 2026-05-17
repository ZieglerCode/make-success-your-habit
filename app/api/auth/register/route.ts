import {NextResponse} from "next/server";

export async function GET() {
  return registrationDisabled();
}

export async function POST() {
  return registrationDisabled();
}

function registrationDisabled() {
  return NextResponse.json(
    {error: "Admin-Registrierung ist deaktiviert. Es gibt genau einen vorkonfigurierten Account."},
    {status: 403},
  );
}
