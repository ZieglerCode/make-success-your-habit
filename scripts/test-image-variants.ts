import assert from "node:assert/strict";
import sharp from "sharp";
import {createImageVariants} from "../lib/image-variants.ts";

const input = await sharp({
  create: {width: 2000, height: 1200, channels: 3, background: {r: 120, g: 80, b: 40}},
}).jpeg().toBuffer();

const result = await createImageVariants(input, {x: 0.25, y: 0.75});
assert.equal(result.width, 2000);
assert.equal(result.height, 1200);
assert.deepEqual(Object.keys(result.variants), ["sm", "md", "lg", "social"]);
assert.equal((await sharp(result.variants.sm.buffer).metadata()).width, 640);
assert.equal((await sharp(result.variants.md.buffer).metadata()).width, 1280);
assert.equal((await sharp(result.variants.lg.buffer).metadata()).width, 1920);
const social = await sharp(result.variants.social.buffer).metadata();
assert.equal(social.width, 1200);
assert.equal(social.height, 630);
assert.equal(social.exif, undefined);
assert.deepEqual(result.focalPoint, {x: 0.25, y: 0.75});

await assert.rejects(
  createImageVariants(await sharp({create: {width: 12001, height: 2, channels: 3, background: "red"}}).png().toBuffer()),
  /Abmessungen/i,
);

console.log("image variants: ok");
