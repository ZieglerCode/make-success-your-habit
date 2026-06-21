import type {Metadata} from "next";

export const metadata: Metadata = {
  title: "Terms of Use | Make Success Your Habit",
  description: "Terms of Use – Heike Ziegler, Make Success Your Habit.",
};

export default function NutzungsbedingungenPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <p className="mb-4 font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b49474]">
        Legal
      </p>
      <h1 className="font-serif text-4xl font-normal leading-tight text-[#03182e] md:text-5xl">
        Terms of Use
      </h1>
      <p className="mt-1 font-sans text-sm text-[#6b5f50]">Nutzungsbedingungen</p>
      <div className="mt-3 h-px w-16 bg-[#d4af37]" />

      <div className="mt-4">
        <a
          className="inline-flex items-center gap-1.5 rounded-full border border-[#b49474]/30 px-4 py-2 text-xs font-medium text-[#6b5f50] transition hover:border-[#03182e] hover:text-[#03182e]"
          download
          href="/legal/HZ-MSYH-Terms of Use-Nutzungsbedingungen.pdf"
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

          <Section title="§1 Anbieter und Geltungsbereich">
            <p>Diese Nutzungsbedingungen gelten für alle digitalen Produkte, Inhalte und Dienstleistungen von:</p>
            <p>
              <strong>Heike Ziegler – Make Success Your Habit</strong><br />
              Wexstraße 39, 20355 Hamburg, Deutschland<br />
              E-Mail: care@heike-ziegler.com
            </p>
            <p>Sie gelten insbesondere für folgende Programme:</p>
            <ul>
              <li>Instant Success Formula</li>
              <li>Instant Success Online Business Launch</li>
              <li>ISA Instant Success Alliance</li>
              <li>Quantum Life-Design Lab</li>
            </ul>
            <p>Bereitgestellt über die Plattform WHOP.</p>
          </Section>

          <Section title="§2 Vertragsgegenstand">
            <p>Der Anbieter stellt digitale Inhalte, Schulungen, Coaching-Programme sowie den Zugang zu geschlossenen Mitgliederbereichen zur Verfügung.</p>
            <p><strong>Wichtiger Hinweis:</strong> Die Inhalte stellen keine garantierten Ergebnisse dar – weder wirtschaftlich noch gesundheitlich noch persönlich.</p>
          </Section>

          <Section title="§3 Zugang und Nutzung">
            <ul>
              <li>Der Zugang ist personenbezogen und nicht übertragbar</li>
              <li>Eine Weitergabe von Zugangsdaten ist untersagt</li>
              <li>Inhalte dürfen nicht vervielfältigt, verbreitet, öffentlich zugänglich gemacht oder weiterverkauft werden</li>
            </ul>
          </Section>

          <Section title="§4 Coaching und Live-Calls">
            <p>Live-Coachings finden über digitale Kommunikationsmittel (z. B. Videocalls) statt. Diese stellen keine medizinische, therapeutische oder rechtliche Beratung dar.</p>
          </Section>

          <Section title="§5 Plattformnutzung (WHOP)">
            <p>Die Bereitstellung erfolgt über die Plattform WHOP. Der Anbieter übernimmt keine Haftung für technische Störungen, Plattformausfälle oder Drittanbieterleistungen.</p>
          </Section>

          <Section title="§6 Haftung">
            <p>Die Teilnahme erfolgt eigenverantwortlich. Der Anbieter übernimmt keine Haftung für Entscheidungen oder Ergebnisse, die aus der Nutzung der Inhalte entstehen.</p>
          </Section>

          <Section title="§7 Schlussbestimmungen">
            <ul>
              <li>Es gilt deutsches Recht</li>
              <li>Gerichtsstand ist Deutschland</li>
              <li>Sollten einzelne Bestimmungen unwirksam sein, bleibt der Rest wirksam</li>
            </ul>
            <p>
              Bei Fragen zur Nutzung:{" "}
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
          <p className="font-semibold text-[#03182e]">
            Heike Ziegler – Make Success Your Habit<br />
            Quantum Life-Design Lab: whop.com/quantum-lifedesign-lab
          </p>

          <Section title="§1 Provider and Scope">
            <p>These Terms of Use apply to all digital products, content, and services of:</p>
            <p>
              <strong>Heike Ziegler – Make Success Your Habit</strong><br />
              Wexstraße 39, 20355 Hamburg, Germany<br />
              Email: care@heike-ziegler.com
            </p>
            <p>They apply in particular to the following programs:</p>
            <ul>
              <li>Instant Success Formula</li>
              <li>Instant Success Online Business Launch</li>
              <li>ISA Instant Success Alliance</li>
              <li>Quantum Life-Design Lab</li>
            </ul>
            <p>Provided via the WHOP platform.</p>
          </Section>

          <Section title="§2 Subject Matter of the Contract">
            <p>The Provider offers digital content, training programs, coaching programs, and access to closed membership areas. These contents serve personal and entrepreneurial development.</p>
            <p><strong>Important Notice:</strong> The contents do not constitute guaranteed results — neither financially, health-related, nor personally.</p>
          </Section>

          <Section title="§3 Access and Use">
            <ul>
              <li>Access is personal and non-transferable</li>
              <li>Sharing access credentials is prohibited</li>
              <li>Content may not be reproduced, distributed, made publicly accessible, or resold</li>
            </ul>
          </Section>

          <Section title="§4 Coaching and Live Calls">
            <p>Live coaching sessions take place via digital communication tools (e.g., video calls). They do not constitute medical, therapeutic, or legal advice.</p>
          </Section>

          <Section title="§5 Platform Use (WHOP)">
            <p>The services are provided via the WHOP platform. The Provider assumes no liability for technical disruptions, platform outages, or third-party services.</p>
          </Section>

          <Section title="§6 Liability">
            <p>Participation is at your own responsibility. The Provider assumes no liability for decisions or results arising from the use of the content.</p>
          </Section>

          <Section title="§7 Final Provisions">
            <ul>
              <li>German law applies</li>
              <li>The place of jurisdiction is Germany</li>
              <li>Should individual provisions become invalid, the remainder shall remain effective</li>
            </ul>
            <p>
              For questions regarding usage:{" "}
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
