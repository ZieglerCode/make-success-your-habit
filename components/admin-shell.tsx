"use client";

import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import type {ReactNode} from "react";
import {BarChart3, FileText, Images, LayoutDashboard, LogOut, Settings, Type} from "lucide-react";
import type {AdminUser} from "@/lib/auth";

const navItems = [
  {href: "/admin", label: "Dashboard", icon: LayoutDashboard},
  {href: "/admin/blog", label: "Blog", icon: FileText},
  {href: "/admin/website", label: "Website", icon: Type},
  {href: "/admin/media", label: "Medien", icon: Images},
  {href: "/admin/settings", label: "Settings", icon: Settings},
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
    <div className="min-h-[100dvh] bg-[#f9f4e7] text-[#03182e]">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-[#b49474]/20 bg-[#fcf3e3]/90 px-5 py-6 backdrop-blur lg:block">
        <Link className="block border-b border-[#b49474]/20 pb-6" href="/admin">
          <span className="font-display text-[10px] font-semibold uppercase tracking-[0.24em] text-[#b49474]">
            Make Success
          </span>
          <span className="mt-2 block font-serif text-3xl leading-none">Content Studio</span>
        </Link>
        <nav className="mt-8 flex flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                  active
                    ? "bg-[#03182e] text-[#f9f4e7]"
                    : "text-[#4c4235] hover:bg-[#f2e2ce]"
                }`}
                href={item.href}
                key={item.href}
              >
                <Icon className="size-4" strokeWidth={1.8} />
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
            <LogOut className="size-4" strokeWidth={1.8} />
            Abmelden
          </button>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-[#b49474]/20 bg-[#f9f4e7]/88 px-5 py-4 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between">
            <Link className="font-serif text-2xl" href="/admin">
              Content Studio
            </Link>
            <button className="text-sm text-[#4c4235]" onClick={logout} type="button">
              Logout
            </button>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => (
              <Link
                className="shrink-0 rounded-full border border-[#b49474]/20 px-3 py-2 text-xs"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">{children}</main>
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
        <p className="mb-3 font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-[#b49474]">
          {eyebrow}
        </p>
        <h1 className="font-serif text-4xl leading-none md:text-6xl">{title}</h1>
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
      <p className="mt-3 font-display text-4xl font-semibold tracking-tight text-[#03182e]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[#4c4235]">{detail}</p>
    </div>
  );
}
