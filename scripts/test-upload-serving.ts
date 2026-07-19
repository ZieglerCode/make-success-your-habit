import assert from "node:assert/strict";
import {mkdtemp, writeFile} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {localUploadResponse} from "../lib/local-upload-response.ts";

const previous = process.env.UPLOAD_DIR;
const directory = await mkdtemp(path.join(os.tmpdir(), "msyh-upload-serving-"));
process.env.UPLOAD_DIR = directory;

await writeFile(path.join(directory, "cover.webp"), new Uint8Array([82, 73, 70, 70]));
const found = await localUploadResponse("cover.webp");
assert.equal(found.status, 200);
assert.equal(found.headers.get("content-type"), "image/webp");
assert.equal((await localUploadResponse("missing.webp")).status, 404);
assert.equal((await localUploadResponse("../secret.webp")).status, 404);

if (previous === undefined) delete process.env.UPLOAD_DIR;
else process.env.UPLOAD_DIR = previous;

console.log("upload serving: ok");
