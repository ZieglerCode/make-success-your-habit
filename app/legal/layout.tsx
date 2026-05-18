import Link from "next/link";
import type {ReactNode} from "react";

const legalLinks = [
  {href: "/legal/impressum", label: "Impressum"},
  {href: "/legal/datenschutz", label: "Datenschutz"},
  {href: "/legal/agb", label: "AGB"},
  {href: "/legal/nutzungsbedingungen", label: "Nutzungsbedingungen"},
  {href: "/legal/eula", label: "EULA"},
  {href: "/legal/widerruf", label: "Widerruf"},
];

export default function LegalLayout({children}: {children: ReactNode}) {
  return (
    <div className="min-h-screen bg-[#f9f4e7] text-[#03182e]">
      {/* Top Bar */}
      <header className="border-b border-[#b49474]/20 bg-[#f9f4e7]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <Link
            className="inline-flex items-center gap-1.5 text-sm text-[#6b5f50] transition hover:text-[#03182e]"
            href="/"
          >
            <span className="text-[#d4af37]">←</span>
            Zur Website
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {legalLinks.map((link) => (
              <Link
                className="rounded-full px-3 py-1.5 text-xs font-medium text-[#6b5f50] transition hover:bg-[#f2e2ce] hover:text-[#03182e]"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-[#b49474]/20 bg-[#fcf3e3] px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-[#6b5f50]">
              © {new Date().getFullYear()} Heike Ziegler – Make Success Your Habit
            </p>
            <nav className="flex flex-wrap gap-x-5 gap-y-2">
              {legalLinks.map((link) => (
                <Link
                  className="text-xs text-[#6b5f50] transition hover:text-[#03182e]"
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
