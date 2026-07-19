import assert from "node:assert/strict";
import {access, mkdtemp} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {deleteMediaGroup, storeMediaGroup} from "../lib/media-storage.ts";

const root = await mkdtemp(path.join(os.tmpdir(), "media-store-"));
const stored = await storeMediaGroup("asset-1", [{name: "original.jpg", bytes: new Uint8Array([1, 2]), contentType: "image/jpeg"}], root);
assert.equal(stored["original.jpg"], "/uploads/asset-1/original.jpg");
await access(path.join(root, "uploads", "asset-1", "original.jpg"));
await deleteMediaGroup("asset-1", Object.values(stored), root);
await deleteMediaGroup("asset-1", Object.values(stored), root);
await assert.rejects(access(path.join(root, "uploads", "asset-1")));
console.log("media storage: ok");
