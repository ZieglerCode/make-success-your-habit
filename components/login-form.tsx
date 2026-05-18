"use client";

import {useRouter, useSearchParams} from "next/navigation";
import {Suspense, useMemo, useState} from "react";

export function LoginPageContent() {
  return (
    <Suspense fallback={<LoginShell>Login wird vorbereitet...</LoginShell>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = useMemo(() => searchParams.get("next") || "/admin", [searchParams]);
  const [email, setEmail] = useState("heike@make-success-your-habit.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const response = await fetch("/api/auth/login", {
      body: JSON.stringify({email, password}),
      headers: {"content-type": "application/json"},
      method: "POST",
    });
    const data = await response.json().catch(() => null);

    setIsSubmitting(false);

    if (!response.ok) {
      setError(data?.error || "Login fehlgeschlagen.");
      return;
    }

    router.replace(next);
    router.refresh();
  }

  return (
    <LoginShell>
      <form className="space-y-5" onSubmit={submit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">E-Mail</span>
          <input
            autoComplete="email"
            className="admin-input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Passwort</span>
          <input
            autoComplete="current-password"
            className="admin-input"
            placeholder="Admin-Passwort"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error ? <div className="rounded-xl bg-[#7f1d1d]/10 px-4 py-3 text-sm text-[#7f1d1d]">{error}</div> : null}
        <button
          className="w-full rounded-full bg-[#03182e] px-5 py-3 text-sm font-medium text-[#f9f4e7] transition hover:bg-[#100f0f] active:-translate-y-px disabled:opacity-50"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Anmelden..." : "Anmelden"}
        </button>
      </form>
    </LoginShell>
  );
}

function LoginShell({children}: {children: React.ReactNode}) {
  return (
    <main className="grid min-h-[100dvh] bg-[#f9f4e7] px-5 py-10 text-[#03182e] md:grid-cols-[1fr_1fr]">
      <section className="hidden overflow-hidden rounded-[32px] bg-[#03182e] md:block">
        <img
          alt=""
          className="h-full w-full object-cover opacity-80"
          src="/media/images/heike-ziegler.webp"
        />
      </section>
      <section className="flex items-center justify-center">
        <div className="w-full max-w-md">
          <img
            alt=""
            className="mb-5 h-16 w-16 rounded-full object-contain shadow-[0_10px_30px_rgba(16,15,15,0.08)]"
            src="/media/images/msyh-logo.webp"
          />
          <p className="mb-4 font-display text-[10px] font-semibold uppercase tracking-[0.24em] text-[#b49474]">
            Make Success Content Studio
          </p>
          <h1 className="mb-8 font-display text-5xl font-semibold leading-none tracking-tight">Einloggen</h1>
          <div className="rounded-[28px] border border-[#b49474]/20 bg-[#fcf3e3]/72 p-6 shadow-[0_24px_70px_rgba(16,15,15,0.06)]">
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
