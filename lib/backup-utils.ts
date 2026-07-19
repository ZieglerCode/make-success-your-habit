import {createHash} from "node:crypto";
import {readFile, readdir, rm} from "node:fs/promises";
import path from "node:path";

export type BackupManifest = {schemaVersion:1; createdAt:string; provider:"postgres"|"local-sqlite"; files:{database:{name:string; sha256:string}; uploads:{name:string; sha256:string}}};
export const backupDirectoryName = (date = new Date()) => date.toISOString().replace(/[:.]/g,"-");
export const sha256 = (bytes:Uint8Array) => createHash("sha256").update(bytes).digest("hex");

export function validateBackupManifest(value:unknown): value is BackupManifest {
  const item = value as BackupManifest;
  return item?.schemaVersion === 1 && !!item.createdAt && ["postgres","local-sqlite"].includes(item.provider) && !!item.files?.database?.sha256 && !!item.files?.uploads?.sha256;
}

export async function latestBackup(root = process.env.BACKUP_DIR || "/app/backups") {
  try {
    const names = (await readdir(root)).filter((name) => !name.startsWith(".")).sort().reverse();
    for (const name of names) {
      try { const parsed:unknown = JSON.parse(await readFile(path.join(root,name,"manifest.json"),"utf8")); if (validateBackupManifest(parsed)) return {directory:name, manifest:parsed}; } catch {}
    }
  } catch {}
  return null;
}

export async function pruneBackupDirectories(root:string, keep=14) {
  const names = (await readdir(root)).filter((name) => !name.startsWith(".")).sort().reverse();
  await Promise.all(names.slice(keep).map((name) => rm(path.join(root,name), {recursive:true,force:true})));
  return names.slice(keep);
}
