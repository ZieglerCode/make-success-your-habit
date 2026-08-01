import type {SiteLang} from "@/lib/ai/knowledge-types";

const excludedPrefixes = [
  "/admin",
  "/api",
  "/payload-admin",
  "/payload-api",
  "/payload-graphql",
  "/payload-graphql-playground",
  "/uploads",
];

const publicBasePaths = [
  "/method",
  "/about-heike",
  "/community",
  "/blog",
  "/instant-success-formula",
  "/isobl",
  "/isa-alliance",
  "/legal",
];

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function getPublicAssistantContext(pathname: string): {locale: SiteLang} | null {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (excludedPrefixes.some((prefix) => matchesPrefix(normalized, prefix))) return null;
  if (normalized === "/" || normalized === "/de") return {locale: "de"};
  if (normalized === "/en") return {locale: "en"};

  const localized = normalized.match(/^\/(de|en)(\/.*)$/);
  if (localized) {
    const locale = localized[1] as SiteLang;
    return publicBasePaths.some((prefix) => matchesPrefix(localized[2], prefix)) ? {locale} : null;
  }

  return publicBasePaths.some((prefix) => matchesPrefix(normalized, prefix))
    ? {locale: "en"}
    : null;
}
