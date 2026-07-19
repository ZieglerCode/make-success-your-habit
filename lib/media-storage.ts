import {mkdir, rm, writeFile} from "node:fs/promises";
import path from "node:path";
import {del, put} from "@vercel/blob";

export type StoredPart = {name: string; bytes: Uint8Array; contentType: string};

export async function storeMediaGroup(assetId: string, parts: StoredPart[], root = path.join(process.cwd(), "public")) {
  const urls: Record<string, string> = {};
  for (const part of parts) {
    const key = `uploads/${assetId}/${part.name}`;
    if (process.env.BLOB_READ_WRITE_TOKEN && root === path.join(process.cwd(), "public")) {
      urls[part.name] = (await put(key, Buffer.from(part.bytes), {access: "public", addRandomSuffix: false, contentType: part.contentType})).url;
    } else {
      const target = path.join(root, key);
      await mkdir(path.dirname(target), {recursive: true});
      await writeFile(target, part.bytes);
      urls[part.name] = `/${key}`;
    }
  }
  return urls;
}

export async function deleteMediaGroup(assetId: string, urls: string[], root = path.join(process.cwd(), "public")) {
  if (process.env.BLOB_READ_WRITE_TOKEN && root === path.join(process.cwd(), "public")) {
    const remote = urls.filter((url) => /^https?:\/\//.test(url));
    if (remote.length) await del(remote);
    return;
  }
  await rm(path.join(root, "uploads", assetId), {recursive: true, force: true});
}
