"use client";

import {SpinnerGap, Upload, X} from "@phosphor-icons/react";
import {useEffect, useRef, useState} from "react";
import type {MediaAsset} from "@/lib/content-store";
import {uploadMedia} from "@/lib/upload-client";

export function MediaUploadField({alt, onUploaded}: {alt: string; onUploaded: (asset: MediaAsset) => void}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function start(nextFile = file) {
    if (!nextFile) return;
    setFile(nextFile); setError(null); setProgress(0); setUploading(true);
    const controller = new AbortController();
    abortRef.current = controller;
    const formData = new FormData();
    formData.append("file", nextFile);
    formData.append("alt", alt || nextFile.name.replace(/\.[^.]+$/, ""));
    try {
      const asset = await uploadMedia(formData, {signal: controller.signal, onProgress: setProgress});
      setProgress(100); onUploaded(asset); setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (reason) {
      setError(reason instanceof DOMException && reason.name === "AbortError" ? "Upload abgebrochen." : reason instanceof Error ? reason.message : "Upload fehlgeschlagen.");
    } finally {
      setUploading(false); abortRef.current = null;
    }
  }

  return (
    <div className="space-y-3">
      <label
        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#b49474]/40 bg-[#fffaf0] px-4 py-6 text-center transition hover:border-[#8b6f4e] hover:bg-[#fcf3e3]"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => { event.preventDefault(); void start(event.dataTransfer.files?.[0] || null); }}
      >
        <input ref={inputRef} className="sr-only" type="file" accept="image/png,image/jpeg,image/webp,video/mp4,video/quicktime,video/webm" onChange={(event) => void start(event.target.files?.[0] || null)} />
        {uploading ? <SpinnerGap className="mb-3 size-6 animate-spin text-[#8b6f4e]" /> : <Upload className="mb-3 size-6 text-[#8b6f4e]" />}
        <span className="text-sm font-semibold text-[#03182e]">Datei auswählen oder hier ablegen</span>
        <span className="mt-1 text-xs text-[#6b5f50]">Bilder bis 8 MB, Videos bis 80 MB</span>
      </label>
      {preview ? <img alt="Lokale Vorschau" className="aspect-video w-full rounded-xl object-cover" src={preview} /> : null}
      {uploading ? (
        <div className="space-y-2" aria-live="polite">
          <div className="h-2 overflow-hidden rounded-full bg-[#ead8c2]"><div className="h-full bg-[#0f5132] transition-[width]" style={{width: `${progress}%`}} /></div>
          <div className="flex items-center justify-between text-xs text-[#6b5f50]"><span>{progress}% hochgeladen</span><button type="button" onClick={() => abortRef.current?.abort()} className="inline-flex items-center gap-1 font-semibold text-[#7f1d1d]"><X className="size-3" /> Abbrechen</button></div>
        </div>
      ) : null}
      {error ? <div className="flex items-center justify-between gap-3 rounded-xl bg-[#7f1d1d]/10 px-3 py-2 text-xs text-[#7f1d1d]"><span>{error}</span>{file ? <button className="font-semibold underline" type="button" onClick={() => void start()}>Erneut versuchen</button> : null}</div> : null}
    </div>
  );
}
