export type SearchParams = Promise<Record<string, string | string[] | undefined>> | undefined;

const backTargets: Record<string, string> = {
  start: "/en#start",
  methode: "/en#methode",
  angebote: "/en#angebote",
  "ueber-heike": "/en#ueber-heike",
  insights: "/blog",
  community: "/en#community",
  kontakt: "/en#kontakt",
  footer: "/en#angebote",
};

export async function resolveBackHref(searchParams: SearchParams, fallback: string) {
  const params = await searchParams;
  const value = params?.from;
  const from = Array.isArray(value) ? value[0] : value;
  const isGermanFallback = fallback.startsWith("/de");

  if (!from) return fallback;

  const target = backTargets[from];
  if (!target) return fallback;

  if (isGermanFallback && target.startsWith("/en")) {
    return `/de${target.slice(3)}`;
  }
  return target;
}
