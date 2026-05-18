import type {Metadata} from "next";

export const metadata: Metadata = {
  title: "Impressum | Make Success Your Habit",
};

export default function ImpressumPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <p className="mb-4 font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b49474]">
        Rechtliches
      </p>
      <h1 className="font-serif text-4xl font-normal leading-tight text-[#03182e] md:text-5xl">
        Impressum
      </h1>
      <div className="mt-1 h-px w-16 bg-[#d4af37]" />

      <div className="mt-12 space-y-10 text-[#2d2319]">
        <Section title="Angaben gemäß § 5 TMG">
          <p>Heike Ziegler – Make Success Your Habit</p>
          <p>Wexstraße 39</p>
          <p>20355 Hamburg</p>
          <p>Deutschland</p>
        </Section>

        <Section title="Kontakt">
          <p>
            E-Mail:{" "}
            <a className="text-[#03182e] underline decoration-[#d4af37] underline-offset-2 hover:text-[#6b5f50]" href="mailto:heike@heike-ziegler.com">
              heike@heike-ziegler.com
            </a>
          </p>
          <p>
            Support:{" "}
            <a className="text-[#03182e] underline decoration-[#d4af37] underline-offset-2 hover:text-[#6b5f50]" href="mailto:care@heike-ziegler.com">
              care@heike-ziegler.com
            </a>
          </p>
        </Section>

        <Section title="Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV">
          <p>Heike Ziegler</p>
          <p>Wexstraße 39, 20355 Hamburg</p>
        </Section>

        <Section title="Haftungsausschluss">
          <p className="leading-7 text-[#4c4235]">
            Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die
            Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann keine Gewähr übernommen
            werden.
          </p>
        </Section>

        <Section title="Streitschlichtung">
          <p className="leading-7 text-[#4c4235]">
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
            <a
              className="text-[#03182e] underline decoration-[#d4af37] underline-offset-2 hover:text-[#6b5f50]"
              href="https://ec.europa.eu/consumers/odr"
              rel="noreferrer"
              target="_blank"
            >
              https://ec.europa.eu/consumers/odr
            </a>
            . Wir nehmen nicht an einem Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teil.
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
