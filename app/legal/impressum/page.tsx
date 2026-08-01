import type {Metadata} from "next";

export const metadata: Metadata = {
  title: "Legal notice | Make Success Your Habit",
};

export default function ImpressumPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <p className="mb-4 font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b49474]">
        Legal
      </p>
      <h1 className="font-serif text-4xl font-normal leading-tight text-[#03182e] md:text-5xl">
        Legal notice
      </h1>
      <div className="mt-1 h-px w-16 bg-[#d4af37]" />

      <div className="mt-12 space-y-10 text-[#2d2319]">
        <Section title="Information according to § 5 TMG">
          <p>Heike Ziegler – Make Success Your Habit</p>
          <p>Wexstraße 39</p>
          <p>20355 Hamburg</p>
          <p>Germany</p>
        </Section>

        <Section title="Contact">
          <p>
            E-Mail:{" "}
            <a className="text-[#03182e] underline decoration-[#d4af37] underline-offset-2 hover:text-[#6b5f50]" href="mailto:contact@heike-ziegler.com">
              contact@heike-ziegler.com
            </a>
          </p>
          <p>
            Support:{" "}
            <a className="text-[#03182e] underline decoration-[#d4af37] underline-offset-2 hover:text-[#6b5f50]" href="mailto:contact@heike-ziegler.com">
              contact@heike-ziegler.com
            </a>
          </p>
        </Section>

        <Section title="Responsible for content according to § 55 para. 2 RStV">
          <p>Heike Ziegler</p>
          <p>Wexstraße 39, 20355 Hamburg</p>
        </Section>

        <Section title="Disclaimer">
          <p className="leading-7 text-[#4c4235]">
            The content on this website has been created with the greatest possible care. No
            guarantee can be given for the accuracy, completeness, or timeliness of the content.
          </p>
        </Section>

        <Section title="Dispute resolution">
          <p className="leading-7 text-[#4c4235]">
            The European Commission provides a platform for online dispute resolution:{" "}
            <a
              className="text-[#03182e] underline decoration-[#d4af37] underline-offset-2 hover:text-[#6b5f50]"
              href="https://ec.europa.eu/consumers/odr"
              rel="noreferrer"
              target="_blank"
            >
              https://ec.europa.eu/consumers/odr
            </a>
            . We do not participate in dispute resolution proceedings before a consumer arbitration
            board.
          </p>
        </Section>

        <div className="border-t border-[#b49474]/20 pt-8">
          <p className="text-sm italic text-[#6b5f50]">
            We don&apos;t promise outcomes. We create the conditions for them.
          </p>
        </div>
      </div>
    </article>
  );
}

function Section({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <section>
      <h2 className="mb-4 font-serif text-2xl font-normal text-[#03182e]">{title}</h2>
      <div className="space-y-1 text-[#4c4235]">{children}</div>
    </section>
  );
}
