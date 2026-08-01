import {writeFile} from "node:fs/promises";
import path from "node:path";

const baseUrl = (process.env.AI_KNOWLEDGE_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const outputPath = path.join(process.cwd(), "lib", "ai", "generated-knowledge.json");
const approvedEmail = "contact@heike-ziegler.com";

const pages = [
  ["home", "", ["success", "identity", "clarity", "leadership", "contact"]],
  ["method", "/method", ["method", "see", "clear", "become"]],
  ["about", "/about-heike", ["heike", "about", "experience"]],
  ["community", "/community", ["community", "connection", "membership"]],
  ["blog", "/blog", ["blog", "insights", "articles"]],
  ["isf", "/instant-success-formula", ["isf", "instant success formula"]],
  ["isobl", "/isobl", ["isobl", "online business", "practice"]],
  ["isa", "/isa-alliance", ["isa", "instant success alliance"]],
  ["legal_agb", "/legal/agb", ["agb", "terms and conditions"]],
  ["legal_privacy", "/legal/datenschutz", ["datenschutz", "privacy"]],
  ["legal_imprint", "/legal/impressum", ["impressum", "imprint", "contact"]],
  ["legal_eula", "/legal/eula", ["eula", "license"]],
  ["legal_terms", "/legal/nutzungsbedingungen", ["nutzungsbedingungen", "terms of use"]],
  ["legal_withdrawal", "/legal/widerruf", ["widerruf", "withdrawal", "refund"]],
];

const entityMap = new Map([
  ["amp", "&"], ["lt", "<"], ["gt", ">"], ["quot", '"'], ["apos", "'"],
  ["nbsp", " "], ["ndash", "–"], ["mdash", "—"], ["hellip", "…"],
  ["auml", "ä"], ["ouml", "ö"], ["uuml", "ü"], ["Auml", "Ä"],
  ["Ouml", "Ö"], ["Uuml", "Ü"], ["szlig", "ß"],
]);

function decodeEntities(value) {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    if (entity.startsWith("#x") || entity.startsWith("#X")) {
      return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    }
    if (entity.startsWith("#")) return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    return entityMap.get(entity) ?? match;
  });
}

function visibleText(html) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  if (!main) throw new Error("Page does not contain a <main> element.");

  return decodeEntities(
    main
      .replace(/<(script|style|noscript|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
      .replace(/<!--([\s\S]*?)-->/g, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|h[1-6]|li|section|article|div)>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, approvedEmail)
    .replace(/[\t ]+/g, " ")
    .replace(/ *\n+ */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function titleFromHtml(html, fallback) {
  const raw = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? fallback;
  return decodeEntities(raw.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function splitText(text, maxLength = 2_400) {
  const paragraphs = text.split(/\n+/).map((part) => part.trim()).filter(Boolean);
  const chunks = [];
  let current = "";

  function pushCurrent() {
    if (current) chunks.push(current);
    current = "";
  }

  for (const paragraph of paragraphs) {
    const parts = paragraph.match(/[^.!?]+(?:[.!?]+|$)/g) ?? [paragraph];
    for (const rawPart of parts) {
      const part = rawPart.trim();
      if (!part) continue;
      if (part.length > maxLength) {
        pushCurrent();
        for (let index = 0; index < part.length; index += maxLength) {
          chunks.push(part.slice(index, index + maxLength).trim());
        }
        continue;
      }
      const joined = current ? `${current} ${part}` : part;
      if (joined.length > maxLength) pushCurrent();
      current = current ? `${current} ${part}` : part;
    }
  }
  pushCurrent();
  return chunks.filter((chunk) => chunk.length >= 20);
}

function articlePaths(html, locale) {
  const matches = html.matchAll(/href=["']([^"']*\/blog\/[^"'?#]+)[^"']*["']/gi);
  const paths = new Set();
  for (const match of matches) {
    const url = new URL(match[1], baseUrl);
    if (url.origin !== new URL(baseUrl).origin) continue;
    const normalized = url.pathname.startsWith(`/${locale}/`)
      ? url.pathname
      : `/${locale}${url.pathname.startsWith("/") ? "" : "/"}${url.pathname}`;
    if (/^\/(de|en)\/blog\/[^/]+$/.test(normalized)) paths.add(normalized);
  }
  return [...paths].sort();
}

async function fetchPage(sourcePath) {
  const response = await fetch(`${baseUrl}${sourcePath}`, {headers: {accept: "text/html"}});
  if (!response.ok) throw new Error(`${sourcePath} returned HTTP ${response.status}`);
  return response.text();
}

const records = [];
const discoveredArticles = new Map();

for (const locale of ["de", "en"]) {
  for (const [destination, suffix, topics] of pages) {
    const sourcePath = `/${locale}${suffix}`;
    const html = await fetchPage(sourcePath);
    const text = visibleText(html);
    const title = titleFromHtml(html, `${destination} ${locale}`);
    if (text.length < 80) throw new Error(`${sourcePath} returned too little visible content.`);

    splitText(text).forEach((chunk, index) => records.push({
      id: `${locale}:${destination}:${index + 1}`,
      locale,
      destination,
      sourcePath,
      title,
      topics,
      text: chunk,
      ...(destination.startsWith("legal_") ? {legalReferenceOnly: true} : {}),
    }));

    if (destination === "blog") discoveredArticles.set(locale, articlePaths(html, locale));
    process.stdout.write(`Captured ${sourcePath}\n`);
  }
}

const slugs = new Set(
  [...discoveredArticles.values()].flat().map((sourcePath) => sourcePath.split("/").at(-1)),
);

for (const slug of [...slugs].sort()) {
  for (const locale of ["de", "en"]) {
    const sourcePath = `/${locale}/blog/${slug}`;
    const html = await fetchPage(sourcePath);
    const title = titleFromHtml(html, slug);
    const text = visibleText(html);
    splitText(text).forEach((chunk, index) => records.push({
      id: `${locale}:blog:${slug}:${index + 1}`,
      locale,
      destination: "blog",
      sourcePath,
      title,
      topics: ["blog", "insights", title],
      text: chunk,
    }));
    process.stdout.write(`Captured ${sourcePath}\n`);
  }
}

records.sort((left, right) =>
  `${left.locale}:${left.destination}:${left.sourcePath}:${left.id}`.localeCompare(
    `${right.locale}:${right.destination}:${right.sourcePath}:${right.id}`,
  ),
);

const snapshot = {
  generatedAt: new Date().toISOString(),
  sourceBaseUrl: baseUrl,
  chunks: records,
};

await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
process.stdout.write(`Wrote ${records.length} chunks for ${slugs.size} published article(s).\n`);
