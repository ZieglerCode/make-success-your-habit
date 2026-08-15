import type {Metadata} from "next";
import {MarketingOfferPage} from "@/components/marketing-offer-page";
import {resolveBackHref} from "@/lib/resolve-back-href";

export const metadata: Metadata = {
  title: "About Heike | Make Success Your Habit",
  description: "Heike Ziegler combines identity work with clear business leadership.",
};

export default async function AboutHeikePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const backHref = await resolveBackHref(searchParams, "/en#ueber-heike");

  return (
    <MarketingOfferPage
      eyebrow="About Heike"
      title="Identity work and clear business leadership."
      intro="Heike Ziegler creates spaces where change is not forced, but guided with precision."
      backHref={backHref}
      sections={[
        {
          title: "Calm authority",
          body: "Her work is for ambitious women who want to build success from inner clarity, emotional self-leadership, and conscious alignment.",
        },
        {
          title: "Strategic depth",
          body: "Heike combines emotional precision, transformative process work, and business clarity into a form of growth that feels supported rather than forced.",
        },
        {
          title: "Brand role",
          body: "On the website, Heike is the personal anchor of authority: visible, present, and trust-building, without loud coaching theatrics.",
        },
        {
          title: "Next expansion",
          body: "Later, this page can be expanded with story, perspective, method, media, and further trust elements.",
        },
      ]}
    />
  );
}
