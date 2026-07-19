"use client";

import {
  ArrowSquareOut,
  CheckCircle,
  FloppyDisk,
  ImageSquare,
  Link as LinkIcon,
  ListBullets,
  MagnifyingGlass,
  Minus,
  Quotes,
  SpinnerGap,
  Trash,
  Upload,
  VideoCamera,
  WarningCircle,
} from "@phosphor-icons/react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useEffect, useMemo, useRef, useState} from "react";
import {BlogContentRenderer} from "@/components/blog-content-renderer";
import {MediaUploadField} from "@/components/media-upload-field";
import {PostRevisionPanel} from "@/components/post-revision-panel";
import {applyUploadedCover, type UploadedMedia} from "@/lib/blog-upload";
import type {BlogPost, MediaAsset, PostStatus} from "@/lib/content-store";
import {
  formatDate,
  formatDateTimeInput,
  fromDateTimeInput,
  readingMinutes,
  seoIssues,
  statusLabels,
  wordCount,
} from "@/lib/editor-insights";
import {slugify} from "@/lib/slug";
import type {BlogLocale} from "@/lib/blog-localization";

type Draft = Pick<
  BlogPost,
  | "title"
  | "slug"
  | "excerpt"
  | "content"
  | "coverImage"
  | "coverAlt"
  | "status"
  | "seoTitle"
  | "seoDescription"
  | "authorName"
  | "category"
  | "tags"
  | "scheduledAt"
> & {locale: BlogLocale | ""};

const emptyDraft: Draft = {
  authorName: "Heike Ziegler",
  category: "",
  content: "",
  coverAlt: "",
  coverImage: "/media/images/heike-ziegler.webp",
  excerpt: "",
  locale: "",
  scheduledAt: null,
  seoDescription: "",
  seoTitle: "",
  slug: "",
  status: "draft",
  tags: "",
  title: "",
};

export function BlogPostForm({
  counterpart,
  initialCover,
  initialCoverAlt,
  mediaAssets = [],
  post,
  translationCreated = false,
}: {
  counterpart?: BlogPost;
  initialCover?: string;
  initialCoverAlt?: string;
  mediaAssets?: MediaAsset[];
  post?: BlogPost;
  translationCreated?: boolean;
}) {
  const router = useRouter();
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const initialDraft = post ? postToDraft(post) : {...emptyDraft, coverAlt: initialCoverAlt || "", coverImage: initialCover || emptyDraft.coverImage};
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [savedSnapshot, setSavedSnapshot] = useState(JSON.stringify(initialDraft));
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [lastUpload, setLastUpload] = useState<UploadedMedia | null>(null);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaQuery, setMediaQuery] = useState("");
  const [recoveryAvailable, setRecoveryAvailable] = useState(false);

  const currentWordCount = useMemo(() => wordCount(draft.content), [draft.content]);
  const currentReadingMinutes = useMemo(() => readingMinutes(draft.content), [draft.content]);
  const issues = useMemo(() => seoIssues(draft), [draft]);
  const blockingIssues = useMemo(
    () =>
      issues.filter((issue) =>
        ["Titel fehlt", "Slug fehlt", "Auszug fehlt", "Inhalt fehlt", "Cover fehlt", "Cover-Alt-Text fehlt"].includes(issue),
      ),
    [issues],
  );
  const isDirty = JSON.stringify(draft) !== savedSnapshot;
  const isCoverVideo = isVideoUrl(draft.coverImage);
  const canOpenPublic = post && draft.status === "published" && draft.slug;
  const targetLocale: BlogLocale = post?.locale === "de" ? "en" : "de";
  const recoveryKey = `content-studio:draft:${post?.id || "new"}`;
  const filteredMedia = useMemo(() => {
    const query = mediaQuery.trim().toLowerCase();
    return mediaAssets.filter((asset) => {
      if (!query) return true;
      return [asset.filename, asset.alt, asset.mimeType, asset.url].join(" ").toLowerCase().includes(query);
    });
  }, [mediaAssets, mediaQuery]);

  useEffect(() => {
    const stored = window.localStorage.getItem(recoveryKey);
    if (stored && stored !== savedSnapshot) setRecoveryAvailable(true);
  }, [recoveryKey, savedSnapshot]);

  useEffect(() => {
    if (!isDirty) return;
    window.localStorage.setItem(recoveryKey, JSON.stringify(draft));
  }, [draft, isDirty, recoveryKey]);

  useEffect(() => {
    if (!isDirty) return;

    function warnBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    function warnBeforeInternalNavigation(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target.closest("a") : null;
      if (!target || target.target === "_blank" || event.defaultPrevented) return;

      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      const nextUrl = new URL(href, window.location.href);
      if (nextUrl.origin !== window.location.origin) return;

      const confirmed = window.confirm("Es gibt ungespeicherte Änderungen. Seite trotzdem verlassen?");
      if (!confirmed) event.preventDefault();
    }

    window.addEventListener("beforeunload", warnBeforeUnload);
    document.addEventListener("click", warnBeforeInternalNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", warnBeforeUnload);
      document.removeEventListener("click", warnBeforeInternalNavigation, true);
    };
  }, [isDirty]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => {
      const next = {...current, [key]: value};
      if (key === "title") {
        if (!post && !current.slug) next.slug = slugify(String(value));
        if (!current.seoTitle) next.seoTitle = String(value);
        if (!current.coverAlt) next.coverAlt = String(value);
      }
      if (key === "excerpt" && !current.seoDescription) next.seoDescription = String(value);
      if (key === "status" && value !== "scheduled") next.scheduledAt = null;
      return next;
    });
    setMessage(null);
  }

  function appendToContent(markup: string) {
    setDraft((current) => ({
      ...current,
      content: `${current.content.trimEnd()}${current.content.trim() ? "\n\n" : ""}${markup}\n\n`,
    }));
    setMessage(null);
  }

  function insertMarkup(markup: string) {
    const textarea = contentTextareaRef.current;
    if (!textarea) {
      appendToContent(markup);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = draft.content.slice(start, end);
    const insertion = selected ? markup.replace("Text", selected) : markup;
    const nextContent = `${draft.content.slice(0, start)}${insertion}${draft.content.slice(end)}`;

    update("content", nextContent);
    requestAnimationFrame(() => {
      textarea.focus();
      const nextCursor = start + insertion.length;
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  }

  function insertUploadedMedia(asset = lastUpload) {
    if (!asset) return;
    const alt = asset.alt || draft.title || "Blog-Medium";
    appendToContent(asset.mimeType.startsWith("video/") ? `[video](${asset.url})` : `![${alt}](${asset.url})`);
  }

  async function save() {
    setError(null);
    setMessage(null);

    if (!draft.locale) {
      setError("Bitte zuerst Deutsch oder English als Sprache wählen.");
      return;
    }

    if ((draft.status === "published" || draft.status === "scheduled") && blockingIssues.length) {
      setError(`Vor dem Veröffentlichen bitte beheben: ${blockingIssues.join(", ")}.`);
      return;
    }

    setIsSaving(true);
    const payload = {...draft, readingMinutes: currentReadingMinutes};
    const response = await fetch(post ? `/api/posts/${post.id}` : "/api/posts", {
      body: JSON.stringify(payload),
      headers: {"content-type": "application/json"},
      method: post ? "PATCH" : "POST",
    });
    const data = await response.json().catch(() => null);

    setIsSaving(false);

    if (!response.ok) {
      setError(data?.error || "Der Beitrag konnte nicht gespeichert werden.");
      return;
    }

    const nextDraft = postToDraft(data);
    setDraft(nextDraft);
    setSavedSnapshot(JSON.stringify(nextDraft));
    window.localStorage.removeItem(recoveryKey);
    setRecoveryAvailable(false);
    setMessage("Gespeichert.");

    if (!post) {
      router.replace(`/admin/blog/${data.id}`);
    }
    router.refresh();
  }

  async function generateTranslation(confirmOverwrite = false) {
    if (!post) return;
    if (isDirty) {
      setError("Bitte den Ausgangsbeitrag vor der Übersetzung speichern.");
      return;
    }

    setError(null);
    setMessage(null);
    setIsTranslating(true);
    const response = await fetch(`/api/posts/${post.id}/translate`, {
      method: "POST",
      headers: {"content-type": "application/json"},
      body: JSON.stringify({targetLocale, confirmOverwrite}),
    });
    const data = await response.json().catch(() => null);
    setIsTranslating(false);

    if (response.status === 409 && data?.code === "overwrite_required" && !confirmOverwrite) {
      const confirmed = window.confirm(
        "Die vorhandene Übersetzung enthält bereits Text. Soll sie wirklich durch eine neue automatische Übersetzung ersetzt werden?",
      );
      if (confirmed) await generateTranslation(true);
      return;
    }
    if (!response.ok) {
      setError(data?.error || "Die Übersetzung konnte nicht erstellt werden.");
      return;
    }

    router.push(`/admin/blog/${data.target.id}?translation=draft`);
    router.refresh();
  }

  function restoreLocalDraft() {
    const stored = window.localStorage.getItem(recoveryKey);
    if (!stored) return;

    try {
      setDraft(JSON.parse(stored) as Draft);
      setRecoveryAvailable(false);
      setMessage("Lokale Sicherung wiederhergestellt.");
    } catch {
      window.localStorage.removeItem(recoveryKey);
      setRecoveryAvailable(false);
    }
  }

  function discardLocalDraft() {
    window.localStorage.removeItem(recoveryKey);
    setRecoveryAvailable(false);
    setMessage("Lokale Sicherung verworfen.");
  }

  function insertMediaAsset(asset: MediaAsset) {
    const alt = asset.alt || draft.title || asset.filename;
    appendToContent(asset.mimeType.startsWith("video/") ? `[video](${asset.url})` : `![${alt}](${asset.url})`);
    setLastUpload({alt, mimeType: asset.mimeType, url: asset.url});
    setShowMediaLibrary(false);
  }

  async function remove() {
    if (!post) return;
    const confirmed = window.confirm("Diesen Blogpost dauerhaft löschen? Diese Aktion kann nicht rückgängig gemacht werden.");
    if (!confirmed) return;

    setIsSaving(true);
    await fetch(`/api/posts/${post.id}`, {method: "DELETE"});
    router.replace("/admin/blog");
    router.refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-5">
        <div className="sticky top-0 z-10 -mx-5 border-b border-[#b49474]/20 bg-[#f8f1e4]/92 px-5 py-3 backdrop-blur md:top-0 md:mx-0 md:rounded-[22px] md:border md:bg-[#fcf3e3]/76">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex rounded-full border border-[#b49474]/25 bg-[#fffaf0] p-1">
              <button
                className={`rounded-full px-4 py-2 text-sm font-semibold transition active:-translate-y-px ${
                  mode === "write" ? "bg-[#03182e] text-[#f9f4e7]" : "text-[#4c4235] hover:bg-[#f2e2ce]"
                }`}
                onClick={() => setMode("write")}
                type="button"
              >
                Schreiben
              </button>
              <button
                className={`rounded-full px-4 py-2 text-sm font-semibold transition active:-translate-y-px ${
                  mode === "preview" ? "bg-[#03182e] text-[#f9f4e7]" : "text-[#4c4235] hover:bg-[#f2e2ce]"
                }`}
                onClick={() => setMode("preview")}
                type="button"
              >
                Vorschau
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SaveState dirty={isDirty} isSaving={isSaving} message={message} />
              <button
                className="inline-flex items-center gap-2 rounded-full bg-[#03182e] px-4 py-2.5 text-sm font-semibold text-[#f9f4e7] transition hover:bg-[#100f0f] active:-translate-y-px disabled:opacity-50"
                disabled={isSaving}
                onClick={save}
                type="button"
              >
                {isSaving ? <SpinnerGap className="size-4 animate-spin" /> : <FloppyDisk className="size-4" />}
                Speichern
              </button>
            </div>
          </div>
        </div>

        {error ? <Notice tone="error">{error}</Notice> : null}
        {recoveryAvailable ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-[#b49474]/25 bg-[#fffaf0] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[#03182e]">Lokale Sicherung gefunden</p>
              <p className="mt-1 text-xs text-[#6b5f50]">Es gibt eine ungespeicherte Version dieses Beitrags auf diesem Gerät.</p>
            </div>
            <div className="flex gap-2">
              <button className="rounded-full border border-[#b49474]/30 px-3 py-2 text-xs font-semibold text-[#4c4235] transition hover:bg-[#f2e2ce]" onClick={discardLocalDraft} type="button">
                Verwerfen
              </button>
              <button className="rounded-full bg-[#03182e] px-3 py-2 text-xs font-semibold text-[#f9f4e7] transition hover:bg-[#100f0f]" onClick={restoreLocalDraft} type="button">
                Wiederherstellen
              </button>
            </div>
          </div>
        ) : null}

        {mode === "write" ? (
          <div className="space-y-5">
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <Field label="Titel" helper="Wird für H1, Auto-Slug und Standard-SEO genutzt." error={!draft.title.trim() ? "Pflichtfeld" : undefined}>
                <input
                  className="admin-input text-lg font-semibold"
                  value={draft.title}
                  onChange={(event) => update("title", event.target.value)}
                  placeholder="Titel des Insights"
                />
              </Field>
              <Field label="Slug" helper={`URL: /${draft.locale || "de|en"}/blog/${draft.slug || "neuer-insight"}`} error={!draft.slug.trim() ? "Pflichtfeld" : undefined}>
                <input
                  className="admin-input"
                  value={draft.slug}
                  onChange={(event) => update("slug", slugify(event.target.value))}
                  placeholder="erfolg-ohne-druck"
                />
              </Field>
            </div>

            <Field label="Auszug" helper={`${draft.excerpt.length}/220 Zeichen empfohlen`} error={!draft.excerpt.trim() ? "Pflichtfeld" : undefined}>
              <textarea
                className="admin-input min-h-28"
                value={draft.excerpt}
                onChange={(event) => update("excerpt", event.target.value)}
                placeholder="Kurzer Teaser für Blogübersicht und SEO."
              />
            </Field>

            <section className="overflow-hidden rounded-[24px] border border-[#b49474]/20 bg-[#fcf3e3]/50">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#b49474]/20 px-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-[#03182e]">Inhalt</p>
                  <p className="mt-1 text-xs text-[#6b5f50]">
                    {currentWordCount} Wörter · {currentReadingMinutes} Min. Lesezeit
                  </p>
                </div>
                <EditorToolbar
                  canInsertUpload={Boolean(lastUpload)}
                  hasMediaLibrary={mediaAssets.length > 0}
                  onCallout={() => insertMarkup("[callout]Text")}
                  onDivider={() => insertMarkup("---")}
                  onHeading={() => insertMarkup("## Text")}
                  onSubheading={() => insertMarkup("### Text")}
                  onInsertUpload={() => insertUploadedMedia()}
                  onLink={() => insertMarkup("[Text](https://)")}
                  onList={() => insertMarkup("- Text")}
                  onMediaLibrary={() => setShowMediaLibrary((current) => !current)}
                  onQuote={() => insertMarkup("> Text")}
                  onVideo={() => {
                    const url = window.prompt("Medien-URL (z.B. YouTube, Vimeo, Spotify, SoundCloud oder MP4) eingeben:");
                    if (url?.trim()) {
                      insertMarkup(`[video](${url.trim()})`);
                    }
                  }}
                />
              </div>
              {showMediaLibrary ? (
                <MediaLibraryPanel
                  assets={filteredMedia}
                  onInsert={insertMediaAsset}
                  query={mediaQuery}
                  setQuery={setMediaQuery}
                />
              ) : null}
              <textarea
                ref={contentTextareaRef}
                className="min-h-[620px] w-full resize-y border-0 bg-[#fffaf0] px-5 py-5 font-sans text-[15px] leading-7 text-[#03182e] outline-none transition focus:bg-white md:px-6"
                value={draft.content}
                onChange={(event) => update("content", event.target.value)}
                placeholder="Absätze mit einer Leerzeile trennen. Bilder werden als ![Alt](URL), Videos als [video](URL) eingefügt."
              />
            </section>
          </div>
        ) : (
          <PreviewPane draft={draft} />
        )}
      </div>

      <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
        {translationCreated ? (
          <Notice tone="success">Übersetzung als Entwurf gespeichert. Bitte vollständig prüfen und separat veröffentlichen.</Notice>
        ) : null}
        <section className="rounded-[22px] border border-[#b49474]/20 bg-[#fcf3e3]/62 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#03182e]">Veröffentlichung</p>
              <p className="mt-1 text-xs text-[#6b5f50]">{post ? `Bearbeitet ${formatDate(post.updatedAt)}` : "Neuer Entwurf"}</p>
            </div>
            <span className="rounded-full border border-[#b49474]/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#4c4235]">
              {statusLabels[draft.status]}
            </span>
          </div>
          <SelectField
            disabled={Boolean(post && counterpart)}
            helper={post && counterpart ? "Die Sprache ist fest, weil ein verknüpftes Gegenstück existiert." : "Sprache dieses einzelnen Beitrags."}
            label="Sprache"
            value={draft.locale}
            onChange={(value) => update("locale", value as BlogLocale)}
            options={[
              ...(!draft.locale ? [{label: "Bitte wählen", value: ""}] : []),
              {label: "Deutsch", value: "de"},
              {label: "English", value: "en"},
            ]}
          />
          <div className="mt-4" />
          <SelectField
            label="Status"
            value={draft.status}
            onChange={(value) => update("status", value as PostStatus)}
            options={[
              {label: "Entwurf", value: "draft"},
              {label: "Review", value: "review"},
              {label: "Geplant", value: "scheduled"},
              {label: "Veröffentlicht", value: "published"},
              {label: "Archiviert", value: "archived"},
            ]}
          />
          {draft.status === "scheduled" ? (
            <Field label="Geplant für" helper="Wird durch den Coolify-Scheduler automatisch veröffentlicht.">
              <input
                className="admin-input"
                type="datetime-local"
                value={formatDateTimeInput(draft.scheduledAt)}
                onChange={(event) => update("scheduledAt", fromDateTimeInput(event.target.value))}
              />
            </Field>
          ) : null}
          {canOpenPublic ? (
            <Link
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#b49474]/30 px-4 py-3 text-sm font-semibold text-[#4c4235] transition hover:bg-[#f2e2ce] active:-translate-y-px"
              href={`/${draft.locale}/blog/${draft.slug}`}
              target="_blank"
            >
              <ArrowSquareOut className="size-4" />
              Öffentliche Seite öffnen
            </Link>
          ) : null}
        </section>

        {post ? (
          <section className="rounded-[22px] border border-[#b49474]/20 bg-[#fcf3e3]/62 p-4">
            <p className="text-sm font-semibold text-[#03182e]">DE/EN-Übersetzung</p>
            <p className="mt-1 text-xs leading-5 text-[#6b5f50]">
              Status: {translationStatusLabel(post.translationStatus)}. Automatische Übersetzungen werden immer nur als Entwurf gespeichert.
            </p>
            {post.translationError ? (
              <p className="mt-3 rounded-xl bg-[#7f1d1d]/10 px-3 py-2 text-xs leading-5 text-[#7f1d1d]">
                Letzter Versuch fehlgeschlagen. Du kannst ihn erneut starten.
              </p>
            ) : null}
            {counterpart ? (
              <Link
                className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-[#b49474]/30 px-4 py-3 text-sm font-semibold text-[#4c4235] transition hover:bg-[#f2e2ce]"
                href={`/admin/blog/${counterpart.id}`}
              >
                {counterpart.locale === "de" ? "Deutschen" : "Englischen"} Beitrag öffnen
              </Link>
            ) : null}
            {post.sourcePostId ? (
              <p className="mt-3 rounded-xl bg-[#0f4c81]/10 px-3 py-2 text-xs leading-5 text-[#0f4c81]">
                Dieser Beitrag wurde automatisch als Entwurf erzeugt. Bitte hier prüfen, bearbeiten und separat veröffentlichen.
              </p>
            ) : (
              <>
                <button
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#03182e] px-4 py-3 text-sm font-semibold text-[#f9f4e7] transition hover:bg-[#100f0f] disabled:opacity-50"
                  disabled={isTranslating || isSaving || isDirty}
                  onClick={() => generateTranslation(false)}
                  type="button"
                >
                  {isTranslating ? <SpinnerGap className="size-4 animate-spin" /> : null}
                  {counterpart ? "Übersetzung neu erzeugen" : `${targetLocale === "de" ? "Deutsche" : "Englische"} Übersetzung erzeugen`}
                </button>
                {isDirty ? <p className="mt-2 text-xs text-[#6b5f50]">Vorher Änderungen speichern.</p> : null}
              </>
            )}
          </section>
        ) : null}

        <section className="rounded-[22px] border border-[#b49474]/20 bg-[#fcf3e3]/62 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#03182e]">Medien</p>
              <p className="mt-1 text-xs text-[#6b5f50]">JPG, PNG, WebP, MP4, MOV, WebM</p>
            </div>
            <Upload className="size-5 text-[#8b6f4e]" />
          </div>
          <MediaUploadField alt={draft.coverAlt || draft.title} onUploaded={(asset) => {
            const uploaded: UploadedMedia = {alt: asset.alt, mimeType: asset.mimeType, url: asset.url};
            setLastUpload(uploaded);
            setDraft((current) => applyUploadedCover(current, uploaded));
            setMessage(null);
            setUploadMessage("Upload abgeschlossen und als Cover gesetzt. Beitrag noch speichern.");
          }} />
          {uploadMessage ? <Notice tone="success">{uploadMessage}</Notice> : null}
          {lastUpload ? (
            <div className="mt-4 space-y-3">
              <MediaPreview asset={lastUpload} />
              <p className="break-all text-xs text-[#6b5f50]">{lastUpload.url}</p>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0f5132]">
                  <CheckCircle className="size-4" />
                  Als Cover gesetzt
                </span>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#03182e] px-3 py-2 text-xs font-semibold text-[#f9f4e7] transition hover:bg-[#100f0f] active:-translate-y-px"
                  onClick={() => insertUploadedMedia(lastUpload)}
                  type="button"
                >
                  <LinkIcon className="size-4" />
                  Einfügen
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <section className="rounded-[22px] border border-[#b49474]/20 bg-[#fcf3e3]/62 p-4">
          <p className="mb-4 text-sm font-semibold text-[#03182e]">Cover</p>
          <Field label="Cover-Medium URL" error={!draft.coverImage.trim() ? "Pflichtfeld" : undefined}>
            <input
              className="admin-input"
              value={draft.coverImage}
              onChange={(event) => update("coverImage", event.target.value)}
            />
          </Field>
          <Field label="Cover-Alt-Text" helper="Kurz beschreiben, was sichtbar ist." error={!draft.coverAlt.trim() ? "Pflichtfeld" : undefined}>
            <input
              className="admin-input"
              value={draft.coverAlt}
              onChange={(event) => update("coverAlt", event.target.value)}
            />
          </Field>
          <div className="mt-4 overflow-hidden rounded-[18px] border border-[#b49474]/20 bg-[#fffaf0]">
            <MediaPreview
              asset={{
                alt: draft.coverAlt,
                mimeType: isCoverVideo ? "video/mp4" : "image/*",
                url: draft.coverImage,
              }}
              className="aspect-[16/10] w-full object-cover"
            />
          </div>
        </section>

        <section className="rounded-[22px] border border-[#b49474]/20 bg-[#fcf3e3]/62 p-4">
          <p className="mb-4 text-sm font-semibold text-[#03182e]">SEO und Redaktion</p>
          <div className="grid gap-3">
            <Field label="Autorin">
              <input className="admin-input admin-input-compact" value={draft.authorName} onChange={(event) => update("authorName", event.target.value)} />
            </Field>
            <Field label="Kategorie">
              <input className="admin-input admin-input-compact" value={draft.category} onChange={(event) => update("category", event.target.value)} placeholder="Selbstführung" />
            </Field>
            <Field label="Tags" helper="Durch Kommas getrennt.">
              <input className="admin-input admin-input-compact" value={draft.tags} onChange={(event) => update("tags", event.target.value)} placeholder="Erfolg, Klarheit, Identität" />
            </Field>
            <Field label="SEO Titel" helper={`${draft.seoTitle.length}/65 Zeichen`}>
              <input className="admin-input admin-input-compact" value={draft.seoTitle} onChange={(event) => update("seoTitle", event.target.value)} />
            </Field>
            <Field label="SEO Beschreibung" helper={`${draft.seoDescription.length}/160 Zeichen`}>
              <textarea className="admin-input min-h-20" value={draft.seoDescription} onChange={(event) => update("seoDescription", event.target.value)} />
            </Field>
          </div>
          <SeoPreview draft={draft} />
          <IssueList issues={issues} />
        </section>

        {post ? <PostRevisionPanel postId={post.id} current={{...draft, locale: draft.locale || undefined}} onRestored={(restored) => {
          const next = postToDraft(restored);
          setDraft(next); setSavedSnapshot(JSON.stringify(next));
          window.localStorage.removeItem(recoveryKey);
          setRecoveryAvailable(false); setMessage("Version wiederhergestellt."); router.refresh();
        }} /> : null}

        <div className="flex flex-col gap-3">
          {post ? (
            <button
              className="rounded-full border border-[#7f1d1d]/25 px-5 py-3 text-sm font-semibold text-[#7f1d1d] transition hover:bg-[#7f1d1d]/10 active:-translate-y-px disabled:opacity-50"
              disabled={isSaving}
              onClick={remove}
              type="button"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <Trash className="size-4" />
                Löschen
              </span>
            </button>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

function postToDraft(post: BlogPost): Draft {
  return {
    authorName: post.authorName,
    category: post.category,
    content: post.content,
    coverAlt: post.coverAlt,
    coverImage: post.coverImage,
    excerpt: post.excerpt,
    locale: post.locale,
    scheduledAt: post.scheduledAt,
    seoDescription: post.seoDescription,
    seoTitle: post.seoTitle,
    slug: post.slug,
    status: post.status,
    tags: post.tags,
    title: post.title,
  };
}

function PreviewPane({draft}: {draft: Draft}) {
  return (
    <article className="rounded-[28px] border border-[#b49474]/20 bg-[#fffaf0] px-5 py-8 md:px-10 md:py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b6f4e]">
        {draft.category || "Insight"} · {draft.authorName}
      </p>
      <h2 className="mt-4 text-4xl font-semibold leading-[1.02] tracking-tight text-[#03182e] md:text-6xl">
        {draft.title || "Unbenannter Entwurf"}
      </h2>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-[#4c4235]">{draft.excerpt || "Noch kein Auszug gepflegt."}</p>
      {isVideoUrl(draft.coverImage) ? (
        <video className="mt-8 aspect-[16/9] w-full rounded-[24px] object-cover" controls playsInline src={draft.coverImage} />
      ) : (
        <img alt={draft.coverAlt || ""} className="mt-8 aspect-[16/9] w-full rounded-[24px] object-cover" src={draft.coverImage} />
      )}
      <BlogContentRenderer className="prose-brand mt-10" content={draft.content} />
    </article>
  );
}

function EditorToolbar({
  canInsertUpload,
  hasMediaLibrary,
  onCallout,
  onDivider,
  onHeading,
  onInsertUpload,
  onLink,
  onList,
  onMediaLibrary,
  onQuote,
  onSubheading,
  onVideo,
}: {
  canInsertUpload: boolean;
  hasMediaLibrary: boolean;
  onCallout: () => void;
  onDivider: () => void;
  onHeading: () => void;
  onInsertUpload: () => void;
  onLink: () => void;
  onList: () => void;
  onMediaLibrary: () => void;
  onQuote: () => void;
  onSubheading: () => void;
  onVideo: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <ToolButton label="H2" onClick={onHeading} />
      <ToolButton label="H3" onClick={onSubheading} />
      <ToolButton icon={<Quotes className="size-4" />} label="Zitat" onClick={onQuote} />
      <ToolButton label="Callout" onClick={onCallout} />
      <ToolButton icon={<ListBullets className="size-4" />} label="Liste" onClick={onList} />
      <ToolButton icon={<Minus className="size-4" />} label="Linie" onClick={onDivider} />
      <ToolButton icon={<LinkIcon className="size-4" />} label="Link" onClick={onLink} />
      <ToolButton icon={<VideoCamera className="size-4" />} label="Video/Medien" onClick={onVideo} />
      <ToolButton
        disabled={!hasMediaLibrary}
        icon={<MagnifyingGlass className="size-4" />}
        label="Bibliothek"
        onClick={onMediaLibrary}
      />
      <ToolButton
        disabled={!canInsertUpload}
        icon={<ImageSquare className="size-4" />}
        label="Letzter Upload"
        onClick={onInsertUpload}
      />
    </div>
  );
}

function MediaLibraryPanel({
  assets,
  onInsert,
  query,
  setQuery,
}: {
  assets: MediaAsset[];
  onInsert: (asset: MediaAsset) => void;
  query: string;
  setQuery: (query: string) => void;
}) {
  return (
    <div className="border-b border-[#b49474]/20 bg-[#f9f4e7] px-4 py-4">
      <label className="relative block">
        <MagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8b6f4e]" />
        <input
          className="admin-input bg-[#fffaf0] pl-11"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Medienbibliothek durchsuchen"
        />
      </label>
      {assets.length ? (
        <div className="mt-4 grid max-h-80 gap-3 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <button
              className="group rounded-2xl border border-[#b49474]/20 bg-[#fffaf0] p-2 text-left transition hover:border-[#8b6f4e] hover:bg-white active:-translate-y-px"
              key={asset.id}
              onClick={() => onInsert(asset)}
              type="button"
            >
              {asset.mimeType.startsWith("video/") ? (
                <video className="aspect-[4/3] w-full rounded-xl object-cover" muted preload="metadata" src={asset.url} />
              ) : (
                <img alt={asset.alt} className="aspect-[4/3] w-full rounded-xl object-cover" src={asset.url} />
              )}
              <p className="mt-2 truncate text-xs font-semibold text-[#03182e]">{asset.filename}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#6b5f50]">{asset.alt || "Kein Alt-Text"}</p>
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-2xl border border-dashed border-[#b49474]/35 px-4 py-8 text-center text-sm text-[#6b5f50]">
          Keine Medien gefunden.
        </p>
      )}
    </div>
  );
}

function SeoPreview({draft}: {draft: Draft}) {
  const title = draft.seoTitle || draft.title || "Unbenannter Insight";
  const description = draft.seoDescription || draft.excerpt || "Noch keine SEO-Beschreibung gepflegt.";
  const slug = draft.slug || "neuer-insight";

  return (
    <div className="mt-4 space-y-3">
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b6f4e]">Google Preview</p>
        <div className="rounded-2xl border border-[#b49474]/20 bg-[#fffaf0] p-3">
          <p className="truncate text-xs text-[#0f5132]">make-success-your-habit.com/{draft.locale || "de|en"}/blog/{slug}</p>
          <p className="mt-1 line-clamp-2 text-sm font-semibold text-[#1a0dab]">{title}</p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#4c4235]">{description}</p>
        </div>
      </div>
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b6f4e]">Social Preview</p>
        <div className="overflow-hidden rounded-2xl border border-[#b49474]/20 bg-[#fffaf0]">
          {isVideoUrl(draft.coverImage) ? (
            <video className="aspect-[1.91/1] w-full object-cover" muted preload="metadata" src={draft.coverImage} />
          ) : (
            <img alt={draft.coverAlt || ""} className="aspect-[1.91/1] w-full object-cover" src={draft.coverImage} />
          )}
          <div className="p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[#6b5f50]">make-success-your-habit.com</p>
            <p className="mt-1 line-clamp-2 text-sm font-semibold text-[#03182e]">{title}</p>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#6b5f50]">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolButton({
  disabled,
  icon,
  label,
  onClick,
}: {
  disabled?: boolean;
  icon?: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-[#b49474]/30 bg-[#fffaf0] px-3 text-xs font-semibold text-[#4c4235] transition hover:bg-[#f2e2ce] active:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

function SaveState({dirty, isSaving, message}: {dirty: boolean; isSaving: boolean; message: string | null}) {
  if (isSaving) {
    return (
      <span className="inline-flex items-center gap-2 text-sm font-medium text-[#6b5f50]">
        <SpinnerGap className="size-4 animate-spin" />
        Speichert
      </span>
    );
  }

  if (message) {
    return (
      <span className="inline-flex items-center gap-2 text-sm font-medium text-[#0f5132]">
        <CheckCircle className="size-4" />
        {message}
      </span>
    );
  }

  return <span className="text-sm font-medium text-[#6b5f50]">{dirty ? "Ungespeicherte Änderungen" : "Keine Änderungen"}</span>;
}

function IssueList({issues}: {issues: string[]}) {
  if (!issues.length) {
    return (
      <div className="mt-4 rounded-2xl bg-[#0f5132]/10 px-3 py-3 text-sm font-medium text-[#0f5132]">
        Keine redaktionellen Hinweise.
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl bg-[#7f1d1d]/10 px-3 py-3 text-sm text-[#7f1d1d]">
      <p className="mb-2 flex items-center gap-2 font-semibold">
        <WarningCircle className="size-4" />
        Hinweise
      </p>
      <ul className="space-y-1">
        {issues.map((issue) => (
          <li key={issue}>{issue}</li>
        ))}
      </ul>
    </div>
  );
}

function Notice({children, tone}: {children: React.ReactNode; tone: "error" | "success"}) {
  const styles = tone === "error" ? "bg-[#7f1d1d]/10 text-[#7f1d1d]" : "bg-[#0f5132]/10 text-[#0f5132]";
  return <div className={`mt-3 rounded-xl px-4 py-3 text-sm leading-6 ${styles}`}>{children}</div>;
}

function Field({
  label,
  helper,
  error,
  children,
}: {
  label: string;
  helper?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#03182e]">{label}</span>
      {children}
      {helper ? <span className="mt-2 block text-xs leading-5 text-[#6b5f50]">{helper}</span> : null}
      {error ? <span className="mt-2 block text-xs font-semibold text-[#7f1d1d]">{error}</span> : null}
    </label>
  );
}

function SelectField({
  disabled,
  helper,
  label,
  onChange,
  options,
  value,
}: {
  disabled?: boolean;
  helper?: string;
  label: string;
  onChange: (value: string) => void;
  options: Array<{label: string; value: string}>;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#03182e]">{label}</span>
      <span className="relative block">
        <select
          className="admin-input admin-input-compact appearance-none pr-10"
          disabled={disabled}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#8b6f4e]">▼</span>
      </span>
      {helper ? <span className="mt-2 block text-xs leading-5 text-[#6b5f50]">{helper}</span> : null}
    </label>
  );
}

function translationStatusLabel(status: BlogPost["translationStatus"]) {
  return {
    none: "noch nicht erzeugt",
    translating: "Übersetzung läuft",
    ready: "Entwurf bereit",
    failed: "fehlgeschlagen",
  }[status];
}

function isVideoUrl(url: string) {
  return /\.(mp4|mov|webm)(\?|#|$)/i.test(url);
}

function MediaPreview({
  asset,
  className = "aspect-video w-full rounded-2xl object-cover",
}: {
  asset: UploadedMedia;
  className?: string;
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [asset.url]);

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center border border-[#7f1d1d]/25 bg-[#7f1d1d]/10 px-4 text-center text-sm text-[#7f1d1d] ${className}`}
        role="alert"
      >
        Die Vorschau konnte nicht geladen werden. Bitte Upload oder Speicher-Konfiguration prüfen.
      </div>
    );
  }

  if (asset.mimeType.startsWith("video/")) {
    return <video className={className} controls muted onError={() => setHasError(true)} src={asset.url} />;
  }

  return <img alt={asset.alt} className={className} onError={() => setHasError(true)} src={asset.url} />;
}
