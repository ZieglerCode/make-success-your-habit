"use client";

import {useRouter} from "next/navigation";
import {useState} from "react";
import type {SiteContent} from "@/lib/content-store";

export function SiteContentForm({content}: {content: SiteContent}) {
  const router = useRouter();
  const [draft, setDraft] = useState(content);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function update<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    setDraft((current) => ({...current, [key]: value}));
  }

  async function save() {
    setIsSaving(true);
    setMessage(null);
    setError(null);

    const response = await fetch("/api/site-content", {
      body: JSON.stringify(draft),
      headers: {"content-type": "application/json"},
      method: "PATCH",
    });
    const data = await response.json().catch(() => null);

    setIsSaving(false);

    if (!response.ok) {
      setError(data?.error || "Die Inhalte konnten nicht gespeichert werden.");
      return;
    }

    setDraft(data);
    setMessage("Website-Inhalte gespeichert.");
    router.refresh();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <Field label="CTA Headline">
          <input
            className="admin-input text-lg"
            value={draft.ctaHeadline}
            onChange={(event) => update("ctaHeadline", event.target.value)}
          />
        </Field>
        <Field label="CTA Text">
          <textarea
            className="admin-input min-h-32"
            value={draft.ctaText}
            onChange={(event) => update("ctaText", event.target.value)}
          />
        </Field>
        <Field label="Footer E-Mail">
          <input
            className="admin-input"
            type="email"
            value={draft.footerEmail}
            onChange={(event) => update("footerEmail", event.target.value)}
          />
        </Field>
        <Field label="SEO Titel">
          <input
            className="admin-input"
            value={draft.seoTitle}
            onChange={(event) => update("seoTitle", event.target.value)}
          />
        </Field>
        <Field label="SEO Beschreibung">
          <textarea
            className="admin-input min-h-24"
            value={draft.seoDescription}
            onChange={(event) => update("seoDescription", event.target.value)}
          />
        </Field>
      </div>
      <aside className="space-y-4">
        {message ? <div className="rounded-xl bg-[#166534]/10 px-4 py-3 text-sm text-[#166534]">{message}</div> : null}
        {error ? <div className="rounded-xl bg-[#7f1d1d]/10 px-4 py-3 text-sm text-[#7f1d1d]">{error}</div> : null}
        <button
          className="w-full rounded-full bg-[#03182e] px-5 py-3 text-sm font-medium text-[#f9f4e7] transition hover:bg-[#100f0f] active:-translate-y-px disabled:opacity-50"
          disabled={isSaving}
          onClick={save}
          type="button"
        >
          {isSaving ? "Speichern..." : "Inhalte speichern"}
        </button>
        <p className="text-sm leading-6 text-[#6b5f50]">
          Diese v1-Felder steuern den dynamischen Blog-CTA auf der öffentlichen Website und die
          wichtigsten SEO-Basics.
        </p>
      </aside>
    </div>
  );
}

function Field({label, children}: {label: string; children: React.ReactNode}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#03182e]">{label}</span>
      {children}
    </label>
  );
}
