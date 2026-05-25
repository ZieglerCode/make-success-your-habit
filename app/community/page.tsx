import type {Metadata} from "next";
import {MarketingOfferPage, resolveBackHref} from "@/components/marketing-offer-page";

export const metadata: Metadata = {
  title: "Community | Make Success Your Habit",
  description: "Community-Hub für ISA Alliance und die zukünftige Academy-Struktur.",
};

export default async function CommunityPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const backHref = await resolveBackHref(searchParams, "/#community");

  return (
    <MarketingOfferPage
      eyebrow="Community"
      title="Verbindung, Wachstum und Zukunft."
      intro="Der Community-Hub bündelt ISA Alliance und die langfristige Vision des Quantum Lifedesign Lab."
      backHref={backHref}
      primaryCta="ISA Alliance ansehen"
      primaryHref="/isa-alliance?from=community"
      sections={[
        {
          title: "ISA Alliance",
          body: "Der konkrete Community-Einstieg für Austausch, Impulse und strategische Verbindung.",
        },
        {
          title: "Quantum Lifedesign Lab",
          body: "Die Future Academy bleibt zunächst als Vision geführt: Lernpfade, Community, AI-Tools und zukunftsorientierte Entwicklung.",
        },
        {
          title: "Ruhig statt laut",
          body: "Community wird nicht als Hype-Raum erzählt, sondern als hochwertiger Ort für Selbstführung, Klarheit und Verbindung.",
        },
        {
          title: "Nächster Schritt",
          body: "Für den Start kann diese Seite auf ISA Alliance führen. Später kann sie als eigener Hub ausgebaut werden.",
        },
      ]}
    />
  );
}
