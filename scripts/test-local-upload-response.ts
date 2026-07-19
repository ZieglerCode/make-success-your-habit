import assert from "node:assert/strict";
import {mkdtemp, writeFile} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {localUploadResponse} from "../lib/local-upload-response";

const directory = await mkdtemp(path.join(os.tmpdir(), "msyh-upload-test-"));
await writeFile(path.join(directory, "cover-123.webp"), new Uint8Array([82, 73, 70, 70]));

const found = await localUploadResponse("cover-123.webp", directory);
assert.equal(found.status, 200);
assert.equal(found.headers.get("content-type"), "image/webp");
assert.equal(found.headers.get("cache-control"), "public, max-age=31536000, immutable");
assert.deepEqual(Array.from(new Uint8Array(await found.arrayBuffer())), [82, 73, 70, 70]);

assert.equal((await localUploadResponse("missing.webp", directory)).status, 404);
assert.equal((await localUploadResponse("../secret.webp", directory)).status, 404);
assert.equal((await localUploadResponse("folder/secret.webp", directory)).status, 404);

console.log("local upload response tests passed");
