import type {Metadata} from "next";

export const metadata: Metadata = {
  title: "EULA | Make Success Your Habit",
  description: "End User License Agreement – Heike Ziegler, Make Success Your Habit.",
};

export default function EulaPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <p className="mb-4 font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b49474]">
        Legal
      </p>
      <h1 className="font-serif text-4xl font-normal leading-tight text-[#03182e] md:text-5xl">
        EULA
      </h1>
      <p className="mt-1 font-sans text-sm text-[#6b5f50]">End User License Agreement</p>
      <div className="mt-3 h-px w-16 bg-[#d4af37]" />

      <div className="mt-4">
        <a
          className="inline-flex items-center gap-1.5 rounded-full border border-[#b49474]/30 px-4 py-2 text-xs font-medium text-[#6b5f50] transition hover:border-[#03182e] hover:text-[#03182e]"
          download
          href="/legal/HZ-MSYH-EULA-DE-EN.pdf"
        >
          Download PDF ↓
        </a>
      </div>

      <div className="mt-12 space-y-12">
        {/* DE Version */}
        <div className="space-y-8">
          <LangBadge lang="DE" />

          <Section title="1. Lizenz">
            <p>Mit dem Kauf erhältst du eine nicht exklusive, nicht übertragbare Lizenz zur persönlichen Nutzung der Inhalte von Heike Ziegler – Make Success Your Habit.</p>
          </Section>

          <Section title="2. Geistiges Eigentum">
            <p>Alle Inhalte, Methoden und Konzepte sind Eigentum von:</p>
            <p><strong>Heike Ziegler – Make Success Your Habit</strong></p>
          </Section>

          <Section title="3. Untersagt ist insbesondere">
            <ul>
              <li>Weitergabe von Inhalten</li>
              <li>Nutzung für eigene Programme oder Coachings</li>
              <li>Kopieren oder Veröffentlichen</li>
              <li>Reverse Engineering</li>
            </ul>
          </Section>

          <Section title="4. Feedback">
            <p>Feedback oder Vorschläge dürfen vom Anbieter verwendet werden – ohne Anspruch auf Vergütung.</p>
          </Section>

          <Section title="5. Kontakt">
            <p>
              Fragen zur Nutzung:{" "}
              <a className="text-[#03182e] underline decoration-[#d4af37] underline-offset-2" href="mailto:support@heike-ziegler.com">
                support@heike-ziegler.com
              </a>
            </p>
          </Section>
        </div>

        <Divider />

        {/* EN Version */}
        <div className="space-y-8">
          <LangBadge lang="EN" />

          <Section title="1. License">
            <p>By purchasing, you receive a non-exclusive, non-transferable license for personal use of the content provided by Heike Ziegler – Make Success Your Habit.</p>
          </Section>

          <Section title="2. Intellectual Property">
            <p>All content, methods, and concepts are the property of:</p>
            <p><strong>Heike Ziegler – Make Success Your Habit</strong></p>
          </Section>

          <Section title="3. The following is prohibited in particular">
            <ul>
              <li>Sharing content</li>
              <li>Using content for your own programs or coaching services</li>
              <li>Copying or publishing</li>
              <li>Reverse engineering</li>
            </ul>
          </Section>

          <Section title="4. Feedback">
            <p>Feedback or suggestions may be used by the Provider without any claim to compensation.</p>
          </Section>

          <Section title="5. Contact">
            <p>
              Questions regarding usage:{" "}
              <a className="text-[#03182e] underline decoration-[#d4af37] underline-offset-2" href="mailto:support@heike-ziegler.com">
                support@heike-ziegler.com
              </a>
            </p>
          </Section>
        </div>

        <Footer />
      </div>
    </article>
  );
}

function LangBadge({lang}: {lang: string}) {
  return (
    <span className="inline-block rounded-full border border-[#b49474]/30 bg-[#f2e2ce] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#4c4235]">
      {lang}
    </span>
  );
}

function Divider() {
  return <div className="h-px w-full bg-[#b49474]/20" />;
}

function Section({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <section>
      <h2 className="mb-3 font-serif text-xl font-normal text-[#03182e]">{title}</h2>
      <div className="space-y-2 text-[#4c4235] [&_ul]:mt-2 [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ul]:text-sm [&_ul>li]:list-disc [&_p]:text-sm [&_p]:leading-7">
        {children}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <div className="border-t border-[#b49474]/20 pt-8">
      <p className="text-sm italic text-[#6b5f50]">
        We don&apos;t promise outcomes. We create the conditions for them.
      </p>
    </div>
  );
}
