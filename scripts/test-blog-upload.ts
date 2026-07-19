import assert from "node:assert/strict";
import {applyUploadedCover} from "../lib/blog-upload";

const current = {
  coverAlt: "Bisheriges Cover",
  coverImage: "/media/images/heike-ziegler.webp",
  title: "Test",
};
const uploaded = {
  alt: "Neues Portrait",
  mimeType: "image/webp",
  url: "/uploads/neues-portrait-123.webp",
};
const next = applyUploadedCover(current, uploaded);

assert.deepEqual(next, {...current, coverAlt: "Neues Portrait", coverImage: uploaded.url});
assert.notEqual(next, current);
assert.equal(applyUploadedCover(current, {...uploaded, alt: ""}).coverAlt, current.coverAlt);

console.log("blog upload mapping tests passed");
