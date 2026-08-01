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
          <Link
            aria-label="Make Success Your Habit home"
            className="flex min-w-0 items-center gap-3"
            href="/en#start"
          >
            <img
              alt="Make Success Your Habit"
              className="h-10 w-10 shrink-0 rounded-full object-contain shadow-[0_8px_24px_rgba(16,15,15,0.08)]"
              src="/media/images/msyh-logo.webp"
            />
            <span className="truncate font-display text-xs font-semibold uppercase tracking-[0.14em] text-brand-primary sm:text-sm sm:tracking-[0.16em]">
              Make Success Your Habit
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-1 lg:hidden">
            <Link
              aria-label="Back"
              className="grid h-11 w-11 place-items-center rounded-full text-brand-muted transition-colors hover:bg-brand-primary/5 hover:text-brand-primary"
              href={backHref}
            >
              <ChevronLeft aria-hidden="true" className="h-5 w-5" />
            </Link>
            <button
              aria-controls="offer-mobile-menu"
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid h-11 w-11 place-items-center rounded-full text-brand-primary transition-colors hover:bg-brand-primary/5 lg:hidden"
              onClick={() => setOpen((current) => !current)}
              type="button"
            >
              {open ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="hidden lg:flex lg:items-center lg:gap-6">
          <nav aria-label="Main navigation" className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <Link
                className="text-sm font-medium text-brand-muted transition-colors hover:text-brand-primary"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
            <LanguageSwitcher />
          </nav>
          <a
            className="rounded-full border border-brand-primary bg-brand-primary px-5 py-2.5 text-sm font-medium text-brand-secondary transition-colors hover:border-brand-accent hover:bg-brand-shadow"
            href="https://cal.com/heikeziegler/clarity-call"
            rel="noopener noreferrer"
            target="_blank"
          >
            Clarity Call
          </a>
        </div>

        {open ? (
          <div className="border-t border-brand-primary/10 pb-2 pt-4 lg:hidden" id="offer-mobile-menu">
            <nav aria-label="Mobile navigation" className="grid gap-1">
              {navItems.map((item) => (
                <Link
                  className="min-h-11 rounded-xl px-3 py-3 text-base font-medium text-brand-primary transition-colors hover:bg-brand-primary/5"
                  href={item.href}
                  key={item.href}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-brand-primary/10 pt-4">
              <LanguageSwitcher />
              <a
                className="rounded-full bg-brand-primary px-5 py-3 text-sm font-medium text-brand-secondary transition-colors hover:bg-brand-shadow"
                href="https://cal.com/heikeziegler/clarity-call"
                rel="noopener noreferrer"
                target="_blank"
              >
                Clarity Call
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
