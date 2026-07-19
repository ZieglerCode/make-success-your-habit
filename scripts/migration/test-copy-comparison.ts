import assert from "node:assert/strict";
import {buildCopyInventory, compareCopyInventories} from "./copy-comparison";

const source = buildCopyInventory([
  {route: "/de", semanticText: [{tag: "h1", text: "Erfolg."}]},
  {route: "/en", semanticText: [{tag: "h1", text: "Success."}]},
]);

assert.equal(source.length, 2);
assert.match(source[0]?.hash || "", /^[a-f0-9]{64}$/);

assert.deepEqual(compareCopyInventories(source, source), {
  extraRoutes: [],
  mismatches: [],
  missingRoutes: [],
  ok: true,
});

const comparison = compareCopyInventories(source, [
  {hash: "changed", route: "/de", semanticText: [{tag: "h1", text: "Optimierter Erfolg."}]},
  {hash: "extra", route: "/extra", semanticText: []},
]);

assert.equal(comparison.ok, false);
assert.deepEqual(comparison.missingRoutes, ["/en"]);
assert.deepEqual(comparison.extraRoutes, ["/extra"]);
assert.deepEqual(comparison.mismatches, [
  {
    actual: [{tag: "h1", text: "Optimierter Erfolg."}],
    expected: [{tag: "h1", text: "Erfolg."}],
    route: "/de",
  },
]);

console.log("copy comparison: ok");
