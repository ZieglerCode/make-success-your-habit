import Link from "next/link";
import {ArrowRight} from "lucide-react";
import {MarketingOfferHeader} from "@/components/marketing-offer-header";

type SearchParams = Promise<Record<string, string | string[] | undefined>> | undefined;

const backTargets: Record<string, string> = {
  start: "/en#start",
  methode: "/en#methode",
  angebote: "/en#angebote",
  "ueber-heike": "/en#ueber-heike",
  insights: "/en#insights",
  community: "/en#community",
  kontakt: "/en#kontakt",
  footer: "/en#angebote",
};

export async function resolveBackHref(searchParams: SearchParams, fallback: string) {
  const params = await searchParams;
  const value = params?.from;
  const from = Array.isArray(value) ? value[0] : value;

  return from ? backTargets[from] ?? fallback : fallback;
}

type OfferPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  primaryCta?: string;
  primaryHref?: string;
  secondaryCta?: string;
  backHref?: string;
  audienceTitle?: string;
  audienceItems?: string[];
  outcomesTitle?: string;
  outcomes?: string[];
  sections: Array<{
    title: string;
    body: string;
  }>;
  processEyebrow?: string;
  processTitle?: string;
  steps?: Array<{
    label: string;
    text: string;
  }>;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  finalTitle?: string;
  finalText?: string;
  storiesTitle?: string;
  storiesSub?: string;
  stories?: Array<{
    title: string;
    body: string;
  }>;
  interviewsTitle?: string;
  interviewsSub?: string;
  interviews?: Array<{
    name: string;
    quote: string;
    paragraphs: string[];
  }>;
};

export function MarketingOfferPage({
  eyebrow,
  title,
  intro,
  primaryCta = "Request a Clarity Call",
  primaryHref = "https://cal.com/heikeziegler/clarity-call",
  secondaryCta = "Back to the homepage",
  backHref = "/",
  audienceTitle,
  audienceItems,
  outcomesTitle,
  outcomes,
  sections,
  processEyebrow = "Signature Process",
  processTitle = "A clear process. Calmly guided.",
  steps,
  faq,
  finalTitle = "When you can feel that your next step needs more clarity.",
  finalText = "The Clarity Call is a strategic space for orientation. We look at where you are, what matters now, and which path actually makes sense.",
  storiesTitle,
  storiesSub,
  stories,
  interviewsTitle,
  interviewsSub,
  interviews,
}: OfferPageProps) {
  return (
    <main className="min-h-screen bg-brand-secondary text-brand-primary">
      <MarketingOfferHeader backHref={backHref} />

      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto grid max-w-6xl gap-14 md:grid-cols-[0.9fr_1.1fr] md:items-end">
          <div>
            <p className="mb-6 font-display text-[10px] font-semibold uppercase tracking-[0.32em] text-brand-accent">
              {eyebrow}
            </p>
            <h1 className="text-balance font-serif text-[3rem] leading-[1.02] md:text-[5rem]">
              {title}
            </h1>
          </div>
          <div className="max-w-2xl md:justify-self-end">
            <p className="text-lg leading-[1.85] text-brand-muted">{intro}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-brand-primary px-6 py-3.5 text-sm font-medium text-brand-secondary transition hover:bg-brand-shadow"
                href={primaryHref}
              >
                {primaryCta}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-full border border-brand-primary/20 px-6 py-3.5 text-sm font-medium text-brand-primary transition hover:border-brand-accent"
                href={backHref}
              >
                {secondaryCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {(audienceItems || outcomes) && (
        <section className="border-y border-brand-brass/20 bg-brand-ivory/62 px-6 py-20 md:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
            {audienceItems && (
              <div>
                <p className="mb-5 font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-accent">
                  Who it is for
                </p>
                <h2 className="font-serif text-3xl leading-tight md:text-[2.6rem]">
                  {audienceTitle ?? "For women with experience, vision, and an inner transition."}
                </h2>
                <ul className="mt-8 space-y-4 border-t border-brand-primary/10 pt-6">
                  {audienceItems.map((item) => (
                    <li className="flex gap-4 text-base leading-[1.7] text-brand-muted" key={item}>
                      <span className="mt-3 h-px w-6 shrink-0 bg-brand-accent" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {outcomes && (
              <div className="rounded-[1.75rem] bg-brand-primary p-8 text-brand-secondary shadow-[0_32px_80px_rgba(3,24,46,0.18)] md:p-10">
                <p className="mb-5 font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-accent">
                  What changes
                </p>
                <h2 className="font-serif text-3xl leading-tight md:text-[2.6rem]">
                  {outcomesTitle ?? "Clarity that shows up in everyday decisions."}
                </h2>
                <ul className="mt-8 space-y-4">
                  {outcomes.map((item) => (
                    <li className="border-t border-brand-secondary/14 pt-4 text-base leading-[1.7] text-brand-secondary/76" key={item}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {steps && (
        <section className="bg-brand-primary px-6 py-24 text-brand-secondary md:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 max-w-2xl">
              <p className="mb-5 font-display text-[10px] font-semibold uppercase tracking-[0.32em] text-brand-accent">
                {processEyebrow}
              </p>
              <h2 className="font-serif text-4xl leading-tight md:text-6xl">{processTitle}</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <article
                  className="rounded-[1.75rem] border border-brand-secondary/18 bg-brand-secondary/[0.06] p-7"
                  key={step.label}
                >
                  <p className="mb-8 font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-accent">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="font-serif text-3xl">{step.label}</h3>
                  <p className="mt-5 text-base leading-[1.75] text-brand-secondary/74">{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2">
          {sections.map((section) => (
            <article
              className="rounded-[1.75rem] border border-brand-brass/18 bg-brand-ivory/72 p-8 shadow-[0_24px_70px_rgba(16,15,15,0.06)] md:p-10"
              key={section.title}
            >
              <h2 className="font-serif text-3xl leading-tight md:text-[2.4rem]">{section.title}</h2>
              <p className="mt-5 text-base leading-[1.8] text-brand-muted">{section.body}</p>
            </article>
          ))}
        </div>
      </section>

      {stories && (
        <section className="bg-brand-ivory/30 px-6 py-24 md:py-32 border-t border-brand-brass/10">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center max-w-3xl mx-auto">
              <p className="mb-5 font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-accent">
                {storiesSub ?? "Praxis-Erfolgsgeschichten"}
              </p>
              <h2 className="font-serif text-4xl leading-tight md:text-6xl text-brand-primary">
                {storiesTitle ?? "Wie sie es mit ISOBL geschafft haben"}
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {stories.map((story, index) => (
                <article
                  className="rounded-[2rem] border border-brand-brass/15 bg-white/50 p-8 md:p-10 shadow-[0_16px_40px_rgba(16,15,15,0.03)] flex flex-col justify-between hover:shadow-md transition-shadow duration-300"
                  key={story.title}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <span className="font-display text-xs font-bold text-brand-accent px-3 py-1 rounded-full bg-brand-accent/8 border border-brand-accent/15">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="h-px bg-brand-brass/20 flex-grow" />
                    </div>
                    <h3 className="font-serif text-2xl text-brand-primary leading-snug mb-5">
                      {story.title}
                    </h3>
                    <p className="text-base leading-[1.8] text-brand-muted font-light whitespace-pre-wrap">
                      {story.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {interviews && (
        <section className="bg-brand-secondary px-6 py-24 md:py-32 border-t border-brand-primary/5">
          <div className="mx-auto max-w-4xl">
            <div className="mb-20 text-center">
              <p className="mb-5 font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-accent">
                {interviewsSub ?? "Kunden-Interviews"}
              </p>
              <h2 className="font-serif text-4xl leading-tight md:text-6xl text-brand-primary">
                {interviewsTitle ?? "Ausführliche Erfolgsberichte"}
              </h2>
            </div>
            <div className="space-y-16">
              {interviews.map((interview, index) => (
                <article
                  className="rounded-[2.5rem] border border-brand-primary/8 bg-brand-ivory/20 p-8 md:p-14 shadow-[0_24px_60px_rgba(3,24,46,0.02)]"
                  key={interview.name}
                >
                  <div className="flex items-center justify-between border-b border-brand-primary/10 pb-6 mb-8 gap-4 flex-wrap">
                    <h3 className="font-serif text-2xl md:text-3xl text-brand-primary">
                      {interview.name}
                    </h3>
                    <span className="font-display text-[10px] uppercase tracking-widest text-brand-accent font-semibold px-4 py-1.5 rounded-full bg-brand-accent/5 border border-brand-accent/10">
                      Partner Story {index + 1}
                    </span>
                  </div>
                  {interview.quote && (
                    <blockquote className="mb-10 text-xl md:text-2xl font-serif italic text-brand-accent leading-relaxed relative pl-6 border-l-2 border-brand-accent/35">
                      {interview.quote}
                    </blockquote>
                  )}
                  <div className="space-y-6 text-base leading-[1.85] text-brand-muted font-light">
                    {interview.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="whitespace-pre-wrap">{p}</p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {faq && (
        <section className="bg-brand-ivory/55 px-6 py-24 md:py-32">
          <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="mb-5 font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-accent">
                FAQ
              </p>
              <h2 className="font-serif text-4xl leading-tight md:text-5xl">
                Clear answers. No pressure.
              </h2>
            </div>
            <div className="space-y-4">
              {faq.map((item) => (
                <article
                  className="rounded-[1.5rem] border border-brand-brass/18 bg-brand-secondary p-7"
                  key={item.question}
                >
                  <h3 className="font-serif text-2xl leading-tight">{item.question}</h3>
                  <p className="mt-4 text-base leading-[1.8] text-brand-muted">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-brand-primary px-6 py-24 text-center text-brand-secondary md:py-32">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-balance font-serif text-4xl leading-tight md:text-6xl">
            {finalTitle}
          </h2>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-[1.85] text-brand-secondary/74 md:text-lg">
            {finalText}
          </p>
          <Link
            className="group mt-10 inline-flex items-center justify-center gap-3 rounded-full bg-brand-secondary px-7 py-4 text-sm font-medium text-brand-primary transition hover:bg-brand-ivory"
            href={primaryHref}
          >
            {primaryCta}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-brand-primary/5 bg-brand-secondary py-20">
        <div className="container mx-auto px-6">
          <div className="mb-20 grid gap-16 text-center md:grid-cols-4 md:gap-8 md:text-left">
            <div>
              <div className="mb-6 flex items-center justify-center gap-3 md:justify-start">
                <img
                  alt="Make Success Your Habit"
                  className="h-11 w-11 rounded-full object-contain shadow-[0_8px_24px_rgba(16,15,15,0.08)]"
                  src="/media/images/msyh-logo.webp"
                />
                <span className="font-display text-sm font-semibold uppercase tracking-[0.14em]">
                  Make Success Your Habit
                </span>
              </div>
              <p className="mx-auto max-w-xs text-sm leading-relaxed text-brand-muted md:mx-0">
                A premium transformation space for identity, business, and the future.
              </p>
            </div>

            <div>
              <h2 className="mb-6 font-display text-xs font-semibold uppercase tracking-[0.22em]">Brand world</h2>
              <ul className="flex flex-col gap-4 text-sm text-brand-muted">
                <li><Link className="transition-colors hover:text-brand-primary" href="/en/instant-success-formula?from=footer">ISF Instant Success Formula</Link></li>
                <li><Link className="transition-colors hover:text-brand-primary" href="/en/isobl?from=footer">ISOBL Business Launch</Link></li>
                <li><Link className="transition-colors hover:text-brand-primary" href="/en/isa-alliance?from=footer">ISA Alliance</Link></li>
                <li><Link className="transition-colors hover:text-brand-primary" href="/blog">Insights</Link></li>
              </ul>
            </div>

            <div>
              <h2 className="mb-6 font-display text-xs font-semibold uppercase tracking-[0.22em]">Heike Ziegler</h2>
              <ul className="flex flex-col gap-4 text-sm text-brand-muted">
                <li><Link className="transition-colors hover:text-brand-primary" href="/en/about-heike?from=footer">About Heike</Link></li>
                <li><Link className="transition-colors hover:text-brand-primary" href="/en/method?from=footer">Method</Link></li>
                <li><a className="transition-colors hover:text-brand-primary" href="https://whop.com/quantum-lifedesign-lab/instant-success-formula-english-edition/" rel="noreferrer" target="_blank">ISF FREE Training</a></li>
                <li><a className="transition-colors hover:text-brand-primary" href="https://cal.com/heikeziegler/book-your-first-instant-success-formula-session" rel="noreferrer" target="_blank">Book your first ISF Session</a></li>
                <li><a className="transition-colors hover:text-brand-primary" href="https://cal.com/heikeziegler/application-instant-success-online-business-launch" rel="noreferrer" target="_blank">Apply to IS Online Business Launch</a></li>
              </ul>
            </div>

            <div>
              <h2 className="mb-6 font-display text-xs font-semibold uppercase tracking-[0.22em]">Connect</h2>
              <ul className="flex flex-col gap-4 text-sm text-brand-muted">
                <li><a className="transition-colors hover:text-brand-primary" href="https://www.linkedin.com/in/heikezieglerhzh/" rel="noreferrer" target="_blank">LinkedIn</a></li>
                <li><a className="transition-colors hover:text-brand-primary" href="https://www.instagram.com/heikeziegler_isa/" rel="noreferrer" target="_blank">Instagram</a></li>
                <li><a className="transition-colors hover:text-brand-primary" href="https://www.youtube.com/watch?v=hKct4thY7Yc" rel="noreferrer" target="_blank">Podcast</a></li>
                <li><Link className="transition-colors hover:text-brand-primary" href="/blog">Blog</Link></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-6 border-t border-brand-primary/5 pt-10 md:flex-row">
            <p className="text-xs text-brand-muted">
              © 2026 Heike Ziegler – Make Success Your Habit. All rights reserved.
            </p>
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium text-brand-muted" aria-label="Legal">
              <Link className="transition-colors hover:text-brand-primary" href="/legal/impressum">Legal notice</Link>
              <Link className="transition-colors hover:text-brand-primary" href="/legal/datenschutz">Privacy</Link>
              <Link className="transition-colors hover:text-brand-primary" href="/legal/agb">Terms</Link>
              <Link className="transition-colors hover:text-brand-primary" href="/legal/nutzungsbedingungen">Terms of use</Link>
              <Link className="transition-colors hover:text-brand-primary" href="/legal/eula">EULA</Link>
              <Link className="transition-colors hover:text-brand-primary" href="/legal/widerruf">Refund policy</Link>
            </nav>
          </div>
        </div>
      </footer>
    </main>
  );
}
