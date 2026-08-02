# Responsive Public Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every public German and English page usable without horizontal overflow or an oversized navigation at 320, 375, 768, 1024, and 1440 pixels.

**Architecture:** Extract the offer-page header into one focused client component so its mobile menu can hold state without converting the full offer page into a client component. Fix intrinsic grid sizing and responsive breakpoints in the shared offer template, then validate the other public page types without changing content or external links.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Codex in-app browser.

## Global Constraints

- Scope includes public German and English pages only; `/admin` remains unchanged.
- Preserve colors, typography, rounded shapes, image language, content, prices, claims, and destination URLs.
- Do not hide layout defects with global `overflow-x: hidden`.
- Do not add dependencies.
- Preserve existing unrelated changes in `content-db/site.sqlite`, `next-env.d.ts`, `AGENTS.md`, and `public/media/images/isoble-experience-pictures/`.
- Work directly on `main` because the user explicitly requested it.
- Keep all work local until the user explicitly requests publication.

## File Map

- Create `components/marketing-offer-header.tsx`: responsive offer-page header and mobile menu state.
- Modify `components/marketing-offer-page.tsx`: render the extracted header and fix shared offer grids, typography, spacing, cards, and CTAs.
- Inspect without planned edits: `components/site-home.tsx`, `components/ai-chat-widget.tsx`, `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, and `app/legal/layout.tsx`.

---

### Task 1: Reproduce the responsive failures in the real browser

**Files:**
- No file changes.

**Interfaces:**
- Consumes: local page `http://localhost:3000/de/isobl?from=angebote`.
- Produces: measured failing values for navigation behavior and horizontal overflow.

- [ ] **Step 1: Set the browser to 320 × 700 pixels and load the German ISOBL page**

Expected failing behavior:

```text
document.documentElement.scrollWidth > document.documentElement.clientWidth
No compact menu button is present.
The wrapped navigation makes the header substantially taller than one compact row.
```

- [ ] **Step 2: Set the browser to 768 × 900 pixels and reload**

Expected failing behavior:

```text
document.documentElement.scrollWidth > document.documentElement.clientWidth
The hero's second column extends beyond the right viewport edge.
The header remains a multi-row navigation block.
```

- [ ] **Step 3: Save the exact measurements in the implementation notes for comparison after Tasks 2 and 3**

---

### Task 2: Replace the wrapping offer navigation with a compact responsive header

**Files:**
- Create: `components/marketing-offer-header.tsx`
- Modify: `components/marketing-offer-page.tsx:1-3,95-150`

**Interfaces:**
- Consumes: `backHref: string` from `MarketingOfferPage`.
- Produces: `MarketingOfferHeader({backHref}: {backHref: string})`.
- Preserves: existing navigation destinations, language switcher, logo, Back link, and Clarity Call URL.

- [ ] **Step 1: Verify the new behavior is absent before implementation**

At 320 pixels, query the rendered page for a unique button named `Open menu`.

Expected: zero matching buttons.

- [ ] **Step 2: Create the client header**

```tsx
"use client";

import Link from "next/link";
import {ChevronLeft, Menu, X} from "lucide-react";
import {useState} from "react";
import {LanguageSwitcher} from "@/components/language-switcher";

const navItems = [
  {label: "Start", href: "/en#start"},
  {label: "Method", href: "/en#methode"},
  {label: "Services", href: "/en#angebote"},
  {label: "About Heike", href: "/en#ueber-heike"},
  {label: "Insights", href: "/blog"},
  {label: "Community", href: "/en#community"},
];

export function MarketingOfferHeader({backHref}: {backHref: string}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-brand-brass/20 bg-brand-secondary/92 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-5 py-4 sm:px-6 lg:flex lg:items-center lg:justify-between lg:gap-6 lg:py-5">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <Link className="flex min-w-0 items-center gap-3" href="/en#start" aria-label="Make Success Your Habit home">
            <img alt="Make Success Your Habit" className="h-10 w-10 shrink-0 rounded-full object-contain shadow-[0_8px_24px_rgba(16,15,15,0.08)]" src="/media/images/msyh-logo.webp" />
            <span className="truncate font-display text-xs font-semibold uppercase tracking-[0.14em] text-brand-primary sm:text-sm sm:tracking-[0.16em]">Make Success Your Habit</span>
          </Link>
          <div className="flex shrink-0 items-center gap-1 lg:hidden">
            <Link className="grid h-11 w-11 place-items-center rounded-full text-brand-muted" href={backHref} aria-label="Back">
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </Link>
            <button aria-controls="offer-mobile-menu" aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"} className="grid h-11 w-11 place-items-center rounded-full text-brand-primary lg:hidden" onClick={() => setOpen((current) => !current)} type="button">
              {open ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="hidden lg:flex lg:items-center lg:gap-6">
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Main navigation">
            {navItems.map((item) => <Link className="text-sm font-medium text-brand-muted transition-colors hover:text-brand-primary" href={item.href} key={item.href}>{item.label}</Link>)}
            <LanguageSwitcher />
          </nav>
          <a className="rounded-full border border-brand-primary bg-brand-primary px-5 py-2.5 text-sm font-medium text-brand-secondary transition-colors hover:border-brand-accent hover:bg-brand-shadow" href="https://cal.com/heikeziegler/clarity-call" target="_blank" rel="noopener noreferrer">Clarity Call</a>
        </div>

        {open ? (
          <div className="border-t border-brand-primary/10 pb-2 pt-4 lg:hidden" id="offer-mobile-menu">
            <nav className="grid gap-1" aria-label="Mobile navigation">
              {navItems.map((item) => <Link className="min-h-11 rounded-xl px-3 py-3 text-base font-medium text-brand-primary" href={item.href} key={item.href} onClick={() => setOpen(false)}>{item.label}</Link>)}
            </nav>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-brand-primary/10 pt-4">
              <LanguageSwitcher />
              <a className="rounded-full bg-brand-primary px-5 py-3 text-sm font-medium text-brand-secondary" href="https://cal.com/heikeziegler/clarity-call" target="_blank" rel="noopener noreferrer">Clarity Call</a>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Replace the old inline header**

```tsx
import {MarketingOfferHeader} from "@/components/marketing-offer-header";

<MarketingOfferHeader backHref={backHref} />
```

Remove the old `navItems`, `ChevronLeft`, `LanguageSwitcher`, and inline `<header>` block. Keep `Link` and `ArrowRight` for the page body.

- [ ] **Step 4: Run `npm run lint`**

Expected: PASS.

- [ ] **Step 5: Reload at 320 and 768 pixels and verify the new behavior**

Expected:

```text
Exactly one Open menu button is visible.
The closed header is one compact row.
Clicking Open menu reveals Mobile navigation, language choice, and Clarity Call.
Clicking Close menu hides the mobile navigation.
```

- [ ] **Step 6: Commit the responsive header**

```bash
git add components/marketing-offer-header.tsx components/marketing-offer-page.tsx
git commit -m "feat: add compact offer page navigation"
```

---

### Task 3: Fix offer-page intrinsic sizing, breakpoints, and small-screen spacing

**Files:**
- Modify: `components/marketing-offer-page.tsx:105-456`

**Interfaces:**
- Consumes: the existing `OfferPageProps` arrays and strings without changing their values.
- Produces: shared offer sections that fit 320–1440 pixel viewports.

- [ ] **Step 1: Reconfirm the horizontal overflow before implementation**

At 320 and 768 pixels, compare `scrollWidth` with `clientWidth`.

Expected: FAIL because `scrollWidth` is greater than `clientWidth`.

- [ ] **Step 2: Move the hero split to large screens and make both columns shrinkable**

```tsx
<section className="px-5 py-16 sm:px-6 sm:py-20 lg:py-32">
  <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end lg:gap-14">
    <div className="min-w-0">
      <p className="mb-5 font-display text-[10px] font-semibold uppercase tracking-[0.32em] text-brand-accent sm:mb-6">{eyebrow}</p>
      <h1 className="break-words text-balance font-serif text-[clamp(2.5rem,12vw,3.75rem)] leading-[1.02] lg:text-[5rem]">{title}</h1>
    </div>
    <div className="min-w-0 max-w-2xl lg:justify-self-end">
      <p className="break-words text-base leading-[1.8] text-brand-muted sm:text-lg sm:leading-[1.85]">{intro}</p>
      <div className="mt-8 flex min-w-0 flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap">
        <Link className="group inline-flex min-h-12 min-w-0 items-center justify-center gap-3 break-words rounded-full bg-brand-primary px-5 py-3.5 text-center text-sm font-medium text-brand-secondary transition hover:bg-brand-shadow sm:px-6" href={primaryHref}>
          <span className="min-w-0 break-words">{primaryCta}</span>
          <ArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-1" />
        </Link>
        <Link className="inline-flex min-h-12 min-w-0 items-center justify-center break-words rounded-full border border-brand-primary/20 px-5 py-3.5 text-center text-sm font-medium text-brand-primary transition hover:border-brand-accent sm:px-6" href={backHref}>{secondaryCta}</Link>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Make shared grids and cards shrink below their content width**

Use `min-w-0` on every grid child or card that contains user-facing copy. Change offer sections from `px-6 py-24` to `px-5 py-16 sm:px-6 sm:py-20 md:py-28`. Change cards that begin at `p-8` to `p-6 sm:p-8 md:p-10`, and long headings/prose to `break-words`.

Use these exact class patterns for the affected structures:

```tsx
className="mx-auto grid min-w-0 max-w-6xl gap-10 md:grid-cols-2 md:gap-12"
className="min-w-0 rounded-[1.5rem] border border-brand-brass/18 bg-brand-ivory/72 p-6 shadow-[0_24px_70px_rgba(16,15,15,0.06)] sm:p-8 md:rounded-[1.75rem] md:p-10"
className="break-words font-serif text-3xl leading-tight md:text-[2.4rem]"
className="mb-8 flex min-w-0 flex-col gap-4 border-b border-brand-primary/10 pb-6 sm:flex-row sm:items-center sm:justify-between"
```

- [ ] **Step 4: Run `npm run lint`**

Expected: PASS.

- [ ] **Step 5: Reload at 320, 375, 768, 1024, and 1440 pixels**

Expected: `scrollWidth === clientWidth` at every width, with no element crossing either viewport edge.

- [ ] **Step 6: Commit the shared offer layout fix**

```bash
git add components/marketing-offer-page.tsx
git commit -m "fix: make offer pages responsive"
```

---

### Task 4: Verify every public page type and the chat overlay

**Files:**
- Verify: `components/site-home.tsx`
- Verify: `components/ai-chat-widget.tsx`
- Verify: `app/blog/page.tsx`
- Verify: `app/blog/[slug]/page.tsx`
- Verify: `app/legal/layout.tsx`

- [ ] **Step 1: Run `npm run lint` and `npm run build`**

Expected: both PASS.

- [ ] **Step 2: Audit the exact public routes at all five target widths**

```text
/de
/en
/de/isobl?from=angebote
/en/isobl?from=angebote
/de/instant-success-formula
/en/instant-success-formula
/de/isa-alliance
/en/isa-alliance
/de/method
/en/method
/de/about-heike
/en/about-heike
/de/community
/en/community
/blog
/legal/impressum
```

Expected: no horizontal overflow and no element crossing either viewport edge.

- [ ] **Step 3: Verify interactions at 320 and 768 pixels**

Open and close the offer menu, homepage menu, and AI chat. Confirm all close, language, Back, Clarity Call, and send controls remain visible and usable.

- [ ] **Step 4: Capture representative screenshots**

Capture the top of German ISOBL at 320, 768, and 1440 pixels and one long-text card section at 320 pixels. Confirm that brand styling is unchanged and content is not clipped.

- [ ] **Step 5: Review final changes**

Run `git status --short` and `git diff --check`. Confirm unrelated local files remain unstaged and unchanged by this work.

## Completion Conditions

- Type and production-build checks pass.
- Every listed public route has no horizontal overflow at all five target widths.
- Offer navigation is compact and operable at 320 and 768 pixels.
- German ISOBL hero, cards, and CTAs fit without clipping.
- Homepage navigation and AI chat remain usable.
- No public content, claim, price, or URL changed.
- No admin file or unrelated local change was modified.
- The local browser preview is left open for user review.
