"use client";

import {
  ArrowCounterClockwise,
  Check,
  CopySimple,
  Crosshair,
  Minus,
  Plus,
  X,
} from "@phosphor-icons/react";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {createPortal} from "react-dom";
import {CroppedCoverImage} from "@/components/cropped-cover-image";
import {
  COVER_FORMATS,
  COVER_PRESETS,
  copyCoverCrops,
  DEFAULT_COVER_CROP,
  normalizeCoverCrops,
  type CoverCrop,
  type CoverCrops,
  type CoverPreset,
} from "@/lib/cover-crop";

type DragState = {
  pointerId: number;
  startCrop: CoverCrop;
  startX: number;
  startY: number;
};

export function CoverCropEditor({
  alt,
  crops,
  imageUrl,
  onApply,
  onCancel,
}: {
  alt: string;
  crops: CoverCrops;
  imageUrl: string;
  onApply: (crops: CoverCrops) => void;
  onCancel: () => void;
}) {
  const [activePreset, setActivePreset] = useState<CoverPreset>("article");
  const [draftCrops, setDraftCrops] = useState(() => copyCoverCrops(normalizeCoverCrops(crops)));
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const activeCrop = draftCrops[activePreset];

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [onCancel]);

  function updateActive(next: Partial<CoverCrop>) {
    setDraftCrops((current) => ({
      ...current,
      [activePreset]: normalizeCoverCrops({
        ...current,
        [activePreset]: {...current[activePreset], ...next},
      })[activePreset],
    }));
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startCrop: {...activeCrop},
      startX: event.clientX,
      startY: event.clientY,
    };
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const sensitivity = Math.max(0.45, drag.startCrop.zoom * 0.75);
    updateActive({
      x: drag.startCrop.x - (event.clientX - drag.startX) / (bounds.width * sensitivity),
      y: drag.startCrop.y - (event.clientY - drag.startY) / (bounds.height * sensitivity),
    });
  }

  function handlePointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleFrameKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 0.08 : 0.02;
    if (event.key === "ArrowLeft") updateActive({x: activeCrop.x - step});
    else if (event.key === "ArrowRight") updateActive({x: activeCrop.x + step});
    else if (event.key === "ArrowUp") updateActive({y: activeCrop.y - step});
    else if (event.key === "ArrowDown") updateActive({y: activeCrop.y + step});
    else if (event.key === "+" || event.key === "=") updateActive({zoom: activeCrop.zoom + 0.1});
    else if (event.key === "-") updateActive({zoom: activeCrop.zoom - 0.1});
    else return;
    event.preventDefault();
  }

  const editor = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#03182e]/70 p-3 backdrop-blur-sm md:p-8">
      <div
        aria-labelledby="cover-crop-title"
        aria-modal="true"
        className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-white/15 bg-[#f9f4e7] shadow-[0_32px_100px_rgba(3,24,46,0.38)]"
        ref={dialogRef}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-5 border-b border-[#b49474]/20 px-5 py-4 md:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b6f4e]">Cover gestalten</p>
            <h2 className="mt-1 text-2xl font-semibold text-[#03182e]" id="cover-crop-title">
              Bildausschnitt festlegen
            </h2>
            <p className="mt-1 text-sm text-[#6b5f50]">Bild verschieben, zoomen und jedes Ausgabeformat prüfen.</p>
          </div>
          <button
            aria-label="Bildeditor schließen"
            className="grid size-11 shrink-0 place-items-center rounded-full border border-[#b49474]/25 bg-[#fffaf0] text-[#03182e] transition hover:bg-[#f2e2ce]"
            onClick={onCancel}
            ref={closeRef}
            type="button"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_320px] lg:overflow-hidden">
          <div className="flex min-h-[420px] items-center justify-center bg-[#100f0f] p-4 md:p-8 lg:min-h-0">
            <div className="w-full max-w-4xl">
              <div
                aria-label={`${COVER_FORMATS[activePreset].label}-Ausschnitt. Mit Pfeiltasten verschieben, mit Plus und Minus zoomen.`}
                className={`group relative mx-auto w-full cursor-grab touch-none overflow-hidden rounded-[20px] border-2 border-[#d4af37] bg-black outline-none ring-offset-4 ring-offset-[#100f0f] focus:ring-2 focus:ring-[#f9f4e7] active:cursor-grabbing ${
                  activePreset === "article"
                    ? "aspect-[16/9]"
                    : activePreset === "card"
                      ? "aspect-[16/10]"
                      : activePreset === "featured"
                        ? "aspect-[4/3] max-w-2xl"
                        : "aspect-[1.91/1]"
                }`}
                onKeyDown={handleFrameKeyDown}
                onPointerCancel={handlePointerEnd}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerEnd}
                tabIndex={0}
              >
                <CroppedCoverImage
                  alt={alt}
                  className="absolute inset-0 h-full w-full"
                  crops={draftCrops}
                  preset={activePreset}
                  src={imageUrl}
                />
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                  {Array.from({length: 9}).map((_, index) => (
                    <span className="border border-white/25" key={index} />
                  ))}
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
                  <span className="rounded-full bg-[#03182e]/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                    Ziehen zum Verschieben
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-white/65">
                <span>{COVER_FORMATS[activePreset].description}</span>
                <span>Der goldene Rahmen entspricht der finalen Anzeige.</span>
              </div>
            </div>
          </div>

          <aside className="space-y-6 border-t border-[#b49474]/20 bg-[#fcf3e3] p-5 lg:overflow-y-auto lg:border-l lg:border-t-0 lg:p-6">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#8b6f4e]">Ausgabeformat</p>
              <div className="grid grid-cols-2 gap-2">
                {COVER_PRESETS.map((preset) => (
                  <button
                    aria-pressed={activePreset === preset}
                    className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                      activePreset === preset
                        ? "bg-[#03182e] text-[#f9f4e7]"
                        : "border border-[#b49474]/25 bg-[#fffaf0] text-[#4c4235] hover:bg-[#f2e2ce]"
                    }`}
                    key={preset}
                    onClick={() => setActivePreset(preset)}
                    type="button"
                  >
                    {COVER_FORMATS[preset].label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b6f4e]" htmlFor="cover-zoom">
                  Zoom
                </label>
                <span className="text-sm font-semibold text-[#03182e]">{Math.round(activeCrop.zoom * 100)}%</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  aria-label="Verkleinern"
                  className="grid size-10 shrink-0 place-items-center rounded-full border border-[#b49474]/25 bg-[#fffaf0] text-[#03182e]"
                  onClick={() => updateActive({zoom: activeCrop.zoom - 0.1})}
                  type="button"
                >
                  <Minus className="size-4" />
                </button>
                <input
                  aria-valuetext={`${Math.round(activeCrop.zoom * 100)} Prozent`}
                  className="w-full accent-[#03182e]"
                  id="cover-zoom"
                  max="3"
                  min="1"
                  onChange={(event) => updateActive({zoom: Number(event.target.value)})}
                  step="0.01"
                  type="range"
                  value={activeCrop.zoom}
                />
                <button
                  aria-label="Vergrößern"
                  className="grid size-10 shrink-0 place-items-center rounded-full border border-[#b49474]/25 bg-[#fffaf0] text-[#03182e]"
                  onClick={() => updateActive({zoom: activeCrop.zoom + 0.1})}
                  type="button"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-2">
              <button
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#b49474]/30 bg-[#fffaf0] px-4 py-2.5 text-sm font-semibold text-[#4c4235] transition hover:bg-[#f2e2ce]"
                onClick={() => updateActive({x: 0.5, y: 0.5})}
                type="button"
              >
                <Crosshair className="size-4" /> Zentrieren
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#b49474]/30 bg-[#fffaf0] px-4 py-2.5 text-sm font-semibold text-[#4c4235] transition hover:bg-[#f2e2ce]"
                onClick={() =>
                  setDraftCrops((current) => ({
                    ...current,
                    [activePreset]: {...DEFAULT_COVER_CROP},
                  }))
                }
                type="button"
              >
                <ArrowCounterClockwise className="size-4" /> Format zurücksetzen
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#b49474]/30 bg-[#fffaf0] px-4 py-2.5 text-sm font-semibold text-[#4c4235] transition hover:bg-[#f2e2ce]"
                onClick={() =>
                  setDraftCrops(
                    Object.fromEntries(
                      COVER_PRESETS.map((preset) => [preset, {...activeCrop}]),
                    ) as CoverCrops,
                  )
                }
                type="button"
              >
                <CopySimple className="size-4" /> Auf alle Formate anwenden
              </button>
            </div>

            <p className="rounded-2xl bg-[#f2e2ce] px-4 py-3 text-xs leading-5 text-[#4c4235]">
              Tipp: Mit den Pfeiltasten fein verschieben. Umschalt + Pfeiltaste bewegt schneller.
            </p>
          </aside>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#b49474]/20 bg-[#fffaf0] px-5 py-4 sm:flex-row sm:justify-end md:px-7">
          <button
            className="rounded-full border border-[#b49474]/30 px-5 py-3 text-sm font-semibold text-[#4c4235] transition hover:bg-[#f2e2ce]"
            onClick={onCancel}
            type="button"
          >
            Abbrechen
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#03182e] px-6 py-3 text-sm font-semibold text-[#f9f4e7] transition hover:bg-[#100f0f]"
            onClick={() => onApply(copyCoverCrops(draftCrops))}
            type="button"
          >
            <Check className="size-4" /> Ausschnitte übernehmen
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(editor, document.body);
}
