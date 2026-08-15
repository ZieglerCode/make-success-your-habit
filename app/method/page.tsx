import type {Metadata} from "next";
import {MarketingOfferPage} from "@/components/marketing-offer-page";
import {resolveBackHref} from "@/lib/resolve-back-href";

export const metadata: Metadata = {
  title: "Method | Make Success Your Habit",
  description: "Heike Ziegler's SEE, CLEAR, BECOME method.",
};

export default async function MethodPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const backHref = await resolveBackHref(searchParams, "/en#methode");

  return (
    <MarketingOfferPage
      eyebrow="The Method"
      title="SEE. CLEAR. BECOME."
      intro="The method describes the inner movement of the brand: seeing clearly, clearing what holds you back, and embodying a new identity for success."
      backHref={backHref}
      primaryCta="Explore the Instant Success Formula"
      primaryHref="/en/instant-success-formula?from=methode"
      sections={[
        {
          title: "Brand method",
          body: "SEE, CLEAR, and BECOME is the umbrella method of the brand. It belongs on the homepage and on the Method page because it connects ISF, community, and the future platform.",
        },
        {
          title: "Not ISOBL",
          body: "The ISOBL process stays on the ISOBL page. This keeps the homepage from being overloaded with offer logic.",
        },
        {
          title: "Language",
          body: "The method is explained calmly and precisely. No hype claims, no guarantees, no overloaded transformation language.",
        },
        {
          title: "Next expansion",
          body: "Later, this page can become the central brand-method page with philosophy, process, examples, and related offers.",
        },
      ]}
      steps={[
        {label: "SEE", text: "Recognize the patterns that are holding back your next level."},
        {label: "CLEAR", text: "Release emotional resistance and inner tension."},
        {label: "BECOME", text: "Embody a new identity for success through clear decisions."},
      ]}
    />
  );
}
