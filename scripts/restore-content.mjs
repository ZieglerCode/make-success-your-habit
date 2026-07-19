import {createHash} from "node:crypto";
import {cp, mkdir, readFile, readdir, rename, rm} from "node:fs/promises";
import {execFileSync} from "node:child_process";
import path from "node:path";
if(process.env.CONFIRM_RESTORE!=="restore-content") throw new Error("Restore blockiert. Setze CONFIRM_RESTORE=restore-content.");
const root=process.env.BACKUP_DIR||"/app/backups", names=(await readdir(root)).filter(x=>!x.startsWith(".")).sort().reverse(), dir=process.argv[2]||path.join(root,names[0]||"");
const manifest=JSON.parse(await readFile(path.join(dir,"manifest.json"),"utf8")); if(manifest.schemaVersion!==1) throw new Error("Unbekannte Backup-Version.");
const hash=async(file)=>createHash("sha256").update(await readFile(file)).digest("hex"); for(const file of Object.values(manifest.files)){if(await hash(path.join(dir,file.name))!==file.sha256)throw new Error(`Prüfsumme falsch: ${file.name}`);}
if(manifest.provider==="postgres") execFileSync("pg_restore",["--clean","--if-exists","--no-owner","--dbname",process.env.DATABASE_URL||process.env.POSTGRES_URL,path.join(dir,manifest.files.database.name)],{stdio:"inherit"});
else {const target=process.env.CONTENT_DB_DIR?path.join(process.env.CONTENT_DB_DIR,"site.sqlite"):path.join(process.cwd(),"content-db","site.sqlite");await mkdir(path.dirname(target),{recursive:true});await cp(path.join(dir,manifest.files.database.name),target);}
const uploads=process.env.UPLOAD_DIR||"/app/public/uploads", temp=`${uploads}.restore-${Date.now()}`, old=`${uploads}.old-${Date.now()}`; await mkdir(temp,{recursive:true}); execFileSync("tar",["-xzf",path.join(dir,manifest.files.uploads.name),"-C",temp]);
try{await rename(uploads,old).catch(()=>{});await rename(temp,uploads);await rm(old,{recursive:true,force:true});}catch(error){await rename(old,uploads).catch(()=>{});throw error;}
console.log(JSON.stringify({ok:true,restored:dir}));
