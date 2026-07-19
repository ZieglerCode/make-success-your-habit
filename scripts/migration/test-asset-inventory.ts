import assert from "node:assert/strict";
import {classifyAsset} from "./asset-inventory";

assert.deepEqual(classifyAsset("public/media/images/hero.webp"), {
  kind: "image",
  mimeType: "image/webp",
});
assert.deepEqual(classifyAsset("public/media/videos/hero.mp4"), {
  kind: "video",
  mimeType: "video/mp4",
});
assert.deepEqual(classifyAsset("public/legal/AGB-DE-EN.pdf"), {
  kind: "document",
  mimeType: "application/pdf",
});
assert.deepEqual(classifyAsset("public/favicon.svg"), {
  kind: "image",
  mimeType: "image/svg+xml",
});
assert.deepEqual(classifyAsset("public/unknown.bin"), {
  kind: "other",
  mimeType: "application/octet-stream",
});

console.log("asset inventory classification: ok");
