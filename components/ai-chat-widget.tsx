"use client";

import {ArrowRight, ChatCircleDots, PaperPlaneTilt, Sparkle, X} from "@phosphor-icons/react";
import {FormEvent, KeyboardEvent, useEffect, useRef, useState} from "react";
import type {SiteLang} from "@/lib/ai/knowledge-types";

type Navigation = {href: string; label: string};
type Message = {role: "user" | "assistant"; content: string; navigation?: Navigation};

const APPROVED_EMAIL = "contact@heike-ziegler.com";

const copy = {
  de: {
    title: "Heikes AI-Assistent",
    welcome: "Hallo, ich bin Heikes digitaler Assistent. Ich helfe dir, passende Informationen und den richtigen Bereich der Website zu finden.",
    placeholder: "Was möchtest du wissen?",
    open: "AI-Assistenten öffnen",
    close: "AI-Assistenten schließen",
    send: "Nachricht senden",
    thinking: "Ich prüfe die Website …",
    fallback: "Der Assistent ist gerade nicht verfügbar. Du kannst Heike direkt kontaktieren.",
    disclaimer: "Antworten basieren auf den Inhalten dieser Website. Keine medizinische, rechtliche oder finanzielle Beratung.",
    contact: "E-Mail schreiben",
    teaserEyebrow: "Persönliche Orientierung",
    teaserTitle: "Welche Information oder welches Angebot suchst du?",
    teaserAction: "Assistenten fragen",
    online: "Bereit für deine Frage",
    suggestions: ["Was ist ISOBL?", "Wie kann ich Heike kontaktieren?", "Welche Methode verwendet Heike?"],
  },
  en: {
    title: "Heike's AI assistant",
    welcome: "Hello, I'm Heike's digital assistant. I can help you find verified information and the right part of this website.",
    placeholder: "What would you like to know?",
    open: "Open AI assistant",
    close: "Close AI assistant",
    send: "Send message",
    thinking: "Checking the website …",
    fallback: "The assistant is currently unavailable. You can contact Heike directly.",
    disclaimer: "Answers are based on this website. No medical, legal, or financial advice.",
    contact: "Send an email",
    teaserEyebrow: "Personal guidance",
    teaserTitle: "Which information or offer are you looking for?",
    teaserAction: "Ask the assistant",
    online: "Ready for your question",
    suggestions: ["What is ISOBL?", "How can I contact Heike?", "Which method does Heike use?"],
  },
} as const;

function safeNavigation(value: unknown, locale: SiteLang): Navigation | undefined {
  if (!value || typeof value !== "object") return undefined;
  const navigation = value as Partial<Navigation>;
  if (typeof navigation.href !== "string" || typeof navigation.label !== "string") return undefined;
  if (navigation.label.length < 1 || navigation.label.length > 80) return undefined;
  if (!navigation.href.startsWith(`/${locale}`)) return undefined;
  if (!/^\/(de|en)(?:[/?#]|$)/.test(navigation.href)) return undefined;
  if (/[:\\]|%5c|%2f%2f/i.test(navigation.href)) return undefined;
  return {href: navigation.href, label: navigation.label};
}

function MessageText({content}: {content: string}) {
  return (
    <div className="whitespace-pre-wrap break-words leading-6">
      {content}
    </div>
  );
}

function getClientToken() {
  const key = "msyh-ai-client-token";
  const current = window.sessionStorage.getItem(key);
  if (current) return current;
  const token = typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  window.sessionStorage.setItem(key, token);
  return token;
}

export function AiChatWidget({locale}: {locale: SiteLang}) {
  const labels = copy[locale];
  const [open, setOpen] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {role: "assistant", content: labels.welcome},
  ]);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages([{role: "assistant", content: labels.welcome}]);
    setInput("");
  }, [labels.welcome]);

  useEffect(() => {
    if (window.sessionStorage.getItem("msyh-ai-teaser-dismissed")) return;
    const timer = window.setTimeout(() => setShowTeaser(true), 4_200);
    return () => window.clearTimeout(timer);
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

  async function sendMessage(prompt?: string) {
    const content = (prompt ?? input).trim();
    if (!content || loading) return;

    setOpen(true);
    setShowTeaser(false);
    const userMessage: Message = {role: "user", content};
    const nextMessages = [...messages, userMessage].slice(-6);
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-msyh-ai-client": getClientToken(),
        },
        body: JSON.stringify({
          locale,
          messages: nextMessages.map(({role, content: messageContent}) => ({role, content: messageContent})),
        }),
      });
      const data = (await response.json()) as {message?: unknown; navigation?: unknown};
      const answer = typeof data.message === "string" && data.message.trim() ? data.message.trim() : labels.fallback;
      setMessages((current) => [
        ...current,
        {role: "assistant", content: answer, navigation: safeNavigation(data.navigation, locale)},
      ]);
    } catch {
      setMessages((current) => [...current, {role: "assistant", content: labels.fallback}]);
    } finally {
      setLoading(false);
    }
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
    <div className="fixed bottom-4 right-4 z-[70] sm:bottom-7 sm:right-7">
      <aside
        aria-hidden={!showTeaser || open}
        className={`absolute bottom-[calc(100%+14px)] right-0 w-[min(340px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-brand-primary/10 bg-brand-secondary shadow-[0_24px_70px_rgba(3,24,46,0.18)] transition duration-500 ${
          showTeaser && !open ? "visible translate-y-0 opacity-100" : "invisible translate-y-3 opacity-0"
        }`}
      >
        <div className="h-1 bg-brand-accent" />
        <div className="relative p-5 pr-12">
          <button aria-label={labels.close} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-brand-muted hover:bg-brand-primary/5" onClick={dismissTeaser} type="button">
            <X aria-hidden size={16} />
          </button>
          <p className="font-display text-[9px] font-semibold uppercase tracking-[0.22em] text-brand-accent">{labels.teaserEyebrow}</p>
          <p className="mt-2 font-serif text-xl leading-snug text-brand-primary">{labels.teaserTitle}</p>
          <button className="group mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary" onClick={openAssistant} type="button">
            {labels.teaserAction}<ArrowRight aria-hidden className="text-brand-accent transition-transform group-hover:translate-x-1" size={16} />
          </button>
        </div>
      </aside>

      <section
        aria-hidden={!open}
        aria-label={labels.title}
        className={`absolute bottom-[calc(100%+12px)] right-0 flex h-[min(640px,calc(100dvh-92px))] w-[min(410px,calc(100vw-24px))] origin-bottom-right flex-col overflow-hidden rounded-[24px] border border-white/10 bg-brand-ivory shadow-[0_30px_90px_rgba(3,24,46,0.32)] transition duration-300 ${
          open ? "visible translate-y-0 scale-100 opacity-100" : "invisible translate-y-3 scale-95 opacity-0"
        }`}
      >
        <header className="relative overflow-hidden bg-brand-primary px-5 pb-5 pt-4 text-brand-secondary">
          <div className="absolute inset-x-0 top-0 h-1 bg-brand-accent" />
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-brand-accent/40 bg-brand-secondary text-brand-primary">
                <Sparkle aria-hidden size={21} weight="fill" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate font-display text-[15px] font-semibold">{labels.title}</h2>
                <p className="mt-1 text-[11px] text-brand-secondary/60">{labels.online}</p>
              </div>
            </div>
            <button aria-label={labels.close} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-brand-secondary/75 hover:bg-white/10 hover:text-white" onClick={() => setOpen(false)} type="button">
              <X aria-hidden size={20} />
            </button>
          </div>
        </header>

        <div aria-live="polite" className="flex-1 space-y-3 overflow-y-auto bg-[linear-gradient(180deg,#fcf3e3_0%,#f9f4e7_100%)] px-4 py-5" role="log">
          {messages.map((message, index) => (
            <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm shadow-[0_6px_24px_rgba(3,24,46,0.05)] ${message.role === "user" ? "ml-auto rounded-br-[4px] bg-brand-primary text-brand-secondary" : "rounded-bl-[4px] border border-brand-primary/8 bg-white text-brand-espresso"}`} key={`${message.role}-${index}`}>
              <MessageText content={message.content} />
              {message.navigation ? (
                <a className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full bg-brand-primary px-4 py-2 text-xs font-semibold text-brand-secondary transition hover:bg-brand-shadow" href={message.navigation.href}>
                  {message.navigation.label}<ArrowRight aria-hidden size={14} />
                </a>
              ) : null}
            </div>
          ))}
          {messages.length === 1 ? (
            <div className="grid gap-2 pt-1">
              {labels.suggestions.map((suggestion) => (
                <button className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-brand-primary/10 bg-white/65 px-4 py-2.5 text-left text-xs font-medium leading-5 text-brand-primary hover:border-brand-accent/60 hover:bg-white" key={suggestion} onClick={() => void sendMessage(suggestion)} type="button">
                  <span>{suggestion}</span><ArrowRight aria-hidden className="shrink-0 text-brand-accent" size={14} />
                </button>
              ))}
            </div>
          ) : null}
          {loading ? <div className="flex max-w-[88%] items-center gap-2 rounded-2xl rounded-bl-[4px] border border-brand-primary/8 bg-white px-4 py-3 text-sm text-brand-muted"><span className="h-2 w-2 animate-pulse rounded-full bg-brand-accent" />{labels.thinking}</div> : null}
          <div ref={endRef} />
        </div>

        <form className="border-t border-brand-primary/8 bg-white p-3" onSubmit={handleSubmit}>
          <div className="flex items-end gap-2 rounded-xl border border-brand-primary/14 bg-brand-secondary/40 px-3 py-2 focus-within:border-brand-accent focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-accent/10">
            <textarea aria-label={labels.placeholder} className="max-h-28 min-h-11 flex-1 resize-none bg-transparent px-1 py-2 text-sm leading-5 text-brand-primary outline-none placeholder:text-brand-muted/65" disabled={loading} maxLength={1_000} onChange={(event) => setInput(event.target.value)} onKeyDown={handleKeyDown} placeholder={labels.placeholder} ref={inputRef} rows={1} value={input} />
            <button aria-label={labels.send} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-primary text-brand-secondary hover:bg-brand-shadow disabled:cursor-not-allowed disabled:opacity-35" disabled={!input.trim() || loading} type="submit">
              <PaperPlaneTilt aria-hidden size={18} weight="fill" />
            </button>
          </div>
          <div className="flex items-start justify-between gap-3 px-2 pt-2 text-[10px] leading-4 text-brand-muted/70">
            <p>{labels.disclaimer}</p>
            <a className="shrink-0 font-semibold underline underline-offset-2" href={`mailto:${APPROVED_EMAIL}`}>{labels.contact}</a>
          </div>
        </form>
      </section>

      <button aria-expanded={open} aria-label={open ? labels.close : labels.open} className="group flex h-14 items-center justify-center gap-3 rounded-full border border-brand-accent/55 bg-brand-primary px-4 text-brand-secondary shadow-[0_14px_40px_rgba(3,24,46,0.3)] transition duration-300 hover:-translate-y-1 hover:bg-brand-shadow focus-visible:outline-brand-accent sm:h-16 sm:px-5" onClick={() => { dismissTeaser(); setOpen((current) => !current); }} type="button">
        {open ? <X aria-hidden size={24} /> : <><ChatCircleDots aria-hidden size={26} weight="fill" /><span className="hidden whitespace-nowrap font-display text-xs font-semibold sm:inline">{locale === "de" ? "Frag Heikes AI" : "Ask Heike's AI"}</span></>}
      </button>
    </div>
  );
}
