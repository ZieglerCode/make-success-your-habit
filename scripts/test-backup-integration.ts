import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {mkdir, mkdtemp, readFile, readdir, writeFile} from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const root=await mkdtemp(path.join(os.tmpdir(),"content-backup-"));
const db=path.join(root,"db"), uploads=path.join(root,"uploads"), backups=path.join(root,"backups");
await mkdir(db,{recursive:true}); await mkdir(uploads,{recursive:true});
await writeFile(path.join(db,"site.sqlite"),"database-before"); await writeFile(path.join(uploads,"image.webp"),"image-before");
const env={...process.env,CONTENT_DB_DIR:db,UPLOAD_DIR:uploads,BACKUP_DIR:backups,BACKUP_RETENTION_DAYS:"14"};
const backup=spawnSync(process.execPath,["scripts/backup-content.mjs"],{cwd:process.cwd(),env,encoding:"utf8"});
assert.equal(backup.status,0,backup.stderr); const [directory]=await readdir(backups); assert.ok(directory);
await writeFile(path.join(db,"site.sqlite"),"database-after"); await writeFile(path.join(uploads,"image.webp"),"image-after");
const restore=spawnSync(process.execPath,["scripts/restore-content.mjs",path.join(backups,directory)],{cwd:process.cwd(),env:{...env,CONFIRM_RESTORE:"restore-content"},encoding:"utf8"});
assert.equal(restore.status,0,restore.stderr);
assert.equal(await readFile(path.join(db,"site.sqlite"),"utf8"),"database-before");
assert.equal(await readFile(path.join(uploads,"image.webp"),"utf8"),"image-before");
console.log("backup integration: ok");
