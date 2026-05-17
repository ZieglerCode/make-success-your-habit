"use client";

import {Image, Link2, Loader2, Upload, Video} from "lucide-react";
import {useRouter} from "next/navigation";
import {useMemo, useRef, useState} from "react";
import type {BlogPost, PostStatus} from "@/lib/content-store";
import {slugify} from "@/lib/slug";

type Draft = Pick<
  BlogPost,
  "title" | "slug" | "excerpt" | "content" | "coverImage" | "status" | "seoTitle" | "seoDescription"
>;

const emptyDraft: Draft = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "/media/images/heike-ziegler.webp",
  status: "draft",
  seoTitle: "",
  seoDescription: "",
};

export function BlogPostForm({post}: {post?: BlogPost}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<Draft>(post ? {...post} : emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [lastUpload, setLastUpload] = useState<{url: string; mimeType: string; alt: string} | null>(null);

  const wordCount = useMemo(
    () => draft.content.trim().split(/\s+/).filter(Boolean).length,
    [draft.content],
  );
  const isCoverVideo = isVideoUrl(draft.coverImage);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => {
      const next = {...current, [key]: value};
      if (key === "title") {
        if (!post && !current.slug) next.slug = slugify(String(value));
        if (!current.seoTitle) next.seoTitle = String(value);
      }
      if (key === "excerpt" && !current.seoDescription) next.seoDescription = String(value);
      return next;
    });
  }

  function appendToContent(markup: string) {
    setDraft((current) => ({
      ...current,
      content: `${current.content.trimEnd()}${current.content.trim() ? "\n\n" : ""}${markup}\n\n`,
    }));
  }

  function insertUploadedMedia(asset = lastUpload) {
    if (!asset) return;
    const alt = asset.alt || draft.title || "Blog-Medium";
    appendToContent(asset.mimeType.startsWith("video/") ? `[video](${asset.url})` : `![${alt}](${asset.url})`);
  }

  async function uploadSelectedFile(file: File | null) {
    if (!file) return;

    setError(null);
    setUploadMessage(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("alt", draft.title || file.name.replace(/\.[^.]+$/, ""));

    const response = await fetch("/api/media", {
      body: formData,
      method: "POST",
    });
    const data = await response.json().catch(() => null);

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (!response.ok) {
      setError(data?.error || "Die Datei konnte nicht hochgeladen werden.");
      return;
    }

    const uploaded = {
      alt: data.alt || "",
      mimeType: data.mimeType || file.type,
      url: data.url,
    };
    setLastUpload(uploaded);
    setUploadMessage("Upload abgeschlossen. Du kannst die Datei als Cover verwenden oder in den Inhalt einfügen.");
  }

  async function save() {
    setIsSaving(true);
    setError(null);

    const response = await fetch(post ? `/api/posts/${post.id}` : "/api/posts", {
      body: JSON.stringify(draft),
      headers: {"content-type": "application/json"},
      method: post ? "PATCH" : "POST",
    });
    const data = await response.json().catch(() => null);

    setIsSaving(false);

    if (!response.ok) {
      setError(data?.error || "Der Beitrag konnte nicht gespeichert werden.");
      return;
    }

    router.replace(`/admin/blog/${data.id}`);
    router.refresh();
  }

  async function remove() {
    if (!post) return;

    setIsSaving(true);
    await fetch(`/api/posts/${post.id}`, {method: "DELETE"});
    router.replace("/admin/blog");
    router.refresh();
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
      <div className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Field label="Titel">
            <input
              className="admin-input text-lg"
              value={draft.title}
              onChange={(event) => update("title", event.target.value)}
              placeholder="Titel des Insights"
            />
          </Field>
          <Field label="Status">
            <select
              className="admin-input"
              value={draft.status}
              onChange={(event) => update("status", event.target.value as PostStatus)}
            >
              <option value="draft">Entwurf</option>
              <option value="published">Veröffentlicht</option>
              <option value="archived">Archiviert</option>
            </select>
          </Field>
        </div>

        <Field label="Slug" helper={`URL: /blog/${draft.slug || "neuer-insight"}`}>
          <input
            className="admin-input"
            value={draft.slug}
            onChange={(event) => update("slug", slugify(event.target.value))}
            placeholder="erfolg-ohne-druck"
          />
        </Field>

        <Field label="Auszug" helper={`${draft.excerpt.length}/220 Zeichen empfohlen`}>
          <textarea
            className="admin-input min-h-28"
            value={draft.excerpt}
            onChange={(event) => update("excerpt", event.target.value)}
            placeholder="Kurzer Teaser für Blogübersicht und SEO."
          />
        </Field>

        <section className="rounded-[20px] border border-[#b49474]/20 bg-[#fcf3e3]/45 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[#03182e]">Inhalt</p>
              <p className="mt-1 text-xs text-[#6b5f50]">{wordCount} Wörter</p>
            </div>
            <div className="flex gap-2">
              <button
                className="inline-flex items-center gap-2 rounded-full border border-[#b49474]/30 px-3 py-2 text-xs text-[#4c4235] transition hover:bg-[#f2e2ce]"
                disabled={!lastUpload}
                onClick={() => insertUploadedMedia()}
                type="button"
              >
                <Link2 size={14} />
                Medium einfügen
              </button>
            </div>
          </div>
          <textarea
            className="admin-input min-h-[520px] resize-y bg-[#fffaf0]"
            value={draft.content}
            onChange={(event) => update("content", event.target.value)}
            placeholder="Absätze mit einer Leerzeile trennen. Bilder werden als ![Alt](URL), Videos als [video](URL) eingefügt."
          />
        </section>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
        {error ? <div className="rounded-xl bg-[#7f1d1d]/10 px-4 py-3 text-sm text-[#7f1d1d]">{error}</div> : null}
        <section className="rounded-[20px] border border-[#b49474]/20 bg-[#fcf3e3]/55 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[#03182e]">Medien</p>
              <p className="mt-1 text-xs text-[#6b5f50]">JPG, PNG, WebP, MP4, MOV, WebM</p>
            </div>
            {isUploading ? <Loader2 className="animate-spin text-[#b49474]" size={18} /> : <Upload size={18} />}
          </div>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#b49474]/40 bg-[#fffaf0] px-4 py-8 text-center transition hover:border-[#b49474] hover:bg-[#fcf3e3]">
            <input
              ref={fileInputRef}
              className="sr-only"
              type="file"
              accept="image/png,image/jpeg,image/webp,video/mp4,video/quicktime,video/webm"
              onChange={(event) => uploadSelectedFile(event.target.files?.[0] || null)}
            />
            <Upload className="mb-3 text-[#b49474]" size={24} />
            <span className="text-sm font-medium text-[#03182e]">Datei auswählen</span>
            <span className="mt-1 text-xs text-[#6b5f50]">Bilder bis 8 MB, Videos bis 80 MB</span>
          </label>
          {uploadMessage ? (
            <p className="mt-3 rounded-xl bg-[#0f5132]/10 px-3 py-2 text-xs leading-5 text-[#0f5132]">
              {uploadMessage}
            </p>
          ) : null}
          {lastUpload ? (
            <div className="mt-4 space-y-3">
              <MediaPreview asset={lastUpload} />
              <p className="break-all text-xs text-[#6b5f50]">{lastUpload.url}</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#b49474]/30 px-3 py-2 text-xs text-[#4c4235] transition hover:bg-[#f2e2ce]"
                  onClick={() => update("coverImage", lastUpload.url)}
                  type="button"
                >
                  {lastUpload.mimeType.startsWith("video/") ? <Video size={14} /> : <Image size={14} />}
                  Als Cover
                </button>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#03182e] px-3 py-2 text-xs text-[#f9f4e7] transition hover:bg-[#100f0f]"
                  onClick={() => insertUploadedMedia(lastUpload)}
                  type="button"
                >
                  <Link2 size={14} />
                  Einfügen
                </button>
              </div>
            </div>
          ) : null}
        </section>
        <Field label="Cover-Medium URL">
          <input
            className="admin-input"
            value={draft.coverImage}
            onChange={(event) => update("coverImage", event.target.value)}
          />
        </Field>
        <div className="overflow-hidden rounded-[20px] border border-[#b49474]/20 bg-[#fcf3e3]">
          {isCoverVideo ? (
            <video className="aspect-[16/10] w-full object-cover" controls muted src={draft.coverImage} />
          ) : (
            <img alt="" className="aspect-[16/10] w-full object-cover" src={draft.coverImage} />
          )}
        </div>
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
        <div className="flex flex-col gap-3">
          <button
            className="rounded-full bg-[#03182e] px-5 py-3 text-sm font-medium text-[#f9f4e7] transition hover:bg-[#100f0f] active:-translate-y-px disabled:opacity-50"
            disabled={isSaving}
            onClick={save}
            type="button"
          >
            {isSaving ? "Speichern..." : "Speichern"}
          </button>
          {post ? (
            <button
              className="rounded-full border border-[#b49474]/30 px-5 py-3 text-sm text-[#4c4235] transition hover:bg-[#f2e2ce] active:-translate-y-px"
              disabled={isSaving}
              onClick={remove}
              type="button"
            >
              Löschen
            </button>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#03182e]">{label}</span>
      {children}
      {helper ? <span className="mt-2 block text-xs leading-5 text-[#6b5f50]">{helper}</span> : null}
    </label>
  );
}

function isVideoUrl(url: string) {
  return /\.(mp4|mov|webm)(\?|#|$)/i.test(url);
}

function MediaPreview({asset}: {asset: {url: string; mimeType: string; alt: string}}) {
  if (asset.mimeType.startsWith("video/")) {
    return <video className="aspect-video w-full rounded-2xl object-cover" controls muted src={asset.url} />;
  }

  return <img alt={asset.alt} className="aspect-video w-full rounded-2xl object-cover" src={asset.url} />;
}
