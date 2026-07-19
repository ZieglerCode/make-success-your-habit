import assert from "node:assert/strict";
import {mkdtemp, rm} from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const directory = await mkdtemp(path.join(os.tmpdir(), "msyh-cover-persistence-"));
process.env.CONTENT_DB_DIR = directory;
delete process.env.DATABASE_URL;
delete process.env.POSTGRES_PRISMA_URL;
delete process.env.POSTGRES_URL;
delete process.env.TURSO_DATABASE_URL;

const {createPost, getPostById, updatePost} = await import("../lib/content-store");

const created = await createPost({
  content: "Testinhalt",
  coverCrops: {
    article: {x: 0.2, y: 0.7, zoom: 1.4},
    card: {x: 0.8, y: 0.3, zoom: 2},
    featured: {x: 0.4, y: 0.6, zoom: 1.2},
    social: {x: 0.65, y: 0.25, zoom: 1.8},
  },
  excerpt: "Persistenztest",
  slug: "cover-persistence-test",
  title: "Cover persistence test",
});

const reloaded = await getPostById(created.id);
assert.deepEqual(reloaded?.coverCrops, created.coverCrops);

const updated = await updatePost(created.id, {
  coverCrops: {...created.coverCrops, social: {x: 1, y: 0, zoom: 3}},
});
const reloadedUpdate = await getPostById(created.id);
assert.deepEqual(reloadedUpdate?.coverCrops.social, updated?.coverCrops.social);

await rm(directory, {force: true, recursive: true});
console.log("cover persistence tests passed");
