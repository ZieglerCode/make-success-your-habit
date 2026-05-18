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
  {label: "Methode", href: "#methode"},
  {label: "Angebote", href: "#angebote"},
  {label: "Über Heike", href: "#ueber-heike"},
  {label: "Insights", href: "#insights"},
  {label: "Community", href: "#community"},
];

export default function App({blogSection}: {blogSection?: ReactNode}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

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
    <div className="min-h-screen overflow-x-hidden bg-white selection:bg-brand-accent/30">
      {/* Navigation */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-brand-secondary/90 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-6'
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <a className="flex items-center gap-3" href="#start" aria-label="Make Success Your Habit Startseite">
            <img
              alt=""
              className="h-10 w-10 rounded-full object-contain shadow-[0_8px_24px_rgba(16,15,15,0.08)]"
              src="/media/images/msyh-logo.webp"
            />
            <span className="font-display font-bold tracking-tight text-lg uppercase">Make Success Your Habit</span>
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
            <a href="#kontakt" className="bg-brand-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-500 hover:bg-brand-primary/90 hover:scale-[1.02] shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/30">
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
            <a href="#kontakt" onClick={() => setIsMenuOpen(false)} className="bg-brand-primary text-white mt-12 py-4 rounded-xl font-bold text-center transition-all duration-500 hover:bg-brand-primary/90 hover:scale-[1.02]">
              Clarity Call anfragen
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* Section 1: Hero */}
        <section id="start" ref={heroRef} className="relative left-1/2 w-screen -translate-x-1/2 min-h-[100dvh] flex items-center overflow-hidden bg-white">
          {/* Video Background */}
          <video
            ref={videoRef}
            src="/media/videos/hero-image-new.mp4"
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover object-[68%_50%]"
          />

          {/* Angled editorial gradient — lighter, more video visible */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(108deg, rgba(249,248,246,0.92) 12%, rgba(249,248,246,0.5) 35%, rgba(249,248,246,0.04) 55%, transparent 70%)' }}
          />
          {/* Top vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-secondary/20 via-transparent to-transparent" />
          {/* Bottom vignette */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-brand-secondary/50 to-transparent" />
          {/* Main Content */}
          <div className="relative z-10 w-full container mx-auto px-6 pt-32 pb-24">

            {/* Eyebrow pill */}
            <motion.div
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
              className="flex items-center gap-3 mb-10"
            >
              <div className="w-7 h-px bg-brand-accent" />
              <span className="inline-flex items-center bg-brand-accent/12 text-brand-accent px-3.5 py-1.5 rounded-full text-[10px] font-display font-semibold tracking-[0.28em] uppercase">
                The Art of Becoming
              </span>
            </motion.div>

            {/* Headline — left border accent, reduced size for editorial refinement */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.95, delay: 0.12, ease: [0.32, 0.72, 0, 1] }}
              className="pl-5 border-l-[1.5px] border-brand-accent/35 mb-7"
            >
              <h1 className="font-serif text-[2.6rem] md:text-[3.4rem] lg:text-[4rem] xl:text-[4.4rem] text-brand-primary leading-[1.13] max-w-[22rem] md:max-w-[30rem] lg:max-w-[34rem]">
                Success is not<br />something you chase.
                <br />
                <span className="italic font-light text-brand-primary/60 text-[0.88em] leading-[1.25]">
                  It is something<br />you become.
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
              className="text-[0.925rem] text-brand-muted max-w-[22rem] leading-[1.88] mb-11"
            >
              Für ambitionierte Unternehmerinnen und Coaches, die Erfolg nicht länger erzwingen — sondern als natürliche Gewohnheit verkörpern möchten.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.68, ease: [0.32, 0.72, 0, 1] }}
              className="flex flex-col sm:flex-row items-start gap-3"
            >
              {/* Primary — Button-in-Button architecture */}
              <a href="#kontakt" className="group flex items-center bg-brand-primary text-white pl-6 pr-1.5 py-1.5 rounded-full text-sm font-semibold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-brand-primary/90 active:scale-[0.97] shadow-xl shadow-brand-primary/25">
                <span className="pr-4 tracking-wide">Clarity Call anfragen</span>
                <span className="w-8 h-8 rounded-full bg-white/12 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-brand-accent group-hover:translate-x-0.5 group-hover:-translate-y-px">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </a>

              {/* Secondary */}
              <a href="#angebote" className="group flex items-center gap-2 text-brand-primary text-sm font-medium py-[0.82rem] px-6 rounded-full border border-brand-primary/12 bg-white/45 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/70 hover:border-brand-primary/20 active:scale-[0.97]">
                Instant Success Formula
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
        <section className="py-24 bg-white/50 backdrop-blur-sm border-y border-brand-primary/5">
          <div className="container mx-auto px-6 max-w-4xl">
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="text-center"
            >
              <motion.h2 variants={fadeIn} className="font-serif text-3xl md:text-5xl mb-8 leading-tight">
                Vielleicht brauchst du nicht mehr Strategie. <br />
                Vielleicht brauchst du eine neue <span className="italic">innere Grundlage</span> für Erfolg.
              </motion.h2>
              <motion.div variants={fadeIn} className="space-y-6 text-lg text-brand-muted leading-relaxed">
                <p>
                  Du hast Erfahrung, Fähigkeiten und Vision. Und trotzdem spürst du, dass etwas in dir noch nicht vollständig mit deinem nächsten Wachstum übereinstimmt.
                </p>
                <p>
                  Sichtbarkeit fühlt sich schwer an. Entscheidungen kosten Energie. Kundengewinnung ist nicht so klar, wie sie sein könnte.
                </p>
                <p className="font-display font-medium text-brand-primary pt-4 text-xl">
                  Genau hier beginnt Make Success Your Habit.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Section 3: Markenphilosophie */}
        <section id="markenphilosophie" className="relative overflow-hidden bg-[#d8c3a6] text-brand-primary">
          <div
            className="absolute inset-0 bg-cover bg-center md:bg-[center_right]"
            style={{ backgroundImage: "url('/media/images/success-section.png')" }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(249,248,246,0.88)_0%,rgba(249,248,246,0.70)_35%,rgba(249,248,246,0.22)_63%,rgba(26,26,26,0.14)_100%)] md:bg-[linear-gradient(90deg,rgba(249,248,246,0.76)_0%,rgba(249,248,246,0.46)_38%,rgba(249,248,246,0.04)_64%,rgba(26,26,26,0.06)_100%)]" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-brand-primary/20 to-transparent" aria-hidden="true" />

          <div className="container relative mx-auto grid min-h-[760px] items-center gap-12 px-6 py-24 md:grid-cols-[0.92fr_1.08fr] md:py-28 lg:min-h-[820px]">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-120px" }}
              className="max-w-2xl"
            >
              <motion.p variants={fadeIn} className="mb-6 font-display text-xs font-semibold uppercase tracking-[0.34em] text-brand-accent">
                The Philosophy of Aligned Success
              </motion.p>
              <motion.h2 variants={fadeIn} className="font-serif text-5xl leading-[0.98] md:text-7xl lg:text-8xl">
                Success is a <span className="italic">habit</span>.
              </motion.h2>
              <motion.div variants={fadeIn} className="mt-9 max-w-xl space-y-6 text-lg leading-relaxed text-brand-primary/78 md:text-xl">
                <p>
                  Erfolg wird stabil, wenn du ihn nicht länger aus Druck erzeugst -
                  sondern aus Identität, emotionaler Klarheit und strategischer Führung.
                </p>
                <p>
                  Wenn innen und außen übereinstimmen, wird Erfolg nicht mehr gejagt.
                  Er wird zu deinem natürlichen Standard.
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative mx-auto flex aspect-square w-full max-w-[540px] items-center justify-center md:mr-2 md:translate-x-6 md:-translate-y-24 lg:max-w-[640px] lg:translate-x-4 lg:-translate-y-32"
              aria-label="SEE CLEAR BECOME: Identity, Clarity, Action lead to Aligned Success"
            >
              <div className="absolute inset-[7%] rounded-full border border-brand-accent/55" />

              <div className="absolute left-1/2 top-[9%] -translate-x-1/2 text-center">
                <span className="font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-primary/70 md:text-xs">Identity</span>
              </div>
              <div className="absolute right-[5%] top-1/2 -translate-y-1/2 text-right">
                <span className="font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-primary/70 md:text-xs">Clarity</span>
              </div>
              <div className="absolute bottom-[11%] left-[13%]">
                <span className="font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-primary/70 md:text-xs">Action</span>
              </div>

              <div className="relative text-center">
                <p className="mb-4 font-display text-[11px] font-semibold uppercase tracking-[0.36em] text-brand-accent md:text-xs">
                  SEE <span className="mx-2 text-brand-primary/35">→</span> CLEAR <span className="mx-2 text-brand-primary/35">→</span> BECOME
                </p>
                <div className="mx-auto h-px w-24 bg-brand-accent/60" />
                <p className="mt-5 font-serif text-3xl leading-none text-brand-primary md:text-5xl">
                  Aligned<br />Success
                </p>
              </div>
            </motion.div>
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
          <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/96 via-brand-primary/72 to-brand-primary/18" />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/40 via-transparent to-brand-primary/68" />
          <div className="relative z-10 mx-auto max-w-[1440px] px-5 py-24 sm:px-8 md:py-28 lg:px-10 lg:py-34 xl:py-36">
            <div className="grid items-end gap-12 xl:grid-cols-[0.84fr_1.16fr] xl:gap-16">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-120px" }}
                transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-2xl xl:max-w-xl"
              >
                <div className="mb-6 flex items-center gap-4">
                  <motion.span
                    initial={{ scaleX: 0, opacity: 0 }}
                    whileInView={{ scaleX: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-120px" }}
                    transition={{ duration: 1, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                    className="h-px w-8 origin-left bg-brand-accent sm:w-10"
                  />
                  <p className="font-display text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-accent sm:text-[11px] sm:tracking-[0.32em]">
                    SEE → CLEAR → BECOME
                  </p>
                </div>
                <h2 className="max-w-[11ch] font-serif text-[2.65rem] leading-[1.02] sm:text-5xl md:text-6xl lg:text-7xl">
                  The Instant Success Formula
                </h2>
                <p className="mt-7 max-w-2xl text-base leading-[1.85] text-white/78 md:text-lg xl:max-w-lg">
                  Eine Methode, die dich nicht nur informiert, sondern innerlich neu ausrichtet — damit Erfolg nicht länger mit Druck verbunden ist, sondern mit Klarheit, Identität und bewusster Führung.
                </p>
              </motion.div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:items-end xl:gap-5">
                {[
                  {
                    id: 'see',
                    step: '01',
                    title: 'SEE',
                    desc: 'Erkenne die unbewussten Muster, inneren Grenzen und emotionalen Dynamiken, die deinen nächsten Schritt bisher noch zurückhalten.',
                    result: 'Klarheit über das, was im Hintergrund wirkt.',
                    className: 'bg-white/80 text-brand-primary lg:mb-10'
                  },
                  {
                    id: 'clear',
                    step: '02',
                    title: 'CLEAR',
                    desc: 'Löse emotionale Widerstände, innere Anspannung und Selbstsabotage — damit mehr Ruhe, Freiheit und bewusste Ausrichtung entstehen.',
                    result: 'Innere Entlastung und neue Handlungsfreiheit.',
                    className: 'bg-white/95 text-brand-primary shadow-2xl shadow-brand-primary/35 ring-1 ring-brand-accent/55 md:row-span-2 lg:row-span-1 lg:-translate-y-5'
                  },
                  {
                    id: 'become',
                    step: '03',
                    title: 'BECOME',
                    desc: 'Verkörpere eine neue Erfolgsidentität, aus der du sichtbar wirst, klarer entscheidest und nachhaltiger wächst.',
                    result: 'Erfolg als natürlicher Zustand statt als ständiger Kampf.',
                    className: 'bg-[#24211e]/88 text-white ring-1 ring-white/18 md:col-span-2 lg:col-span-1 lg:mb-20'
                  }
                ].map((item, idx) => (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, y: 48 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -10, transition: { duration: 0.45, ease: [0.32, 0.72, 0, 1] } }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 1.1, delay: idx * 0.16, ease: [0.16, 1, 0.3, 1] }}
                    className={`group relative overflow-hidden rounded-lg border border-white/18 p-6 shadow-xl shadow-brand-primary/18 backdrop-blur-md transition-shadow duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-2xl hover:shadow-brand-primary/30 sm:p-7 lg:min-h-[500px] xl:min-h-[540px] ${item.className}`}
                  >
                    {/* Top accent bar — sweeps in after card */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ duration: 1.2, delay: 0.25 + idx * 0.16, ease: [0.16, 1, 0.3, 1] }}
                      className={`absolute left-0 top-0 h-[1.5px] w-full origin-left ${item.id === 'clear' ? 'bg-brand-accent' : item.id === 'become' ? 'bg-white/30' : 'bg-brand-primary/15'}`}
                    />

                    {/* Step + expanding line */}
                    <div className="mb-8 flex items-center justify-between">
                      <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 0.55 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.35 + idx * 0.16 }}
                        className="font-display text-[11px] font-semibold uppercase tracking-[0.26em]"
                      >
                        {item.step}
                      </motion.span>
                      <motion.span
                        initial={{ scaleX: 0, opacity: 0 }}
                        whileInView={{ scaleX: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3 + idx * 0.16, ease: [0.16, 1, 0.3, 1] }}
                        className={`h-px w-10 origin-right transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:w-28 ${item.id === 'become' ? 'bg-brand-accent/60' : 'bg-brand-accent/70'}`}
                      />
                    </div>

                    {/* Title */}
                    <h3 className={`font-serif text-3xl leading-none transition-colors duration-500 sm:text-4xl lg:text-[2.7rem] ${item.id === 'become' ? 'group-hover:text-brand-accent' : 'group-hover:text-brand-primary'}`}>
                      {item.title}
                    </h3>

                    <p className={`mt-6 text-[0.95rem] leading-[1.72] sm:text-base ${item.id === 'become' ? 'text-white/76' : 'text-brand-muted'}`}>
                      {item.desc}
                    </p>

                    <div className={`my-7 h-px w-full transition-all duration-700 group-hover:w-[85%] ${item.id === 'become' ? 'bg-white/16' : 'bg-brand-primary/10'}`} />

                    <p className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-accent">
                      Ergebnis:
                    </p>
                    <p className={`mt-3 text-sm leading-relaxed sm:text-[0.95rem] ${item.id === 'become' ? 'text-white/86' : 'text-brand-primary/80'}`}>
                      {item.result}
                    </p>

                    {/* CLEAR: pulsing corner glow */}
                    {item.id === 'clear' && (
                      <motion.span
                        animate={{ opacity: [0.1, 0.22, 0.1], scale: [1, 1.08, 1] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="pointer-events-none absolute bottom-0 right-0 h-28 w-28 rounded-tl-full bg-brand-accent/20"
                        aria-hidden="true"
                      />
                    )}
                  </motion.article>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.95, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="mt-12 flex justify-start md:mt-14 xl:ml-[calc(42%-1rem)]"
            >
              <button className="group flex w-full max-w-[430px] items-center justify-between rounded-full bg-white py-2 pl-6 pr-2 text-left text-sm font-semibold text-brand-primary shadow-xl shadow-brand-primary/25 transition-all duration-500 hover:bg-brand-secondary active:scale-[0.98] sm:w-auto sm:min-w-[430px] sm:pl-7">
                <span className="pr-5">Instant Success Formula entdecken</span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white transition-all duration-500 group-hover:translate-x-0.5 group-hover:bg-brand-accent">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            </motion.div>
          </div>
        </section>

        {/* Section 5: Für wen ist das? */}
        <section className="bg-brand-secondary py-32 md:py-44 overflow-hidden">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid lg:grid-cols-[1fr_1fr] gap-16 lg:gap-24 items-start">

              {/* Left: Editorial image */}
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                className="relative lg:sticky lg:top-28"
              >
                {/* Outer frame — thin gold hairline */}
                <div className="relative rounded-[1.75rem] overflow-hidden ring-1 ring-brand-accent/15">
                  <picture>
                    <source srcSet="/media/images/fuer-wen.webp" type="image/webp" />
                    <img
                      src="/media/images/für-wen.png"
                      alt="Heike Ziegler – Transformationsmentorin für Unternehmerinnen"
                      className="w-full h-auto block object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                  {/* Bottom quote overlay */}
                  <div className="absolute bottom-0 left-0 right-0 px-9 pb-9 pt-24 bg-gradient-to-t from-brand-primary/75 via-brand-primary/30 to-transparent">
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
                      className="font-serif text-xl md:text-2xl text-white leading-[1.4]"
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
                  className="flex items-center gap-3 mb-10"
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
                  className="font-serif text-[2.4rem] md:text-[3rem] lg:text-[3.25rem] leading-[1.12] text-brand-primary mb-10"
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
                  className="text-brand-muted text-[0.925rem] leading-[1.9] mb-12 max-w-[38ch] font-light"
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
          className="relative py-36 md:py-48 overflow-hidden text-white"
          style={{
            background: 'radial-gradient(circle at 50% 0%, rgba(212,175,55,0.08) 0%, transparent 36%), linear-gradient(180deg, #171614 0%, #10100F 100%)'
          }}
        >
          {/* Subtle top fade from previous section */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-brand-secondary/8 to-transparent pointer-events-none" />

          <div className="container mx-auto px-6 max-w-6xl">

            {/* Editorial Intro — centered */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-center mb-20 md:mb-28"
            >
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-8 h-px bg-brand-accent/50" />
                <span className="font-display text-[9px] font-semibold uppercase tracking-[0.36em] text-brand-accent/70">Ergebnisse</span>
                <div className="w-8 h-px bg-brand-accent/50" />
              </div>
              <h2 className="font-serif text-[2.4rem] md:text-[3.4rem] lg:text-[4rem] leading-[1.1] text-white max-w-3xl mx-auto mb-8">
                Was entsteht, wenn Erfolg zu deinem{' '}
                <span className="italic font-light text-white/55">inneren Standard</span> wird.
              </h2>
              <p className="text-white/45 text-[0.9rem] leading-[1.9] max-w-xl mx-auto font-light">
                Nicht mehr Druck. Nicht mehr ständiges Beweisen. Sondern Klarheit,
                Selbstführung und Wachstum aus einer Identität, die Erfolg halten kann.
              </p>
            </motion.div>

            {/* 4 Large Outcome Cards — 2×2 grid */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
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
                    className="group relative rounded-[1.75rem] p-8 md:p-10 cursor-default transition-[background,border-color] duration-500"
                    style={{
                      background: 'rgba(249,244,231,0.045)',
                      border: '1px solid rgba(249,244,231,0.10)',
                      backdropFilter: 'blur(16px)'
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(249,244,231,0.075)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.28)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(249,244,231,0.045)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(249,244,231,0.10)';
                    }}
                  >
                    {/* Number + line — cascade first */}
                    <motion.div
                      variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { duration: 0.5 } }
                      }}
                      className="flex items-center gap-4 mb-7"
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
                      className="font-serif text-[1.6rem] md:text-[1.85rem] text-white leading-tight mb-5"
                    >
                      {card.title}
                    </motion.h3>

                    {/* Body — cascade third */}
                    <motion.p
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } }
                      }}
                      className="text-white/50 text-[0.875rem] leading-[1.85] font-light group-hover:text-white/65 transition-colors duration-500"
                    >
                      {card.body}
                    </motion.p>
                  </motion.div>
                );
              })}
            </div>

            {/* 4 Small Outcome Pills */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                  className="flex items-center justify-center gap-2.5 px-5 py-4 rounded-2xl text-center cursor-default transition-[border-color] duration-500 hover:border-brand-accent/30"
                  style={{ background: 'rgba(249,244,231,0.03)', border: '1px solid rgba(249,244,231,0.07)' }}
                >
                  <div className="w-1 h-1 rounded-full bg-brand-accent/50 shrink-0" />
                  <span className="font-display text-[0.7rem] font-medium tracking-[0.18em] uppercase text-white/45">
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
          className="py-32 md:py-44 overflow-hidden"
          style={{ background: 'linear-gradient(180deg, #F9F4E7 0%, #FBF8F1 100%)' }}
        >
          <div className="container mx-auto px-6 max-w-6xl">

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="mb-16 md:mb-20 max-w-2xl"
            >
              <div className="flex items-center gap-3 mb-7">
                <div className="w-6 h-px bg-brand-accent" />
                <span className="font-display font-semibold text-[9px] uppercase tracking-[0.36em] text-brand-accent">
                  Kundinnenstimmen
                </span>
              </div>
              <h2 className="font-serif text-[2.2rem] md:text-[3rem] lg:text-[3.4rem] leading-[1.12] text-brand-primary mb-6">
                Was Kundinnen erleben,
                <br />
                <span className="italic font-light text-brand-primary/55">wenn Erfolg leichter wird.</span>
              </h2>
              <p className="text-brand-muted text-[0.9rem] leading-[1.85] font-light max-w-md">
                Nicht lauter. Nicht härter. Sondern klarer, stabiler
                und mehr aus sich selbst heraus.
              </p>
            </motion.div>

            {/* Grid: 1 featured + 2 stacked */}
            <div className="grid lg:grid-cols-[3fr_2fr] gap-4 lg:gap-5 items-start">

              {/* Featured Testimonial */}
              <motion.div
                initial={{ opacity: 0, y: 44, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex flex-col rounded-[2.25rem] p-10 md:p-16"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(3,24,46,0.08)',
                  boxShadow: '0 30px 80px rgba(3,24,46,0.06)'
                }}
              >
                {/* Decorative quote mark */}
                <div
                  className="font-serif leading-none select-none pointer-events-none mb-4"
                  style={{ fontSize: '7rem', color: 'rgba(196,164,132,0.13)', lineHeight: 1 }}
                  aria-hidden="true"
                >
                  "
                </div>

                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="font-serif text-[1.25rem] md:text-[1.45rem] text-brand-primary leading-[1.72] font-light flex-1 mb-12"
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
                    className="relative flex flex-col rounded-[1.75rem] p-8 md:p-9"
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
                    <p className="font-serif text-[1rem] md:text-[1.05rem] text-brand-primary/80 leading-[1.75] font-light flex-1 mb-8">
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
          className="py-32 md:py-44 overflow-hidden"
          style={{ background: 'linear-gradient(180deg, #FBF8F1 0%, #F7F1E6 100%)' }}
        >
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-20 items-start">

              {/* Left: Portrait image */}
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                className="relative lg:sticky lg:top-28"
              >
                <div className="relative rounded-[2rem] overflow-hidden ring-1 ring-brand-accent/15">
                  <picture>
                    <source srcSet="/media/images/heike-ziegler.webp" type="image/webp" />
                    <img
                      src="/media/images/heike-ziegler.png"
                      alt="Heike Ziegler – Identitätsarbeit & Business-Führung"
                      className="w-full h-auto block object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                  {/* Bottom overlay with identity line */}
                  <div className="absolute bottom-0 left-0 right-0 px-8 pb-8 pt-20 bg-gradient-to-t from-brand-primary/65 via-brand-primary/20 to-transparent">
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
                  className="flex items-center gap-3 mb-9"
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
                  className="font-serif text-[2.2rem] md:text-[2.8rem] lg:text-[3rem] leading-[1.13] text-brand-primary mb-8"
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
                  className="space-y-5 text-brand-muted text-[0.925rem] leading-[1.88] font-light mb-12 max-w-md"
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
                  className="space-y-0 mb-12 border-t border-brand-primary/[0.07]"
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
                  className="flex flex-col sm:flex-row items-start gap-5"
                >
                  <button className="group flex items-center bg-brand-primary text-white pl-6 pr-1.5 py-1.5 rounded-full text-sm font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-brand-primary/90 active:scale-[0.97] shadow-lg shadow-brand-primary/20">
                    <span className="pr-4 tracking-wide">Clarity Call buchen</span>
                    <span className="w-8 h-8 rounded-full bg-white/12 flex items-center justify-center transition-all duration-500 group-hover:bg-brand-accent group-hover:translate-x-0.5">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </button>
                  <button className="text-brand-primary text-sm font-medium py-3 flex items-center gap-1.5 border-b border-brand-primary/20 transition-all duration-300 hover:border-brand-accent hover:text-brand-accent group">
                    Mehr über Heike
                    <ChevronRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </button>
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
        <section id="angebote" className="py-32 bg-brand-secondary/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="font-serif text-5xl mb-4 italic">Das Ökosystem</h2>
              <div className="h-1 w-24 bg-brand-accent mx-auto mb-6" />
            </div>

            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
               {/* Highlighted Offer */}
               <motion.div 
                 whileHover={{ y: -10 }}
                 className="lg:col-span-2 bg-brand-primary text-white p-12 md:p-16 rounded-[4rem] shadow-3xl shadow-brand-primary/30 flex flex-col md:flex-row gap-12 items-center"
               >
                 <div className="md:w-2/3">
                   <span className="bg-brand-accent/20 text-brand-accent px-4 py-1 rounded-full text-xs font-display tracking-widest uppercase mb-4 inline-block">Premium Core Offer</span>
                   <h3 className="font-serif text-4xl md:text-5xl mb-6">Instant Success Formula</h3>
                   <p className="text-white/70 text-lg mb-8 leading-relaxed max-w-xl">
                     Die exklusive 1:1 Transformation für Unternehmerinnen, die Identität, emotionale Klarheit und Erfolg als ihre neue natürliche Gewohnheit etablieren wollen.
                   </p>
                   <button className="bg-white text-brand-primary px-8 py-4 rounded-full font-bold flex items-center gap-2 transition-all duration-500 hover:scale-[1.02] group">
                     Mehr erfahren
                     <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-500" />
                   </button>
                 </div>
                 <div className="md:w-1/3 flex justify-center">
                   <div className="w-32 h-32 rounded-full border-2 border-white/10 flex items-center justify-center p-2">
                     <div className="w-full h-full rounded-full border-2 border-brand-accent/40 animate-spin-slow" />
                   </div>
                 </div>
               </motion.div>

               {/* Secondary Offers */}
               {[
                 {
                   title: 'ISOBL',
                   subtitle: 'Business Launch',
                   desc: 'Moderner Einstieg in digitale Einkommensmodelle und Online-Business-Strukturen.'
                 },
                 {
                   title: 'ISA Alliance',
                   subtitle: 'Community & Growth',
                   desc: 'Exklusives Netzwerk für gemeinsames Wachstum und strategische Partnerschaften.'
                 },
                 {
                   title: 'Quantum Lab',
                   subtitle: 'Future Academy',
                   desc: 'Die Plattform für personalisierte Lernpfade, AI-Tools und zukunftsorientierte Entwicklung.'
                 }
               ].map((item, idx) => (
                 <motion.div 
                   key={idx}
                   whileHover={{ y: -5 }}
                   className="bg-white p-10 rounded-[3rem] shadow-sm hover:shadow-lg transition-all"
                 >
                   <h4 className="font-display font-bold text-brand-accent text-xs tracking-widest uppercase mb-2">{item.subtitle}</h4>
                   <h3 className="font-serif text-2xl mb-4">{item.title}</h3>
                   <p className="text-brand-muted mb-8">{item.desc}</p>
                   <button className="text-brand-primary font-medium flex items-center gap-1 transition-all duration-500 hover:gap-2">
                     Entdecken <ChevronRight className="w-4 h-4" />
                   </button>
                 </motion.div>
               ))}
               
               <div className="lg:col-span-1 bg-brand-accent/10 p-10 rounded-[3rem] flex flex-col justify-center items-center text-center">
                  <h3 className="font-serif text-2xl mb-2">Future Vision</h3>
                  <p className="text-brand-muted text-sm italic">Hormonelle Intelligenz & AI personalisiert</p>
               </div>
            </div>
          </div>
        </section>

        {/* Section 10: Leadmagnet */}
        <section id="kontakt" className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 z-0">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-accent/5 rounded-full blur-[100px]" />
          </div>
          
          <div className="container mx-auto px-6 relative z-10 max-w-4xl">
            <div className="bg-white/80 backdrop-blur-xl p-12 md:p-20 rounded-[4rem] text-center shadow-xl border border-brand-primary/5">
              <h2 className="font-serif text-4xl mb-6 italic">Gönne dir den ersten Schritt.</h2>
              <p className="text-brand-muted text-xl mb-12 max-w-2xl mx-auto">
                Sichere dir das <strong>Instant Success Framework</strong> und erkenne, welches innere Muster deinen Erfolg noch bremst.
              </p>
              
              <div className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="Deine E-Mail Adresse" 
                  className="flex-grow px-8 py-4 rounded-full border border-brand-primary/10 focus:outline-none focus:border-brand-accent bg-white"
                />
                <button className="bg-brand-primary text-white px-8 py-4 rounded-full font-bold transition-all duration-500 hover:bg-brand-primary/90 hover:scale-[1.02]">
                  Erhalten
                </button>
              </div>
              <p className="mt-6 text-xs text-brand-muted font-display tracking-wide uppercase">Kostenfreies PDF & Video-Impuls</p>
            </div>
          </div>
        </section>

        {blogSection}

        {/* Section 11: Final CTA */}
        <section className="py-40 bg-brand-primary relative overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1]
            }} 
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-brand-accent/20 rounded-full blur-[150px]" 
          />
          
          <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
            <h2 className="font-serif text-4xl md:text-7xl text-white mb-8">
              Bereit, Erfolg nicht länger <br /> <span className="italic font-light">zu erzwingen?</span>
            </h2>
            <p className="text-white/60 text-xl mb-12 leading-relaxed">
              Wenn du spürst, dass dein nächstes Wachstum nicht mehr über Druck entstehen soll, ist der Clarity Call dein nächster Schritt.
            </p>
            <a href="#kontakt" className="bg-white text-brand-primary px-12 py-6 rounded-full text-lg font-bold transition-all duration-500 hover:scale-[1.02] shadow-2xl shadow-white/10 hover:shadow-white/20 flex items-center gap-3 mx-auto group">
              Clarity Call anfragen
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-500" />
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-brand-secondary py-20 border-t border-brand-primary/5">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-16 md:gap-8 mb-20 text-center md:text-left">
            <div className="md:col-span-1">
              <div className="mb-6 flex items-center justify-center gap-3 md:justify-start">
                <img
                  alt=""
                  className="h-11 w-11 rounded-full object-contain shadow-[0_8px_24px_rgba(16,15,15,0.08)]"
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
