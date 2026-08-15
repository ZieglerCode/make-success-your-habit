import type {Metadata} from "next";
import {MarketingOfferPage} from "@/components/marketing-offer-page";
import {resolveBackHref} from "@/lib/resolve-back-href";

export const metadata: Metadata = {
  title: "Community | Make Success Your Habit",
  description: "Community hub for ISA Alliance and the future academy structure.",
};

export default async function CommunityPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const backHref = await resolveBackHref(searchParams, "/en#community");

  return (
    <MarketingOfferPage
      eyebrow="Community"
      title="Connection, growth, and the future."
      intro="The community hub brings together ISA Alliance and the long-term vision of the Quantum Lifedesign Lab."
      backHref={backHref}
      primaryCta="Explore ISA Alliance"
      primaryHref="/en/isa-alliance?from=community"
      sections={[
        {
          title: "ISA Alliance",
          body: "The concrete community entry point for exchange, impulses, and strategic connection.",
        },
        {
          title: "Quantum Lifedesign Lab",
          body: "The future academy remains a vision for now: learning paths, community, AI tools, and future-oriented development.",
        },
        {
          title: "Calm instead of loud",
          body: "Community is not presented as a hype space, but as a high-quality place for self-leadership, clarity, and connection.",
        },
        {
          title: "Next step",
          body: "At launch, this page can lead into ISA Alliance. Later, it can be developed into its own hub.",
        },
      ]}
    />
  );
}
