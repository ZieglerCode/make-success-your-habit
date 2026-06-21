import type {Metadata} from "next";
import {MarketingOfferPage, resolveBackHref} from "@/components/marketing-offer-page";

export const metadata: Metadata = {
  title: "ISA Alliance | Make Success Your Habit",
  description:
    "Community, impulses, and strategic connection for women who do not want to grow alone.",
};

export default async function IsaAlliancePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const backHref = await resolveBackHref(searchParams, "/en#community");

  return (
    <MarketingOfferPage
      eyebrow="Instant Success Alliance"
      title="A calm space for growth, exchange, and new possibilities."
      intro="ISA Alliance is the community entry point into Heike's brand world: approachable, clear, and strategic. For women who do not want to grow alone."
      backHref={backHref}
      primaryCta="Get access"
      primaryHref="https://whop.com/quantum-lifedesign-lab/isa-instant-success-alliance-17/"
      audienceTitle="For women who do not want to hold growth alone."
      audienceItems={[
        "You are looking for a clear space for exchange, reflection, and new perspectives.",
        "You want to connect with women who think about business and self-leadership together.",
        "You want impulses that do not push you, but help you align more precisely.",
        "You want community without hype, constant noise, or aggressive sales dynamics.",
      ]}
      outcomesTitle="Community as a calm environment for growth."
      outcomes={[
        "Regular impulses for clarity, identity, and business leadership.",
        "Exchange with women who do not just want to achieve more, but want to grow more consciously.",
        "Strategic connection, new possibilities, and a stronger sense of direction.",
        "A planned entry point at EUR 29 per month with a 7-day trial.",
      ]}
      sections={[
        {
          title: "Community & Growth",
          body: "Exchange, impulses, and strategic connection for your next chapter. The page stays deliberately lean and leads clearly toward access.",
        },
        {
          title: "Entry",
          body: "The planned offer logic: EUR 29 per month with a 7-day trial. Access runs through the ISA Whop page.",
        },
        {
          title: "Positioning",
          body: "ISA is not a loud hype space, but a high-quality community layer for self-leadership, business clarity, and new partnerships.",
        },
        {
          title: "Expansion",
          body: "The next step adds formats, community benefits, FAQ, and a clear access section.",
        },
      ]}
      faq={[
        {
          question: "Is ISA a course?",
          answer: "ISA is primarily a community and growth layer. Content and impulses can be part of it, but the core is connection, exchange, and strategic orientation.",
        },
        {
          question: "Who is the community for?",
          answer: "For ambitious women, founders, coaches, and experts who do not want to develop growth, self-leadership, and business clarity in isolation.",
        },
        {
          question: "How does access start?",
          answer: "Access starts through the ISA Whop page with monthly membership and a trial phase.",
        },
      ]}
      finalTitle="For women who do not want to grow alone."
      finalText="ISA will become the calm community entry point into Heike's brand world: strategic, clear, and connected."
    />
  );
}
