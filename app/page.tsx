import SiteHome from "@/components/site-home";
import {getSiteContent} from "@/lib/content-store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await getSiteContent();

  return (
    <>
      <SiteHome />
      <section className="bg-[#f9f4e7] px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-8 border-t border-[#b49474]/30 pt-12 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="mb-4 font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b49474]">
              Aktuell aus dem Studio
            </p>
            <h2 className="font-serif text-4xl leading-tight text-[#03182e] md:text-6xl">
              {content.ctaHeadline}
            </h2>
          </div>
          <div className="flex flex-col justify-end gap-6">
            <p className="text-base leading-8 text-[#4c4235]">{content.ctaText}</p>
            <a
              className="w-fit rounded-full border border-[#03182e] bg-[#03182e] px-6 py-3 text-sm font-medium tracking-wide text-[#f9f4e7] transition duration-300 hover:border-[#d4af37] hover:bg-[#100f0f] active:-translate-y-px"
              href="/blog"
            >
              Insights lesen
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
