import {KNOWLEDGE_DESTINATIONS, type KnowledgeDestination, type SiteLang} from "@/lib/ai/knowledge-types";
import {resolveDestination, type SafeDestination} from "@/lib/ai/navigation";

export type AssistantReply = {
  answer: string;
  destination: KnowledgeDestination;
  navigation?: Pick<SafeDestination, "href" | "label">;
  source: "local" | "model" | "fallback";
};

const APPROVED_EMAIL = "contact@heike-ziegler.com";

const localAnswers: Record<SiteLang, Record<Exclude<KnowledgeDestination, "none" | "home">, string>> = {
  de: {
    method: "Die Methode folgt drei Schritten: SEE, CLEAR und BECOME. Auf der Methodenseite findest du den vollständigen Überblick.",
    about: "Auf der Seite über Heike findest du ihre Haltung, ihren Ansatz und weitere Informationen zu ihrer Arbeit.",
    community: "Die Community verbindet Austausch, bewusste Entwicklung und die langfristige Vision des Quantum Lifedesign Lab.",
    blog: "Im Blog findest du Impulse zu Identität, Klarheit, Selbstführung und nachhaltigem Wachstum.",
    isf: "Die Instant Success Formula führt durch SEE, CLEAR und BECOME, damit Erfolg aus Klarheit, Identität und bewusster Führung entsteht.",
    isobl: "ISOBL steht für Instant Success Online Business Launch. Es erweitert eine bestehende Praxis um eine professionelle digitale Wellness-Plattform, ausgewählte Produkte, automatisierte Abläufe und persönliche Unterstützung.",
    isa: "Die ISA Alliance ist der Community-Einstieg für Austausch, Impulse und strategische Verbindung.",
    contact: `Du erreichst Heike für allgemeine Anfragen ausschließlich unter ${APPROVED_EMAIL}.`,
    legal_agb: "Die veröffentlichten AGB findest du auf der AGB-Seite. Der Assistent gibt dazu keine rechtliche Auslegung.",
    legal_privacy: "Die veröffentlichten Datenschutzinformationen findest du auf der Datenschutzseite. Der Assistent gibt dazu keine rechtliche Auslegung.",
    legal_imprint: "Die Anbieter- und Kontaktdaten findest du im Impressum.",
    legal_eula: "Die veröffentlichte Endnutzer-Lizenzvereinbarung findest du auf der EULA-Seite. Der Assistent gibt dazu keine rechtliche Auslegung.",
    legal_terms: "Die veröffentlichten Nutzungsbedingungen findest du auf der entsprechenden Seite. Der Assistent gibt dazu keine rechtliche Auslegung.",
    legal_withdrawal: "Die veröffentlichten Angaben zu Widerruf und Rückgabe findest du auf der Widerrufsseite. Der Assistent gibt dazu keine rechtliche Auslegung.",
  },
  en: {
    method: "The method follows three steps: SEE, CLEAR, and BECOME. The method page contains the complete overview.",
    about: "The About Heike page explains her perspective, approach, and work in more detail.",
    community: "The community brings together connection, conscious development, and the long-term vision of the Quantum Lifedesign Lab.",
    blog: "The blog shares insights on identity, clarity, self-leadership, and sustainable growth.",
    isf: "The Instant Success Formula moves through SEE, CLEAR, and BECOME so success can grow from clarity, identity, and conscious leadership.",
    isobl: "ISOBL stands for Instant Success Online Business Launch. It extends an existing practice with a professional digital wellness platform, curated products, automated processes, and personal support.",
    isa: "ISA Alliance is the community entry point for connection, insights, and strategic exchange.",
    contact: `For general enquiries, contact Heike only at ${APPROVED_EMAIL}.`,
    legal_agb: "The published terms and conditions are available on the terms page. The assistant does not provide legal interpretation.",
    legal_privacy: "The published privacy information is available on the privacy page. The assistant does not provide legal interpretation.",
    legal_imprint: "Provider and contact details are available on the legal notice page.",
    legal_eula: "The published end-user licence agreement is available on the EULA page. The assistant does not provide legal interpretation.",
    legal_terms: "The published terms of use are available on the terms page. The assistant does not provide legal interpretation.",
    legal_withdrawal: "The published withdrawal and refund information is available on the withdrawal page. The assistant does not provide legal interpretation.",
  },
};

const intentPatterns: Array<[Exclude<KnowledgeDestination, "none" | "home">, RegExp]> = [
  ["contact", /\b(kontakt|kontaktieren|erreichen|e-?mail|email|contact|reach|write to)\b/i],
  ["isobl", /\b(isobl|instant success online business launch)\b/i],
  ["isf", /\b(isf|instant success formula)\b/i],
  ["isa", /\b(isa alliance|instant success alliance)\b/i],
  ["about", /\b(über heike|ueber heike|wer ist heike|about heike|who is heike)\b/i],
  ["community", /\b(community|gemeinschaft|quantum lifedesign lab)\b/i],
  ["blog", /\b(blog|insights|artikel|article|essay)\b/i],
  ["legal_privacy", /\b(datenschutz|privacy(?: policy)?)\b/i],
  ["legal_imprint", /\b(impressum|legal notice|imprint)\b/i],
  ["legal_eula", /\b(eula|end.user licen[cs]e)\b/i],
  ["legal_withdrawal", /\b(widerruf|rückgabe|refund|withdrawal)\b/i],
  ["legal_terms", /\b(nutzungsbedingungen|terms of use)\b/i],
  ["legal_agb", /\b(agb|terms and conditions)\b/i],
  ["method", /\b(methode|method|see clear become)\b/i],
];

function withNavigation(
  answer: string,
  destination: KnowledgeDestination,
  locale: SiteLang,
  source: AssistantReply["source"],
): AssistantReply {
  const navigation = resolveDestination(destination, locale);
  return {
    answer,
    destination,
    ...(navigation ? {navigation: {href: navigation.href, label: navigation.label}} : {}),
    source,
  };
}

export function answerDeterministically(
  question: string,
  locale: SiteLang,
  messages?: Array<{role: string; content: string}>,
): AssistantReply | null {
  const normalized = question.normalize("NFKC").trim();

  // 1. Follow-up navigation intent (e.g. "öffne die seite", "bring mich dorthin", "open the page")
  const followUpNavPattern = /^(?:öffne(?: die seite| sie)?|oeffne(?: die seite| sie)?|seite öffnen|seite oeffnen|bring mich (?:dorthin|hin)|geh (?:dorthin|hin)|gehe (?:dorthin|hin)|zeig sie mir|zeige sie mir|open(?: the page| it)?|take me there|go there)[.!]?$/i;

  if (followUpNavPattern.test(normalized) && messages && messages.length > 1) {
    const prevText = messages.slice(-3, -1).map((m) => m.content).join(" ");
    for (const [destination, pattern] of intentPatterns) {
      if (pattern.test(prevText)) {
        const directNavAnswers: Record<SiteLang, Record<Exclude<KnowledgeDestination, "none" | "home">, string>> = {
          de: {
            isobl: "Ich öffne jetzt die ISOBL-Seite für dich.",
            method: "Ich öffne jetzt die Methodenseite für dich.",
            about: "Ich bringe dich jetzt zur Seite über Heike.",
            community: "Ich öffne jetzt die Community-Seite für dich.",
            blog: "Ich bringe dich jetzt zum Blog.",
            isf: "Ich öffne jetzt die Seite zur Instant Success Formula für dich.",
            isa: "Ich öffne jetzt die ISA Alliance Seite für dich.",
            contact: "Ich bringe dich jetzt zum Kontaktbereich.",
            legal_agb: "Ich öffne jetzt die AGB für dich.",
            legal_privacy: "Ich öffne jetzt die Datenschutzseite für dich.",
            legal_imprint: "Ich öffne jetzt das Impressum für dich.",
            legal_eula: "Ich öffne jetzt die EULA für dich.",
            legal_terms: "Ich öffne jetzt die Nutzungsbedingungen für dich.",
            legal_withdrawal: "Ich öffne jetzt die Widerrufsbelehrung für dich.",
          },
          en: {
            isobl: "Opening the ISOBL page for you now.",
            method: "Opening the method page for you now.",
            about: "Taking you to the About Heike page now.",
            community: "Opening the community page for you now.",
            blog: "Taking you to the blog now.",
            isf: "Opening the Instant Success Formula page for you now.",
            isa: "Opening the ISA Alliance page for you now.",
            contact: "Taking you to the contact section now.",
            legal_agb: "Opening the terms and conditions for you now.",
            legal_privacy: "Opening the privacy policy for you now.",
            legal_imprint: "Opening the legal notice for you now.",
            legal_eula: "Opening the EULA for you now.",
            legal_terms: "Opening the terms of use for you now.",
            legal_withdrawal: "Opening the withdrawal policy for you now.",
          },
        };
        const directAnswer = directNavAnswers[locale][destination];
        if (directAnswer) {
          return withNavigation(directAnswer, destination, locale, "local");
        }
      }
    }
  }

  // 2. Direct intent matching
  for (const [destination, pattern] of intentPatterns) {
    if (pattern.test(normalized)) {
      const isDirectOpen = /\b(öffne|oeffne|bring mich|geh|gehe|zeig|zeige|navigier|navigiere|open|take me|show|go to)\b/i.test(normalized);
      if (isDirectOpen && destination === "isobl") {
        const text = locale === "de"
          ? "Ich öffne jetzt die ISOBL-Seite für dich."
          : "Opening the ISOBL page for you now.";
        return withNavigation(text, destination, locale, "local");
      }
      return withNavigation(localAnswers[locale][destination], destination, locale, "local");
    }
  }
  return null;
}

export function parseAssistantReply(value: unknown, locale: SiteLang): AssistantReply | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as {answer?: unknown; destination?: unknown};
  if (typeof candidate.answer !== "string" || typeof candidate.destination !== "string") return null;

  const answer = candidate.answer.trim();
  if (!answer || answer.length > 1_200) return null;
  if (/<[^>]+>|javascript:|data:text\/html|https?:\/\//i.test(answer)) return null;
  if (/\[[^\]]+\]\([^)]+\)/.test(answer)) return null;
  const emails: string[] = answer.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g) ?? [];
  if (emails.some((email) => email.toLowerCase() !== APPROVED_EMAIL)) return null;
  if (!(KNOWLEDGE_DESTINATIONS as readonly string[]).includes(candidate.destination)) return null;

  return withNavigation(answer, candidate.destination as KnowledgeDestination, locale, "model");
}
