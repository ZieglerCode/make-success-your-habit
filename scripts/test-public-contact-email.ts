import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import path from "node:path";
import {enforcePublicContactEmail} from "../lib/content-store";

const approvedEmail = "contact@heike-ziegler.com";

assert.equal(
  enforcePublicContactEmail({
    ctaHeadline: "Headline",
    ctaText: "Text",
    footerEmail: "old-address@example.test",
    seoTitle: "Title",
    seoDescription: "Description",
  }).footerEmail,
  approvedEmail,
  "stored legacy contact values must never reach the public website",
);
const publicFiles = [
  "lib/content-store.ts",
  "components/site-home.tsx",
  "app/legal/agb/page.tsx",
  "app/legal/datenschutz/page.tsx",
  "app/legal/eula/page.tsx",
  "app/legal/impressum/page.tsx",
  "app/legal/nutzungsbedingungen/page.tsx",
  "app/legal/widerruf/page.tsx",
];

for (const filename of publicFiles) {
  const source = await readFile(path.join(process.cwd(), filename), "utf8");
  const emails = source.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g) ?? [];
  assert(
    emails.every((email) => email === approvedEmail),
    `${filename} contains an unapproved public email: ${emails.join(", ")}`,
  );
  if (filename.startsWith("app/legal/")) {
    const mailtoAddresses = [...source.matchAll(/mailto:([^"']+)/g)].map((match) => match[1]);
    assert(
      mailtoAddresses.every((email) => email === approvedEmail),
      `${filename} contains an unapproved mailto link`,
    );
  }
}

const homepage = await readFile(path.join(process.cwd(), "components/site-home.tsx"), "utf8");
assert(!homepage.includes("example.com"), "homepage must use a neutral email placeholder");

console.log("Public contact email tests passed");
