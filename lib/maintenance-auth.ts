import {timingSafeEqual} from "node:crypto";

export function isMaintenanceAuthorized(request: Request) {
  const secret = process.env.MAINTENANCE_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") || "";
  const supplied = header.startsWith("Bearer ") ? header.slice(7) : "";
  const actual = Buffer.from(supplied);
  const expected = Buffer.from(secret);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
