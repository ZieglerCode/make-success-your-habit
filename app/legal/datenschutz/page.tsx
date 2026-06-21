import type {Metadata} from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Make Success Your Habit",
  description: "Privacy Policy – Heike Ziegler, Make Success Your Habit.",
};

export default function DatenschutzPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <p className="mb-4 font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b49474]">
        Legal
      </p>
      <h1 className="font-serif text-4xl font-normal leading-tight text-[#03182e] md:text-5xl">
        Privacy Policy
      </h1>
      <p className="mt-1 font-sans text-sm text-[#6b5f50]">Datenschutzrichtlinie</p>
      <div className="mt-3 h-px w-16 bg-[#d4af37]" />

      <div className="mt-4 flex items-center gap-3">
        <a
          className="inline-flex items-center gap-1.5 rounded-full border border-[#b49474]/30 px-4 py-2 text-xs font-medium text-[#6b5f50] transition hover:border-[#03182e] hover:text-[#03182e]"
          download
          href="/legal/HZ-MSYH-Datenschutz-Privacy Policy.pdf"
        >
          Download PDF ↓
        </a>
      </div>

      <div className="mt-12 space-y-12">
        {/* DE Version */}
        <div className="space-y-8">
          <LangBadge lang="DE" />

          <Section title="1. Verantwortlicher">
            <p>Heike Ziegler – Make Success Your Habit</p>
            <p>Wexstraße 39, 20355 Hamburg, Deutschland</p>
            <p>
              E-Mail:{" "}
              <a className="text-[#03182e] underline decoration-[#d4af37] underline-offset-2" href="mailto:heike@heike-ziegler.com">
                heike@heike-ziegler.com
              </a>
            </p>
          </Section>

          <Section title="2. Erhebung und Verarbeitung von Daten">
            <p>Wir verarbeiten personenbezogene Daten nur, soweit dies erforderlich ist:</p>
            <ul>
              <li>Name</li>
              <li>E-Mail-Adresse</li>
              <li>Zahlungsinformationen (über WHOP)</li>
              <li>Nutzungsdaten</li>
            </ul>
          </Section>

          <Section title="3. Zweck der Verarbeitung">
            <ul>
              <li>Vertragsabwicklung</li>
              <li>Bereitstellung von Inhalten</li>
              <li>Kommunikation</li>
              <li>Optimierung unserer Angebote</li>
            </ul>
          </Section>

          <Section title="4. Plattform und Drittanbieter">
            <p>Zur Bereitstellung nutzen wir:</p>
            <ul>
              <li>WHOP (Plattform) – whop.com/quantum-lifedesign-lab</li>
              <li>ggf. Analyse- und Marketingtools</li>
            </ul>
            <p>Dabei kann es zu internationalen Datenübertragungen kommen.</p>
          </Section>

          <Section title="5. Rechtsgrundlagen">
            <ul>
              <li>Art. 6 Abs. 1 lit. b DSGVO (Vertrag)</li>
              <li>Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)</li>
              <li>Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)</li>
            </ul>
          </Section>

          <Section title="6. Speicherung">
            <p>Daten werden nur so lange gespeichert, wie erforderlich oder gesetzlich vorgeschrieben ist.</p>
          </Section>

          <Section title="7. Rechte der Nutzer">
            <p>Du hast jederzeit das Recht auf:</p>
            <ul>
              <li>Auskunft</li>
              <li>Berichtigung</li>
              <li>Löschung</li>
              <li>Einschränkung</li>
              <li>Widerspruch</li>
              <li>Datenübertragbarkeit</li>
            </ul>
          </Section>

          <Section title="8. Sicherheit">
            <p>
              Wir behandeln deine Daten mit hoher Sorgfalt und schützen sie durch geeignete
              technische und organisatorische Maßnahmen.
            </p>
          </Section>
        </div>

        <Divider />

        {/* EN Version */}
        <div className="space-y-8">
          <LangBadge lang="EN" />

          <Section title="1. Data Controller">
            <p>Heike Ziegler – Make Success Your Habit</p>
            <p>Wexstraße 39, 20355 Hamburg, Germany</p>
            <p>
              E-Mail:{" "}
              <a className="text-[#03182e] underline decoration-[#d4af37] underline-offset-2" href="mailto:heike@heike-ziegler.com">
                heike@heike-ziegler.com
              </a>
            </p>
          </Section>

          <Section title="2. Collection and Processing of Data">
            <p>We process personal data only to the extent necessary:</p>
            <ul>
              <li>Name</li>
              <li>Email address</li>
              <li>Payment information (via WHOP)</li>
              <li>Usage data</li>
            </ul>
          </Section>

          <Section title="3. Purpose of Processing">
            <ul>
              <li>Contract processing</li>
              <li>Provision of content</li>
              <li>Communication</li>
              <li>Optimization of our offers</li>
            </ul>
          </Section>

          <Section title="4. Platform and Third Parties">
            <p>For the provision of our services, we use:</p>
            <ul>
              <li>WHOP (Platform) – whop.com/quantum-lifedesign-lab</li>
              <li>if applicable, analytics and marketing tools</li>
            </ul>
            <p>International data transfers may occur in this context.</p>
          </Section>

          <Section title="5. Legal Basis">
            <ul>
              <li>Art. 6 para. 1 lit. b GDPR (Contract)</li>
              <li>Art. 6 para. 1 lit. a GDPR (Consent)</li>
              <li>Art. 6 para. 1 lit. f GDPR (Legitimate interest)</li>
            </ul>
          </Section>

          <Section title="6. Storage">
            <p>Data is stored only as long as necessary or legally required.</p>
          </Section>

          <Section title="7. User Rights">
            <p>You have the right at any time to:</p>
            <ul>
              <li>Access</li>
              <li>Correction</li>
              <li>Deletion</li>
              <li>Restriction</li>
              <li>Objection</li>
              <li>Data portability</li>
            </ul>
          </Section>

          <Section title="8. Security">
            <p>
              We handle your data with great care and protect it through appropriate technical and
              organizational measures.
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
