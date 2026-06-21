/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import { motion, AnimatePresence } from 'motion/react';
import type { Variants } from 'motion/react';
import {
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { AiChatWidget } from '@/components/ai-chat-widget';
import { TestimonialsSection } from '@/components/testimonials-section';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

type SiteLang = "de" | "en";
const SHOW_BRAND_PHILOSOPHY = false;

const successSectionImages: Record<SiteLang, {png: string; webp: string}> = {
  de: {
    png: "/media/images/success-section_de.png",
    webp: "/media/images/success-section_de.webp",
  },
  en: {
    png: "/media/images/success-section_eng.png",
    webp: "/media/images/success-section_eng.webp",
  },
};

function LanguageToggle({
  lang,
  onChange,
  className = "",
  label,
}: {
  lang: SiteLang;
  onChange: (lang: SiteLang) => void;
  className?: string;
  label: string;
}) {
  return (
    <div
      className={`inline-flex items-center rounded-full border border-brand-primary/10 bg-white/70 p-1 backdrop-blur-sm ${className}`}
      role="group"
      aria-label={label}
    >
      {(["de", "en"] as const).map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={lang === option}
          onClick={() => onChange(option)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
            lang === option
              ? "bg-brand-primary text-white shadow-sm"
              : "text-brand-muted hover:text-brand-primary"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export default function App({
  blogSectionDe,
  blogSectionEn,
  initialLang = "de",
}: {
  blogSectionDe?: ReactNode;
  blogSectionEn?: ReactNode;
  initialLang?: SiteLang;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState<SiteLang>(initialLang);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const isEn = lang === "en";
  const tx = (de: string, en: string) => (isEn ? en : de);
  const localeRoot = isEn ? "/en" : "/de";
  const localizedPage = (path: string) => `${localeRoot}${path}`;
  const navItems = [
    {label: tx("Start", "Home"), href: "#start"},
    {label: tx("Methode", "Method"), href: "#methode"},
    {label: tx("Angebote", "Services"), href: "#angebote"},
    {label: tx("Über Heike", "About Heike"), href: "#ueber-heike"},
    {label: "Insights", href: "#insights"},
    {label: tx("Erfahrungen", "Testimonials"), href: "#community"},
  ];

  useEffect(() => {
    const stored = window.localStorage.getItem("site-lang");
    if (stored === "de" || stored === "en") {
      setLang(stored);
      document.documentElement.lang = stored;
      return;
    }
    document.documentElement.lang = initialLang;
  }, []);

  function selectLang(next: SiteLang) {
    setLang(next);
    window.localStorage.setItem("site-lang", next);
    document.documentElement.lang = next;
    const target = next === "en" ? "/en" : "/de";
    if (window.location.pathname === "/" || window.location.pathname === "/en" || window.location.pathname === "/de") {
      window.history.replaceState(null, "", `${target}${window.location.hash}`);
    }
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const hero = heroRef.current;
    if (!video || !hero) return;


    video.muted = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-brand-secondary selection:bg-brand-accent/30">
      <a
        href="#start"
        className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[60] focus:rounded-full focus:bg-brand-primary focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-brand-secondary"
      >
        {tx("Zum Inhalt springen", "Skip to content")}
      </a>
      {/* Navigation */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,box-shadow,padding,backdrop-filter] duration-300 ${
          scrolled ? 'bg-brand-secondary/92 backdrop-blur-md py-4 shadow-[0_16px_50px_rgba(3,24,46,0.08)]' : 'bg-transparent py-6'
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <a className="flex items-center gap-3" href="#start" aria-label={tx("Make Success Your Habit Startseite", "Make Success Your Habit home")}>
            <img
              alt="Make Success Your Habit"
              className="h-10 w-10 rounded-full object-contain shadow-[0_8px_24px_rgba(16,15,15,0.08)]"
              width={40}
              height={40}
              src="/media/images/msyh-logo.webp"
            />
            <span className="max-w-[11rem] truncate font-display text-xs font-semibold uppercase tracking-[0.14em] text-brand-primary sm:max-w-none sm:text-sm sm:tracking-[0.16em]">Make Success Your Habit</span>
          </a>

          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <a 
                key={item.href} 
                href={item.href} 
                className="text-sm font-medium text-brand-muted hover:text-brand-primary transition-colors"
              >
                {item.label}
              </a>
            ))}
            <LanguageToggle label={tx("Sprache wählen", "Choose language")} lang={lang} onChange={selectLang} />
            <a href="https://cal.com/heikeziegler/clarity-call" target="_blank" rel="noopener noreferrer" className="rounded-full border border-brand-primary bg-brand-primary px-6 py-2.5 text-sm font-medium text-brand-secondary shadow-[0_12px_28px_rgba(3,24,46,0.16)] transition-[background-color,border-color,transform] duration-500 hover:-translate-y-px hover:bg-brand-shadow hover:border-brand-accent active:translate-y-0">
              Clarity Call
            </a>
          </nav>

          <button
            aria-label={tx(isMenuOpen ? "Menü schließen" : "Menü öffnen", isMenuOpen ? "Close menu" : "Open menu")}
            className="lg:hidden text-brand-primary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            type="button"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-40 bg-brand-secondary flex flex-col pt-24 px-8 lg:hidden"
          >
            {navItems.map((item) => (
              <a 
                key={item.href} 
                href={item.href} 
                className="text-2xl font-serif py-4 border-b border-brand-primary/10"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <LanguageToggle label={tx("Sprache wählen", "Choose language")} lang={lang} onChange={selectLang} className="mt-8 self-start" />
            <a href="https://cal.com/heikeziegler/clarity-call" target="_blank" rel="noopener noreferrer" onClick={() => setIsMenuOpen(false)} className="mt-12 rounded-full bg-brand-primary py-4 text-center font-medium text-brand-secondary transition-colors duration-500 hover:bg-brand-shadow">
              {tx("Clarity Call anfragen", "Request a Clarity Call")}
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* Section 1: Hero */}
        <section id="start" ref={heroRef} className="relative left-1/2 w-screen -translate-x-1/2 min-h-[100dvh] flex items-center overflow-hidden bg-brand-secondary">
          {/* Video Background */}
          <video
            ref={videoRef}
            src="/media/videos/hero-image-new.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover object-[72%_50%] sm:object-[68%_50%]"
          />

          {/* Angled editorial gradient — lighter, more video visible */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(108deg, rgba(249,244,231,0.96) 0%, rgba(249,244,231,0.78) 44%, rgba(249,244,231,0.22) 68%, transparent 88%)' }}
          />
          {/* Top vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-secondary/25 via-transparent to-transparent" />
          {/* Bottom vignette */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-brand-secondary/50 to-transparent" />
          {/* Main Content */}
          <div className="relative z-10 w-full container mx-auto px-5 pt-28 pb-24 sm:px-6 sm:pt-32">

            {/* Eyebrow pill */}
            <motion.div
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
              className="mb-8 flex items-center gap-3 sm:mb-10"
            >
              <div className="w-7 h-px bg-brand-accent" />
              <span className="text-[10px] font-display font-semibold tracking-[0.28em] uppercase text-brand-accent">
                Make Success Your Habit
              </span>
            </motion.div>

            {/* Headline — left border accent, refined brand hook */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.95, delay: 0.12, ease: [0.32, 0.72, 0, 1] }}
              className="mb-6 border-l-[1.5px] border-brand-accent/35 pl-4 sm:mb-7 sm:pl-5"
            >
              <h1 className="max-w-[20rem] text-balance font-serif text-[2.45rem] leading-[1.02] text-brand-primary min-[380px]:text-[2.85rem] md:max-w-[32rem] md:text-[4.15rem] lg:max-w-[40rem] lg:text-[5.25rem] xl:text-[5.85rem]">
                {tx("Werde die Frau, die", "Become the Woman Who")}{' '}
                <span className="italic font-light text-brand-primary/62">
                  {tx("Erfolg selbstverständlich lebt.", "Succeeds by Default.")}
                </span>
              </h1>
            </motion.div>

            {/* Animated accent line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.75, delay: 0.38, ease: [0.32, 0.72, 0, 1] }}
              className="origin-left mb-7"
              style={{ width: '4rem', height: '1px', background: 'linear-gradient(to right, #c4a484, transparent)' }}
            />

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.52, ease: [0.32, 0.72, 0, 1] }}
              className="mb-9 max-w-[31rem] text-[0.98rem] leading-[1.75] text-brand-primary/76 sm:mb-11 md:text-lg md:leading-[1.85]"
            >
              {tx(
                "Für ambitionierte Unternehmerinnen und Coaches, die Erfolg als natürliche Gewohnheit verkörpern.",
                "For ambitious founders and coaches who want success to become their natural way of being.",
              )}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.68, ease: [0.32, 0.72, 0, 1] }}
              className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-start"
            >
              {/* Primary — Button-in-Button architecture */}
              <a href="https://cal.com/heikeziegler/clarity-call" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between rounded-full border border-brand-primary bg-brand-primary py-1.5 pl-6 pr-1.5 text-sm font-medium text-brand-secondary shadow-[0_12px_28px_rgba(3,24,46,0.16)] transition-[background-color,border-color,transform] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-px hover:border-brand-accent hover:bg-brand-shadow active:translate-y-0 sm:justify-start">
                <span className="pr-4 tracking-wide">{tx("Clarity Call anfragen", "Request a Clarity Call")}</span>
                <span className="w-8 h-8 rounded-full bg-white/12 flex items-center justify-center transition-[background-color,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-brand-accent group-hover:translate-x-0.5 group-hover:-translate-y-px">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </a>

              {/* Secondary */}
              <a href={`${localizedPage("/instant-success-formula")}?from=start`} className="group flex items-center justify-center gap-2 rounded-full border border-brand-primary/18 bg-brand-secondary/70 px-6 py-[0.82rem] text-sm font-medium text-brand-primary backdrop-blur-sm transition-[background-color,border-color,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-brand-accent/60 hover:bg-brand-ivory active:scale-[0.98] sm:justify-start">
                {tx("Instant Success Formula ansehen", "Explore the Instant Success Formula")}
                <ChevronRight className="w-3.5 h-3.5 opacity-40 transition-transform duration-500 group-hover:translate-x-0.5" />
              </a>
            </motion.div>
          </div>

          {/* Scroll indicator — absolutely pinned bottom-left */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="absolute bottom-10 left-6 z-10 flex items-center gap-3"
          >
            <div className="relative w-px h-12 overflow-hidden bg-brand-primary/10 rounded-full">
              <motion.div
                animate={{ y: ['-100%', '200%'] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-x-0 h-1/2 bg-brand-accent rounded-full"
              />
            </div>
            <span className="text-[9px] text-brand-muted/40 font-display tracking-[0.42em] uppercase">Scroll</span>
          </motion.div>
        </section>

        {/* Section 2: Emotionaler Einstieg */}
        <section className="border-y border-brand-primary/5 bg-brand-secondary py-16 backdrop-blur-sm sm:py-20 md:py-24">
          <div className="container mx-auto max-w-4xl px-5 sm:px-6">
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="text-center"
            >
              <motion.h2 variants={fadeIn} className="mb-7 font-serif text-[2rem] leading-tight min-[380px]:text-3xl md:mb-8 md:text-5xl">
                {tx("Vielleicht brauchst du keine neue Strategie.", "Maybe you do not need another strategy.")} <br />
                {tx("Vielleicht brauchst du eine neue ", "Maybe you need a new ")}
                <span className="italic">{tx("innere Grundlage", "inner foundation")}</span>
                {tx(" für Erfolg.", " for success.")}
              </motion.h2>
              <motion.div variants={fadeIn} className="space-y-5 text-base leading-relaxed text-brand-muted md:space-y-6 md:text-lg">
                <p>
                  {tx(
                    "Du hast Erfahrung, Fähigkeiten und eine Vision. Und trotzdem spürst du, dass etwas innen noch nicht vollständig mit deinem nächsten Level übereinstimmt.",
                    "You have experience, skills, and a vision. Yet you sense that something within you is not fully aligned with your next level.",
                  )}
                </p>
                <p>
                  {tx(
                    "Sichtbarkeit fühlt sich schwer an. Entscheidungen kosten Energie. Kundengewinnung ist nicht so klar, wie sie sein könnte.",
                    "Visibility feels difficult. Decisions drain your energy. Client acquisition is not as clear as it could be.",
                  )}
                </p>
                <p className="pt-3 font-display text-lg font-medium text-brand-primary md:pt-4 md:text-xl">
                  {tx("Genau hier beginnt Make Success Your Habit.", "This is where Make Success Your Habit begins.")}
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Temporarily hidden while the surrounding page stays unchanged. */}
        {SHOW_BRAND_PHILOSOPHY ? (
        <section id="markenphilosophie" className="relative bg-[#d8c3a6]">
          <motion.picture
            key={lang}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <source media="(max-width: 767px)" srcSet="/media/images/succes-section-mobile.webp" type="image/webp" />
            <source media="(max-width: 767px)" srcSet="/media/images/succes-section-mobile.png" type="image/png" />
            <source srcSet={successSectionImages[lang].webp} type="image/webp" />
            <img
              src={successSectionImages[lang].png}
              alt={
                lang === "de"
                  ? "Markenphilosophie: Ausrichtung führt zu Erfolg - Identität, Erkennen, Klären, Werden, Umsetzung"
                  : "Brand philosophy: Aligned Success - Identity, See, Clear, Become, Action"
              }
              width={1718}
              height={916}
              className="block h-auto w-full max-w-full"
              decoding="async"
              loading="lazy"
              sizes="100vw"
            />
          </motion.picture>
          <div className="pointer-events-none absolute inset-0 flex items-start px-6 pt-24 md:hidden">
            <div className="max-w-[18rem]">
              <p className="mb-4 font-display text-[9px] font-semibold uppercase tracking-[0.24em] text-brand-accent">
                {tx("Die Philosophie des ausgerichteten Erfolgs", "The Philosophy of Aligned Success")}
              </p>
              <h2 className="font-serif text-[2.7rem] leading-[0.98] text-brand-primary min-[380px]:text-[3rem]">
                {tx("Erfolg wird zur ", "Success is a ")}
                <span className="italic font-light text-brand-primary/62">{tx("Gewohnheit.", "habit.")}</span>
              </h2>
              <p className="mt-6 text-[0.95rem] leading-[1.72] text-brand-primary/72">
                {tx(
                  "Erfolg wird stabil, wenn du ihn aus Identität, emotionaler Klarheit und strategischer Führung verkörperst.",
                  "Success becomes stable when you embody it through identity, emotional clarity, and strategic leadership.",
                )}
              </p>
            </div>
          </div>
        </section>
        ) : null}

        {/* Section 4: Signature-Methode (MSF) */}
        <section
          id="methode"
          className="relative overflow-hidden bg-brand-primary text-white"
        >
          <div
            className="absolute inset-0 bg-cover bg-[58%_50%] md:bg-[56%_50%] lg:bg-[center_center]"
            style={{
              backgroundImage:
                "image-set(url('/media/images/see-clear-become.webp') type('image/webp'), url('/media/images/see-clear-become.png') type('image/png'))"
            }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-primary via-brand-primary/86 via-46% to-brand-primary/28" />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/36 via-brand-primary/8 to-brand-primary/62" />
          <div className="absolute inset-0 bg-brand-shadow/18" />
          <div className="relative z-10 mx-auto flex min-h-[auto] max-w-[1600px] items-center px-5 py-16 sm:px-8 sm:py-20 md:py-28 lg:min-h-[900px] lg:px-16 xl:px-20">
            <div className="grid w-full items-center gap-14 xl:grid-cols-[0.7fr_1.3fr] xl:gap-16">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-120px" }}
                transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-2xl xl:max-w-[520px]"
              >
                <div className="mb-7 flex items-center gap-4 sm:mb-9">
                  <motion.span
                    initial={{ scaleX: 0, opacity: 0 }}
                    whileInView={{ scaleX: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-120px" }}
                    transition={{ duration: 1, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                    className="h-px w-8 origin-left bg-brand-accent sm:w-12"
                  />
                  <p className="font-display text-[9px] font-semibold uppercase tracking-[0.24em] text-brand-accent sm:text-[11px] sm:tracking-[0.32em]">
                    SEE → CLEAR → BECOME
                  </p>
                </div>
                <h2 className="max-w-[10ch] font-serif text-[2.85rem] leading-[0.98] tracking-[-0.02em] min-[380px]:text-[3.2rem] sm:text-6xl md:text-7xl lg:text-[5.4rem] lg:tracking-[-0.035em] xl:text-[5.85rem]">
                  The Instant Success Formula
                </h2>
                <p className="mt-7 max-w-2xl text-[0.98rem] leading-[1.75] text-white/78 sm:mt-9 md:text-[1.35rem] md:leading-[1.85] xl:max-w-[34rem]">
                  {tx(
                    "Eine Methode, die dich nicht nur informiert, sondern innerlich neu ausrichtet — damit Erfolg nicht länger mit Druck verbunden ist, sondern mit Klarheit, Identität und bewusster Führung.",
                    "A method that does more than inform you. It realigns you from within, so success is no longer tied to pressure but to clarity, identity, and conscious leadership.",
                  )}
                </p>
              </motion.div>

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:items-center xl:gap-6">
                {[
                  {
                    id: 'see',
                    step: '01',
                    title: 'SEE',
                    desc: tx('Erkenne unbewusste Muster, innere Grenzen und emotionale Dynamiken.', 'Recognize unconscious patterns, inner limits, and emotional dynamics.'),
                    result: tx('Klarheit', 'Clarity'),
                    className: 'bg-white/78 text-brand-primary lg:min-h-[510px] lg:translate-y-8'
                  },
                  {
                    id: 'clear',
                    step: '02',
                    title: 'CLEAR',
                    desc: tx('Löse emotionale Widerstände, innere Anspannung und Selbstsabotage.', 'Release emotional resistance, inner tension, and self-sabotage.'),
                    result: tx('Freiheit', 'Freedom'),
                    className: 'bg-white/96 text-brand-primary shadow-2xl shadow-brand-primary/35 ring-1 ring-brand-accent/70 md:row-span-2 lg:row-span-1 lg:min-h-[570px] lg:-translate-y-4'
                  },
                  {
                    id: 'become',
                    step: '03',
                    title: 'BECOME',
                    desc: tx('Verkörpere eine neue Erfolgsidentität, aus der du sichtbar wirst.', 'Embody a new identity for success from which you become visible.'),
                    result: tx('Identität', 'Identity'),
                    className: 'bg-brand-shadow/90 text-white ring-1 ring-white/12 md:col-span-2 lg:col-span-1 lg:min-h-[480px] lg:translate-y-6'
                  }
                ].map((item, idx) => (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, y: 48 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -10, transition: { duration: 0.45, ease: [0.32, 0.72, 0, 1] } }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 1.1, delay: idx * 0.16, ease: [0.16, 1, 0.3, 1] }}
                    className={`group relative flex min-h-[300px] flex-col overflow-hidden rounded-lg border border-white/16 p-7 shadow-xl shadow-brand-primary/18 backdrop-blur-md transition-[box-shadow,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-2xl hover:shadow-brand-primary/30 sm:min-h-[360px] sm:p-9 lg:min-h-[430px] xl:p-10 ${item.className}`}
                  >
                    <div className="mb-10 flex items-center justify-between sm:mb-16">
                      <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: item.id === 'become' ? 0.45 : 0.62 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.35 + idx * 0.16 }}
                        className="font-display text-[11px] font-medium uppercase tracking-[0.32em]"
                      >
                        {item.step}
                      </motion.span>
                    </div>

                    <h3 className={`font-serif text-[2.35rem] leading-none transition-colors duration-500 sm:text-5xl ${item.id === 'become' ? 'lg:text-[2.85rem] xl:text-[3rem] group-hover:text-brand-accent' : 'lg:text-[3.35rem] group-hover:text-brand-primary'}`}>
                      {item.title}
                    </h3>

                    <p className={`mt-6 max-w-[18rem] text-[0.98rem] leading-[1.68] sm:mt-8 sm:max-w-[14rem] sm:text-lg ${item.id === 'become' ? 'text-white/72' : 'text-brand-muted'}`}>
                      {item.desc}
                    </p>

                    <div className={`mt-auto h-px w-full transition-[width] duration-700 group-hover:w-[85%] ${item.id === 'become' ? 'bg-white/14' : 'bg-brand-primary/10'}`} />

                    <p className="mt-8 font-display text-[10px] font-medium uppercase tracking-[0.32em] text-brand-accent">
                      {item.result}
                    </p>
                  </motion.article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Für wen ist das? */}
        <section className="overflow-hidden bg-brand-secondary py-20 sm:py-28 md:py-44">
          <div className="container mx-auto max-w-7xl px-5 sm:px-6">
            <div className="grid items-start gap-12 lg:grid-cols-[1fr_1fr] lg:gap-24">

              {/* Left: Editorial image */}
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                className="relative lg:sticky lg:top-28"
              >
                {/* Outer frame — thin gold hairline */}
                <div className="relative overflow-hidden rounded-2xl ring-1 ring-brand-accent/15 sm:rounded-[1.75rem]">
                  <picture>
                    <source srcSet="/media/images/fuer-wen.webp" type="image/webp" />
                    <img
                      src="/media/images/für-wen.png"
                      alt={tx("Heike Ziegler – Transformationsmentorin für Unternehmerinnen", "Heike Ziegler – transformation mentor for women in business")}
                      className="w-full h-auto block object-cover"
                      width={900}
                      height={1125}
                      loading="lazy"
                      decoding="async"
                      sizes="(min-width: 1024px) 50vw, 100vw"
                    />
                  </picture>
                  {/* Bottom quote overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-brand-primary/75 via-brand-primary/30 to-transparent px-6 pb-6 pt-20 sm:px-9 sm:pb-9 sm:pt-24">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: 0.5, ease: [0.32, 0.72, 0, 1] }}
                      className="origin-left w-6 h-px bg-brand-accent mb-5"
                    />
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
                      className="font-serif text-lg leading-[1.4] text-white md:text-2xl"
                    >
                      {tx("Klarheit ist keine Pause.", "Clarity is not a pause.")}
                      <br />
                      <span className="italic font-light text-white/60">{tx("Sie ist Führung.", "It is leadership.")}</span>
                    </motion.p>
                  </div>
                </div>
              </motion.div>

              {/* Right: Text content */}
              <div className="lg:pt-4">
                {/* Eyebrow */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                  className="mb-8 flex items-center gap-3 sm:mb-10"
                >
                  <div className="w-6 h-px bg-brand-accent" />
                  <span className="font-display font-semibold text-[10px] uppercase tracking-[0.32em] text-brand-accent">
                    {tx("Für wen", "Who it is for")}
                  </span>
                </motion.div>

                {/* Headline — large, generous */}
                <motion.h2
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-8 font-serif text-[2.05rem] leading-[1.12] text-brand-primary min-[380px]:text-[2.3rem] md:mb-10 md:text-[3rem] lg:text-[3.25rem]"
                >
                  {tx("Für Frauen, die Erfolg nicht länger", "For women who no longer want")}
                  <br className="hidden md:block" /> {tx("erzwingen wollen —", "to force success —")}
                  <br />
                  <span className="italic font-light text-brand-primary/50">
                    {tx("sondern ihn verkörpern.", "but embody it.")}
                  </span>
                </motion.h2>

                {/* Intro */}
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-10 max-w-[38ch] text-[0.925rem] font-light leading-[1.85] text-brand-muted md:mb-12 md:leading-[1.9]"
                >
                  {tx(
                    "Für Unternehmerinnen, Coaches, Consultants, Therapeutinnen und Expertinnen, die spüren: Mehr Strategie allein reicht nicht, wenn die ",
                    "For founders, coaches, consultants, therapists, and experts who sense that more strategy alone is not enough when their ",
                  )}
                  <span className="text-brand-primary font-normal">{tx("innere Ausrichtung", "inner alignment")}</span>{' '}
                  {tx("nicht mitzieht.", "does not move with it.")}
                </motion.p>

                {/* Numbered list — editorial, airy */}
                <motion.ol
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.28 }}
                  className="border-t border-brand-primary/[0.07]"
                >
                  {[
                    { num: '01', label: tx('Sichtbarkeit ohne Verbiegen', 'Visibility without compromising yourself') },
                    { num: '02', label: tx('Kundengewinnung mit Klarheit', 'Client acquisition with clarity') },
                    { num: '03', label: tx('Wachstum ohne Daueranspannung', 'Growth without constant tension') },
                    { num: '04', label: tx('Entscheidungen aus Identität', 'Decisions rooted in identity') },
                    { num: '05', label: tx('Führung aus innerer Stabilität', 'Leadership from inner stability') },
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.34 + i * 0.07 }}
                      className="group flex items-baseline gap-6 py-5 border-b border-brand-primary/[0.07] cursor-default"
                    >
                      <span className="font-display text-[9px] tracking-[0.3em] text-brand-accent/50 shrink-0 transition-colors duration-500 group-hover:text-brand-accent/80">
                        {item.num}
                      </span>
                      <span className="font-serif text-[1.05rem] text-brand-primary/80 font-light leading-snug transition-colors duration-500 group-hover:text-brand-primary">
                        {item.label}
                      </span>
                    </motion.li>
                  ))}
                </motion.ol>
              </div>

            </div>
          </div>
        </section>

        {/* Section 6: Transformation Outcomes */}
        <section
          className="relative overflow-hidden py-20 text-white sm:py-28 md:py-48"
          style={{
            background: 'radial-gradient(circle at 50% 0%, rgba(212,175,55,0.10) 0%, transparent 36%), linear-gradient(180deg, #03182E 0%, #100F0F 100%)'
          }}
        >
          {/* Subtle top fade from previous section */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-brand-secondary/8 to-transparent pointer-events-none" />

          <div className="container mx-auto max-w-6xl px-5 sm:px-6">

            {/* Editorial Intro — centered */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="mb-14 text-center md:mb-28"
            >
              <div className="mb-7 flex items-center justify-center gap-3 md:mb-8">
                <div className="w-8 h-px bg-brand-accent/50" />
                <span className="font-display text-[9px] font-semibold uppercase tracking-[0.36em] text-brand-accent/70">{tx("Ergebnisse", "Outcomes")}</span>
                <div className="w-8 h-px bg-brand-accent/50" />
              </div>
              <h2 className="mx-auto mb-6 max-w-3xl font-serif text-[2.05rem] leading-[1.1] text-white min-[380px]:text-[2.35rem] md:mb-8 md:text-[3.4rem] lg:text-[4rem]">
                {tx("Was entsteht, wenn Erfolg zu deinem ", "What becomes possible when success becomes your ")}
                <span className="italic font-light text-white/55">{tx("inneren Standard", "inner standard")}</span>
                {tx(" wird.", ".")}
              </h2>
              <p className="mx-auto max-w-xl text-[0.98rem] leading-[1.75] text-white/72 md:text-base md:leading-[1.9]">
                {tx(
                  "Ruhiger. Klarer. Stabiler. Wachstum aus einer Identität, die Erfolg halten kann.",
                  "Calmer. Clearer. More stable. Growth from an identity that can sustain success.",
                )}
              </p>
            </motion.div>

            {/* 4 Large Outcome Cards — 2×2 grid */}
            <div className="mb-4 grid gap-4 md:grid-cols-2">
              {[
                {
                  num: '01',
                  title: tx('Emotionale Klarheit', 'Emotional clarity'),
                  body: tx('Du erkennst schneller, was dich innerlich bewegt — und triffst Entscheidungen nicht mehr aus Druck, sondern aus Ruhe und Bewusstsein.', 'You recognize what moves you internally and make decisions from calm awareness rather than pressure.')
                },
                {
                  num: '02',
                  title: tx('Stärkere Selbstführung', 'Stronger self-leadership'),
                  body: tx('Du führst dich klarer durch Wachstum, Sichtbarkeit und Veränderung — ohne dich in alten Mustern zu verlieren.', 'You lead yourself more clearly through growth, visibility, and change without losing yourself in old patterns.')
                },
                {
                  num: '03',
                  title: tx('Sichtbare Autorität', 'Visible authority'),
                  body: tx('Du zeigst dich präsenter, klarer und souveräner, weil deine Positionierung nicht nur strategisch, sondern innerlich getragen ist.', 'You show up with greater presence, clarity, and confidence because your positioning is supported from within.')
                },
                {
                  num: '04',
                  title: tx('Wachstum ohne Hustle', 'Growth without hustle'),
                  body: tx('Dein Business darf wachsen, ohne dass du dich ständig überforderst, beweist oder gegen dich selbst arbeitest.', 'Your business can grow without constantly overextending, proving, or working against yourself.')
                }
              ].map((card, i) => {
                // Diagonal stagger: TL→TR→BL→BR
                const cardDelay = [0, 0.13, 0.08, 0.21][i];
                return (
                  <motion.div
                    key={card.num}
                    initial="hidden"
                    whileInView="visible"
                    whileHover={{ y: -6, transition: { duration: 0.45, ease: [0.32, 0.72, 0, 1] } }}
                    viewport={{ once: false, amount: 0.28 }}
                    variants={{
                      hidden: { opacity: 0, y: 56, scale: 0.96 },
                      visible: {
                        opacity: 1, y: 0, scale: 1,
                        transition: {
                          duration: 1.1,
                          delay: cardDelay,
                          ease: [0.16, 1, 0.3, 1],
                          staggerChildren: 0.1,
                          delayChildren: cardDelay + 0.3
                        }
                      }
                    }}
                    className="group relative cursor-default rounded-2xl p-6 transition-[background,border-color] duration-500 sm:rounded-[1.75rem] sm:p-8 md:p-10"
                    style={{
                      background: 'rgba(249,244,231,0.065)',
                      border: '1px solid rgba(249,244,231,0.18)',
                      backdropFilter: 'blur(16px)'
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(249,244,231,0.095)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.38)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(249,244,231,0.065)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(249,244,231,0.18)';
                    }}
                  >
                    {/* Number + line — cascade first */}
                    <motion.div
                      variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { duration: 0.5 } }
                      }}
                      className="mb-6 flex items-center gap-4 md:mb-7"
                    >
                      <span className="font-display text-[10px] font-semibold tracking-[0.3em] text-brand-accent/55 group-hover:text-brand-accent transition-colors duration-500">
                        {card.num}
                      </span>
                      <motion.div
                        variants={{
                          hidden: { scaleX: 0, opacity: 0 },
                          visible: { scaleX: 1, opacity: 1, transition: { duration: 0.9, ease: [0.32, 0.72, 0, 1] } }
                        }}
                        className="origin-left h-px flex-1 max-w-[3rem]"
                        style={{ background: 'rgba(212,175,55,0.35)' }}
                      />
                    </motion.div>

                    {/* Title — cascade second */}
                    <motion.h3
                      variants={{
                        hidden: { opacity: 0, y: 14 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } }
                      }}
                      className="mb-4 font-serif text-[1.45rem] leading-tight text-white md:mb-5 md:text-[1.85rem]"
                    >
                      {card.title}
                    </motion.h3>

                    {/* Body — cascade third */}
                    <motion.p
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } }
                      }}
                      className="text-[0.95rem] leading-[1.72] text-white/72 transition-colors duration-500 group-hover:text-white/82 md:text-base md:leading-[1.8]"
                    >
                      {card.body}
                    </motion.p>
                  </motion.div>
                );
              })}
            </div>

            {/* 4 Small Outcome Pills */}
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              {[
                tx('Klarere Entscheidungen', 'Clearer decisions'),
                tx('Magnetischere Kundengewinnung', 'More magnetic client acquisition'),
                tx('Mehr Energie', 'More energy'),
                tx('Freiheit & Präsenz', 'Freedom & presence')
              ].map((label, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 22, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ duration: 0.65, delay: 0.3 + i * 0.1, ease: [0.32, 0.72, 0, 1] }}
                  className="flex min-h-14 cursor-default items-center justify-center gap-2.5 rounded-2xl px-4 py-4 text-center transition-[border-color] duration-500 hover:border-brand-accent/30 sm:px-5"
                  style={{ background: 'rgba(249,244,231,0.055)', border: '1px solid rgba(249,244,231,0.14)' }}
                >
                  <div className="w-1 h-1 rounded-full bg-brand-accent/50 shrink-0" />
                  <span className="font-display text-[0.66rem] font-medium uppercase tracking-[0.14em] text-white/68 sm:text-[0.7rem] sm:tracking-[0.18em]">
                    {label}
                  </span>
                </motion.div>
              ))}
            </div>

          </div>
        </section>

        <TestimonialsSection lang={lang} />

        {/* Section 7: Über Heike — Editorial Authority */}
        <section
          id="ueber-heike"
          className="overflow-hidden py-20 sm:py-28 md:py-44"
          style={{ background: 'linear-gradient(180deg, #FBF8F1 0%, #F7F1E6 100%)' }}
        >
          <div className="container mx-auto max-w-6xl px-5 sm:px-6">
            <div className="grid items-start gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">

              {/* Left: Portrait image */}
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                className="relative lg:sticky lg:top-28"
              >
                <div className="relative overflow-hidden rounded-2xl ring-1 ring-brand-accent/15 md:rounded-[2rem]">
                  <picture>
                    <source srcSet="/media/images/heike-ziegler.webp" type="image/webp" />
                    <img
                      src="/media/images/heike-ziegler.png"
                      alt={tx("Heike Ziegler – Identitätsarbeit & Business-Führung", "Heike Ziegler – identity work and business leadership")}
                      className="w-full h-auto block object-cover"
                      width={900}
                      height={1125}
                      loading="lazy"
                      decoding="async"
                      sizes="(min-width: 1024px) 50vw, 100vw"
                    />
                  </picture>
                  {/* Bottom overlay with identity line */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-brand-primary/65 via-brand-primary/20 to-transparent px-6 pb-6 pt-20 sm:px-8 sm:pb-8">
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="font-display text-[9px] uppercase tracking-[0.32em] text-brand-accent/80"
                    >
                      Clarity · Identity · Leadership
                    </motion.p>
                  </div>
                </div>
              </motion.div>

              {/* Right: Content */}
              <div className="lg:pt-2">

                {/* Eyebrow */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
                  className="mb-8 flex items-center gap-3 md:mb-9"
                >
                  <div className="w-6 h-px bg-brand-accent" />
                  <span className="font-display font-semibold text-[9px] uppercase tracking-[0.34em] text-brand-accent">
                    {tx("Über Heike", "About Heike")}
                  </span>
                </motion.div>

                {/* Headline */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-7 font-serif text-[2rem] leading-[1.13] text-brand-primary min-[380px]:text-[2.18rem] md:mb-8 md:text-[2.8rem] lg:text-[3rem]"
                >
                  {tx("Heike Ziegler verbindet", "Heike Ziegler combines")}
                  <br />{tx("Identitätsarbeit mit ", "identity work with ")}
                  <span className="italic font-light text-brand-primary/60">
                    {tx("klarer Business-Führung.", "clear business leadership.")}
                  </span>
                </motion.h2>

                {/* Two intro paragraphs */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-10 max-w-md space-y-5 text-[0.925rem] font-light leading-[1.78] text-brand-muted md:mb-12 md:leading-[1.88]"
                >
                  <p>
                    {tx(
                      "Ihre Arbeit richtet sich an ambitionierte Frauen, die Erfolg nicht länger aus Druck, Überforderung oder Selbstzweifel heraus aufbauen wollen — sondern aus innerer Klarheit, Identität und bewusster Führung.",
                      "Her work is for ambitious women who no longer want to build success through pressure, overwhelm, or self-doubt, but through inner clarity, identity, and conscious leadership.",
                    )}
                  </p>
                  <p>
                    {tx(
                      "Sie verbindet emotionale Präzision, transformative Prozessarbeit und strategische Ausrichtung zu einer Form von Wachstum, die nicht nur inspiriert, sondern nachhaltig verändert.",
                      "She combines emotional precision, transformative process work, and strategic alignment into a form of growth that creates lasting change.",
                    )}
                  </p>
                </motion.div>

                {/* 3 Signature Points */}
                <motion.ol
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.28 }}
                  className="mb-10 space-y-0 border-t border-brand-primary/[0.07] md:mb-12"
                >
                  {[
                    {
                      num: '01',
                      title: tx('Emotionale Klarheit statt Daueranspannung.', 'Emotional clarity instead of constant tension.'),
                      body: tx('Wachstum beginnt dort, wo innere Ausrichtung und äußere Entscheidungen zusammenkommen.', 'Growth begins where inner alignment and external decisions come together.')
                    },
                    {
                      num: '02',
                      title: tx('Identitätsarbeit statt kurzfristiger Motivation.', 'Identity work instead of short-term motivation.'),
                      body: tx('Es geht nicht um Impulse auf Zeit, sondern um echte, verkörperte Veränderung.', 'This is not about temporary inspiration, but genuine embodied change.')
                    },
                    {
                      num: '03',
                      title: tx('Strategisches Wachstum aus Selbstführung.', 'Strategic growth through self-leadership.'),
                      body: tx('Ein Raum, in dem Frauen sich neu führen, klarer entscheiden und nachhaltiger wachsen.', 'A space where women lead themselves differently, decide more clearly, and grow sustainably.')
                    }
                  ].map((point, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.65, delay: 0.34 + i * 0.1, ease: [0.32, 0.72, 0, 1] }}
                      className="group py-5 border-b border-brand-primary/[0.07] cursor-default"
                    >
                      <div className="flex items-baseline gap-5">
                        <span className="font-display text-[9px] tracking-[0.28em] text-brand-accent/50 shrink-0 transition-colors duration-400 group-hover:text-brand-accent/80">
                          {point.num}
                        </span>
                        <div>
                          <p className="font-serif text-[1rem] text-brand-primary leading-snug mb-1.5 group-hover:text-brand-primary transition-colors duration-300">
                            {point.title}
                          </p>
                          <p className="text-[0.825rem] text-brand-muted font-light leading-relaxed">
                            {point.body}
                          </p>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </motion.ol>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:gap-5"
                >
                  <a href="https://cal.com/heikeziegler/clarity-call" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between rounded-full border border-brand-primary bg-brand-primary py-1.5 pl-6 pr-1.5 text-sm font-medium text-brand-secondary shadow-lg shadow-brand-primary/20 transition-[background-color,border-color,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-px hover:border-brand-accent hover:bg-brand-shadow active:translate-y-0 sm:justify-start">
                    <span className="pr-4 tracking-wide">{tx("Clarity Call buchen", "Book a Clarity Call")}</span>
                    <span className="w-8 h-8 rounded-full bg-white/12 flex items-center justify-center transition-[background-color,transform] duration-500 group-hover:bg-brand-accent group-hover:translate-x-0.5">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </a>
                  <a href={`${localizedPage("/about-heike")}?from=ueber-heike`} className="text-brand-primary text-sm font-medium py-3 flex items-center gap-1.5 border-b border-brand-primary/20 transition-[border-color,color] duration-300 hover:border-brand-accent hover:text-brand-accent group">
                    {tx("Mehr über Heike", "More about Heike")}
                    <ChevronRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </a>
                </motion.div>

                {/* Trust line */}
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.75 }}
                  className="mt-8 text-[0.78rem] text-brand-muted/50 font-display tracking-[0.18em] uppercase"
                >
                  {tx("Für Frauen, die Erfolg neu führen wollen.", "For women who want to lead success differently.")}
                </motion.p>

              </div>
            </div>
          </div>
        </section>

        {/* Section 8: Angebotswelt / Ökosystem */}
        <section id="angebote" className="bg-brand-secondary py-20 sm:py-28 md:py-40">
          <div className="container mx-auto px-5 sm:px-6">
            <div className="mx-auto mb-12 grid max-w-6xl gap-7 border-t border-brand-brass/30 pt-10 md:mb-20 md:grid-cols-[0.9fr_1.1fr] md:items-end md:pt-14">
              <div>
                <p className="mb-5 font-display text-[10px] font-semibold uppercase tracking-[0.32em] text-brand-accent">
                  Services
                </p>
                <h2 className="font-serif text-[2.1rem] leading-[1.08] text-brand-primary min-[380px]:text-[2.35rem] md:text-[4rem] md:leading-[1.05]">
                  {tx("Die Wege in Heikes ", "The paths through Heike's ")}
                  <span className="italic font-light text-brand-primary/58">{tx("Ökosystem.", "ecosystem.")}</span>
                </h2>
              </div>
              <p className="max-w-xl text-[0.98rem] leading-[1.75] text-brand-muted md:justify-self-end md:text-base md:leading-[1.85]">
                {tx(
                  "Die Homepage zeigt die Angebotswelt bewusst als Orientierung. Die tieferen Entscheidungen entstehen auf den Angebotsseiten und im Clarity Call.",
                  "The homepage presents the range of offers as orientation. Deeper decisions happen on the offer pages and in the Clarity Call.",
                )}
              </p>
            </div>

            <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-2">
              <motion.a
                href={`${localizedPage("/instant-success-formula")}?from=angebote`}
                whileHover={{ y: -8 }}
                className="group relative overflow-hidden rounded-2xl bg-brand-primary p-7 text-brand-secondary shadow-[0_32px_80px_rgba(3,24,46,0.22)] ring-1 ring-brand-accent/20 transition-shadow duration-500 hover:shadow-[0_40px_90px_rgba(3,24,46,0.3)] sm:p-9 md:rounded-[2rem] md:p-12 lg:col-span-2"
              >
                <div className="absolute right-8 top-8 hidden h-32 w-32 rounded-full border border-brand-accent/35 md:block" aria-hidden="true">
                  <div className="absolute inset-4 rounded-full border border-brand-secondary/12" />
                  <div className="absolute inset-10 rounded-full bg-brand-accent/18" />
                </div>
                <p className="mb-5 font-display text-[10px] font-semibold uppercase tracking-[0.32em] text-brand-accent">
                  Premium Core Offer
                </p>
                <h3 className="max-w-3xl font-serif text-[2rem] leading-[1.08] min-[380px]:text-[2.25rem] md:text-[4rem]">
                  Instant Success Formula
                </h3>
                <p className="mt-6 max-w-2xl text-[0.98rem] leading-[1.75] text-brand-secondary/78 md:mt-7 md:text-lg md:leading-[1.85]">
                  {tx(
                    "Die tiefe 1:1 Transformation für Identität, emotionale Klarheit und Erfolg als natürlichen Standard.",
                    "Deep one-to-one transformation for identity, emotional clarity, and success as a natural standard.",
                  )}
                </p>
                <span className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full bg-brand-secondary px-5 py-3 text-center text-sm font-medium text-brand-primary transition duration-500 group-hover:bg-brand-ivory sm:w-fit sm:px-6 md:mt-10">
                  {tx("Instant Success Formula ansehen", "Explore the Instant Success Formula")}
                  <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
                </span>
              </motion.a>

              {[
                {
                  title: 'ISOBL',
                  subtitle: 'Business Launch',
                  desc: tx('Ein digitales Zusatzgeschäft, das sich sinnvoll in dein bestehendes Business integriert.', 'A digital additional business that integrates meaningfully into your existing company.'),
                  href: `${localizedPage('/isobl')}?from=angebote`,
                  cta: tx('ISOBL ansehen', 'Explore ISOBL')
                },
                {
                  title: 'ISA Alliance',
                  subtitle: 'Community & Growth',
                  desc: tx('Ein ruhiger, klarer Raum für Wachstum, Austausch und neue strategische Verbindung.', 'A calm, focused space for growth, exchange, and new strategic connections.'),
                  href: 'https://whop.com/quantum-lifedesign-lab/isa-instant-success-alliance-17/',
                  cta: tx('Zugang vormerken', 'Get access')
                },
                {
                  title: 'Quantum Lifedesign Lab',
                  subtitle: 'Future Academy',
                  desc: tx('Die langfristige Plattform für Lernpfade, Community, AI-Tools und zukunftsorientierte Entwicklung.', 'The long-term platform for learning paths, community, AI tools, and future-focused development.'),
                  href: 'https://whop.com/quantum-lifedesign-lab',
                  cta: tx('Future Vision ansehen', 'Explore the future vision')
                },
                {
                  title: 'Future Vision',
                  subtitle: 'AI-ready Intelligence',
                  desc: tx('Hormonelle Intelligenz, personalisierte Systeme und eine Academy-Struktur als behutsame Zukunftsebene.', 'Hormonal intelligence, personalized systems, and an academy structure as a carefully developed future layer.'),
                  href: `${localizedPage('/method')}?from=angebote`,
                  cta: tx('Methode verstehen', 'Understand the method')
                }
              ].map((item) => (
                <motion.a
                  key={item.title}
                  href={item.href}
                  whileHover={{ y: -6 }}
                  className="group flex min-h-[240px] flex-col rounded-2xl border border-brand-brass/18 bg-brand-ivory/72 p-7 shadow-[0_24px_70px_rgba(16,15,15,0.06)] transition duration-500 hover:border-brand-accent/45 hover:bg-brand-ivory md:min-h-[300px] md:rounded-[1.75rem] md:p-10"
                >
                  <p className="mb-4 font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-accent">
                    {item.subtitle}
                  </p>
                  <h3 className="font-serif text-3xl leading-tight text-brand-primary md:text-[2.4rem]">
                    {item.title}
                  </h3>
                  <p className="mt-5 flex-1 text-base leading-[1.75] text-brand-muted">
                    {item.desc}
                  </p>
                  <span className="mt-8 inline-flex w-fit items-center gap-2 border-b border-brand-primary/20 pb-1 text-sm font-medium text-brand-primary transition duration-300 group-hover:border-brand-accent group-hover:text-brand-muted">
                    {item.cta}
                    <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* Section 10: Leadmagnet */}
        <section id="kontakt" className="relative overflow-hidden bg-brand-secondary py-20 sm:py-28 md:py-32">
          <div className="absolute inset-0 z-0">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-accent/5 rounded-full blur-[100px]" />
          </div>
          
          <div className="container relative z-10 mx-auto max-w-4xl px-5 sm:px-6">
            <div className="rounded-2xl border border-brand-brass/18 bg-brand-ivory/80 p-6 text-center shadow-[0_24px_70px_rgba(16,15,15,0.08)] backdrop-blur-xl sm:p-10 md:rounded-[2.25rem] md:p-20">
              <h2 className="mb-5 font-serif text-[2rem] leading-tight text-brand-primary min-[380px]:text-4xl md:mb-6 md:text-5xl">
                {tx("Der erste Schritt ist ", "The first step is ")}
                <span className="italic font-light text-brand-primary/58">{tx("Klarheit.", "clarity.")}</span>
              </h2>
              <p className="mx-auto mb-9 max-w-2xl text-base leading-[1.7] text-brand-muted md:mb-12 md:text-lg md:leading-[1.75]">
                {tx("Sichere dir das ", "Get the ")}
                <strong>Instant Success Framework</strong>
                {tx(
                  " und erkenne, welches innere Muster deinen nächsten Schritt noch bindet.",
                  " and discover which inner pattern is still holding back your next step.",
                )}
              </p>
              
              <form action={isEn ? "https://whop.com/quantum-lifedesign-lab/instant-success-formula-english-edition/" : "https://whop.com/quantum-lifedesign-lab/instant-success-formula-deutsche-ausgabe/"} className="mx-auto flex max-w-md flex-col gap-3 md:flex-row md:gap-4">
                <label className="sr-only" htmlFor="lead-email">
                  {tx("E-Mail-Adresse", "Email address")}
                </label>
                <input 
                  id="lead-email"
                  name="email"
                  type="email" 
                  autoComplete="email"
                  spellCheck={false}
                  suppressHydrationWarning
                  placeholder={tx("z. B. heike@example.com…", "e.g. heike@example.com…")}
                  className="min-w-0 flex-grow rounded-full border border-brand-muted/20 bg-brand-secondary px-6 py-4 text-base text-brand-primary outline-none transition focus:border-brand-accent focus:shadow-[0_0_0_4px_rgba(212,175,55,0.12)] md:px-7"
                />
                <button type="submit" className="rounded-full border border-brand-primary bg-brand-primary px-8 py-4 font-medium text-brand-secondary transition-colors duration-500 hover:border-brand-accent hover:bg-brand-shadow active:translate-y-px">
                  {tx("Erhalten", "Get access")}
                </button>
              </form>
              <p className="mt-6 text-xs text-brand-muted font-display tracking-wide uppercase">
                {lang === "de"
                  ? "Klare Entscheidungen treffen, schneller handeln: Kostenloses Training."
                  : "Overthinking Solutions, Mind Calming, and Decision-Making Success Training. Free course."}
              </p>
            </div>
          </div>
        </section>

        {isEn ? blogSectionEn : blogSectionDe}

        {/* Section 11: Final CTA */}
        <section className="relative overflow-hidden bg-brand-primary py-24 sm:py-32 md:py-40">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1]
            }} 
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-brand-accent/20 rounded-full blur-[150px]" 
          />
          
          <div className="container relative z-10 mx-auto max-w-4xl px-5 text-center sm:px-6">
            <h2 className="mb-6 font-serif text-[2.15rem] leading-tight text-white min-[380px]:text-4xl md:mb-8 md:text-7xl">
              {tx("Bereit, Erfolg nicht länger", "Ready to stop forcing")} <br />{" "}
              <span className="italic font-light">{tx("zu erzwingen?", "success?")}</span>
            </h2>
            <p className="mb-9 text-base leading-relaxed text-white/60 md:mb-12 md:text-xl">
              {tx(
                "Wenn du spürst, dass dein nächstes Wachstum nicht mehr über Druck entstehen soll, ist der Clarity Call dein nächster Schritt.",
                "If you sense that your next chapter of growth should no longer come through pressure, the Clarity Call is your next step.",
              )}
            </p>
            <a href="https://cal.com/heikeziegler/clarity-call" target="_blank" rel="noopener noreferrer" className="group mx-auto flex w-full max-w-sm items-center justify-center gap-3 rounded-full bg-brand-secondary px-8 py-4 text-base font-medium text-brand-primary shadow-2xl shadow-white/10 transition-[background-color,box-shadow,transform] duration-500 hover:-translate-y-px hover:bg-brand-ivory hover:shadow-white/20 active:translate-y-0 md:w-fit md:px-12 md:py-6 md:text-lg">
              {tx("Clarity Call anfragen", "Request a Clarity Call")}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-500" />
            </a>
          </div>
        </section>
      </main>

      <AiChatWidget locale={lang} />

      {/* Footer */}
      <footer className="border-t border-brand-primary/5 bg-brand-secondary py-14 md:py-20">
        <div className="container mx-auto px-5 sm:px-6">
          <div className="grid md:grid-cols-4 gap-16 md:gap-8 mb-20 text-center md:text-left">
            <div className="md:col-span-1">
              <div className="mb-6 flex items-center justify-center gap-3 md:justify-start">
                <img
                  alt=""
                  className="h-11 w-11 rounded-full object-contain shadow-[0_8px_24px_rgba(16,15,15,0.08)]"
                  width={44}
                  height={44}
                  src="/media/images/msyh-logo.webp"
                />
                <span className="font-display font-bold tracking-tight text-sm uppercase">Make Success Your Habit</span>
              </div>
              <p className="text-brand-muted text-sm leading-relaxed max-w-xs">
                {tx("Premium-Transformationsraum für Identität, Business und Zukunft.", "A premium transformation space for identity, business, and the future.")}
              </p>
            </div>
            
            <div>
              <h5 className="font-display font-bold text-xs uppercase tracking-widest mb-6">{tx("Markenwelt", "Brand world")}</h5>
              <ul className="space-y-4 text-sm text-brand-muted">
                <li><a href={`${localizedPage("/instant-success-formula")}?from=footer`} className="hover:text-brand-primary transition-colors">ISF Instant Success Formula</a></li>
                <li><a href={`${localizedPage("/isobl")}?from=footer`} className="hover:text-brand-primary transition-colors">ISOBL Business Launch</a></li>
                <li><a href={`${localizedPage("/isa-alliance")}?from=footer`} className="hover:text-brand-primary transition-colors">ISA Alliance</a></li>
                <li><a href="/blog" className="hover:text-brand-primary transition-colors">Insights</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-display font-bold text-xs uppercase tracking-widest mb-6">Heike Ziegler</h5>
              <ul className="space-y-4 text-sm text-brand-muted">
                <li><a href="#ueber-heike" className="hover:text-brand-primary transition-colors">{tx("Über mich", "About me")}</a></li>
                <li><a href="#methode" className="hover:text-brand-primary transition-colors">{tx("Methode", "Method")}</a></li>
                <li><a href={isEn ? "https://whop.com/quantum-lifedesign-lab/instant-success-formula-english-edition/" : "https://whop.com/quantum-lifedesign-lab/instant-success-formula-deutsche-ausgabe/"} target="_blank" rel="noreferrer" className="hover:text-brand-primary transition-colors">ISF FREE Training</a></li>
                <li><a href="https://cal.com/heikeziegler/book-your-first-instant-success-formula-session" target="_blank" rel="noreferrer" className="hover:text-brand-primary transition-colors">{tx("Erste ISF Session buchen", "Book your first ISF Session")}</a></li>
                <li><a href="https://cal.com/heikeziegler/application-instant-success-online-business-launch" target="_blank" rel="noreferrer" className="hover:text-brand-primary transition-colors">{tx("Für ISOBL bewerben", "Apply to IS Online Business Launch")}</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-display font-bold text-xs uppercase tracking-widest mb-6">Connect</h5>
              <ul className="space-y-4 text-sm text-brand-muted">
                <li><a href="https://www.linkedin.com/in/heikezieglerhzh/" target="_blank" rel="noreferrer" className="hover:text-brand-primary transition-colors">LinkedIn</a></li>
                <li><a href="https://www.instagram.com/heikeziegler_isa/" target="_blank" rel="noreferrer" className="hover:text-brand-primary transition-colors">Instagram</a></li>
                <li><a href="https://www.youtube.com/watch?v=hKct4thY7Yc" target="_blank" rel="noreferrer" className="hover:text-brand-primary transition-colors">Podcast</a></li>
                <li><a href="/blog" className="hover:text-brand-primary transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-between gap-6 border-t border-brand-primary/5 pt-10 md:flex-row">
            <p className="text-xs text-brand-muted">© {new Date().getFullYear()} Heike Ziegler – Make Success Your Habit. {tx("Alle Rechte vorbehalten.", "All rights reserved.")}</p>
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium text-brand-muted">
              <a className="transition-colors hover:text-brand-primary" href="/legal/impressum">{tx("Impressum", "Legal notice")}</a>
              <a className="transition-colors hover:text-brand-primary" href="/legal/datenschutz">{tx("Datenschutz", "Privacy")}</a>
              <a className="transition-colors hover:text-brand-primary" href="/legal/agb">{tx("AGB", "Terms")}</a>
              <a className="transition-colors hover:text-brand-primary" href="/legal/nutzungsbedingungen">{tx("Nutzungsbedingungen", "Terms of use")}</a>
              <a className="transition-colors hover:text-brand-primary" href="/legal/eula">EULA</a>
              <a className="transition-colors hover:text-brand-primary" href="/legal/widerruf">{tx("Widerruf", "Refund policy")}</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
