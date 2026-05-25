import type {Metadata} from "next";
import {MarketingOfferPage, resolveBackHref} from "@/components/marketing-offer-page";

export const metadata: Metadata = {
  title: "Instant Success Formula | Make Success Your Habit",
  description:
    "Die Premium-Transformation für Identität, emotionale Klarheit und Erfolg als natürlichen Standard.",
};

export default async function InstantSuccessFormulaPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const backHref = await resolveBackHref(searchParams, "/#angebote");

  return (
    <MarketingOfferPage
      eyebrow="Instant Success Formula"
      title="Erfolg wird stabil, wenn er aus Identität entsteht."
      intro="Die Instant Success Formula ist Heike Zieglers Signature-Methode für Frauen, die Erfolg aus emotionaler Klarheit, bewusster Führung und einer neuen inneren Grundlage aufbauen möchten."
      backHref={backHref}
      audienceTitle="Für Frauen, die Strategie nicht ersetzen, sondern innerlich tragen wollen."
      audienceItems={[
        "Du hast Erfahrung, Fähigkeiten und eine Vision, aber Sichtbarkeit kostet noch zu viel Energie.",
        "Du triffst Entscheidungen, spürst aber, dass ein Teil von dir innerlich noch zurückhält.",
        "Du willst wachsen, ohne Druck, Daueranspannung oder ständiges Beweisen zur Grundlage zu machen.",
        "Du suchst keine schnelle Motivationsspitze, sondern eine ruhigere Form von Selbstführung.",
      ]}
      outcomesTitle="Mehr Klarheit, mehr Stabilität und ein anderer innerer Standard."
      outcomes={[
        "Du erkennst schneller, welche Muster im Hintergrund wirken.",
        "Du kannst emotionale Ladung bewusster klären, statt sie mit neuer Strategie zu überdecken.",
        "Du handelst sichtbarer und klarer, weil Entscheidungen stärker aus Identität entstehen.",
        "Viele Kundinnen erleben bereits in kurzer Zeit mehr Ruhe, Klarheit und innere Beweglichkeit.",
      ]}
      sections={[
        {
          title: "Problem",
          body: "Manchmal ist nicht fehlende Strategie das eigentliche Thema. Manchmal trägt ein inneres Muster dein nächstes Level noch nicht vollständig mit.",
        },
        {
          title: "Reframe",
          body: "Wachstum wird leichter, wenn deine Entscheidungen aus einer klareren inneren Grundlage entstehen. Genau dort setzt ISF an.",
        },
        {
          title: "Ablauf",
          body: "Die Arbeit führt dich durch Erkennen, Klären und Verkörpern. Der Prozess bleibt ruhig, präzise und auf deinen konkreten Wachstumsübergang bezogen.",
        },
        {
          title: "Clarity Call",
          body: "Der Call ist kein Druckgespräch. Er ist ein strategischer Raum, um zu prüfen, wo du stehst und welcher nächste Schritt wirklich Sinn ergibt.",
        },
      ]}
      processEyebrow="SEE → CLEAR → BECOME"
      processTitle="Die Methode für Identität, Klarheit und bewusste Führung."
      steps={[
        {
          label: "SEE",
          text: "Du erkennst die Muster, die dein nächstes Level zurückhalten.",
        },
        {
          label: "CLEAR",
          text: "Du löst emotionale Widerstände und innere Anspannung.",
        },
        {
          label: "BECOME",
          text: "Du verkörperst eine neue Erfolgsidentität durch klare Entscheidungen und aligned action.",
        },
      ]}
      faq={[
        {
          question: "Ist ISF eine Strategie- oder Coaching-Session?",
          answer: "ISF verbindet innere Klärung, Identitätsarbeit und bewusste Handlungsschritte. Es geht nicht darum, noch mehr Druck aufzubauen, sondern dein Wachstum innerlich tragfähiger zu machen.",
        },
        {
          question: "Wie schnell merke ich etwas?",
          answer: "Viele Frauen erleben bereits in kurzer Zeit mehr Klarheit, Ruhe oder innere Beweglichkeit. Trotzdem wird kein Ergebnis garantiert, weil echte Veränderung individuell entsteht.",
        },
        {
          question: "Was passiert im Clarity Call?",
          answer: "Wir schauen gemeinsam, wo du stehst, was dich innerlich noch bindet und ob die Instant Success Formula der passende nächste Schritt ist.",
        },
      ]}
      finalTitle="Wenn Strategie nicht mehr die ganze Antwort ist."
      finalText="Dann darf dein nächster Schritt dort beginnen, wo Wachstum stabil wird: in deiner inneren Grundlage, deiner emotionalen Klarheit und deiner bewussten Führung."
    />
  );
}
