"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";

type LanguageSwitcherProps = {
  className?: string;
  tone?: "brand" | "legal";
};

export function LanguageSwitcher({className = "", tone = "brand"}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const activeClasses =
    tone === "legal"
      ? "bg-[#03182e] text-[#f9f4e7]"
      : "bg-brand-primary text-white shadow-sm";
  const idleClasses =
    tone === "legal"
      ? "text-[#6b5f50] hover:text-[#03182e]"
      : "text-brand-muted hover:text-brand-primary";

  function rememberLanguage(lang: "de" | "en") {
    window.localStorage.setItem("site-lang", lang);
  }

  return (
    <div
      className={`inline-flex items-center rounded-full border border-brand-primary/10 bg-white/70 p-1 backdrop-blur-sm ${className}`}
      role="group"
      aria-label="Choose language"
    >
      <Link
        aria-label="Switch to German"
        className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${idleClasses}`}
        href="/"
        onClick={() => rememberLanguage("de")}
      >
        de
      </Link>
      <Link
        aria-current="true"
        aria-label="Stay in English"
        className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${activeClasses}`}
        href={pathname}
        onClick={() => rememberLanguage("en")}
      >
        en
      </Link>
    </div>
  );
}
