export type SiteLang = "de" | "en";

export const KNOWLEDGE_DESTINATIONS = [
  "home",
  "method",
  "about",
  "community",
  "blog",
  "isf",
  "isobl",
  "isa",
  "contact",
  "legal_agb",
  "legal_privacy",
  "legal_imprint",
  "legal_eula",
  "legal_terms",
  "legal_withdrawal",
  "none",
] as const;

export type KnowledgeDestination = (typeof KNOWLEDGE_DESTINATIONS)[number];

export type KnowledgeChunk = {
  id: string;
  locale: SiteLang;
  destination: KnowledgeDestination;
  sourcePath: string;
  title: string;
  topics: string[];
  text: string;
  legalReferenceOnly?: boolean;
};

export type KnowledgeSnapshot = {
  generatedAt: string;
  sourceBaseUrl: string;
  chunks: KnowledgeChunk[];
};
