import {readFile} from "node:fs/promises";
import path from "node:path";
import {compareCopyInventories} from "./copy-comparison.ts";

const sourcePath = path.resolve(process.env.SOURCE_COPY || "artifacts/migration/inventory/copy.json");
const candidatePath = path.resolve(process.env.CANDIDATE_COPY || "artifacts/migration/candidate/copy.json");
const source = JSON.parse(await readFile(sourcePath, "utf8"));
const candidate = JSON.parse(await readFile(candidatePath, "utf8"));
const result = compareCopyInventories(source, candidate);
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!result.ok) process.exitCode = 1;
