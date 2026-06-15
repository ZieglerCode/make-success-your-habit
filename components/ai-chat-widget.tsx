"use client";

import {
  ArrowRight,
  ChatCircleDots,
  Microphone,
  PaperPlaneTilt,
  Sparkle,
  Stop,
  Trash,
  X,
} from "@phosphor-icons/react";
import {FormEvent, KeyboardEvent, ReactNode, useEffect, useRef, useState} from "react";

type SiteLang = "de" | "en";

type Message = {
  role: "user" | "assistant";
  content: string;
  audioUrl?: string;
};

type VoiceMessage = {
  data: string;
  mimeType: string;
  url: string;
  duration: number;
};

const copy = {
  de: {
    title: "Heikes AI-Assistent",
    welcome:
      "Hallo, ich bin Heikes digitaler Assistent. Ich helfe dir gern dabei, das passende Angebot oder deinen nächsten Schritt zu finden.",
    placeholder: "Was möchtest du wissen?",
    open: "AI-Assistenten öffnen",
    close: "AI-Assistenten schließen",
    send: "Nachricht senden",
    thinking: "Ich denke nach ...",
    recording: "Aufnahme läuft",
    record: "Sprachnachricht aufnehmen",
    stopRecording: "Aufnahme stoppen",
    deleteRecording: "Aufnahme löschen",
    sendRecording: "Sprachnachricht senden",
    voiceMessage: "Sprachnachricht",
    microphoneError: "Das Mikrofon konnte nicht verwendet werden. Bitte prüfe die Browserfreigabe.",
    recordingTooLarge: "Die Aufnahme ist zu groß. Bitte nimm eine kürzere Nachricht auf.",
    disclaimer: "AI kann Fehler machen. Persönliche Fragen klärst du am besten im Clarity Call.",
    fallback: "Die Antwort konnte nicht erstellt werden. Bitte versuche es erneut.",
    teaserEyebrow: "Persönliche Orientierung",
    teaserTitle: "Unsicher, welcher nächste Schritt zu dir passt?",
    teaserAction: "Assistenten fragen",
    online: "Bereit für deine Frage",
    suggestions: [
      "Welches Angebot passt zu mir?",
      "Wie funktioniert die Zusammenarbeit?",
      "Was ist die Instant Success Formula?",
    ],
  },
  en: {
    title: "Heike's AI assistant",
    welcome:
      "Hello, I'm Heike's digital assistant. I can help you find the right offer or a useful next step.",
    placeholder: "What would you like to know?",
    open: "Open AI assistant",
    close: "Close AI assistant",
    send: "Send message",
    thinking: "Thinking ...",
    recording: "Recording",
    record: "Record voice message",
    stopRecording: "Stop recording",
    deleteRecording: "Delete recording",
    sendRecording: "Send voice message",
    voiceMessage: "Voice message",
    microphoneError: "The microphone could not be used. Please check your browser permission.",
    recordingTooLarge: "The recording is too large. Please record a shorter message.",
    disclaimer: "AI can make mistakes. A Clarity Call is best for personal questions.",
    fallback: "The response could not be generated. Please try again.",
    teaserEyebrow: "Personal guidance",
    teaserTitle: "Not sure which next step fits your situation?",
    teaserAction: "Ask the assistant",
    online: "Ready for your question",
    suggestions: [
      "Which offer is right for me?",
      "How does working together work?",
      "What is the Instant Success Formula?",
    ],
  },
};

const INLINE_PATTERN = /(\*\*[^*]+\*\*|\[[^\]]+\]\((?:https?:\/\/|\/)[^)]+\)|https?:\/\/[^\s<]+|\/[a-z0-9][a-z0-9-/]*)/gi;

function InlineContent({content}: {content: string}) {
  const segments = content.split(INLINE_PATTERN);

  return (
    <>
      {segments.map((segment, index) =>
        renderInlineSegment(segment, index),
      )}
    </>
  );
}

function renderInlineSegment(segment: string, index: number): ReactNode {
  const boldMatch = segment.match(/^\*\*(.+)\*\*$/s);
  if (boldMatch) return <strong className="font-semibold text-current" key={index}>{boldMatch[1]}</strong>;

  const markdownLink = segment.match(/^\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)]+)\)$/i);
  if (markdownLink) {
    return (
      <a
        className="font-semibold underline decoration-brand-accent/70 underline-offset-2 transition hover:decoration-brand-accent"
        href={markdownLink[2]}
        key={index}
        rel={markdownLink[2].startsWith("http") ? "noopener noreferrer" : undefined}
        target={markdownLink[2].startsWith("http") ? "_blank" : undefined}
      >
        {markdownLink[1]}
      </a>
    );
  }

  if (/^(?:https?:\/\/|\/[a-z0-9])/i.test(segment)) {
    const punctuation = segment.match(/[.,!?;:]$/)?.[0] ?? "";
    const href = punctuation ? segment.slice(0, -1) : segment;
    return (
      <span key={index}>
        <a
          className="font-semibold underline decoration-brand-accent/70 underline-offset-2 transition hover:decoration-brand-accent"
          href={href}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          target={href.startsWith("http") ? "_blank" : undefined}
        >
          {href}
        </a>
        {punctuation}
      </span>
    );
  }

  return segment;
}

function MessageContent({content}: {content: string}) {
  const lines = content.trim().split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let listItems: Array<{text: string; ordered: boolean}> = [];
  let paragraph: string[] = [];

  function flushParagraph() {
    if (!paragraph.length) return;
    const text = paragraph.join(" ").trim();
    if (text) {
      blocks.push(
        <p className="leading-6" key={`paragraph-${blocks.length}`}>
          <InlineContent content={text} />
        </p>,
      );
    }
    paragraph = [];
  }

  function flushList() {
    if (!listItems.length) return;
    const ordered = listItems[0].ordered;
    const List = ordered ? "ol" : "ul";
    blocks.push(
      <List
        className={`space-y-1.5 pl-5 leading-6 ${ordered ? "list-decimal" : "list-disc marker:text-brand-accent"}`}
        key={`list-${blocks.length}`}
      >
        {listItems.map((item, index) => (
          <li key={`${item.text}-${index}`}><InlineContent content={item.text} /></li>
        ))}
      </List>,
    );
    listItems = [];
  }

  lines.forEach((line) => {
    const trimmed = line.trim();
    const listMatch = trimmed.match(/^([-*•]|\d+[.)])\s+(.+)$/);
    const headingMatch = trimmed.match(/^#{1,3}\s+(.+)$/);

    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    if (listMatch) {
      flushParagraph();
      const ordered = /^\d/.test(listMatch[1]);
      if (listItems.length && listItems[0].ordered !== ordered) flushList();
      listItems.push({text: listMatch[2], ordered});
      return;
    }

    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push(
        <p className="font-display text-[13px] font-semibold leading-5 text-current" key={`heading-${blocks.length}`}>
          <InlineContent content={headingMatch[1]} />
        </p>,
      );
      return;
    }

    flushList();
    paragraph.push(trimmed);
  });

  flushParagraph();
  flushList();

  return <div className="space-y-3">{blocks}</div>;
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.readAsDataURL(blob);
  });
}

export function AiChatWidget({locale}: {locale: SiteLang}) {
  const labels = copy[locale];
  const [open, setOpen] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [voiceMessage, setVoiceMessage] = useState<VoiceMessage | null>(null);
  const [voiceError, setVoiceError] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {role: "assistant", content: labels.welcome},
  ]);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartedAtRef = useRef(0);
  const audioUrlsRef = useRef(new Set<string>());

  useEffect(() => {
    setMessages([{role: "assistant", content: labels.welcome}]);
    setInput("");
    setVoiceError("");
  }, [labels.welcome]);

  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - recordingStartedAtRef.current) / 1000);
      setRecordingSeconds(elapsed);
      if (elapsed >= 60) mediaRecorderRef.current?.stop();
    }, 250);
    return () => window.clearInterval(timer);
  }, [recording]);

  useEffect(() => {
    return () => {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      audioUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    if (window.sessionStorage.getItem("msyh-ai-teaser-dismissed")) return;

    const teaserTimer = window.setTimeout(() => setShowTeaser(true), 4200);
    return () => window.clearTimeout(teaserTimer);
  }, []);

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 180);
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({behavior: "smooth"});
  }, [messages, loading]);

  useEffect(() => {
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  function dismissTeaser() {
    setShowTeaser(false);
    window.sessionStorage.setItem("msyh-ai-teaser-dismissed", "true");
  }

  function openAssistant() {
    dismissTeaser();
    setOpen(true);
  }

  async function sendMessage(prompt?: string, voice?: VoiceMessage) {
    const content = (prompt ?? input).trim();
    if ((!content && !voice) || loading) return;

    setOpen(true);
    setShowTeaser(false);
    const userMessage: Message = {
      role: "user",
      content: voice ? labels.voiceMessage : content,
      audioUrl: voice?.url,
    };
    const nextMessages = [...messages, userMessage].slice(-12);
    setMessages(nextMessages);
    setInput("");
    setVoiceMessage(null);
    setVoiceError("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          locale,
          messages: nextMessages.map(({role, content: messageContent}) => ({role, content: messageContent})),
          audio: voice ? {data: voice.data, mimeType: voice.mimeType} : undefined,
        }),
      });
      const data = (await response.json()) as {message?: string; error?: string};

      setMessages((current) => [
        ...current,
        {role: "assistant", content: response.ok && data.message ? data.message : data.error || labels.fallback},
      ]);
    } catch {
      setMessages((current) => [...current, {role: "assistant", content: labels.fallback}]);
    } finally {
      setLoading(false);
    }
  }

  async function startRecording() {
    if (loading || recording || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setVoiceError(labels.microphoneError);
      return;
    }

    try {
      setVoiceError("");
      if (voiceMessage) {
        URL.revokeObjectURL(voiceMessage.url);
        audioUrlsRef.current.delete(voiceMessage.url);
        setVoiceMessage(null);
      }
      const stream = await navigator.mediaDevices.getUserMedia({audio: true});
      const preferredMimeType = [
        "audio/webm;codecs=opus",
        "audio/mp4",
        "audio/webm",
        "audio/ogg;codecs=opus",
      ].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, preferredMimeType ? {mimeType: preferredMimeType} : undefined);

      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recordingStartedAtRef.current = Date.now();
      setRecordingSeconds(0);

      recorder.ondataavailable = (event) => {
        if (event.data.size) audioChunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        const duration = Math.max(1, Math.min(60, Math.round((Date.now() - recordingStartedAtRef.current) / 1000)));
        const mimeType = recorder.mimeType || audioChunksRef.current[0]?.type || "audio/webm";
        const blob = new Blob(audioChunksRef.current, {type: mimeType});
        stream.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        mediaRecorderRef.current = null;
        setRecording(false);

        if (blob.size > 8 * 1024 * 1024) {
          setVoiceError(labels.recordingTooLarge);
          return;
        }

        const data = await blobToBase64(blob);
        const url = URL.createObjectURL(blob);
        audioUrlsRef.current.add(url);
        setVoiceMessage({data, mimeType: mimeType.split(";")[0], url, duration});
      };

      recorder.start(500);
      setRecording(true);
    } catch {
      setVoiceError(labels.microphoneError);
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
  }

  function deleteRecording() {
    if (voiceMessage) {
      URL.revokeObjectURL(voiceMessage.url);
      audioUrlsRef.current.delete(voiceMessage.url);
    }
    setVoiceMessage(null);
    setVoiceError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[70] sm:bottom-7 sm:right-7">
      <aside
        aria-hidden={!showTeaser || open}
        className={`absolute bottom-[calc(100%+16px)] right-0 w-[min(340px,calc(100vw-40px))] overflow-hidden rounded-2xl border border-brand-primary/10 bg-brand-secondary shadow-[0_24px_70px_rgba(3,24,46,0.18)] transition duration-500 ${
          showTeaser && !open
            ? "visible translate-y-0 scale-100 opacity-100"
            : "invisible translate-y-3 scale-95 opacity-0"
        }`}
      >
        <div className="h-1 bg-brand-accent" />
        <div className="relative p-5 pr-12">
          <button
            aria-label={labels.close}
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-brand-muted transition hover:bg-brand-primary/5 hover:text-brand-primary"
            onClick={dismissTeaser}
            type="button"
          >
            <X aria-hidden size={16} />
          </button>
          <p className="font-display text-[9px] font-semibold uppercase tracking-[0.22em] text-brand-accent">
            {labels.teaserEyebrow}
          </p>
          <p className="mt-2 font-serif text-xl leading-snug text-brand-primary">{labels.teaserTitle}</p>
          <button
            className="group mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary"
            onClick={openAssistant}
            type="button"
          >
            {labels.teaserAction}
            <ArrowRight
              aria-hidden
              className="text-brand-accent transition-transform group-hover:translate-x-1"
              size={16}
            />
          </button>
        </div>
      </aside>

      <section
        aria-hidden={!open}
        aria-label={labels.title}
        className={`absolute bottom-[calc(100%+14px)] right-0 flex h-[min(660px,calc(100dvh-112px))] w-[min(410px,calc(100vw-32px))] origin-bottom-right flex-col overflow-hidden rounded-[24px] border border-white/10 bg-brand-ivory shadow-[0_30px_90px_rgba(3,24,46,0.32)] transition duration-300 ${
          open ? "visible translate-y-0 scale-100 opacity-100" : "invisible translate-y-3 scale-95 opacity-0"
        }`}
      >
        <header className="relative overflow-hidden bg-brand-primary px-5 pb-5 pt-4 text-brand-secondary">
          <div className="absolute inset-x-0 top-0 h-1 bg-brand-accent" />
          <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full border border-brand-accent/15" />
          <div className="pointer-events-none absolute -right-4 -top-8 h-24 w-24 rounded-full border border-brand-accent/10" />
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full border border-brand-accent/40 bg-brand-secondary text-brand-primary shadow-[0_8px_28px_rgba(0,0,0,0.18)]">
                <Sparkle aria-hidden size={21} weight="fill" />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-brand-primary bg-[#70a77b]" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate font-display text-[15px] font-semibold">{labels.title}</h2>
                <p className="mt-1 text-[11px] text-brand-secondary/60">{labels.online}</p>
              </div>
            </div>
            <button
              aria-label={labels.close}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-brand-secondary/75 transition hover:bg-white/10 hover:text-white"
              onClick={() => setOpen(false)}
              type="button"
            >
              <X aria-hidden size={20} />
            </button>
          </div>
        </header>

        <div
          aria-live="polite"
          className="flex-1 space-y-3 overflow-y-auto bg-[linear-gradient(180deg,#fcf3e3_0%,#f9f4e7_100%)] px-4 py-5"
          role="log"
        >
          {messages.map((message, index) => (
            <div
              className={`max-w-[88%] px-4 py-3 text-sm leading-6 shadow-[0_6px_24px_rgba(3,24,46,0.05)] ${
                message.role === "user"
                  ? "ml-auto rounded-2xl rounded-br-[4px] bg-brand-primary text-brand-secondary"
                  : "rounded-2xl rounded-bl-[4px] border border-brand-primary/8 bg-white text-brand-espresso"
              }`}
              key={`${message.role}-${index}`}
            >
              {message.audioUrl ? (
                <div className="min-w-[210px]">
                  <p className="mb-2 text-xs font-semibold">{labels.voiceMessage}</p>
                  <audio className="h-9 w-full max-w-[250px]" controls preload="metadata" src={message.audioUrl}>
                    {labels.voiceMessage}
                  </audio>
                </div>
              ) : (
                <MessageContent content={message.content} />
              )}
            </div>
          ))}
          {messages.length === 1 ? (
            <div className="grid gap-2 pt-1">
              {labels.suggestions.map((suggestion) => (
                <button
                  className="group flex min-h-11 items-center justify-between gap-3 rounded-xl border border-brand-primary/10 bg-white/65 px-4 py-2.5 text-left text-xs font-medium leading-5 text-brand-primary transition hover:border-brand-accent/60 hover:bg-white"
                  key={suggestion}
                  onClick={() => void sendMessage(suggestion)}
                  type="button"
                >
                  <span>{suggestion}</span>
                  <ArrowRight
                    aria-hidden
                    className="shrink-0 text-brand-accent transition-transform group-hover:translate-x-0.5"
                    size={14}
                  />
                </button>
              ))}
            </div>
          ) : null}
          {loading ? (
            <div className="flex max-w-[88%] items-center gap-2 rounded-2xl rounded-bl-[4px] border border-brand-primary/8 bg-white px-4 py-3 text-sm text-brand-muted">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand-accent" />
              {labels.thinking}
            </div>
          ) : null}
          <div ref={endRef} />
        </div>

        <form className="border-t border-brand-primary/8 bg-white p-3" onSubmit={handleSubmit}>
          {recording ? (
            <div className="mb-2 flex items-center justify-between gap-3 rounded-xl border border-[#c56d5c]/20 bg-[#fff7f5] px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="relative flex h-3 w-3 shrink-0">
                  <span className="absolute h-full w-full animate-ping rounded-full bg-[#c56d5c]/45" />
                  <span className="relative h-3 w-3 rounded-full bg-[#c56d5c]" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-brand-primary">{labels.recording}</p>
                  <p className="mt-0.5 font-display text-[10px] text-brand-muted">{formatDuration(recordingSeconds)} / 1:00</p>
                </div>
              </div>
              <button
                aria-label={labels.stopRecording}
                className="grid h-9 w-9 place-items-center rounded-lg bg-brand-primary text-brand-secondary transition hover:bg-brand-shadow"
                onClick={stopRecording}
                type="button"
              >
                <Stop aria-hidden size={15} weight="fill" />
              </button>
            </div>
          ) : null}

          {voiceMessage ? (
            <div className="mb-2 flex items-center gap-2 rounded-xl border border-brand-primary/10 bg-brand-secondary/55 p-2">
              <audio className="h-9 min-w-0 flex-1" controls preload="metadata" src={voiceMessage.url}>
                {labels.voiceMessage}
              </audio>
              <span className="shrink-0 font-display text-[10px] text-brand-muted">{formatDuration(voiceMessage.duration)}</span>
              <button
                aria-label={labels.deleteRecording}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-brand-muted transition hover:bg-white hover:text-[#a04f43]"
                onClick={deleteRecording}
                type="button"
              >
                <Trash aria-hidden size={17} />
              </button>
              <button
                aria-label={labels.sendRecording}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-primary text-brand-secondary transition hover:bg-brand-shadow"
                disabled={loading}
                onClick={() => void sendMessage("", voiceMessage)}
                type="button"
              >
                <PaperPlaneTilt aria-hidden size={16} weight="fill" />
              </button>
            </div>
          ) : null}

          <div className="flex items-end gap-2 rounded-xl border border-brand-primary/14 bg-brand-secondary/40 px-3 py-2 focus-within:border-brand-accent focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-accent/10">
            <textarea
              aria-label={labels.placeholder}
              className="max-h-28 min-h-11 flex-1 resize-none bg-transparent px-1 py-2 text-sm leading-5 text-brand-primary outline-none placeholder:text-brand-muted/65"
              disabled={loading}
              maxLength={2000}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={labels.placeholder}
              ref={inputRef}
              rows={1}
              suppressHydrationWarning
              value={input}
            />
            <button
              aria-label={recording ? labels.stopRecording : labels.record}
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg transition ${
                recording
                  ? "bg-[#c56d5c] text-white"
                  : "text-brand-muted hover:bg-white hover:text-brand-primary"
              }`}
              disabled={loading || Boolean(voiceMessage)}
              onClick={recording ? stopRecording : () => void startRecording()}
              type="button"
            >
              {recording ? <Stop aria-hidden size={17} weight="fill" /> : <Microphone aria-hidden size={19} />}
            </button>
            <button
              aria-label={labels.send}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-primary text-brand-secondary transition hover:bg-brand-shadow disabled:cursor-not-allowed disabled:opacity-35"
              disabled={!input.trim() || loading}
              type="submit"
            >
              <PaperPlaneTilt aria-hidden size={18} weight="fill" />
            </button>
          </div>
          {voiceError ? <p className="px-2 pt-2 text-[11px] leading-4 text-[#a04f43]">{voiceError}</p> : null}
          <p className="px-2 pt-2 text-[10px] leading-4 text-brand-muted/70">{labels.disclaimer}</p>
        </form>
      </section>

      <button
        aria-expanded={open}
        aria-label={open ? labels.close : labels.open}
        className="group flex h-15 items-center justify-center gap-3 rounded-full border border-brand-accent/55 bg-brand-primary px-[18px] text-brand-secondary shadow-[0_14px_40px_rgba(3,24,46,0.3)] transition duration-300 hover:-translate-y-1 hover:bg-brand-shadow focus-visible:outline-brand-accent sm:h-16 sm:px-5"
        onClick={() => {
          dismissTeaser();
          setOpen((current) => !current);
        }}
        type="button"
      >
        {open ? (
          <X aria-hidden size={24} />
        ) : (
          <>
            <ChatCircleDots aria-hidden size={26} weight="fill" />
            <span className="hidden whitespace-nowrap font-display text-xs font-semibold sm:inline">
              {locale === "de" ? "Frag Heikes AI" : "Ask Heike's AI"}
            </span>
          </>
        )}
      </button>
    </div>
  );
}
