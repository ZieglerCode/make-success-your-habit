import type {Metadata} from "next";
import {MarketingOfferPage, resolveBackHref} from "@/components/marketing-offer-page";

export const metadata: Metadata = {
  title: "ISA Alliance | Make Success Your Habit",
  description:
    "Community, Impulse und strategische Verbindung für Frauen, die nicht allein wachsen wollen.",
};

export default async function IsaAlliancePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const backHref = await resolveBackHref(searchParams, "/#community");

  return (
    <MarketingOfferPage
      eyebrow="Instant Success Alliance"
      title="Ein ruhiger Raum für Wachstum, Austausch und neue Möglichkeiten."
      intro="Die ISA Alliance ist der Community-Einstieg in Heikes Markenwelt: nahbar, klar und strategisch. Für Frauen, die nicht allein wachsen wollen."
      backHref={backHref}
      primaryCta="Zugang vormerken"
      primaryHref="/#kontakt"
      audienceTitle="Für Frauen, die Wachstum nicht allein halten wollen."
      audienceItems={[
        "Du suchst einen klaren Raum für Austausch, Reflexion und neue Perspektiven.",
        "Du möchtest dich mit Frauen verbinden, die Business und Selbstführung zusammen denken.",
        "Du willst Impulse, die dich nicht pushen, sondern präziser ausrichten.",
        "Du möchtest Community ohne Hype, Dauerlärm oder aggressive Verkaufsdynamik.",
      ]}
      outcomesTitle="Community als ruhige Wachstumsumgebung."
      outcomes={[
        "Regelmäßige Impulse für Klarheit, Identität und Business-Führung.",
        "Austausch mit Frauen, die nicht nur mehr erreichen, sondern bewusster wachsen wollen.",
        "Strategische Verbindung, neue Möglichkeiten und ein stärkeres Gefühl von Richtung.",
        "Ein geplanter Einstieg für 29 EUR pro Monat mit 7 Tagen Testphase.",
      ]}
      sections={[
        {
          title: "Community & Growth",
          body: "Austausch, Impulse und strategische Verbindung für dein nächstes Kapitel. Die Seite bleibt bewusst schlank und führt klar zum Zugang.",
        },
        {
          title: "Einstieg",
          body: "Die geplante Angebotslogik: 29 EUR pro Monat mit 7 Tagen Testphase. Checkout- oder Whop-Verlinkung wird ergänzt, sobald die finale Ziel-URL feststeht.",
        },
        {
          title: "Positionierung",
          body: "ISA ist kein lauter Hype-Raum, sondern eine hochwertige Community-Ebene für Selbstführung, Business-Klarheit und neue Partnerschaften.",
        },
        {
          title: "Ausbau",
          body: "Im nächsten Schritt folgen Formate, Community-Benefits, FAQ und eine klare Zugangssektion.",
        },
      ]}
      faq={[
        {
          question: "Ist ISA ein Kurs?",
          answer: "ISA ist in erster Linie eine Community- und Growth-Ebene. Inhalte und Impulse können dazugehören, aber der Kern ist Verbindung, Austausch und strategische Orientierung.",
        },
        {
          question: "Für wen ist die Community gedacht?",
          answer: "Für ambitionierte Frauen, Unternehmerinnen, Coaches und Expertinnen, die Wachstum, Selbstführung und Business-Klarheit nicht isoliert entwickeln möchten.",
        },
        {
          question: "Wie startet der Zugang?",
          answer: "Geplant ist ein einfacher Community-Einstieg mit monatlicher Mitgliedschaft und Testphase. Der konkrete Checkout-Link wird ergänzt, sobald er final ist.",
        },
      ]}
      finalTitle="Für Frauen, die nicht allein wachsen wollen."
      finalText="ISA wird der ruhige Community-Einstieg in Heikes Markenwelt: strategisch, klar und verbunden."
    />
  );
}
