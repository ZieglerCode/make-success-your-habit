import snapshotJson from "@/lib/ai/generated-knowledge.json";
import type {KnowledgeChunk, KnowledgeSnapshot, SiteLang} from "@/lib/ai/knowledge-types";

const snapshot = snapshotJson as KnowledgeSnapshot;
const MAX_CONTEXT_LENGTH = 7_000;

const stopWords = new Set([
  "aber", "all", "alle", "als", "am", "an", "and", "are", "auf", "aus", "bei", "das",
  "dem", "den", "der", "die", "does", "ein", "eine", "einer", "for", "für", "how", "ich",
  "in", "ist", "is", "it", "mit", "of", "oder", "the", "to", "und", "von", "was", "what",
  "where", "who", "wie", "with", "zu",
]);

const legalTerms = /\b(agb|datenschutz|privacy|impressum|imprint|legal notice|eula|terms|nutzungsbedingungen|widerruf|withdrawal|refund)\b/i;

function tokens(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .match(/[a-z0-9]{2,}/g)
    ?.filter((token) => !stopWords.has(token)) ?? [];
}

function scoreChunk(chunk: KnowledgeChunk, queryTokens: string[]) {
  const title = `${chunk.title} ${chunk.topics.join(" ")}`.normalize("NFKD").toLowerCase();
  const body = chunk.text.normalize("NFKD").toLowerCase();
  return queryTokens.reduce((score, token) => {
    if (title.includes(token)) return score + 8;
    if (body.includes(token)) return score + 2;
    return score;
  }, 0);
}

export function retrieveKnowledge(question: string, locale: SiteLang, limit = 4): KnowledgeChunk[] {
  const queryTokens = [...new Set(tokens(question))];
  if (!queryTokens.length) return [];
  const asksLegalQuestion = legalTerms.test(question);
  const ranked = snapshot.chunks
    .filter((chunk) => chunk.locale === locale)
    .filter((chunk) => asksLegalQuestion || !chunk.legalReferenceOnly)
    .map((chunk) => ({chunk, score: scoreChunk(chunk, queryTokens)}))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.chunk.id.localeCompare(right.chunk.id));

  const selected: KnowledgeChunk[] = [];
  let totalLength = 0;
  for (const {chunk} of ranked) {
    if (selected.length >= Math.max(1, Math.min(limit, 4))) break;
    if (totalLength + chunk.text.length > MAX_CONTEXT_LENGTH) continue;
    selected.push(chunk);
    totalLength += chunk.text.length;
  }
  return selected;
}
