import type {Metadata} from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | Make Success Your Habit",
  description: "Terms and Conditions – Heike Ziegler, Make Success Your Habit.",
};

export default function AGBPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <p className="mb-4 font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b49474]">
        Legal
      </p>
      <h1 className="font-serif text-4xl font-normal leading-tight text-[#03182e] md:text-5xl">
        Terms and Conditions
      </h1>
      <p className="mt-1 font-sans text-sm text-[#6b5f50]">Allgemeine Geschäftsbedingungen (AGB)</p>
      <div className="mt-3 h-px w-16 bg-[#d4af37]" />

      <div className="mt-4">
        <a
          className="inline-flex items-center gap-1.5 rounded-full border border-[#b49474]/30 px-4 py-2 text-xs font-medium text-[#6b5f50] transition hover:border-[#03182e] hover:text-[#03182e]"
          download
          href="/legal/HZ-MSYH-AGB-T&C.pdf"
        >
          Download PDF ↓
        </a>
      </div>

      <div className="mt-12 space-y-12">
        {/* DE Version */}
        <div className="space-y-8">
          <LangBadge lang="DE" />
          <p className="font-semibold text-[#03182e]">
            Heike Ziegler – Make Success Your Habit<br />
            Quantum Life-Design Lab: whop.com/quantum-lifedesign-lab
          </p>

          <Section title="§1 Anbieter">
            <p>Die Vertragspartnerin ist:</p>
            <p>
              <strong>Heike Ziegler – Make Success Your Habit</strong><br />
              Wexstraße 39, 20355 Hamburg, Deutschland<br />
              E-Mail: care@heike-ziegler.com
            </p>
          </Section>

          <Section title="§2 Geltungsbereich">
            <p>Diese AGB gelten für alle digitalen Produkte, Inhalte, Coaching-Dienstleistungen und Programme, einschließlich:</p>
            <ul>
              <li>Quantum Life-Design Lab</li>
              <li>Instant Success Formula (ISF)</li>
              <li>Instant Success Online Business Launch (ISOBL)</li>
              <li>ISA Instant Success Alliance</li>
            </ul>
            <p>Die Leistungen werden über die Plattform WHOP erbracht. Diese AGB gelten für Verbraucher und Unternehmer weltweit.</p>
          </Section>

          <Section title="§3 Vertragsgegenstand">
            <p>Der Anbieter bietet ausschließlich digitale Dienstleistungen an:</p>
            <ul>
              <li>Digitale Inhalte</li>
              <li>Online-Programme</li>
              <li>Schulungsmaterialien</li>
              <li>Mitgliederzugang</li>
              <li>Live-Coaching und Gruppenanrufe</li>
            </ul>
            <p>Die Dienste dienen der persönlichen und beruflichen Weiterentwicklung.</p>
          </Section>

          <Section title="§4 Kein medizinischer Rat / Keine Erfolgsgarantie">
            <p>Die bereitgestellten Dienste und Inhalte stellen keine medizinische Behandlung, Psychotherapie, Rechts- oder Steuerberatung dar. Der Anbieter garantiert keine spezifischen Ergebnisse. Jeder Teilnehmer ist vollständig für seine eigenen Entscheidungen und Handlungen verantwortlich.</p>
          </Section>

          <Section title="§5 Vertragsschluss">
            <p>Die Darstellung der Produkte und Dienstleistungen stellt kein rechtlich bindendes Angebot dar. Durch den Abschluss des Kaufprozesses über WHOP gibt der Kunde ein verbindliches Angebot zum Vertragsschluss ab. Der Vertrag kommt mit erfolgreicher Zahlungsabwicklung zustande.</p>
          </Section>

          <Section title="§6 Preise und Zahlungsabwicklung">
            <p>Alle Preise sind in der jeweils angezeigten Währung angegeben. Zahlungen werden über WHOP und deren Zahlungsdienstleister abgewickelt. Die vollständige Zahlung ist vor Zugang zu digitalen Inhalten erforderlich.</p>
          </Section>

          <Section title="§7 Zugang zu digitalen Diensten">
            <p>Der Zugang zu digitalen Inhalten wird unmittelbar nach erfolgreicher Zahlung gewährt, sofern nicht anders angegeben. Der Zugang ist persönlich, nicht übertragbar und ausschließlich für den eigenen Gebrauch bestimmt. Die Weitergabe von Zugangsdaten ist streng untersagt.</p>
          </Section>

          <Section title="§8 Geistiges Eigentum">
            <p>Alle Inhalte, Methoden, Frameworks, Texte, Videos, Grafiken und Konzepte sind geistiges Eigentum von Heike Ziegler – Make Success Your Habit. Ohne vorherige schriftliche Genehmigung sind Vervielfältigung, Verbreitung, Veröffentlichung, Weiterverkauf sowie die Nutzung in anderen Coaching-, Schulungs- oder Bildungsprogrammen strengstens untersagt.</p>
          </Section>

          <Section title="§9 Sperrung und Kündigung des Zugangs">
            <p>Der Anbieter behält sich das Recht vor, den Zugang bei Missbrauch, unbefugter Weitergabe von Inhalten, rechtswidrigem Verhalten oder Störung der Plattform- oder Community-Umgebung vorübergehend oder dauerhaft zu sperren. Bereits geleistete Zahlungen sind nicht erstattungsfähig.</p>
          </Section>

          <Section title="§10 Verzicht auf das Widerrufsrecht für digitale Inhalte">
            <p>Da es sich um digitale Produkte mit sofortigem Zugang handelt, stimmt der Kunde ausdrücklich zu, dass die Vertragserfüllung sofort beginnt und der Zugang sofort gewährt wird. Damit erlischt das Widerrufsrecht gemäß § 356 Abs. 5 BGB.</p>
          </Section>

          <Section title="§11 Rückerstattungsrichtlinie">
            <p>Alle Verkäufe sind grundsätzlich endgültig. Rückerstattungen werden nur gewährt bei: technischen Fehlern, Doppelzahlungen oder gesetzlichen Verpflichtungen zur Rückerstattung. Nicht erstattungsfähig sind: bereits abgerufene digitale Inhalte, genutzte Mitgliedschaftszugänge und verbrauchte digitale Dienstleistungen.</p>
          </Section>

          <Section title="§12 Verfügbarkeit">
            <p>Der Anbieter ist nicht haftbar für technische Unterbrechungen, Serverausfälle oder Plattformprobleme bei WHOP oder Drittanbietern.</p>
          </Section>

          <Section title="§13 Haftungsbeschränkung">
            <p>Der Anbieter haftet nur für Vorsatz und grobe Fahrlässigkeit im gesetzlich zulässigen Rahmen. Die Haftung für indirekte Schäden, Folgeschäden oder entgangenen Gewinn ist ausgeschlossen.</p>
          </Section>

          <Section title="§14 Datenschutz">
            <p>Personenbezogene Daten werden gemäß der geltenden Datenschutzrichtlinie verarbeitet.</p>
          </Section>

          <Section title="§15 Internationale Nutzung">
            <p>Die Dienste richten sich an deutsch-, englisch- und französischsprachige Kunden weltweit.</p>
          </Section>

          <Section title="§17 Schlussbestimmungen">
            <p>Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts (CISG). Gerichtsstand ist Deutschland, soweit rechtlich zulässig. Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt der Rest der AGB wirksam.</p>
          </Section>
        </div>

        <Divider />

        {/* EN Version */}
        <div className="space-y-8">
          <LangBadge lang="EN" />
          <p className="font-semibold text-[#03182e]">
            Heike Ziegler – Make Success Your Habit<br />
            Quantum Life-Design Lab: whop.com/quantum-lifedesign-lab
          </p>

          <Section title="§1 Provider">
            <p>
              <strong>Heike Ziegler – Make Success Your Habit</strong><br />
              Wexstraße 39, 20355 Hamburg, Germany<br />
              Email: care@heike-ziegler.com
            </p>
          </Section>

          <Section title="§2 Scope">
            <p>These Terms and Conditions apply to all digital products, content, coaching services, and programs, including:</p>
            <ul>
              <li>Quantum Life-Design Lab</li>
              <li>Instant Success Formula (ISF)</li>
              <li>Instant Success Online Business Launch (ISOBL)</li>
              <li>ISA Instant Success Alliance</li>
            </ul>
            <p>The services are delivered via the platform WHOP. These Terms apply to consumers and business customers worldwide.</p>
          </Section>

          <Section title="§3 Subject of the Agreement">
            <p>The Provider exclusively offers digital services, including digital content, online programs, educational materials, membership access, and live coaching sessions.</p>
          </Section>

          <Section title="§4 No Medical Advice / No Guarantee of Results">
            <p>The Provider does not guarantee any specific outcomes, including financial, personal, health-related, or business results. Each participant is fully responsible for their own decisions and actions.</p>
          </Section>

          <Section title="§5 Formation of Contract">
            <p>The contract becomes effective upon successful payment processing through WHOP.</p>
          </Section>

          <Section title="§6 Pricing and Payment Processing">
            <p>All prices are listed in the respective displayed currency. Payments are processed through WHOP. Full payment is required before access to digital content is granted.</p>
          </Section>

          <Section title="§7 Access to Digital Services">
            <p>Access is personal, non-transferable, and intended solely for the purchaser's own use. Sharing login credentials is strictly prohibited.</p>
          </Section>

          <Section title="§8 Intellectual Property Rights">
            <p>All content, methods, frameworks, texts, videos, graphics, and concepts are the intellectual property of Heike Ziegler – Make Success Your Habit. Reproduction, distribution, publication, resale, or use within other programs is strictly prohibited without prior written permission.</p>
          </Section>

          <Section title="§9 Suspension and Termination of Access">
            <p>The Provider reserves the right to temporarily or permanently suspend access in cases of misuse, unauthorized sharing of content, unlawful conduct, or disruption of the platform or community environment. Payments already made remain non-refundable.</p>
          </Section>

          <Section title="§10 Waiver of Right of Withdrawal for Digital Content">
            <p>As the services provided are digital products with immediate access, the customer expressly agrees that performance of the contract begins immediately. Any applicable statutory right of withdrawal is waived where legally permissible.</p>
          </Section>

          <Section title="§11 Refund Policy">
            <p>All sales are generally final. Refunds will only be granted in cases of technical errors, duplicate payments, or legal obligations requiring reimbursement.</p>
          </Section>

          <Section title="§13 Limitation of Liability">
            <p>The Provider shall only be liable for intentional misconduct and gross negligence. Liability for indirect damages, consequential damages, or loss of profits is excluded where legally permissible.</p>
          </Section>

          <Section title="§17 Final Provisions">
            <p>These Terms shall be governed by the laws of Germany, excluding the UN Convention on Contracts for the International Sale of Goods (CISG). The place of jurisdiction shall be Germany.</p>
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
