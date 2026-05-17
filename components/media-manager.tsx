"use client";

import {useRouter} from "next/navigation";
import {useState} from "react";
import type {MediaAsset} from "@/lib/content-store";

export function MediaManager({assets}: {assets: MediaAsset[]}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function upload(formData: FormData) {
    setError(null);
    setIsUploading(true);

    const response = await fetch("/api/media", {
      body: formData,
      method: "POST",
    });
    const data = await response.json().catch(() => null);

    setIsUploading(false);

    if (!response.ok) {
      setError(data?.error || "Das Bild konnte nicht hochgeladen werden.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <form action={upload} className="h-fit rounded-[28px] border border-[#b49474]/20 bg-[#fcf3e3]/70 p-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Bild- oder Videodatei</span>
          <input
            className="admin-input"
            name="file"
            type="file"
            accept="image/png,image/jpeg,image/webp,video/mp4,video/quicktime,video/webm"
          />
        </label>
        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-medium">Alt-Text / Beschreibung</span>
          <input className="admin-input" name="alt" placeholder="Ruhiges Portrait oder Videobeschreibung" />
        </label>
        {error ? <p className="mt-4 rounded-xl bg-[#7f1d1d]/10 px-4 py-3 text-sm text-[#7f1d1d]">{error}</p> : null}
        <button
          className="mt-5 w-full rounded-full bg-[#03182e] px-5 py-3 text-sm font-medium text-[#f9f4e7] transition hover:bg-[#100f0f] active:-translate-y-px disabled:opacity-50"
          disabled={isUploading}
          type="submit"
        >
          {isUploading ? "Upload..." : "Datei hochladen"}
        </button>
      </form>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {assets.length ? (
          assets.map((asset) => (
            <div className="rounded-[24px] border border-[#b49474]/20 bg-[#fcf3e3]/70 p-3" key={asset.id}>
              {asset.mimeType.startsWith("video/") ? (
                <video className="aspect-[4/3] w-full rounded-2xl object-cover" controls muted src={asset.url} />
              ) : (
                <img alt={asset.alt} className="aspect-[4/3] w-full rounded-2xl object-cover" src={asset.url} />
              )}
              <p className="mt-3 break-all text-sm font-medium">{asset.url}</p>
              <p className="mt-1 text-xs text-[#6b5f50]">{asset.alt || "Kein Alt-Text"}</p>
            </div>
          ))
        ) : (
          <div className="rounded-[28px] border border-dashed border-[#b49474]/40 p-10 text-[#6b5f50] md:col-span-2">
            Noch keine Medien hochgeladen.
          </div>
        )}
      </div>
    </div>
  );
}
