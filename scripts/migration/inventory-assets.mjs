import {execFileSync} from "node:child_process";
import {createHash} from "node:crypto";
import {readFile, readdir, stat, writeFile} from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {classifyAsset} from "./asset-inventory.ts";

const publicDir = path.resolve("public");
const outputPath = path.resolve("artifacts/migration/inventory/repository-assets.json");
const renderedAssets = JSON.parse(await readFile("artifacts/migration/inventory/assets.json", "utf8"));

async function walk(directory) {
  const entries = await readdir(directory, {withFileTypes: true});
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(absolute)));
    if (entry.isFile()) files.push(absolute);
  }
  return files;
}

function usageFor(publicUrl) {
  const usages = [];
  for (const page of renderedAssets) {
    for (const image of page.images) {
      if (decodeURI(new URL(image.src).pathname) === decodeURI(publicUrl)) {
        usages.push({alt: image.alt, route: page.route, type: "image"});
      }
    }
    for (const video of page.videos) {
      if (video.sources.some((source) => decodeURI(new URL(source).pathname) === decodeURI(publicUrl))) {
        usages.push({alt: "", route: page.route, type: "video"});
      }
    }
  }
  return usages;
}

function videoDuration(filename) {
  try {
    return Number(
      execFileSync("ffprobe", [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        filename,
      ], {encoding: "utf8"}).trim(),
    );
  } catch {
    return null;
  }
}

const records = [];
for (const filename of (await walk(publicDir)).sort()) {
  const relativePath = path.relative(process.cwd(), filename);
  const publicUrl = `/${path.relative(publicDir, filename).split(path.sep).join("/")}`;
  const bytes = await readFile(filename);
  const fileStat = await stat(filename);
  const classification = classifyAsset(relativePath);
  let width = null;
  let height = null;
  if (classification.kind === "image") {
    const metadata = await sharp(bytes).metadata();
    width = metadata.width ?? null;
    height = metadata.height ?? null;
  }
  records.push({
    ...classification,
    bytes: fileStat.size,
    durationSeconds: classification.kind === "video" ? videoDuration(filename) : null,
    height,
    path: relativePath,
    publicUrl,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    usages: usageFor(publicUrl),
    width,
  });
}

await writeFile(outputPath, `${JSON.stringify(records, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({assetCount: records.length, outputPath}, null, 2)}\n`);
