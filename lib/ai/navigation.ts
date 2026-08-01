import {
  KNOWLEDGE_DESTINATIONS,
  type KnowledgeDestination,
  type SiteLang,
} from "@/lib/ai/knowledge-types";

export type SafeDestination = {
  id: Exclude<KnowledgeDestination, "none">;
  href: string;
  label: string;
};

const pathByDestination: Record<Exclude<KnowledgeDestination, "none">, string> = {
  home: "#start",
  method: "/method?from=ai",
  about: "/about-heike?from=ai",
  community: "/community?from=ai",
  blog: "/blog?from=ai",
  isf: "/instant-success-formula?from=ai",
  isobl: "/isobl?from=ai",
  isa: "/isa-alliance?from=ai",
  contact: "#kontakt",
  legal_agb: "/legal/agb?from=ai",
  legal_privacy: "/legal/datenschutz?from=ai",
  legal_imprint: "/legal/impressum?from=ai",
  legal_eula: "/legal/eula?from=ai",
  legal_terms: "/legal/nutzungsbedingungen?from=ai",
  legal_withdrawal: "/legal/widerruf?from=ai",
};

const labels: Record<SiteLang, Record<Exclude<KnowledgeDestination, "none">, string>> = {
  de: {
    home: "Zur Startseite",
    method: "Methode ansehen",
    about: "Mehr über Heike",
    community: "Community ansehen",
    blog: "Zum Blog",
    isf: "Instant Success Formula ansehen",
    isobl: "ISOBL ansehen",
    isa: "ISA Alliance ansehen",
    contact: "Zu den Kontaktdaten",
    legal_agb: "AGB ansehen",
    legal_privacy: "Datenschutz ansehen",
    legal_imprint: "Impressum ansehen",
    legal_eula: "EULA ansehen",
    legal_terms: "Nutzungsbedingungen ansehen",
    legal_withdrawal: "Widerruf ansehen",
  },
  en: {
    home: "Go to the homepage",
    method: "Explore the method",
    about: "Learn more about Heike",
    community: "Explore the community",
    blog: "Visit the blog",
    isf: "Explore the Instant Success Formula",
    isobl: "Explore ISOBL",
    isa: "Explore ISA Alliance",
    contact: "Go to contact details",
    legal_agb: "View terms and conditions",
    legal_privacy: "View privacy policy",
    legal_imprint: "View legal notice",
    legal_eula: "View EULA",
    legal_terms: "View terms of use",
    legal_withdrawal: "View withdrawal policy",
  },
};

function isDestination(value: string): value is KnowledgeDestination {
  return (KNOWLEDGE_DESTINATIONS as readonly string[]).includes(value);
}

export function resolveDestination(value: string, locale: SiteLang): SafeDestination | null {
  if (!isDestination(value) || value === "none") return null;
  const suffix = pathByDestination[value];
  const href = suffix.startsWith("#") ? `/${locale}${suffix}` : `/${locale}${suffix}`;
  return {id: value, href, label: labels[locale][value]};
}
