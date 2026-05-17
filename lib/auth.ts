import {createHmac, randomBytes, timingSafeEqual} from "node:crypto";
import bcrypt from "bcryptjs";
import {cookies} from "next/headers";

export const SESSION_COOKIE = "heike_admin_session";
const HEIKE_ADMIN_ID = "admin_heike_ziegler";
const DEFAULT_ADMIN_EMAIL = "heike@make-success-your-habit.com";
const DEFAULT_ADMIN_NAME = "Heike Ziegler";
const DEFAULT_ADMIN_PASSWORD_HASH =
  "$2b$12$826RoH0e7G39PQWpg1oCOedgSE9mucZqLE5me5Uo2uANxHFL.ZVF6";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function secret() {
  const value = process.env.AUTH_SECRET;

  if (value) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be configured in production.");
  }

  return "local-development-secret-change-me";
}

function adminEmail() {
  return process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
}

function adminName() {
  return process.env.ADMIN_NAME || DEFAULT_ADMIN_NAME;
}

function adminPassword() {
  const value = process.env.ADMIN_PASSWORD;

  if (value) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_PASSWORD_HASH or ADMIN_PASSWORD must be configured in production.");
  }

  return null;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function sessionValue(user: AdminUser) {
  const payload = Buffer.from(
    JSON.stringify({
      nonce: randomBytes(12).toString("base64url"),
      user,
    }),
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function parseSession(value?: string): AdminUser | null {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      user?: AdminUser;
    };

    return parsed.user?.email ? parsed.user : null;
  } catch {
    return null;
  }
}

export async function currentAdmin() {
  const cookieStore = await cookies();
  return parseSession(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function loginAdmin(email: string, password: string) {
  if (email.trim().toLowerCase() !== adminEmail().toLowerCase()) return null;

  const passwordHash =
    process.env.ADMIN_PASSWORD_HASH ||
    (!process.env.ADMIN_PASSWORD ? DEFAULT_ADMIN_PASSWORD_HASH : null);
  const valid = passwordHash
    ? await bcrypt.compare(password, passwordHash)
    : password === adminPassword();

  if (!valid) return null;

  return {
    id: HEIKE_ADMIN_ID,
    email: adminEmail(),
    name: adminName(),
    role: "Admin",
  } satisfies AdminUser;
}

export async function setSession(user: AdminUser) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionValue(user), {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
