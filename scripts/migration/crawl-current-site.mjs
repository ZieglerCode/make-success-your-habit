import {mkdir, writeFile} from "node:fs/promises";
import path from "node:path";
import {buildCurrentRouteSeeds, extractPageInventory} from "./source-inventory.ts";
import {buildCopyInventory} from "./copy-comparison.ts";

const baseUrl = new URL(process.env.SOURCE_BASE_URL || "https://www.heike-ziegler.com");
const outputDir = path.resolve(process.env.MIGRATION_INVENTORY_DIR || "artifacts/migration/inventory");

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function loadPublishedBlogSlugs() {
  const response = await fetch(new URL("/api/posts", baseUrl), {
    headers: {accept: "application/json"},
  });
  if (!response.ok) throw new Error(`Blog API returned HTTP ${response.status}.`);
  const payload = await response.json();
  return Array.isArray(payload?.posts)
    ? payload.posts.map((post) => post?.slug).filter((slug) => typeof slug === "string" && slug.length > 0)
    : [];
}

async function fetchRoute(route) {
  const requestedUrl = new URL(route, baseUrl).href;
  const initial = await fetch(requestedUrl, {redirect: "manual"});
  const isRedirect = initial.status >= 300 && initial.status < 400;
  const location = initial.headers.get("location");
  const final = isRedirect && location
    ? await fetch(new URL(location, requestedUrl), {redirect: "follow"})
    : initial;
  const html = await final.text();
  return extractPageInventory({
    finalUrl: final.url || requestedUrl,
    html,
    requestedUrl,
    status: initial.status,
  });
}

const slugs = await loadPublishedBlogSlugs();
const routes = buildCurrentRouteSeeds(slugs);
const pages = [];

for (const route of routes) {
  const page = await fetchRoute(route);
  pages.push({...page, route});
  process.stderr.write(`inventoried ${route} -> ${page.status} ${page.finalUrl}\n`);
}

const routeInventory = pages.map(({finalUrl, lang, requestedUrl, route, status, title}) => ({
  finalUrl,
  lang,
  requestedUrl,
  route,
  status,
  title,
}));
const copyInventory = buildCopyInventory(pages.map(({route, semanticText}) => ({route, semanticText})));
const linkInventory = pages.map(({links, route}) => ({links, route}));
const assetInventory = pages.map(({iframes, images, route, videos}) => ({iframes, images, route, videos}));
const metadataInventory = pages.map(({canonical, description, headings, hreflang, lang, openGraph, route, title}) => ({
  canonical,
  description,
  headings,
  hreflang,
  lang,
  openGraph,
  route,
  title,
}));

await mkdir(outputDir, {recursive: true});
await Promise.all([
  writeFile(path.join(outputDir, "routes.json"), stableJson(routeInventory)),
  writeFile(path.join(outputDir, "pages.raw.json"), stableJson(pages)),
  writeFile(path.join(outputDir, "copy.json"), stableJson(copyInventory)),
  writeFile(path.join(outputDir, "links.json"), stableJson(linkInventory)),
  writeFile(path.join(outputDir, "assets.json"), stableJson(assetInventory)),
  writeFile(path.join(outputDir, "metadata.json"), stableJson(metadataInventory)),
]);

process.stdout.write(
  stableJson({
    outputDir,
    pageCount: pages.length,
    publishedBlogCount: slugs.length,
    source: baseUrl.href,
  }),
);
