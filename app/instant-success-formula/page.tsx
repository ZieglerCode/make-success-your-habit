import type {Metadata} from "next";
import {MarketingOfferPage} from "@/components/marketing-offer-page";
import {resolveBackHref} from "@/lib/resolve-back-href";

export const metadata: Metadata = {
  title: "Instant Success Formula | Make Success Your Habit",
  description:
    "The premium transformation for identity, emotional clarity, and success as a natural standard.",
};

export default async function InstantSuccessFormulaPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const backHref = await resolveBackHref(searchParams, "/en#angebote");

  return (
    <MarketingOfferPage
      eyebrow="Instant Success Formula"
      title="Success becomes stable when it comes from identity."
      intro="The Instant Success Formula is Heike Ziegler's signature method for women who want to build success from emotional clarity, conscious leadership, and a new inner foundation."
      primaryCta="Request an appointment"
      primaryHref="https://cal.com/heikeziegler/book-your-first-instant-success-formula-session"
      backHref={backHref}
      audienceTitle="For women who do not want to replace strategy, but want to carry it from within."
      audienceItems={[
        "You have experience, skills, and a vision, but visibility still costs too much energy.",
        "You make decisions, yet you sense that part of you is still holding back inside.",
        "You want to grow without making pressure, constant tension, or proving yourself the foundation.",
        "You are not looking for a quick motivational high, but for a calmer form of self-leadership.",
      ]}
      outcomesTitle="More clarity, more stability, and a different inner standard."
      outcomes={[
        "You recognize more quickly which patterns are operating in the background.",
        "You can clear emotional charge more consciously instead of covering it with another strategy.",
        "You act with more visibility and clarity because decisions come more strongly from identity.",
        "Many clients experience more calm, clarity, and inner flexibility in a short time.",
      ]}
      sections={[
        {
          title: "Problem",
          body: "Sometimes the real issue is not a missing strategy. Sometimes an inner pattern is not yet able to carry your next level.",
        },
        {
          title: "Reframe",
          body: "Growth becomes easier when your decisions come from a clearer inner foundation. That is where ISF begins.",
        },
        {
          title: "Process",
          body: "The work guides you through seeing, clearing, and embodying. The process stays calm, precise, and connected to your specific growth transition.",
        },
        {
          title: "Clarity Call",
          body: "The call is not a pressure conversation. It is a strategic space to look at where you are and which next step genuinely makes sense.",
        },
      ]}
      processEyebrow="SEE → CLEAR → BECOME"
      processTitle="The method for identity, clarity, and conscious leadership."
      steps={[
        {
          label: "SEE",
          text: "You recognize the patterns that are holding back your next level.",
        },
        {
          label: "CLEAR",
          text: "You release emotional resistance and inner tension.",
        },
        {
          label: "BECOME",
          text: "You embody a new identity for success through clear decisions and aligned action.",
        },
      ]}
      faq={[
        {
          question: "Is ISF a strategy session or a coaching session?",
          answer: "ISF combines inner clearing, identity work, and conscious action steps. The point is not to create more pressure, but to make your growth more internally sustainable.",
        },
        {
          question: "How quickly will I notice something?",
          answer: "Many women experience more clarity, calm, or inner flexibility in a short time. Still, no result is guaranteed, because real change is individual.",
        },
        {
          question: "What happens in the Clarity Call?",
          answer: "We look together at where you are, what is still binding you internally, and whether the Instant Success Formula is the right next step.",
        },
      ]}
      finalTitle="When strategy is no longer the whole answer."
      finalText="Then your next step can begin where growth becomes stable: in your inner foundation, your emotional clarity, and your conscious leadership."
    />
  );
}
