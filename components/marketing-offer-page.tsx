import Link from "next/link";
import {ArrowRight} from "lucide-react";
import {MarketingOfferHeader} from "@/components/marketing-offer-header";
import {PartnerStoryProfile} from "@/components/partner-story-profile";

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
    imageSrc?: string;
    imageAlt?: string;
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

      <section className="px-5 py-16 sm:px-6 sm:py-20 lg:py-32">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end lg:gap-14">
          <div className="min-w-0">
            <p className="mb-5 font-display text-[10px] font-semibold uppercase tracking-[0.32em] text-brand-accent sm:mb-6">
              {eyebrow}
            </p>
            <h1 className="break-words text-balance font-serif text-[clamp(2.5rem,12vw,3.75rem)] leading-[1.02] lg:text-[5rem]">
              {title}
            </h1>
          </div>
          <div className="min-w-0 max-w-2xl lg:justify-self-end">
            <p className="break-words text-base leading-[1.8] text-brand-muted sm:text-lg sm:leading-[1.85]">{intro}</p>
            <div className="mt-8 flex min-w-0 flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap">
              <Link
                className="group inline-flex min-h-12 min-w-0 items-center justify-center gap-3 break-words rounded-full bg-brand-primary px-5 py-3.5 text-center text-sm font-medium text-brand-secondary transition hover:bg-brand-shadow sm:px-6"
                href={primaryHref}
              >
                <span className="min-w-0 break-words">{primaryCta}</span>
                <ArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-1" />
              </Link>
              <Link
                className="inline-flex min-h-12 min-w-0 items-center justify-center break-words rounded-full border border-brand-primary/20 px-5 py-3.5 text-center text-sm font-medium text-brand-primary transition hover:border-brand-accent sm:px-6"
                href={backHref}
              >
                {secondaryCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {(audienceItems || outcomes) && (
        <section className="border-y border-brand-brass/20 bg-brand-ivory/62 px-5 py-16 sm:px-6 sm:py-20 md:py-28">
          <div className="mx-auto grid min-w-0 max-w-6xl gap-10 md:grid-cols-2 md:gap-12">
            {audienceItems && (
              <div className="min-w-0">
                <p className="mb-5 font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-accent">
                  Who it is for
                </p>
                <h2 className="break-words font-serif text-3xl leading-tight md:text-[2.6rem]">
                  {audienceTitle ?? "For women with experience, vision, and an inner transition."}
                </h2>
                <ul className="mt-8 space-y-4 border-t border-brand-primary/10 pt-6">
                  {audienceItems.map((item) => (
                    <li className="flex min-w-0 gap-4 text-base leading-[1.7] text-brand-muted" key={item}>
                      <span className="mt-3 h-px w-6 shrink-0 bg-brand-accent" />
                      <span className="min-w-0 break-words">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {outcomes && (
              <div className="min-w-0 rounded-[1.5rem] bg-brand-primary p-6 text-brand-secondary shadow-[0_32px_80px_rgba(3,24,46,0.18)] sm:p-8 md:rounded-[1.75rem] md:p-10">
                <p className="mb-5 font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-accent">
                  What changes
                </p>
                <h2 className="break-words font-serif text-3xl leading-tight md:text-[2.6rem]">
                  {outcomesTitle ?? "Clarity that shows up in everyday decisions."}
                </h2>
                <ul className="mt-8 space-y-4">
                  {outcomes.map((item) => (
                    <li className="break-words border-t border-brand-secondary/14 pt-4 text-base leading-[1.7] text-brand-secondary/76" key={item}>
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
        <section className="bg-brand-primary px-5 py-16 text-brand-secondary sm:px-6 sm:py-20 md:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 max-w-2xl">
              <p className="mb-5 font-display text-[10px] font-semibold uppercase tracking-[0.32em] text-brand-accent">
                {processEyebrow}
              </p>
              <h2 className="break-words font-serif text-4xl leading-tight md:text-6xl">{processTitle}</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <article
                  className="min-w-0 rounded-[1.5rem] border border-brand-secondary/18 bg-brand-secondary/[0.06] p-6 sm:p-7 md:rounded-[1.75rem]"
                  key={step.label}
                >
                  <p className="mb-8 font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-accent">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="break-words font-serif text-3xl">{step.label}</h3>
                  <p className="mt-5 break-words text-base leading-[1.75] text-brand-secondary/74">{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-5 py-16 sm:px-6 sm:py-20 md:py-28">
        <div className="mx-auto grid min-w-0 max-w-6xl gap-5 md:grid-cols-2">
          {sections.map((section) => (
            <article
              className="min-w-0 rounded-[1.5rem] border border-brand-brass/18 bg-brand-ivory/72 p-6 shadow-[0_24px_70px_rgba(16,15,15,0.06)] sm:p-8 md:rounded-[1.75rem] md:p-10"
              key={section.title}
            >
              <h2 className="break-words font-serif text-3xl leading-tight md:text-[2.4rem]">{section.title}</h2>
              <p className="mt-5 break-words text-base leading-[1.8] text-brand-muted">{section.body}</p>
            </article>
          ))}
        </div>
      </section>

      {stories && (
        <section className="border-t border-brand-brass/10 bg-brand-ivory/30 px-5 py-16 sm:px-6 sm:py-20 md:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center max-w-3xl mx-auto">
              <p className="mb-5 font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-accent">
                {storiesSub ?? "Praxis-Erfolgsgeschichten"}
              </p>
              <h2 className="break-words font-serif text-4xl leading-tight text-brand-primary md:text-6xl">
                {storiesTitle ?? "Wie sie es mit ISOBL geschafft haben"}
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {stories.map((story, index) => (
                <article
                  className="flex min-w-0 flex-col justify-between rounded-[1.5rem] border border-brand-brass/15 bg-white/50 p-6 shadow-[0_16px_40px_rgba(16,15,15,0.03)] transition-shadow duration-300 hover:shadow-md sm:p-8 md:rounded-[2rem] md:p-10"
                  key={story.title}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <span className="font-display text-xs font-bold text-brand-accent px-3 py-1 rounded-full bg-brand-accent/8 border border-brand-accent/15">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="h-px bg-brand-brass/20 flex-grow" />
                    </div>
                    <h3 className="mb-5 break-words font-serif text-2xl leading-snug text-brand-primary">
                      {story.title}
                    </h3>
                    <p className="break-words whitespace-pre-wrap text-base font-light leading-[1.8] text-brand-muted">
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
        <section className="border-t border-brand-primary/5 bg-brand-secondary px-5 py-16 sm:px-6 sm:py-20 md:py-28">
          <div className="mx-auto max-w-4xl">
            <div className="mb-20 text-center">
              <p className="mb-5 font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-accent">
                {interviewsSub ?? "Kunden-Interviews"}
              </p>
              <h2 className="break-words font-serif text-4xl leading-tight text-brand-primary md:text-6xl">
                {interviewsTitle ?? "Ausführliche Erfolgsberichte"}
              </h2>
            </div>
            <div className="space-y-16">
              {interviews.map((interview, index) => (
                <article
                  className="min-w-0 rounded-[1.5rem] border border-brand-primary/8 bg-brand-ivory/20 p-6 shadow-[0_24px_60px_rgba(3,24,46,0.02)] sm:p-8 md:rounded-[2.5rem] md:p-14"
                  key={interview.name}
                >
                  <div className="mb-8 flex min-w-0 flex-col gap-4 border-b border-brand-primary/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <PartnerStoryProfile
                      imageAlt={interview.imageAlt}
                      imageSrc={interview.imageSrc}
                      name={interview.name}
                    />
                    <span className="font-display text-[10px] uppercase tracking-widest text-brand-accent font-semibold px-4 py-1.5 rounded-full bg-brand-accent/5 border border-brand-accent/10">
                      Partner Story {index + 1}
                    </span>
                  </div>
                  {interview.quote && (
                    <blockquote className="relative mb-10 break-words border-l-2 border-brand-accent/35 pl-6 font-serif text-xl italic leading-relaxed text-brand-accent md:text-2xl">
                      {interview.quote}
                    </blockquote>
                  )}
                  <div className="space-y-6 break-words text-base font-light leading-[1.85] text-brand-muted">
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
        <section className="bg-brand-ivory/55 px-5 py-16 sm:px-6 sm:py-20 md:py-28">
          <div className="mx-auto grid min-w-0 max-w-6xl gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-12">
            <div className="min-w-0">
              <p className="mb-5 font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-accent">
                FAQ
              </p>
              <h2 className="break-words font-serif text-4xl leading-tight md:text-5xl">
                Clear answers. No pressure.
              </h2>
            </div>
            <div className="space-y-4">
              {faq.map((item) => (
                <article
                  className="min-w-0 rounded-[1.5rem] border border-brand-brass/18 bg-brand-secondary p-6 sm:p-7"
                  key={item.question}
                >
                  <h3 className="break-words font-serif text-2xl leading-tight">{item.question}</h3>
                  <p className="mt-4 break-words text-base leading-[1.8] text-brand-muted">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-brand-primary px-5 py-16 text-center text-brand-secondary sm:px-6 sm:py-20 md:py-28">
        <div className="mx-auto max-w-4xl">
          <h2 className="break-words text-balance font-serif text-4xl leading-tight md:text-6xl">
            {finalTitle}
          </h2>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-[1.85] text-brand-secondary/74 md:text-lg">
            {finalText}
          </p>
          <Link
            className="group mt-10 inline-flex min-h-12 max-w-full items-center justify-center gap-3 break-words rounded-full bg-brand-secondary px-6 py-4 text-center text-sm font-medium text-brand-primary transition hover:bg-brand-ivory sm:px-7"
            href={primaryHref}
          >
            {primaryCta}
            <ArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-brand-primary/5 bg-brand-secondary py-16 md:py-20">
        <div className="container mx-auto px-5 sm:px-6">
          <div className="mb-16 grid min-w-0 gap-12 text-center lg:mb-20 lg:grid-cols-4 lg:gap-8 lg:text-left">
            <div className="min-w-0">
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
              <p className="mx-auto max-w-xs break-words text-sm leading-relaxed text-brand-muted lg:mx-0">
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
