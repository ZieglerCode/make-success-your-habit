"use client";

import {Copy, FloppyDisk, ImageSquare, MagnifyingGlass, SpinnerGap, Trash, VideoCamera, WarningCircle} from "@phosphor-icons/react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useMemo, useState} from "react";
import {MediaUploadField} from "@/components/media-upload-field";
import type {MediaAssetWithUsage} from "@/lib/editor-insights";
import {mediaImageProps} from "@/lib/responsive-media";

type Filter = "all" | "image" | "video" | "missing-alt" | "unused";

export function MediaManager({assets}: {assets: MediaAssetWithUsage[]}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [uploadAlt, setUploadAlt] = useState("");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return assets.filter((asset) => {
      const matchesQuery = !normalizedQuery || [asset.filename, asset.url, asset.alt, asset.mimeType]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
      const matchesFilter =
        filter === "all" ||
        (filter === "image" && asset.mimeType.startsWith("image/")) ||
        (filter === "video" && asset.mimeType.startsWith("video/")) ||
        (filter === "missing-alt" && !asset.alt.trim()) ||
        (filter === "unused" && asset.usedByCount === 0);
      return matchesQuery && matchesFilter;
    });
  }, [assets, filter, query]);

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url);
    setMessage("URL kopiert.");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <div className="h-fit rounded-[24px] border border-[#b49474]/20 bg-[#fcf3e3]/70 p-5">
        <p className="text-sm font-semibold text-[#03182e]">Neues Medium</p>
        <p className="mt-1 text-xs leading-5 text-[#6b5f50]">Alt-Text direkt beim Upload pflegen, damit die Datei später nutzbar bleibt.</p>
        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-semibold">Alt-Text / Beschreibung</span>
          <input className="admin-input" value={uploadAlt} onChange={(event) => setUploadAlt(event.target.value)} placeholder="Ruhiges Portrait im warmen Licht" />
        </label>
        <div className="mt-4"><MediaUploadField alt={uploadAlt} onUploaded={() => {setMessage("Upload abgeschlossen."); setError(null); setUploadAlt(""); router.refresh();}} /></div>
        {error ? <p className="mt-4 rounded-xl bg-[#7f1d1d]/10 px-4 py-3 text-sm text-[#7f1d1d]">{error}</p> : null}
        {message ? <p className="mt-4 rounded-xl bg-[#0f5132]/10 px-4 py-3 text-sm text-[#0f5132]">{message}</p> : null}
      </div>

      <section className="space-y-5">
        <div className="grid gap-3 rounded-[24px] border border-[#b49474]/20 bg-[#fcf3e3]/72 p-3 md:grid-cols-[1fr_auto]">
          <label className="relative block">
            <MagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8b6f4e]" />
            <input
              className="admin-input bg-[#fffaf0] pl-11"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Dateiname, URL, Alt-Text oder Typ suchen"
            />
          </label>
          <select className="admin-input bg-[#fffaf0] md:w-52" value={filter} onChange={(event) => setFilter(event.target.value as Filter)}>
            <option value="all">Alle Medien</option>
            <option value="image">Bilder</option>
            <option value="video">Videos</option>
            <option value="missing-alt">Ohne Alt-Text</option>
            <option value="unused">Ungenutzt</option>
          </select>
        </div>

        {filtered.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((asset) => (
              <AssetCard
                asset={asset}
                key={asset.id}
                onCopy={copyUrl}
                onMessage={setMessage}
                onRefresh={() => router.refresh()}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-[#b49474]/40 bg-[#fcf3e3]/45 p-10 text-center text-[#6b5f50]">
            Keine Medien für diese Suche.
          </div>
        )}
      </section>
    </div>
  );
}

function AssetCard({
  asset,
  onCopy,
  onMessage,
  onRefresh,
}: {
  asset: MediaAssetWithUsage;
  onCopy: (url: string) => void;
  onMessage: (message: string | null) => void;
  onRefresh: () => void;
}) {
  const [alt, setAlt] = useState(asset.alt);
  const [focalX, setFocalX] = useState(asset.focalX);
  const [focalY, setFocalY] = useState(asset.focalY);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dirty = alt !== asset.alt || focalX !== asset.focalX || focalY !== asset.focalY;

  async function saveAlt() {
    setIsSaving(true);
    onMessage(null);

    const response = await fetch(`/api/media/${asset.id}`, {
      body: JSON.stringify({alt, focalX, focalY}),
      headers: {"content-type": "application/json"},
      method: "PATCH",
    });

    setIsSaving(false);

    if (!response.ok) {
      onMessage("Alt-Text konnte nicht gespeichert werden.");
      return;
    }

    onMessage("Alt-Text gespeichert.");
    onRefresh();
  }

  async function remove() {
    const usageWarning = asset.usedByCount
      ? `Dieses Medium wird aktuell ${asset.usedByCount}x verwendet. Trotzdem löschen?`
      : "Dieses Medium löschen?";
    if (!window.confirm(`${usageWarning} Diese Aktion entfernt die Datei aus der Bibliothek.`)) return;

    setIsDeleting(true);
    onMessage(null);

    const response = await fetch(`/api/media/${asset.id}`, {method: "DELETE"});
    setIsDeleting(false);

    if (!response.ok) {
      onMessage("Medium konnte nicht gelöscht werden.");
      return;
    }

    onMessage("Medium gelöscht.");
    onRefresh();
  }

  return (
    <div className="rounded-[24px] border border-[#b49474]/20 bg-[#fcf3e3]/70 p-3">
      {asset.mimeType.startsWith("video/") ? (
        <video className="aspect-[4/3] w-full rounded-2xl object-cover" controls muted src={asset.url} />
      ) : (
        <button className="relative block w-full cursor-crosshair overflow-hidden rounded-2xl" type="button" title="Bildfokus festlegen" onClick={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          setFocalX((event.clientX - bounds.left) / bounds.width);
          setFocalY((event.clientY - bounds.top) / bounds.height);
        }}>
          <img alt={asset.alt} className="aspect-[4/3] w-full object-cover" {...mediaImageProps({...asset, focalX, focalY})} sizes="(min-width: 1280px) 30vw, (min-width: 768px) 50vw, 100vw" />
          <span className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#03182e] shadow" style={{left: `${focalX * 100}%`, top: `${focalY * 100}%`}} />
        </button>
      )}
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{asset.filename}</p>
          <p className="mt-1 text-xs text-[#6b5f50]">{formatBytes(asset.size)} · {asset.mimeType}</p>
        </div>
        {asset.mimeType.startsWith("video/") ? (
          <VideoCamera className="size-5 shrink-0 text-[#8b6f4e]" />
        ) : (
          <ImageSquare className="size-5 shrink-0 text-[#8b6f4e]" />
        )}
      </div>

      <label className="mt-3 block">
        <span className="mb-1.5 block text-xs font-semibold text-[#4c4235]">Alt-Text</span>
        <textarea
          className="admin-input min-h-20 bg-[#fffaf0] text-sm"
          value={alt}
          onChange={(event) => setAlt(event.target.value)}
          placeholder="Beschreibe sichtbar und konkret, was das Medium zeigt."
        />
      </label>
      {!asset.mimeType.startsWith("video/") ? <p className="mt-2 text-xs text-[#6b5f50]">Klicke ins Bild, um den Fokus für Zuschnitte festzulegen.</p> : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {!alt.trim() ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#7f1d1d]/10 px-2.5 py-1 text-xs font-semibold text-[#7f1d1d]">
            <WarningCircle className="size-3.5" />
            Alt-Text fehlt
          </span>
        ) : null}
        <span className="rounded-full bg-[#f2e2ce] px-2.5 py-1 text-xs font-semibold text-[#4c4235]">
          {asset.usedByCount ? `${asset.usedByCount}x genutzt` : "Ungenutzt"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[#b49474]/30 px-3 py-2 text-xs font-semibold text-[#4c4235] transition hover:bg-[#f2e2ce] active:-translate-y-px"
          onClick={() => onCopy(asset.url)}
          type="button"
        >
          <Copy className="size-4" />
          URL
        </button>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[#b49474]/30 px-3 py-2 text-xs font-semibold text-[#4c4235] transition hover:bg-[#f2e2ce] active:-translate-y-px disabled:opacity-50"
          disabled={!dirty || isSaving}
          onClick={saveAlt}
          type="button"
        >
          {isSaving ? <SpinnerGap className="size-4 animate-spin" /> : <FloppyDisk className="size-4" />}
          Speichern
        </button>
        <Link
          className="inline-flex items-center justify-center rounded-full bg-[#03182e] px-3 py-2 text-xs font-semibold text-[#f9f4e7] transition hover:bg-[#100f0f] active:-translate-y-px"
          href={`/admin/blog/new?cover=${encodeURIComponent(asset.url)}&coverAlt=${encodeURIComponent(alt)}`}
        >
          Als Cover
        </Link>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[#7f1d1d]/25 px-3 py-2 text-xs font-semibold text-[#7f1d1d] transition hover:bg-[#7f1d1d]/10 active:-translate-y-px disabled:opacity-50"
          disabled={isDeleting}
          onClick={remove}
          type="button"
        >
          {isDeleting ? <SpinnerGap className="size-4 animate-spin" /> : <Trash className="size-4" />}
          Löschen
        </button>
      </div>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}
