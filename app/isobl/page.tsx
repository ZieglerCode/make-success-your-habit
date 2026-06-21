import type {Metadata} from "next";
import {MarketingOfferPage, resolveBackHref} from "@/components/marketing-offer-page";

export const metadata: Metadata = {
  title: "ISOBL | Make Success Your Habit",
  description:
    "Instant Success Online Business Launch: a digital add-on business that fits your existing business.",
};

export default async function IsoblPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const backHref = await resolveBackHref(searchParams, "/en#angebote");

  return (
    <MarketingOfferPage
      eyebrow="Instant Success Online Business Launch"
      title="A digital add-on business that fits your business."
      intro="ISOBL helps business owners expand an existing business in a modern way: with a suitable online shop, products, automated processes, and clear guidance."
      backHref={backHref}
      primaryCta="Apply to IS Online Business Launch"
      primaryHref="https://cal.com/heikeziegler/application-instant-success-online-business-launch"
      audienceTitle="For established businesses that want to grow digitally without reinventing everything."
      audienceItems={[
        "You work in health, beauty, fitness, coaching, wellness, healing, services, or consulting.",
        "You want to expand your existing business digitally without creating your own products, warehouse, or shipping stress.",
        "You want to support clients for longer and establish an additional system alongside your core service.",
        "You need a clear assessment of whether the model fits your audience, energy, and positioning.",
      ]}
      outcomesTitle="A modern additional path for client retention and digital expansion."
      outcomes={[
        "An online shop that fits your positioning and audience.",
        "Products, processes, and logistics that do not have to stay on your plate.",
        "A clear invitation for your existing community or client base.",
        "A scalable entry point that does not feel like a loud instant-buy funnel.",
      ]}
      sections={[
        {
          title: "Problem",
          body: "More work does not automatically create more freedom. When your business only grows through your direct time, growth often stays tied to your energy.",
        },
        {
          title: "Reframe",
          body: "A digital add-on business does not have to mean developing, storing, or technically running everything yourself. It can connect to the business you already have.",
        },
        {
          title: "Offer logic",
          body: "A starter or playbook can be a low-threshold entry point. The full implementation with shop, system, and guidance is led through the ISOBL application call.",
        },
        {
          title: "Application call as the gate",
          body: "The call checks whether the model fits the existing business, audience, and desired level of guidance. This keeps the offer high-quality and responsibly led.",
        },
      ]}
      processEyebrow="Analyze → Strategize → Implement → Invite → Ignite"
      processTitle="From existing business to digital expansion."
      steps={[
        {
          label: "Analyze",
          text: "We assess the existing business, audience, energy, and digital points of connection.",
        },
        {
          label: "Strategize",
          text: "The analysis becomes a clear add-on business strategy that fits your positioning.",
        },
        {
          label: "Implement",
          text: "Shop, system, and processes are built to expand your existing work in a meaningful way.",
        },
        {
          label: "Invite",
          text: "Your community and client base are guided into the new offer clearly, calmly, and appropriately.",
        },
        {
          label: "Ignite",
          text: "The system is activated, observed, and refined further.",
        },
      ]}
      faq={[
        {
          question: "Is ISOBL a complete business restart?",
          answer: "No. ISOBL is designed as a digital expansion. It connects to your existing business, your audience, and your personality.",
        },
        {
          question: "Do I have to develop my own products?",
          answer: "Not necessarily. The approach uses an existing system and connects it with your positioning. That reduces the technical, product, and logistics load.",
        },
        {
          question: "What is the difference between starter and implementation?",
          answer: "A starter product can provide orientation. The full implementation with system, shop, and guidance is a larger decision and should be reviewed in the ISOBL application call.",
        },
      ]}
      finalTitle="When your business should grow digitally without becoming louder."
      finalText="Then the next step is no longer more information, but a clear check: does ISOBL fit your business, your audience, and the growth you want?"
    />
  );
}
