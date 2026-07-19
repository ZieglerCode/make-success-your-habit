import {createHash} from "node:crypto";
import {readFile, readdir, writeFile} from "node:fs/promises";
import path from "node:path";
import {buildBaselineManifest} from "./baseline-manifest.ts";

const root = path.resolve("artifacts/migration/baseline/screenshots");
const records = [];

for (const viewport of await readdir(root, {withFileTypes: true})) {
  if (!viewport.isDirectory()) continue;
  for (const entry of await readdir(path.join(root, viewport.name), {withFileTypes: true})) {
    if (!entry.isFile() || !entry.name.endsWith(".png")) continue;
    const filename = path.join(root, viewport.name, entry.name);
    const bytes = await readFile(filename);
    records.push({
      bytes: bytes.length,
      path: `${viewport.name}/${entry.name}`,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    });
  }
}

const manifest = buildBaselineManifest(records, new Date().toISOString());
await writeFile(path.resolve("artifacts/migration/baseline/manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({files: manifest.files.length, viewports: manifest.viewports}, null, 2)}\n`);
