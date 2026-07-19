import {createHash} from "node:crypto";
import {cp, mkdir, readFile, readdir, rename, rm, writeFile} from "node:fs/promises";
import {execFileSync} from "node:child_process";
import path from "node:path";

const root=process.env.BACKUP_DIR||"/app/backups", uploads=process.env.UPLOAD_DIR||"/app/public/uploads", keep=Number(process.env.BACKUP_RETENTION_DAYS||14);
const createdAt=new Date().toISOString(), name=createdAt.replace(/[:.]/g,"-"), temp=path.join(root,`.tmp-${name}`), target=path.join(root,name);
const hash=async(file)=>createHash("sha256").update(await readFile(file)).digest("hex");
await mkdir(root,{recursive:true}); await rm(temp,{recursive:true,force:true}); await mkdir(temp,{recursive:true});
try {
  let provider, dbName;
  if(process.env.DATABASE_URL||process.env.POSTGRES_URL){provider="postgres";dbName="database.dump";execFileSync("pg_dump",["--format=custom","--file",path.join(temp,dbName),process.env.DATABASE_URL||process.env.POSTGRES_URL],{stdio:"inherit"});}
  else if(process.env.TURSO_DATABASE_URL) throw new Error("Turso-Backups müssen über den Anbieter exportiert werden; lokales Backup abgebrochen.");
  else {provider="local-sqlite";dbName="site.sqlite";const source=process.env.CONTENT_DB_DIR?path.join(process.env.CONTENT_DB_DIR,"site.sqlite"):path.join(process.cwd(),"content-db","site.sqlite");await cp(source,path.join(temp,dbName));}
  await mkdir(uploads,{recursive:true}); const uploadsName="uploads.tar.gz"; execFileSync("tar",["-czf",path.join(temp,uploadsName),"-C",uploads,"."],{stdio:"inherit"});
  const manifest={schemaVersion:1,createdAt,provider,files:{database:{name:dbName,sha256:await hash(path.join(temp,dbName))},uploads:{name:uploadsName,sha256:await hash(path.join(temp,uploadsName))}}};
  await writeFile(path.join(temp,"manifest.json"),JSON.stringify(manifest,null,2)); await rename(temp,target);
  const directories=(await readdir(root)).filter(x=>!x.startsWith(".")).sort().reverse(); await Promise.all(directories.slice(keep).map(x=>rm(path.join(root,x),{recursive:true,force:true})));
  console.log(JSON.stringify({ok:true,backup:target,provider}));
} catch(error){await rm(temp,{recursive:true,force:true});throw error;}
