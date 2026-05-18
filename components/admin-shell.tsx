"use client";

import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import type {ReactNode} from "react";
import {Article, GearSix, House, Images, SignOut, TextT} from "@phosphor-icons/react";
import type {AdminUser} from "@/lib/auth";

const navItems = [
  {href: "/admin", label: "Dashboard", icon: House},
  {href: "/admin/blog", label: "Blog", icon: Article},
  {href: "/admin/website", label: "Website", icon: TextT},
  {href: "/admin/media", label: "Medien", icon: Images},
  {href: "/admin/settings", label: "Settings", icon: GearSix},
];

export function AdminShell({children, user}: {children: ReactNode; user: AdminUser}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", {method: "POST"});
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-[100dvh] bg-[#f8f1e4] font-display text-[#03182e]">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-[#b49474]/24 bg-[#fcf3e3]/92 px-5 py-6 shadow-[12px_0_40px_rgba(16,15,15,0.035)] backdrop-blur lg:block">
        <Link className="block border-b border-[#b49474]/20 pb-6" href="/admin">
          <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8b6f4e]">
            Make Success
          </span>
          <span className="mt-2 block text-2xl font-semibold tracking-tight">Content Studio</span>
        </Link>
        <nav className="mt-8 flex flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition active:-translate-y-px ${
                  active
                    ? "bg-[#03182e] text-[#f9f4e7]"
                    : "text-[#4c4235] hover:bg-[#f2e2ce]/80"
                }`}
                href={item.href}
                key={item.href}
              >
                <Icon className="size-4" weight={active ? "fill" : "regular"} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-6 left-5 right-5">
          <div className="mb-4 rounded-2xl border border-[#b49474]/20 bg-[#f9f4e7] p-4">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="mt-1 text-xs text-[#6b5f50]">{user.email}</p>
          </div>
          <button
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[#4c4235] transition hover:bg-[#f2e2ce] active:-translate-y-px"
            onClick={logout}
            type="button"
          >
            <SignOut className="size-4" />
            Abmelden
          </button>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-[#b49474]/20 bg-[#f9f4e7]/88 px-5 py-4 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between">
            <Link className="text-xl font-semibold tracking-tight" href="/admin">
              Content Studio
            </Link>
            <button className="text-sm text-[#4c4235]" onClick={logout} type="button">
              Logout
            </button>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => (
              <Link
                className={`shrink-0 rounded-full border px-3 py-2 text-xs font-medium ${
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "border-[#03182e] bg-[#03182e] text-[#f9f4e7]"
                    : "border-[#b49474]/20 text-[#4c4235]"
                }`}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}

export function AdminPageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-8 grid gap-6 border-b border-[#b49474]/20 pb-8 md:grid-cols-[1fr_auto] md:items-end">
      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8b6f4e]">
          {eyebrow}
        </p>
        <h1 className="max-w-4xl text-3xl font-semibold leading-[1.02] tracking-tight md:text-5xl">{title}</h1>
      </div>
      {children ? <div>{children}</div> : null}
    </div>
  );
}

export function AdminMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <div className="border-t border-[#b49474]/20 pt-5">
      <p className="text-sm text-[#6b5f50]">{label}</p>
      <p className="mt-3 text-4xl font-semibold tracking-tight text-[#03182e]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[#4c4235]">{detail}</p>
    </div>
  );
}
