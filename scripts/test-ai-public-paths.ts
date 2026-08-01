import assert from "node:assert/strict";
import {getPublicAssistantContext} from "../lib/ai/public-path";

const visible: Array<[string, "de" | "en"]> = [
  ["/", "de"],
  ["/de", "de"],
  ["/en", "en"],
  ["/de/isobl", "de"],
  ["/en/instant-success-formula", "en"],
  ["/de/blog/example", "de"],
  ["/en/legal/datenschutz", "en"],
  ["/about-heike", "en"],
];

for (const [pathname, locale] of visible) {
  assert.deepEqual(
    getPublicAssistantContext(pathname),
    {locale},
    `assistant should be visible at ${pathname}`,
  );
}

for (const pathname of [
  "/admin",
  "/admin/login",
  "/payload-admin",
  "/payload-admin/collections/posts",
  "/payload-api/posts",
  "/payload-graphql",
  "/api/chat",
  "/api/posts",
  "/uploads/file.webp",
  "/unknown-private-path",
]) {
  assert.equal(getPublicAssistantContext(pathname), null, `assistant must be hidden at ${pathname}`);
}

console.log("AI public path tests passed");
