import assert from "node:assert/strict";
import {mediaUsage, readingMinutes, seoIssues, wordCount} from "../lib/editor-insights";
import type {BlogPost, MediaAsset} from "../lib/content-store";

const basePost: BlogPost = {
  authorName: "Heike Ziegler",
  category: "Selbstführung",
  content: "Ein klarer Absatz mit genügend Orientierung für den Test.",
  coverAlt: "Portrait im warmen Licht",
  coverImage: "/uploads/portrait.webp",
  createdAt: "2026-05-18T10:00:00.000Z",
  excerpt: "Ein kurzer, konkreter Auszug für den Test.",
  id: "post-1",
  locale: "de",
  publishedAt: null,
  readingMinutes: 1,
  scheduledAt: null,
  seoDescription:
    "Eine klare SEO-Beschreibung mit ausreichender Länge, damit der Preview-Test belastbar bleibt.",
  seoTitle: "Ein tragfähiger SEO Titel für den Blog",
  slug: "tragfaehiger-seo-titel",
  status: "draft",
  tags: "Klarheit, Erfolg",
  title: "Ein tragfähiger SEO Titel für den Blog",
  translationError: null,
  translationGroupId: "post-1",
  translationStatus: "none",
  translationUpdatedAt: null,
  sourcePostId: null,
  updatedAt: "2026-05-18T10:00:00.000Z",
};

const assets: MediaAsset[] = [
  {
    alt: "Portrait",
    createdAt: "2026-05-18T10:00:00.000Z",
    filename: "portrait.webp",
    id: "asset-1",
    mimeType: "image/webp",
    size: 1200,
    url: "/uploads/portrait.webp",
    originalUrl: "/uploads/portrait.webp",
    variants: {}, width: null, height: null, focalX: 0.5, focalY: 0.5,
  },
  {
    alt: "",
    createdAt: "2026-05-18T10:00:00.000Z",
    filename: "unused.webp",
    id: "asset-2",
    mimeType: "image/webp",
    size: 900,
    url: "/uploads/unused.webp",
    originalUrl: "/uploads/unused.webp",
    variants: {}, width: null, height: null, focalX: 0.5, focalY: 0.5,
  },
];

assert.equal(wordCount("eins zwei\n\ndrei"), 3);
assert.equal(readingMinutes(Array.from({length: 221}, (_, index) => `w${index}`).join(" ")), 2);
assert.deepEqual(seoIssues(basePost), []);
assert.ok(seoIssues({...basePost, coverAlt: ""}).includes("Cover-Alt-Text fehlt"));
assert.ok(seoIssues({...basePost, seoDescription: "zu kurz"}).includes("SEO-Beschreibung sollte 70-160 Zeichen haben"));

const usage = mediaUsage([basePost], assets);
assert.equal(usage[0].usedByCount, 1);
assert.equal(usage[1].usedByCount, 0);

console.log("editor-insights tests passed");
