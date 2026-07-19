import assert from "node:assert/strict";
import {
  calculateCropRegion,
  DEFAULT_COVER_CROPS,
  normalizeCoverCrop,
  normalizeCoverCrops,
} from "../lib/cover-crop";

assert.deepEqual(normalizeCoverCrop({x: -4, y: 9, zoom: 99}), {x: 0, y: 1, zoom: 3});
assert.deepEqual(normalizeCoverCrops("invalid"), DEFAULT_COVER_CROPS);

const centered = calculateCropRegion(1600, 1200, "article", {x: 0.5, y: 0.5, zoom: 1});
assert.deepEqual(centered, {height: 900, left: 0, top: 150, width: 1600});

const zoomed = calculateCropRegion(1600, 1200, "article", {x: 1, y: 0, zoom: 2});
assert.deepEqual(zoomed, {height: 450, left: 800, top: 0, width: 800});

const portrait = calculateCropRegion(900, 1600, "social", {x: 0.5, y: 1, zoom: 1});
assert.equal(portrait.left, 0);
assert.equal(portrait.top, 1600 - portrait.height);
assert.equal(Math.round((portrait.width / portrait.height) * 100), 191);

console.log("cover crop tests passed");
