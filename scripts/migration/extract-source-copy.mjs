import {readFile, writeFile} from "node:fs/promises";
import path from "node:path";
import {buildCopyInventory} from "./copy-comparison.ts";

const inputPath = path.resolve(process.env.MIGRATION_PAGES_INPUT || "artifacts/migration/inventory/pages.raw.json");
const outputPath = path.resolve(process.env.MIGRATION_COPY_OUTPUT || "artifacts/migration/inventory/copy.json");
const pages = JSON.parse(await readFile(inputPath, "utf8"));
const copy = buildCopyInventory(pages.map(({route, semanticText}) => ({route, semanticText})));
await writeFile(outputPath, `${JSON.stringify(copy, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({outputPath, routes: copy.length}, null, 2)}\n`);
