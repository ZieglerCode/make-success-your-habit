import assert from "node:assert/strict";
import {buildBaselineManifest} from "./baseline-manifest";

const manifest = buildBaselineManifest(
  [
    {bytes: 20, path: "390x844/de.png", sha256: "b"},
    {bytes: 30, path: "1440x900/de.png", sha256: "c"},
    {bytes: 10, path: "390x844/root.png", sha256: "a"},
  ],
  "2026-07-19T13:00:00.000Z",
);

assert.equal(manifest.capturedAt, "2026-07-19T13:00:00.000Z");
assert.deepEqual(manifest.viewports, [
  {count: 1, name: "1440x900"},
  {count: 2, name: "390x844"},
]);
assert.deepEqual(manifest.files.map(({path}) => path), [
  "1440x900/de.png",
  "390x844/de.png",
  "390x844/root.png",
]);

console.log("baseline manifest: ok");
