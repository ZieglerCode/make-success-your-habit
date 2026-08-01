import assert from "node:assert/strict";
import {resolveDestination} from "../lib/ai/navigation";
import {retrieveKnowledge} from "../lib/ai/retrieval";
import {answerDeterministically, parseAssistantReply} from "../lib/ai/response";

assert.equal(resolveDestination("isobl", "de")?.href, "/de/isobl?from=ai");
assert.equal(resolveDestination("contact", "en")?.href, "/en#kontakt");
assert.equal(resolveDestination("https://evil.example", "de"), null);
assert.equal(resolveDestination("javascript:alert(1)", "en"), null);

const deIsobl = answerDeterministically("Was ist ISOBL?", "de");
assert.equal(deIsobl?.destination, "isobl");
assert.match(deIsobl?.answer ?? "", /ISOBL/);
assert.equal(deIsobl?.navigation?.href, "/de/isobl?from=ai");

const enContact = answerDeterministically("How can I contact Heike?", "en");
assert.equal(enContact?.destination, "contact");
assert.match(enContact?.answer ?? "", /contact@heike-ziegler\.com/);
assert.equal(enContact?.navigation?.href, "/en#kontakt");

assert.equal(answerDeterministically("What does inner clarity mean?", "en"), null);

assert.equal(
  parseAssistantReply({answer: "<script>alert(1)</script>", destination: "isobl"}, "de"),
  null,
);
assert.equal(
  parseAssistantReply({answer: "Visit https://evil.example", destination: "none"}, "en"),
  null,
);
assert.equal(parseAssistantReply({answer: "Safe", destination: "evil"}, "en"), null);
assert.equal(
  parseAssistantReply(
    {answer: "Write to support@heike-ziegler.com", destination: "contact"},
    "en",
  ),
  null,
);

const valid = parseAssistantReply(
  {answer: "You can find the verified details on the ISOBL page.", destination: "isobl"},
  "en",
);
assert.equal(valid?.source, "model");
assert.equal(valid?.navigation?.href, "/en/isobl?from=ai");

const germanIsobl = retrieveKnowledge("Was ist ISOBL und für wen ist es gedacht?", "de", 4);
assert(germanIsobl.length > 0);
assert(germanIsobl.every((chunk) => chunk.locale === "de"));
assert(germanIsobl.some((chunk) => chunk.destination === "isobl"));
assert(germanIsobl.reduce((sum, chunk) => sum + chunk.text.length, 0) <= 7_000);

const englishAbout = retrieveKnowledge("Who is Heike and what is her experience?", "en", 4);
assert(englishAbout.length > 0);
assert(englishAbout.every((chunk) => chunk.locale === "en"));
assert(englishAbout.some((chunk) => chunk.destination === "about"));

const unrelated = retrieveKnowledge("How does coaching support inner clarity?", "en", 4);
assert(unrelated.every((chunk) => !chunk.legalReferenceOnly));

const legal = retrieveKnowledge("Where can I read the privacy policy?", "en", 4);
assert(legal.some((chunk) => chunk.destination === "legal_privacy"));

console.log("AI core security tests passed");
