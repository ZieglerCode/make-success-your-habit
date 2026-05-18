import type {Metadata} from "next";

export const metadata: Metadata = {
  title: "Widerruf & Rückgabe | Make Success Your Habit",
  description: "Widerrufsrecht und Rückgaberichtlinie / Refund Policy & Right of Withdrawal – Heike Ziegler.",
};

export default function WiderrufPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <p className="mb-4 font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b49474]">
        Rechtliches
      </p>
      <h1 className="font-serif text-4xl font-normal leading-tight text-[#03182e] md:text-5xl">
        Widerruf & Rückgabe
      </h1>
      <p className="mt-1 font-sans text-sm text-[#6b5f50]">Refund Policy / Right of Withdrawal</p>
      <div className="mt-3 h-px w-16 bg-[#d4af37]" />

      <div className="mt-4">
        <a
          className="inline-flex items-center gap-1.5 rounded-full border border-[#b49474]/30 px-4 py-2 text-xs font-medium text-[#6b5f50] transition hover:border-[#03182e] hover:text-[#03182e]"
          download
          href="/legal/HZ MSYH-Refund Policy-Rückgabe-Widerruf-DE-EN.pdf"
        >
          PDF herunterladen ↓
        </a>
      </div>

      <div className="mt-12 space-y-12">
        {/* DE Version */}
        <div className="space-y-8">
          <LangBadge lang="DE" />

          <Section title="Widerrufsrecht für digitale Inhalte">
            <p>Da es sich um <strong>digitale Produkte mit sofortigem Zugang</strong> handelt, gilt:</p>
            <p>Mit Kauf und Freischaltung erklärst du dich ausdrücklich damit einverstanden, dass der Zugang sofort beginnt.</p>
            <p className="font-medium text-[#03182e]">Damit erlischt dein Widerrufsrecht gemäß § 356 Abs. 5 BGB.</p>
          </Section>

          <Section title="Rückerstattungen">
            <ul>
              <li>Bereits bereitgestellte Inhalte sind <strong>nicht erstattungsfähig</strong></li>
              <li>Eine Rückerstattung erfolgt nur bei technischen Fehlern oder doppelter Zahlung</li>
            </ul>
          </Section>

          <Section title="Klar und fair">
            <p>Unsere Programme sind so aufgebaut, dass du direkt starten kannst. Mit dem Zugang erhältst du sofort den vollen Wert.</p>
          </Section>

          <Section title="Kontakt bei Fragen">
            <p>
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

          <Section title="Right of Withdrawal for Digital Content">
            <p>As these are <strong>digital products with immediate access</strong>, the following applies:</p>
            <p>By purchasing and activating access, you expressly agree that access begins immediately.</p>
            <p className="font-medium text-[#03182e]">Therefore, your right of withdrawal expires in accordance with § 356 para. 5 German Civil Code (BGB).</p>
          </Section>

          <Section title="Refunds">
            <ul>
              <li>Content already provided is <strong>non-refundable</strong></li>
              <li>Refunds are granted only in cases of technical errors or duplicate payment</li>
            </ul>
          </Section>

          <Section title="Clear and Fair">
            <p>Our programs are designed to start immediately. With access, you receive the full value instantly.</p>
          </Section>

          <Section title="Contact">
            <p>
              For questions regarding the refund policy:{" "}
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
