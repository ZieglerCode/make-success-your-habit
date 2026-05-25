import type {Metadata} from "next";
import {MarketingOfferPage, resolveBackHref} from "@/components/marketing-offer-page";

export const metadata: Metadata = {
  title: "About Heike | Make Success Your Habit",
  description: "Heike Ziegler verbindet Identitätsarbeit mit klarer Business-Führung.",
};

export default async function AboutHeikePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const backHref = await resolveBackHref(searchParams, "/#ueber-heike");

  return (
    <MarketingOfferPage
      eyebrow="About Heike"
      title="Identitätsarbeit und klare Business-Führung."
      intro="Heike Ziegler schafft Räume, in denen Veränderung nicht forciert wird, sondern präzise geführt entsteht."
      backHref={backHref}
      sections={[
        {
          title: "Ruhige Autorität",
          body: "Ihre Arbeit richtet sich an ambitionierte Frauen, die Erfolg aus innerer Klarheit, emotionaler Selbstführung und bewusster Ausrichtung aufbauen möchten.",
        },
        {
          title: "Strategische Tiefe",
          body: "Heike verbindet emotionale Präzision, transformative Prozessarbeit und Business-Klarheit zu einer Form von Wachstum, die getragen statt erzwungen wirkt.",
        },
        {
          title: "Markenrolle",
          body: "Auf der Website ist Heike der persönliche Autoritätsanker: sichtbar, präsent und vertrauensbildend, ohne laute Coach-Inszenierung.",
        },
        {
          title: "Nächster Ausbau",
          body: "Diese Seite wird später um Story, Haltung, Methode, Medien und weiterführende Vertrauenselemente ergänzt.",
        },
      ]}
    />
  );
}
