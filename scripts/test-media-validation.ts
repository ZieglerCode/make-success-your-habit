import assert from "node:assert/strict";
import {detectMediaType, validateMediaUpload} from "../lib/media-validation.ts";

const bytes = {
  jpeg: [0xff, 0xd8, 0xff, 0xdb],
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  webp: [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50],
  mp4: [0, 0, 0, 24, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d],
  webm: [0x1a, 0x45, 0xdf, 0xa3],
} as const;

assert.equal(detectMediaType(new Uint8Array(bytes.jpeg)), "image/jpeg");
assert.equal(detectMediaType(new Uint8Array(bytes.png)), "image/png");
assert.equal(detectMediaType(new Uint8Array(bytes.webp)), "image/webp");
assert.equal(detectMediaType(new Uint8Array(bytes.mp4)), "video/mp4");
assert.equal(detectMediaType(new Uint8Array(bytes.webm)), "video/webm");
assert.equal(detectMediaType(new Uint8Array([1, 2, 3, 4])), null);

const jpeg = new File([new Uint8Array(bytes.jpeg)], "photo.jpg", {type: "image/jpeg"});
assert.equal((await validateMediaUpload(jpeg)).mimeType, "image/jpeg");

await assert.rejects(
  validateMediaUpload(new File([new Uint8Array(bytes.jpeg)], "fake.png", {type: "image/png"})),
  /Dateiinhalt passt nicht/i,
);
await assert.rejects(
  validateMediaUpload(new File([new Uint8Array([1, 2, 3])], "fake.jpg", {type: "image/jpeg"})),
  /keine gültige/i,
);

console.log("media validation: ok");
