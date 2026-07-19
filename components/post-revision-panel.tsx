"use client";

import {ClockCounterClockwise, SpinnerGap} from "@phosphor-icons/react";
import {useState} from "react";
import type {BlogPost} from "@/lib/content-store";
import {changedRevisionFields, type PostRevision} from "@/lib/post-revisions";

type Summary = Omit<PostRevision, "snapshot"> & {changedFrom?: string};

export function PostRevisionPanel({postId, current, onRestored}: {postId:string; current:Partial<BlogPost>; onRestored:(post:BlogPost)=>void}) {
  const [items, setItems] = useState<Summary[] | null>(null);
  const [detail, setDetail] = useState<PostRevision | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setBusy(true); setError(null);
    const response = await fetch(`/api/posts/${postId}/revisions`);
    const data = await response.json().catch(() => null);
    setBusy(false);
    if (!response.ok) return setError(data?.error || "Versionen konnten nicht geladen werden.");
    setItems(data.revisions);
  }

  async function open(id: string) {
    setBusy(true);
    const response = await fetch(`/api/posts/${postId}/revisions/${id}`);
    const data = await response.json().catch(() => null);
    setBusy(false);
    if (response.ok) setDetail(data); else setError(data?.error || "Version konnte nicht geladen werden.");
  }

  async function restore() {
    if (!detail || !window.confirm("Diese Version wiederherstellen? Der aktuelle Stand bleibt in der Historie erhalten.")) return;
    setBusy(true);
    const response = await fetch(`/api/posts/${postId}/revisions/${detail.id}/restore`, {method:"POST"});
    const data = await response.json().catch(() => null);
    setBusy(false);
    if (!response.ok) return setError(data?.error || "Wiederherstellung fehlgeschlagen.");
    setDetail(null); setItems(null); onRestored(data);
  }

  return <section className="rounded-[22px] border border-[#b49474]/20 bg-[#fcf3e3]/62 p-4">
    <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-[#03182e]">Versionshistorie</p><p className="mt-1 text-xs text-[#6b5f50]">Bis zu 50 frühere Stände</p></div><ClockCounterClockwise className="size-5 text-[#8b6f4e]" /></div>
    {items === null ? <button className="mt-4 w-full rounded-full border border-[#b49474]/30 px-4 py-2 text-sm font-semibold" type="button" disabled={busy} onClick={load}>{busy ? <SpinnerGap className="mx-auto size-4 animate-spin" /> : "Versionen laden"}</button> : items.length ? <div className="mt-4 space-y-2">{items.map((item) => <button key={item.id} type="button" onClick={() => open(item.id)} className="w-full rounded-xl border border-[#b49474]/20 bg-[#fffaf0] p-3 text-left"><span className="block text-sm font-semibold">{item.title}</span><span className="mt-1 block text-xs text-[#6b5f50]">{new Date(item.createdAt).toLocaleString("de-DE")} · {item.status} · {item.actor}</span></button>)}</div> : <p className="mt-4 text-sm text-[#6b5f50]">Noch keine frühere Version.</p>}
    {detail ? <div className="mt-4 rounded-xl bg-[#fffaf0] p-3"><p className="text-sm font-semibold">Vorschau: {detail.snapshot.title}</p><p className="mt-2 text-xs text-[#6b5f50]">Geändert: {changedRevisionFields(current, detail.snapshot).join(", ") || "keine redaktionellen Felder"}</p><p className="mt-3 line-clamp-5 whitespace-pre-wrap text-xs leading-5">{detail.snapshot.content}</p><div className="mt-3 flex gap-2"><button className="rounded-full bg-[#03182e] px-3 py-2 text-xs font-semibold text-white" type="button" onClick={restore} disabled={busy}>Wiederherstellen</button><button className="rounded-full border px-3 py-2 text-xs font-semibold" type="button" onClick={() => setDetail(null)}>Schließen</button></div></div> : null}
    {error ? <p className="mt-3 rounded-xl bg-[#7f1d1d]/10 px-3 py-2 text-xs text-[#7f1d1d]">{error}</p> : null}
  </section>;
}
