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

const navItems = [
  {label: "Start", href: "#start"},
  {label: "Method", href: "#methode"},
  {label: "Services", href: "#angebote"},
  {label: "About Heike", href: "#ueber-heike"},
  {label: "Insights", href: "#insights"},
  {label: "Community", href: "#community"},
];

type SiteLang = "de" | "en";

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
}: {
  lang: SiteLang;
  onChange: (lang: SiteLang) => void;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center rounded-full border border-brand-primary/10 bg-white/70 p-1 backdrop-blur-sm ${className}`}
      role="group"
      aria-label="Sprache wählen"
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

export default function App({blogSection}: {blogSection?: ReactNode}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState<SiteLang>("de");
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("site-lang");
    if (stored === "de" || stored === "en") {
      setLang(stored);
      document.documentElement.lang = stored;
    }
  }, []);

  function selectLang(next: SiteLang) {
    setLang(next);
    window.localStorage.setItem("site-lang", next);
    document.documentElement.lang = next;
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
        Zum Inhalt springen
      </a>
      {/* Navigation */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,box-shadow,padding,backdrop-filter] duration-300 ${
          scrolled ? 'bg-brand-secondary/92 backdrop-blur-md py-4 shadow-[0_16px_50px_rgba(3,24,46,0.08)]' : 'bg-transparent py-6'
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <a className="flex items-center gap-3" href="#start" aria-label="Make Success Your Habit Startseite">
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
            <LanguageToggle lang={lang} onChange={selectLang} />
            <a href="#kontakt" className="rounded-full border border-brand-primary bg-brand-primary px-6 py-2.5 text-sm font-medium text-brand-secondary shadow-[0_12px_28px_rgba(3,24,46,0.16)] transition-[background-color,border-color,transform] duration-500 hover:-translate-y-px hover:bg-brand-shadow hover:border-brand-accent active:translate-y-0">
              Clarity Call
            </a>
          </nav>

          <button className="lg:hidden text-brand-primary" onClick={() => setIsMenuOpen(!isMenuOpen)}>
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
            <LanguageToggle lang={lang} onChange={selectLang} className="mt-8 self-start" />
            <a href="#kontakt" onClick={() => setIsMenuOpen(false)} className="mt-12 rounded-full bg-brand-primary py-4 text-center font-medium text-brand-secondary transition-colors duration-500 hover:bg-brand-shadow">
              Clarity Call anfragen
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
                Become the Woman Who{' '}
                <span className="italic font-light text-brand-primary/62">
                  Succeeds by Default.
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
              Für ambitionierte Unternehmerinnen und Coaches, die Erfolg als natürliche Gewohnheit verkörpern.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.68, ease: [0.32, 0.72, 0, 1] }}
              className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-start"
            >
              {/* Primary — Button-in-Button architecture */}
              <a href="#kontakt" className="group flex items-center justify-between rounded-full border border-brand-primary bg-brand-primary py-1.5 pl-6 pr-1.5 text-sm font-medium text-brand-secondary shadow-[0_12px_28px_rgba(3,24,46,0.16)] transition-[background-color,border-color,transform] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-px hover:border-brand-accent hover:bg-brand-shadow active:translate-y-0 sm:justify-start">
                <span className="pr-4 tracking-wide">Clarity Call anfragen</span>
                <span className="w-8 h-8 rounded-full bg-white/12 flex items-center justify-center transition-[background-color,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-brand-accent group-hover:translate-x-0.5 group-hover:-translate-y-px">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </a>

              {/* Secondary */}
              <a href="/instant-success-formula?from=start" className="group flex items-center justify-center gap-2 rounded-full border border-brand-primary/18 bg-brand-secondary/70 px-6 py-[0.82rem] text-sm font-medium text-brand-primary backdrop-blur-sm transition-[background-color,border-color,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-brand-accent/60 hover:bg-brand-ivory active:scale-[0.98] sm:justify-start">
                Instant Success Formula ansehen
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
                Vielleicht brauchst du keine neue Strategie. <br />
                Vielleicht brauchst du eine neue <span className="italic">innere Grundlage</span> für Erfolg.
              </motion.h2>
              <motion.div variants={fadeIn} className="space-y-5 text-base leading-relaxed text-brand-muted md:space-y-6 md:text-lg">
                <p>
                  Du hast Erfahrung, Fähigkeiten und eine Vision. Und trotzdem spürst du, dass etwas innen noch nicht vollständig mit deinem nächsten Level übereinstimmt.
                </p>
                <p>
                  Sichtbarkeit fühlt sich schwer an. Entscheidungen kosten Energie. Kundengewinnung ist nicht so klar, wie sie sein könnte.
                </p>
                <p className="pt-3 font-display text-lg font-medium text-brand-primary md:pt-4 md:text-xl">
                  Genau hier beginnt Make Success Your Habit.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Section 3: Markenphilosophie — full image, no crop (text is baked into asset) */}
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
                The Philosophy of Aligned Success
              </p>
              <h2 className="font-serif text-[2.7rem] leading-[0.98] text-brand-primary min-[380px]:text-[3rem]">
                Success is a <span className="italic font-light text-brand-primary/62">habit.</span>
              </h2>
              <p className="mt-6 text-[0.95rem] leading-[1.72] text-brand-primary/72">
                Erfolg wird stabil, wenn du ihn aus Identität, emotionaler Klarheit und strategischer Führung verkörperst.
              </p>
            </div>
          </div>
        </section>

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
                  Eine Methode, die dich nicht nur informiert, sondern innerlich neu ausrichtet — damit Erfolg nicht länger mit Druck verbunden ist, sondern mit Klarheit, Identität und bewusster Führung.
                </p>
              </motion.div>

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:items-center xl:gap-6">
                {[
                  {
                    id: 'see',
                    step: '01',
                    title: 'SEE',
                    desc: 'Erkenne unbewusste Muster, innere Grenzen und emotionale Dynamiken.',
                    result: 'Klarheit',
                    className: 'bg-white/78 text-brand-primary lg:min-h-[510px] lg:translate-y-8'
                  },
                  {
                    id: 'clear',
                    step: '02',
                    title: 'CLEAR',
                    desc: 'Löse emotionale Widerstände, innere Anspannung und Selbstsabotage.',
                    result: 'Freiheit',
                    className: 'bg-white/96 text-brand-primary shadow-2xl shadow-brand-primary/35 ring-1 ring-brand-accent/70 md:row-span-2 lg:row-span-1 lg:min-h-[570px] lg:-translate-y-4'
                  },
                  {
                    id: 'become',
                    step: '03',
                    title: 'BECOME',
                    desc: 'Verkörpere eine neue Erfolgsidentität, aus der du sichtbar wirst.',
                    result: 'Identität',
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
                      alt="Heike Ziegler – Transformationsmentorin für Unternehmerinnen"
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
                      Klarheit ist keine Pause.
                      <br />
                      <span className="italic font-light text-white/60">Sie ist Führung.</span>
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
                    Für wen
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
                  Für Frauen, die Erfolg nicht länger
                  <br className="hidden md:block" /> erzwingen wollen —
                  <br />
                  <span className="italic font-light text-brand-primary/50">
                    sondern ihn verkörpern.
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
                  Für Unternehmerinnen, Coaches, Consultants, Therapeutinnen
                  und Expertinnen, die spüren: Mehr Strategie allein reicht nicht,
                  wenn die{' '}
                  <span className="text-brand-primary font-normal">innere Ausrichtung</span>{' '}
                  nicht mitzieht.
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
                    { num: '01', label: 'Sichtbarkeit ohne Verbiegen' },
                    { num: '02', label: 'Kundengewinnung mit Klarheit' },
                    { num: '03', label: 'Wachstum ohne Daueranspannung' },
                    { num: '04', label: 'Entscheidungen aus Identität' },
                    { num: '05', label: 'Führung aus innerer Stabilität' },
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
                <span className="font-display text-[9px] font-semibold uppercase tracking-[0.36em] text-brand-accent/70">Ergebnisse</span>
                <div className="w-8 h-px bg-brand-accent/50" />
              </div>
              <h2 className="mx-auto mb-6 max-w-3xl font-serif text-[2.05rem] leading-[1.1] text-white min-[380px]:text-[2.35rem] md:mb-8 md:text-[3.4rem] lg:text-[4rem]">
                Was entsteht, wenn Erfolg zu deinem{' '}
                <span className="italic font-light text-white/55">inneren Standard</span> wird.
              </h2>
              <p className="mx-auto max-w-xl text-[0.98rem] leading-[1.75] text-white/72 md:text-base md:leading-[1.9]">
                Ruhiger. Klarer. Stabiler. Wachstum aus einer Identität, die Erfolg halten kann.
              </p>
            </motion.div>

            {/* 4 Large Outcome Cards — 2×2 grid */}
            <div className="mb-4 grid gap-4 md:grid-cols-2">
              {[
                {
                  num: '01',
                  title: 'Emotionale Klarheit',
                  body: 'Du erkennst schneller, was dich innerlich bewegt — und triffst Entscheidungen nicht mehr aus Druck, sondern aus Ruhe und Bewusstsein.'
                },
                {
                  num: '02',
                  title: 'Stärkere Selbstführung',
                  body: 'Du führst dich klarer durch Wachstum, Sichtbarkeit und Veränderung — ohne dich in alten Mustern zu verlieren.'
                },
                {
                  num: '03',
                  title: 'Sichtbare Autorität',
                  body: 'Du zeigst dich präsenter, klarer und souveräner, weil deine Positionierung nicht nur strategisch, sondern innerlich getragen ist.'
                },
                {
                  num: '04',
                  title: 'Wachstum ohne Hustle',
                  body: 'Dein Business darf wachsen, ohne dass du dich ständig überforderst, beweist oder gegen dich selbst arbeitest.'
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
                'Klarere Entscheidungen',
                'Magnetischere Kundengewinnung',
                'Mehr Energie',
                'Freiheit & Präsenz'
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

        {/* Section 6.5: Testimonials — Editorial Proof */}
        <section
          id="community"
          className="overflow-hidden py-20 sm:py-28 md:py-44"
          style={{ background: 'linear-gradient(180deg, #F9F4E7 0%, #FBF8F1 100%)' }}
        >
          <div className="container mx-auto max-w-6xl px-5 sm:px-6">

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="mb-12 max-w-2xl md:mb-20"
            >
              <div className="mb-6 flex items-center gap-3 md:mb-7">
                <div className="w-6 h-px bg-brand-accent" />
                <span className="font-display font-semibold text-[9px] uppercase tracking-[0.36em] text-brand-accent">
                  Kundinnenstimmen
                </span>
              </div>
              <h2 className="mb-5 font-serif text-[2rem] leading-[1.12] text-brand-primary min-[380px]:text-[2.2rem] md:mb-6 md:text-[3rem] lg:text-[3.4rem]">
                Was Kundinnen erleben,
                <br />
                <span className="italic font-light text-brand-primary/55">wenn Erfolg leichter wird.</span>
              </h2>
              <p className="max-w-md text-[0.9rem] font-light leading-[1.75] text-brand-muted md:leading-[1.85]">
                Nicht lauter. Nicht härter. Sondern klarer, stabiler
                und mehr aus sich selbst heraus.
              </p>
            </motion.div>

            {/* Grid: 1 featured + 2 stacked */}
            <div className="grid items-start gap-4 lg:grid-cols-[3fr_2fr] lg:gap-5">

              {/* Featured Testimonial */}
              <motion.div
                initial={{ opacity: 0, y: 44, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex flex-col rounded-2xl p-7 sm:p-10 md:rounded-[2.25rem] md:p-16"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(3,24,46,0.08)',
                  boxShadow: '0 30px 80px rgba(3,24,46,0.06)'
                }}
              >
                {/* Decorative quote mark */}
                <div
                  className="font-serif leading-none select-none pointer-events-none mb-4"
                  style={{ fontSize: 'clamp(4.5rem, 20vw, 7rem)', color: 'rgba(196,164,132,0.13)', lineHeight: 1 }}
                  aria-hidden="true"
                >
                  "
                </div>

                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-9 flex-1 font-serif text-[1.08rem] font-light leading-[1.65] text-brand-primary md:mb-12 md:text-[1.45rem] md:leading-[1.72]"
                >
                  Die Arbeit mit Heike hat nicht nur mein Business verändert,
                  sondern meine Art, mich selbst zu führen. Ich erreiche heute mehr —
                  aber ohne den ständigen inneren Druck von früher.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.45 }}
                >
                  <div className="w-8 h-px bg-brand-accent mb-5" />
                  <p className="font-display font-medium text-brand-primary text-sm tracking-wide">Sarah K.</p>
                  <p className="font-display text-[9px] uppercase tracking-[0.28em] text-brand-accent mt-1.5">Mentorin & Coach</p>
                </motion.div>
              </motion.div>

              {/* Two smaller cards */}
              <div className="flex flex-col gap-4 lg:gap-5">
                {[
                  {
                    quote: 'Endlich habe ich verstanden, dass magnetische Kundengewinnung nicht mit noch mehr Strategie beginnt, sondern mit innerer Klarheit. Das war für mich ein entscheidender Wendepunkt.',
                    name: 'Julia M.',
                    role: 'Unternehmerin',
                    delay: 0.14
                  },
                  {
                    quote: 'Ich dachte lange, ich müsste härter arbeiten, um weiter zu wachsen. Heute verstehe ich, wie sich nachhaltiger Erfolg ruhiger, klarer und natürlicher anfühlen kann.',
                    name: 'Elena R.',
                    role: 'Consultant',
                    delay: 0.26
                  }
                ].map((t, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 36, scale: 0.97 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 1, delay: t.delay, ease: [0.16, 1, 0.3, 1] }}
                    className="relative flex flex-col rounded-2xl p-7 md:rounded-[1.75rem] md:p-9"
                    style={{
                      background: 'rgba(255,255,255,0.72)',
                      border: '1px solid rgba(3,24,46,0.08)',
                    }}
                  >
                    <div
                      className="font-serif leading-none select-none pointer-events-none mb-3"
                      style={{ fontSize: '3.5rem', color: 'rgba(196,164,132,0.15)', lineHeight: 1 }}
                      aria-hidden="true"
                    >
                      "
                    </div>
                    <p className="mb-7 flex-1 font-serif text-[0.98rem] font-light leading-[1.7] text-brand-primary/80 md:mb-8 md:text-[1.05rem] md:leading-[1.75]">
                      {t.quote}
                    </p>
                    <div>
                      <div className="w-5 h-px bg-brand-accent/60 mb-4" />
                      <p className="font-display font-medium text-brand-primary text-xs tracking-wide">{t.name}</p>
                      <p className="font-display text-[8px] uppercase tracking-[0.26em] text-brand-accent mt-1">{t.role}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

            </div>
          </div>
        </section>

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
                      alt="Heike Ziegler – Identitätsarbeit & Business-Führung"
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
                    Über Heike
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
                  Heike Ziegler verbindet
                  <br />Identitätsarbeit mit{' '}
                  <span className="italic font-light text-brand-primary/60">
                    klarer Business-Führung.
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
                    Ihre Arbeit richtet sich an ambitionierte Frauen, die Erfolg nicht länger aus Druck, Überforderung oder Selbstzweifel heraus aufbauen wollen — sondern aus innerer Klarheit, Identität und bewusster Führung.
                  </p>
                  <p>
                    Sie verbindet emotionale Präzision, transformative Prozessarbeit und strategische Ausrichtung zu einer Form von Wachstum, die nicht nur inspiriert, sondern nachhaltig verändert.
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
                      title: 'Emotionale Klarheit statt Daueranspannung.',
                      body: 'Wachstum beginnt dort, wo innere Ausrichtung und äußere Entscheidungen zusammenkommen.'
                    },
                    {
                      num: '02',
                      title: 'Identitätsarbeit statt kurzfristiger Motivation.',
                      body: 'Es geht nicht um Impulse auf Zeit, sondern um echte, verkörperte Veränderung.'
                    },
                    {
                      num: '03',
                      title: 'Strategisches Wachstum aus Selbstführung.',
                      body: 'Ein Raum, in dem Frauen sich neu führen, klarer entscheiden und nachhaltiger wachsen.'
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
                  <a href="#kontakt" className="group flex items-center justify-between rounded-full border border-brand-primary bg-brand-primary py-1.5 pl-6 pr-1.5 text-sm font-medium text-brand-secondary shadow-lg shadow-brand-primary/20 transition-[background-color,border-color,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-px hover:border-brand-accent hover:bg-brand-shadow active:translate-y-0 sm:justify-start">
                    <span className="pr-4 tracking-wide">Clarity Call buchen</span>
                    <span className="w-8 h-8 rounded-full bg-white/12 flex items-center justify-center transition-[background-color,transform] duration-500 group-hover:bg-brand-accent group-hover:translate-x-0.5">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </a>
                  <a href="/about-heike?from=ueber-heike" className="text-brand-primary text-sm font-medium py-3 flex items-center gap-1.5 border-b border-brand-primary/20 transition-[border-color,color] duration-300 hover:border-brand-accent hover:text-brand-accent group">
                    Mehr über Heike
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
                  Für Frauen, die Erfolg neu führen wollen.
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
                  Die Wege in Heikes <span className="italic font-light text-brand-primary/58">Ökosystem.</span>
                </h2>
              </div>
              <p className="max-w-xl text-[0.98rem] leading-[1.75] text-brand-muted md:justify-self-end md:text-base md:leading-[1.85]">
                Die Homepage zeigt die Angebotswelt bewusst als Orientierung. Die tieferen Entscheidungen entstehen auf den Angebotsseiten und im Clarity Call.
              </p>
            </div>

            <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-2">
              <motion.a
                href="/instant-success-formula?from=angebote"
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
                  Die tiefe 1:1 Transformation für Identität, emotionale Klarheit und Erfolg als natürlichen Standard.
                </p>
                <span className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full bg-brand-secondary px-5 py-3 text-center text-sm font-medium text-brand-primary transition duration-500 group-hover:bg-brand-ivory sm:w-fit sm:px-6 md:mt-10">
                  Instant Success Formula ansehen
                  <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
                </span>
              </motion.a>

              {[
                {
                  title: 'ISOBL',
                  subtitle: 'Business Launch',
                  desc: 'Ein digitales Zusatzgeschäft, das sich sinnvoll in dein bestehendes Business integriert.',
                  href: '/isobl?from=angebote',
                  cta: 'ISOBL ansehen'
                },
                {
                  title: 'ISA Alliance',
                  subtitle: 'Community & Growth',
                  desc: 'Ein ruhiger, klarer Raum für Wachstum, Austausch und neue strategische Verbindung.',
                  href: '/isa-alliance?from=angebote',
                  cta: 'Community ansehen'
                },
                {
                  title: 'Quantum Lifedesign Lab',
                  subtitle: 'Future Academy',
                  desc: 'Die langfristige Plattform für Lernpfade, Community, AI-Tools und zukunftsorientierte Entwicklung.',
                  href: '/community?from=angebote',
                  cta: 'Future Vision ansehen'
                },
                {
                  title: 'Future Vision',
                  subtitle: 'AI-ready Intelligence',
                  desc: 'Hormonelle Intelligenz, personalisierte Systeme und eine Academy-Struktur als behutsame Zukunftsebene.',
                  href: '/method?from=angebote',
                  cta: 'Methode verstehen'
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
                Der erste Schritt ist <span className="italic font-light text-brand-primary/58">Klarheit.</span>
              </h2>
              <p className="mx-auto mb-9 max-w-2xl text-base leading-[1.7] text-brand-muted md:mb-12 md:text-lg md:leading-[1.75]">
                Sichere dir das <strong>Instant Success Framework</strong> und erkenne, welches innere Muster deinen nächsten Schritt noch bindet.
              </p>
              
              <form className="mx-auto flex max-w-md flex-col gap-3 md:flex-row md:gap-4">
                <label className="sr-only" htmlFor="lead-email">
                  E-Mail Adresse
                </label>
                <input 
                  id="lead-email"
                  name="email"
                  type="email" 
                  autoComplete="email"
                  spellCheck={false}
                  placeholder="z. B. heike@example.com…"
                  className="min-w-0 flex-grow rounded-full border border-brand-muted/20 bg-brand-secondary px-6 py-4 text-base text-brand-primary outline-none transition focus:border-brand-accent focus:shadow-[0_0_0_4px_rgba(212,175,55,0.12)] md:px-7"
                />
                <button type="submit" className="rounded-full border border-brand-primary bg-brand-primary px-8 py-4 font-medium text-brand-secondary transition-colors duration-500 hover:border-brand-accent hover:bg-brand-shadow active:translate-y-px">
                  Erhalten
                </button>
              </form>
              <p className="mt-6 text-xs text-brand-muted font-display tracking-wide uppercase">Kostenfreies PDF & Video-Impuls</p>
            </div>
          </div>
        </section>

        {blogSection}

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
              Bereit, Erfolg nicht länger <br /> <span className="italic font-light">zu erzwingen?</span>
            </h2>
            <p className="mb-9 text-base leading-relaxed text-white/60 md:mb-12 md:text-xl">
              Wenn du spürst, dass dein nächstes Wachstum nicht mehr über Druck entstehen soll, ist der Clarity Call dein nächster Schritt.
            </p>
            <a href="#kontakt" className="group mx-auto flex w-full max-w-sm items-center justify-center gap-3 rounded-full bg-brand-secondary px-8 py-4 text-base font-medium text-brand-primary shadow-2xl shadow-white/10 transition-[background-color,box-shadow,transform] duration-500 hover:-translate-y-px hover:bg-brand-ivory hover:shadow-white/20 active:translate-y-0 md:w-fit md:px-12 md:py-6 md:text-lg">
              Clarity Call anfragen
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-500" />
            </a>
          </div>
        </section>
      </main>

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
                Premium-Transformationsraum für Identität, Business und Zukunft.
              </p>
            </div>
            
            <div>
              <h5 className="font-display font-bold text-xs uppercase tracking-widest mb-6">Markenwelt</h5>
              <ul className="space-y-4 text-sm text-brand-muted">
                <li><a href="#angebote" className="hover:text-brand-primary transition-colors">Instant Success Formula</a></li>
                <li><a href="#angebote" className="hover:text-brand-primary transition-colors">Business Launch</a></li>
                <li><a href="#community" className="hover:text-brand-primary transition-colors">ISA Alliance</a></li>
                <li><a href="/blog" className="hover:text-brand-primary transition-colors">Insights</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-display font-bold text-xs uppercase tracking-widest mb-6">Heike Ziegler</h5>
              <ul className="space-y-4 text-sm text-brand-muted">
                <li><a href="#ueber-heike" className="hover:text-brand-primary transition-colors">Über mich</a></li>
                <li><a href="#methode" className="hover:text-brand-primary transition-colors">Methode</a></li>
                <li><a href="#kontakt" className="hover:text-brand-primary transition-colors">Kontakt</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-display font-bold text-xs uppercase tracking-widest mb-6">Connect</h5>
              <ul className="space-y-4 text-sm text-brand-muted">
                <li><a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="hover:text-brand-primary transition-colors">Instagram</a></li>
                <li><a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" className="hover:text-brand-primary transition-colors">LinkedIn</a></li>
                <li><a href="#insights" className="hover:text-brand-primary transition-colors">Podcast</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-between gap-6 border-t border-brand-primary/5 pt-10 md:flex-row">
            <p className="text-xs text-brand-muted">© {new Date().getFullYear()} Heike Ziegler – Make Success Your Habit. Alle Rechte vorbehalten.</p>
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium text-brand-muted">
              <a className="transition-colors hover:text-brand-primary" href="/legal/impressum">Impressum</a>
              <a className="transition-colors hover:text-brand-primary" href="/legal/datenschutz">Datenschutz</a>
              <a className="transition-colors hover:text-brand-primary" href="/legal/agb">AGB</a>
              <a className="transition-colors hover:text-brand-primary" href="/legal/nutzungsbedingungen">Nutzungsbedingungen</a>
              <a className="transition-colors hover:text-brand-primary" href="/legal/eula">EULA</a>
              <a className="transition-colors hover:text-brand-primary" href="/legal/widerruf">Widerruf</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
