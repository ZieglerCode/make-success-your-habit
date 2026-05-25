import type {Metadata} from "next";
import {MarketingOfferPage, resolveBackHref} from "@/components/marketing-offer-page";

export const metadata: Metadata = {
  title: "Method | Make Success Your Habit",
  description: "Die Methode SEE, CLEAR, BECOME von Heike Ziegler.",
};

export default async function MethodPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const backHref = await resolveBackHref(searchParams, "/#methode");

  return (
    <MarketingOfferPage
      eyebrow="The Method"
      title="SEE. CLEAR. BECOME."
      intro="Die Methode beschreibt die innere Bewegung der Marke: erkennen, klären und eine neue Erfolgsidentität verkörpern."
      backHref={backHref}
      primaryCta="Instant Success Formula ansehen"
      primaryHref="/instant-success-formula?from=methode"
      sections={[
        {
          title: "Brand-Methode",
          body: "SEE, CLEAR und BECOME ist die Dachmethode der Marke. Sie gehört auf die Homepage und auf die Method-Seite, weil sie ISF, Community und Zukunftsplattform verbindet.",
        },
        {
          title: "Nicht ISOBL",
          body: "Der ISOBL-Kreis bleibt auf der ISOBL-Seite. So wird die Homepage nicht mit Angebotslogik überladen.",
        },
        {
          title: "Sprache",
          body: "Die Methode wird ruhig und präzise erklärt. Keine Hype-Claims, keine Garantien, keine überladene Transformationssprache.",
        },
        {
          title: "Nächster Ausbau",
          body: "Diese Seite wird später zur zentralen Brand-Method-Seite mit Philosophie, Prozess, Beispielen und weiterführenden Angeboten.",
        },
      ]}
      steps={[
        {label: "SEE", text: "Erkenne die Muster, die dein nächstes Level zurückhalten."},
        {label: "CLEAR", text: "Löse emotionale Widerstände und innere Anspannung."},
        {label: "BECOME", text: "Verkörpere eine neue Erfolgsidentität durch klare Entscheidungen."},
      ]}
    />
  );
}
