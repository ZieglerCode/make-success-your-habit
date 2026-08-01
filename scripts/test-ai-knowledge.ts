import assert from "node:assert/strict";
import snapshot from "../lib/ai/generated-knowledge.json";

const requiredDestinations = [
  "home",
  "method",
  "about",
  "community",
  "blog",
  "isf",
  "isobl",
  "isa",
  "legal_agb",
  "legal_privacy",
  "legal_imprint",
  "legal_eula",
  "legal_terms",
  "legal_withdrawal",
] as const;

for (const locale of ["de", "en"] as const) {
  for (const destination of requiredDestinations) {
    assert(
      snapshot.chunks.some(
        (chunk) =>
          chunk.locale === locale &&
          chunk.destination === destination &&
          chunk.text.length >= 80,
      ),
      `missing useful knowledge for ${locale}/${destination}`,
    );
  }
}

assert(
  snapshot.chunks.every((chunk) => chunk.text.length <= 2_400),
  "knowledge chunks must stay within the retrieval size limit",
);
assert(
  snapshot.chunks.every((chunk) => !/<script|javascript:|data:text\/html/i.test(chunk.text)),
  "knowledge must not contain executable markup",
);

const emails = JSON.stringify(snapshot).match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g) ?? [];
assert(
  emails.every((email) => email === "contact@heike-ziegler.com"),
  `knowledge contains an unapproved email: ${emails.join(", ")}`,
);

const articleChunks = snapshot.chunks.filter((chunk) => /\/blog\/[^/?#]+/.test(chunk.sourcePath));
const articleSlugs = new Set(
  articleChunks.map((chunk) => chunk.sourcePath.match(/\/blog\/([^/?#]+)/)?.[1]).filter(Boolean),
);

for (const slug of articleSlugs) {
  for (const locale of ["de", "en"] as const) {
    assert(
      articleChunks.some(
        (chunk) => chunk.locale === locale && chunk.sourcePath === `/${locale}/blog/${slug}`,
      ),
      `missing localized article knowledge for ${locale}/blog/${slug}`,
    );
  }
}

console.log("AI knowledge coverage tests passed");
