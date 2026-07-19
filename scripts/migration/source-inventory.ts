import {load} from "cheerio";

type ExtractPageInput = {
  finalUrl: string;
  html: string;
  requestedUrl: string;
  status: number;
};

const CURRENT_STATIC_ROUTES = [
  "/",
  "/de",
  "/en",
  "/method",
  "/about-heike",
  "/community",
  "/instant-success-formula",
  "/isobl",
  "/isa-alliance",
  "/blog",
] as const;

const CURRENT_LEGAL_ROUTES = [
  "/legal/agb",
  "/legal/datenschutz",
  "/legal/eula",
  "/legal/impressum",
  "/legal/nutzungsbedingungen",
  "/legal/widerruf",
] as const;

export function buildCurrentRouteSeeds(blogSlugs: string[]) {
  const blogRoutes = blogSlugs.map((slug) => `/blog/${encodeURIComponent(slug)}`);
  return [...CURRENT_STATIC_ROUTES, ...blogRoutes, ...CURRENT_LEGAL_ROUTES];
}

export function normalizeVisibleText(value: string) {
  return value.replace(/\s+/gu, " ").trim();
}

function absoluteUrl(value: string | undefined, baseUrl: string) {
  if (!value) return "";
  try {
    return new URL(value, baseUrl).href;
  } catch {
    return value;
  }
}

function optionalNumber(value: string | undefined) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function extractPageInventory({finalUrl, html, requestedUrl, status}: ExtractPageInput) {
  const $ = load(html);
  const semanticText = $("main")
    .find("h1,h2,h3,h4,h5,h6,p,li,button,a")
    .toArray()
    .map((element) => ({
      tag: element.tagName.toLowerCase(),
      text: normalizeVisibleText($(element).text()),
    }))
    .filter(({text}) => text.length > 0);

  const headings = $("h1,h2,h3,h4,h5,h6")
    .toArray()
    .map((element) => ({
      level: Number(element.tagName.slice(1)),
      text: normalizeVisibleText($(element).text()),
    }))
    .filter(({text}) => text.length > 0);

  const links = $("a[href]")
    .toArray()
    .map((element) => ({
      href: absoluteUrl($(element).attr("href"), finalUrl),
      target: $(element).attr("target") || null,
      text: normalizeVisibleText($(element).text()),
    }));

  const images = $("img[src]")
    .toArray()
    .map((element) => ({
      alt: $(element).attr("alt") || "",
      height: optionalNumber($(element).attr("height")),
      src: absoluteUrl($(element).attr("src"), finalUrl),
      width: optionalNumber($(element).attr("width")),
    }));

  const videos = $("video")
    .toArray()
    .map((element) => {
      const video = $(element);
      const sources = [video.attr("src"), ...video.find("source[src]").toArray().map((source) => $(source).attr("src"))]
        .filter((source): source is string => Boolean(source))
        .map((source) => absoluteUrl(source, finalUrl));
      return {
        poster: absoluteUrl(video.attr("poster"), finalUrl),
        sources,
      };
    });

  const openGraph: Record<string, string> = {};
  $('meta[property^="og:"]').each((_index, element) => {
    const property = $(element).attr("property")?.slice(3);
    const content = $(element).attr("content");
    if (property && content) openGraph[property] = content;
  });

  return {
    canonical: absoluteUrl($('link[rel="canonical"]').attr("href"), finalUrl),
    description: $('meta[name="description"]').attr("content") || "",
    finalUrl,
    headings,
    hreflang: $('link[rel="alternate"][hreflang][href]')
      .toArray()
      .map((element) => ({
        href: absoluteUrl($(element).attr("href"), finalUrl),
        lang: $(element).attr("hreflang") || "",
      })),
    iframes: $("iframe[src]")
      .toArray()
      .map((element) => absoluteUrl($(element).attr("src"), finalUrl)),
    images,
    lang: $("html").attr("lang") || "",
    links,
    openGraph,
    requestedUrl,
    semanticText,
    status,
    title: normalizeVisibleText($("title").text()),
    videos,
  };
}
