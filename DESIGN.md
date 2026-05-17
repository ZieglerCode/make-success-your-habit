# DESIGN.md — Heike Ziegler / Make Success Your Habit

**Version:** 1.0  
**Projekt:** Premium-Markenwebsite für Heike Ziegler  
**Brand Claim:** Make Success Your Habit  
**Creative Direction:** Cinematic Luxury Minimalism · Feminine Leadership · Ruhige Premium-Transformation

---

## 1. Markenessenz

Die Website soll nicht wie eine klassische Coaching- oder Funnel-Seite wirken, sondern wie ein hochwertiger Erfolgsraum: ruhig, klar, elegant, vertrauensvoll und magnetisch.

**Kerngefühl:**  
Success is not something you chase. It is something you become.

**Brand-Archetyp:**  
Die ruhige Mentorin + strategische Transformationsführerin.

**Wahrnehmung beim ersten Besuch:**

- Premium, aber nicht distanziert
- Weiblich kraftvoll, aber nicht verspielt
- Spirituell anschlussfähig, aber nicht esoterisch
- Strategisch und zukunftsorientiert, aber nicht technisch kalt
- Emotional sicher, aber nicht weichgespült
- Erfolgreich, aber ohne Druck und Hustle-Ästhetik

---

## 2. Design-Prinzipien

### 2.1 Ruhige Führung statt lauter Verkauf

Die Website führt mit Klarheit, Raum und Atmosphäre. Sie darf verkaufen, soll sich aber nie gedrängt, hektisch oder aggressiv anfühlen.

### 2.2 Editorial Luxury statt Coaching-Funnel

Layouts sollen großzügig, reduziert und hochwertig wirken. Wenige, starke Aussagen. Viel Weißraum. Große Typografie. Cinematische Bildwelt.

### 2.3 Innerer Erfolg sichtbar machen

Die visuelle Sprache zeigt Erfolg als innere Haltung: Gelassenheit, Selbstführung, Klarheit, Präsenz, Weite und emotionale Stabilität.

### 2.4 Licht als Markenelement

Warmes Morgenlicht, weiche Schatten, transparente Vorhänge, Goldreflexe und natürliche Oberflächen sind zentrale Stimmungsträger.

### 2.5 Premium durch Zurückhaltung

Gold wird sparsam eingesetzt. Die Marke wirkt hochwertig durch Proportion, Typografie, Bildkomposition und ruhige Details — nicht durch Dekoration.

---

## 3. Farbwelt

Die Farbwelt basiert auf dem bestehenden Briefing sowie der neuen Bildwelt: warmes Off-White, tiefe Navy-/Espresso-Schatten, Champagner-Gold, gedämpfte Taupe- und Greige-Töne.

### 3.1 Core Brand Colors

| Token | Name | Hex | Einsatz |
|---|---:|---:|---|
| `--color-navy-950` | Primary Dark Navy | `#03182E` | Hauptfarbe, Header, Footer, Premium-Flächen, Text auf hellen Flächen |
| `--color-gold-500` | Gold Accent | `#D4AF37` | Akzente, Linien, Icons, kleine Highlights, CTA-Details |
| `--color-offwhite-50` | Warm Off White | `#F9F4E7` | Haupt-Hintergrund, helle Sections, großzügige Flächen |

### 3.2 Cinematic Image Palette

Diese Töne greifen die Licht-, Wand-, Schatten- und Textilfarben aus der Bildwelt auf.

| Token | Name | Hex | Einsatz |
|---|---:|---:|---|
| `--color-ivory-100` | Soft Curtain Ivory | `#FCF3E3` | helle Hintergründe, Cards, Overlays |
| `--color-cream-150` | Morning Cream | `#F2E2CE` | warme Section-Hintergründe, Hover-Flächen |
| `--color-champagne-300` | Champagne Beige | `#C5B097` | dezente Flächen, Linien, Bildrahmen |
| `--color-taupe-400` | Soft Taupe | `#B29C81` | Sekundärakzente, Editorial Labels |
| `--color-brass-500` | Muted Brass | `#B49474` | Alternative zu starkem Gold, Icons, feine Highlights |
| `--color-greige-600` | Warm Greige | `#6B5F50` | Subtext auf hellen Flächen, dezente UI-Elemente |
| `--color-taupe-700` | Deep Taupe | `#4C4235` | dunklere Cards, Trennlinien, Hover-Zustände |
| `--color-espresso-900` | Espresso Shadow | `#2D2319` | sehr dunkle Warmflächen, Bildoverlays |
| `--color-shadow-950` | Soft Black Brown | `#100F0F` | Schatten, Overlays, maximale Tiefe |

### 3.3 Farbrollen

#### Backgrounds

- Haupt-Hintergrund: `#F9F4E7`
- Alternative helle Section: `#FCF3E3`
- Warme Premium-Section: `#F2E2CE`
- Dunkle Premium-Section: `#03182E`
- Cinematic Overlay: `rgba(16, 15, 15, 0.42)` oder `rgba(3, 24, 46, 0.54)`

#### Text

- Primärer Text auf hell: `#03182E`
- Sekundärer Text auf hell: `#4C4235`
- Leiser Text / Captions: `#6B5F50`
- Text auf dunkel: `#F9F4E7`
- Text auf Gold: `#03182E`

#### Accent Usage

Gold ist ein Akzent, kein Flächenstandard.

**Empfohlen:**

- 1px Linien
- kleine Icons
- Eyebrows
- Button-Border
- Hover-Unterstreichungen
- feine Dividers
- kleine Monogramm-Details

**Vermeiden:**

- große Goldflächen
- Gold-Verläufe auf jeder Section
- glänzende Fake-Luxury-Optik
- zu gelbe Buttons

### 3.4 Empfohlene Gradients

```css
--gradient-hero-shadow: linear-gradient(
  90deg,
  rgba(3, 24, 46, 0.72) 0%,
  rgba(45, 35, 25, 0.42) 42%,
  rgba(249, 244, 231, 0.04) 100%
);

--gradient-warm-light: radial-gradient(
  circle at 75% 20%,
  rgba(242, 226, 206, 0.72) 0%,
  rgba(249, 244, 231, 0.42) 38%,
  rgba(249, 244, 231, 0.00) 72%
);

--gradient-premium-dark: linear-gradient(
  135deg,
  #03182E 0%,
  #100F0F 100%
);
```

---

## 4. Typografie

Die Typografie muss elegant, modern, ruhig und hochwertig wirken. Der Kontrast zwischen einer editorialen Serif für Headlines und einer präzisen Sans für Body/UI schafft Premium-Charakter.

### 4.1 Primäre Font-Kombination

#### Headline Serif

**Empfohlen:** `Cormorant Garamond`  
**Alternative:** `Playfair Display`, `Fraunces`, `Canela` falls lizenziert

Einsatz:

- H1–H3
- große Editorial-Zitate
- Hero-Headlines
- Signature Statements

Charakter:

- elegant
- weiblich
- editorial
- ruhig luxuriös

#### Body / UI Sans

**Empfohlen:** `Inter`  
**Alternative:** `Satoshi`, `Neue Haas Grotesk`, `Manrope`

Einsatz:

- Fließtext
- Navigation
- Buttons
- Formulare
- Systemtexte
- Captions

Charakter:

- klar
- vertrauenswürdig
- modern
- sehr gut lesbar

### 4.2 Font Stack

```css
--font-display: "Cormorant Garamond", "Playfair Display", Georgia, serif;
--font-sans: "Inter", "Satoshi", "Helvetica Neue", Arial, sans-serif;
```

### 4.3 Type Scale

| Element | Desktop | Mobile | Gewicht | Line-height | Tracking |
|---|---:|---:|---:|---:|---:|
| Hero H1 | 80–104px | 46–58px | 400–500 | 0.92–1.02 | -0.03em |
| H2 | 56–72px | 36–44px | 400–500 | 1.00–1.08 | -0.025em |
| H3 | 36–48px | 28–34px | 400–500 | 1.08–1.16 | -0.015em |
| Body Large | 20–23px | 18–20px | 400 | 1.55 | -0.005em |
| Body | 16–18px | 16px | 400 | 1.65 | 0 |
| Small | 13–14px | 13px | 400–500 | 1.45 | 0.01em |
| Eyebrow | 11–13px | 11–12px | 500–600 | 1.2 | 0.14em |

### 4.4 Typografische Regeln

- Headlines dürfen atmen: kurze Zeilen, große Zwischenräume.
- Keine überlangen H1-Zeilen; ideal sind 2–4 Zeilen.
- Serif nicht für kleine UI-Labels verwenden.
- Eyebrows in Sans, uppercase, leichtes Letterspacing.
- Kein Mix aus mehr als zwei primären Schriften.
- Keine übermäßig dünnen Schriftschnitte auf hellen Hintergründen.

---

## 5. Layout-System

### 5.1 Grid

```css
--container-max: 1280px;
--container-wide: 1440px;
--grid-columns: 12;
--gutter-desktop: 32px;
--gutter-tablet: 24px;
--gutter-mobile: 20px;
```

### 5.2 Spacing Scale

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 24px;
--space-6: 32px;
--space-7: 48px;
--space-8: 64px;
--space-9: 96px;
--space-10: 128px;
--space-11: 160px;
```

### 5.3 Section Rhythm

| Section Type | Desktop Padding | Mobile Padding |
|---|---:|---:|
| Hero | 96–128px top/bottom | 72–96px |
| Standard Section | 112–144px | 72–96px |
| Compact Section | 72–96px | 56–72px |
| CTA Section | 128–160px | 80–104px |

### 5.4 Layout-Gefühl

- Viel negative space.
- Keine engen Blöcke.
- Keine überladenen Cards.
- Maximal 2–3 Kernbotschaften pro Section.
- Jede Section braucht eine klare Hierarchie: Eyebrow → Headline → kurzer Text → Handlung.

---

## 6. Bildsprache

Die Bildwelt ist zentral für die Marke. Sie soll wie ein stiller, hochwertiger Editorial-Film wirken.

### 6.1 Motive

Empfohlen:

- Unternehmerin in ruhiger, klarer Präsenz
- warme Interieurs mit hochwertigen natürlichen Materialien
- Fensterlicht, Vorhänge, Bewegung, Schatten
- ruhige Posen, Blick in die Ferne, innere Klarheit
- Atmosphäre von Weite, Erfolg und emotionaler Sicherheit
- feminine Leadership ohne Inszenierung

Vermeiden:

- klassische Stockfoto-Coach-Posen
- Laptop-am-Café-Tisch-Standardmotive
- übertriebene Business-Lächeln
- Motivations-Poster-Ästhetik
- spirituelle Klischees
- überinszenierte Luxus-Symbole

### 6.2 Hero-Bildrichtung

Die aktuelle Bildwelt eignet sich sehr gut für die Hero Section.

**Komposition:**

- Frau rechts positioniert
- viel negative space links für Headline und CTA
- warme Sonne von rechts
- weiche Vorhangbewegung
- tiefe Schatten im Raum
- kein hektisches Setdesign
- Fokus auf Ruhe, Präsenz und innere Autorität

**Website Overlay:**

- links leichter Navy/Espresso-Gradient für Lesbarkeit
- Text in Off-White oder Navy je nach Bildausschnitt
- Gold nur als kleiner Akzent

### 6.3 Bildbearbeitung

```css
--image-radius-large: 28px;
--image-radius-medium: 20px;
--image-shadow-soft: 0 32px 80px rgba(16, 15, 15, 0.18);
--image-overlay-dark: rgba(3, 24, 46, 0.36);
--image-overlay-warm: rgba(242, 226, 206, 0.18);
```

Empfohlene Bearbeitung:

- Kontrast moderat erhöhen
- Highlights warm halten
- Schatten tief, aber nicht schwarz absaufen lassen
- Hauttöne natürlich und weich
- keine starken Filter
- keine kalte Corporate-Farbkorrektur

---

## 7. UI-Komponenten

### 7.1 Buttons

#### Primary CTA

Einsatz: Clarity Call, Anfrage, Hauptconversion.

```css
.button-primary {
  background: #03182E;
  color: #F9F4E7;
  border: 1px solid #03182E;
  border-radius: 999px;
  padding: 14px 26px;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.02em;
}
```

Hover:

```css
.button-primary:hover {
  background: #100F0F;
  border-color: #D4AF37;
  transform: translateY(-1px);
}
```

#### Secondary CTA

Einsatz: Instant Success Formula entdecken, Learn More.

```css
.button-secondary {
  background: transparent;
  color: #03182E;
  border: 1px solid rgba(3, 24, 46, 0.24);
  border-radius: 999px;
  padding: 14px 26px;
}
```

#### Light CTA auf dunklem Hintergrund

```css
.button-light {
  background: #F9F4E7;
  color: #03182E;
  border: 1px solid rgba(249, 244, 231, 0.32);
}
```

### 7.2 Cards

Cards sollen ruhig und editorial wirken, nicht wie SaaS-Kacheln.

```css
.card-light {
  background: rgba(252, 243, 227, 0.76);
  border: 1px solid rgba(180, 148, 116, 0.22);
  border-radius: 28px;
  box-shadow: 0 24px 70px rgba(16, 15, 15, 0.06);
  backdrop-filter: blur(18px);
}
```

### 7.3 Navigation

- Transparent über Hero oder Off-White auf Scroll.
- Logo links, Navigation mittig oder rechts.
- CTA rechts.
- Höhe: 76–88px Desktop.
- Mobile: ruhiges Fullscreen-Menü mit Off-White/Navy.

Navigation-Farben:

- Auf hellem Hintergrund: Navy Text
- Auf dunklem Bild: Off-White Text
- Active/Hover: feine Gold-Linie oder Opacity-Wechsel

### 7.4 Forms

- Keine harten Boxen.
- Große Eingabefelder.
- Border in Taupe/Champagne.
- Fokus mit Navy + Gold-Akzent.
- Fehlermeldungen ruhig, klar und nicht alarmistisch.

```css
.input {
  background: rgba(249, 244, 231, 0.72);
  border: 1px solid rgba(76, 66, 53, 0.22);
  border-radius: 18px;
  padding: 16px 18px;
  color: #03182E;
}
.input:focus {
  border-color: #D4AF37;
  box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.12);
}
```

---

## 8. Motion & Interactions

Animationen sollen leise, elegant und hochwertig sein. Keine hektischen Bewegungen.

### 8.1 Motion Principles

- langsam
- weich
- filmisch
- minimal
- organisch
- keine Bounce-Effekte
- keine lauten Parallax-Spielereien

### 8.2 Empfohlene Werte

```css
--ease-luxury: cubic-bezier(0.22, 1, 0.36, 1);
--ease-soft: cubic-bezier(0.16, 1, 0.3, 1);
--duration-fast: 180ms;
--duration-medium: 420ms;
--duration-slow: 900ms;
```

### 8.3 Animation Patterns

Empfohlen:

- Fade-up mit 16–24px Y-Movement
- langsamer Hero Push-In bei Video/Background
- leichte Bild-Skalierung von 1.04 → 1.00
- Text Reveal mit Delay
- feine Divider-Linien, die horizontal einzeichnen
- Vorhang-/Lichtbewegung im Video statt UI-Spielerei

Vermeiden:

- aggressive Scroll-Jacking-Effekte
- schnelle Slider
- rotierende Badges
- blinkende CTAs
- übertriebene Cursor-Effekte

---

## 9. Tonalität & Sprache

Die Sprache ist warm, klar, menschlich und führend. Sie soll emotional intelligent sein und Orientierung geben.

### 9.1 Voice Attributes

- ruhig
- präzise
- vertrauensvoll
- erwachsen
- emotional klar
- hochwertig
- stärkend
- nicht belehrend

### 9.2 Copywriting-Regeln

Gute Copy klingt wie:

> Du musst Erfolg nicht länger erzwingen. Du darfst ihn als neue innere Normalität verkörpern.

Nicht wie:

> Unlocke dein Next Level und skaliere jetzt mit der ultimativen Gamechanger-Formel.

### 9.3 Vermeiden

- revolutionär
- next level
- gamechanger
- turbo
- hustle harder
- sofort reich
- Geheimformel
- aggressiver FOMO-Druck
- übertriebene Superlative
- zu technische KI-Sprache
- zu esoterische Frequenz-Sprache ohne Erdung

### 9.4 Gute Schlüsselbegriffe

- innere Klarheit
- emotionale Stabilität
- feminine Führung
- Erfolg ohne Druck
- magnetische Präsenz
- neue Erfolgsidentität
- Business-Klarheit
- Sichtbarkeit aus Sicherheit
- Selbstführung
- aligned success
- Erfolg als Gewohnheit

---

## 10. Logo & Markenzeichen

### 10.1 Wordmark-Richtung

Die Wortmarke sollte reduziert und editorial wirken.

Empfehlung:

- `Heike Ziegler` in Serif oder hochwertiger Sans
- `Make Success Your Habit` als kleine uppercase Subline
- viel Letterspacing in der Subline
- kein lautes Symbol notwendig

### 10.2 Monogramm

Optionales Monogramm: `HZ`

Einsatz:

- Favicon
- Footer
- dezente Pattern
- Loading State
- Social Avatar
- kleine Gold-Prägung auf dunklem Navy

Stil:

- sehr reduziert
- keine verschnörkelte Coach-Ästhetik
- maximal ein feiner Serif-Monogramm-Ansatz

---

## 11. Section-Stil der Website

### 11.1 Hero

**Gefühl:** editorial, ruhig, magnetisch.

Elemente:

- Eyebrow: Make Success Your Habit
- Große Serif-Headline
- kurze Subline
- zwei CTAs
- Microcopy
- Bild/Video mit Frau rechts, negative space links

Empfohlener Textkontrast:

- Bei dunklem Overlay: Headline in Off-White
- Bei heller Hero-Variante: Headline in Navy

### 11.2 Philosophie-Section

- Off-White Hintergrund
- zentrierter oder asymmetrischer Editorial-Block
- großes Statement
- feiner Gold-Divider

### 11.3 Methode: SEE → CLEAR → BECOME

- Drei ruhige Spalten oder gestaffelte Cards
- Keine grellen Icons
- Zahlen oder kleine Linien in Gold/Brass
- Jede Phase mit maximal 2–3 Sätzen

### 11.4 Angebote

- Premium Cards mit viel Raum
- ISF als primäres Angebot visuell stärker
- ISOBL und ISA Alliance als klare sekundäre Wege
- Keine überfüllten Preis-/Feature-Karten auf der Homepage

### 11.5 Abschluss-CTA

- dunkler Navy/Espresso-Hintergrund
- warmer Lichtakzent
- kurze, klare Headline
- ein dominanter CTA
- emotional sicherer Microcopy

---

## 12. Accessibility & Lesbarkeit

### 12.1 Kontrast

- Navy `#03182E` auf Off-White `#F9F4E7` ist bevorzugt.
- Gold `#D4AF37` nicht für lange Texte verwenden.
- Gold auf Off-White nur für Akzent, nicht für Body Copy.
- Body Text niemals unter 16px.
- Auf Bildhintergründen immer Overlay oder separate Textfläche nutzen.

### 12.2 Fokuszustände

Alle interaktiven Elemente brauchen sichtbare Fokuszustände:

```css
:focus-visible {
  outline: 2px solid #D4AF37;
  outline-offset: 4px;
}
```

### 12.3 Motion Safety

Für Nutzer mit reduzierter Bewegung:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 13. CSS Design Tokens

```css
:root {
  /* Core */
  --color-navy-950: #03182E;
  --color-gold-500: #D4AF37;
  --color-offwhite-50: #F9F4E7;

  /* Image-inspired palette */
  --color-ivory-100: #FCF3E3;
  --color-cream-150: #F2E2CE;
  --color-champagne-300: #C5B097;
  --color-taupe-400: #B29C81;
  --color-brass-500: #B49474;
  --color-greige-600: #6B5F50;
  --color-taupe-700: #4C4235;
  --color-espresso-900: #2D2319;
  --color-shadow-950: #100F0F;

  /* Typography */
  --font-display: "Cormorant Garamond", "Playfair Display", Georgia, serif;
  --font-sans: "Inter", "Satoshi", "Helvetica Neue", Arial, sans-serif;

  /* Layout */
  --container-max: 1280px;
  --container-wide: 1440px;
  --gutter-desktop: 32px;
  --gutter-tablet: 24px;
  --gutter-mobile: 20px;

  /* Radius */
  --radius-sm: 12px;
  --radius-md: 18px;
  --radius-lg: 28px;
  --radius-xl: 36px;
  --radius-pill: 999px;

  /* Shadows */
  --shadow-soft: 0 24px 70px rgba(16, 15, 15, 0.08);
  --shadow-image: 0 32px 80px rgba(16, 15, 15, 0.18);
  --shadow-button: 0 12px 28px rgba(3, 24, 46, 0.16);

  /* Motion */
  --ease-luxury: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-soft: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast: 180ms;
  --duration-medium: 420ms;
  --duration-slow: 900ms;
}
```

---

## 14. Tailwind Theme Vorschlag

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#03182E",
        },
        gold: {
          500: "#D4AF37",
        },
        ivory: {
          50: "#F9F4E7",
          100: "#FCF3E3",
          150: "#F2E2CE",
        },
        champagne: {
          300: "#C5B097",
        },
        taupe: {
          400: "#B29C81",
          700: "#4C4235",
        },
        brass: {
          500: "#B49474",
        },
        greige: {
          600: "#6B5F50",
        },
        espresso: {
          900: "#2D2319",
          950: "#100F0F",
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', '"Playfair Display"', "Georgia", "serif"],
        sans: ['"Inter"', '"Satoshi"', '"Helvetica Neue"', "Arial", "sans-serif"],
      },
      borderRadius: {
        xl: "28px",
        "2xl": "36px",
      },
      boxShadow: {
        soft: "0 24px 70px rgba(16, 15, 15, 0.08)",
        image: "0 32px 80px rgba(16, 15, 15, 0.18)",
        button: "0 12px 28px rgba(3, 24, 46, 0.16)",
      },
      transitionTimingFunction: {
        luxury: "cubic-bezier(0.22, 1, 0.36, 1)",
        soft: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
};
```

---

## 15. Do / Don’t

### Do

- Große, ruhige Headlines
- Viel Abstand und klare Hierarchie
- Warmes Licht, tiefe Schatten, natürliche Texturen
- Navy + Off-White als Basis
- Gold nur als präziser Akzent
- Editoriale Bildkomposition
- Ruhige, klare Sprache
- Sanfte Animationen

### Don’t

- Zu viele Farben pro Section
- Laute Goldflächen
- Überladene Funnel-Blöcke
- Aggressive Countdown-/FOMO-Elemente
- Stockfoto-Coaching-Ästhetik
- Zu technische KI-Optik
- Zu esoterische Symbolik
- Zu kleine Texte
- Mehr als zwei Schriftfamilien
- Hektische Animationen

---

## 16. Erste Umsetzungsentscheidung für die Homepage

Für den MVP sollte die Website diese visuelle Richtung priorisieren:

1. **Hero als cinematic full-screen Editorial Scene**  
   Frau rechts, negative space links, ruhige Headline, klare CTAs.

2. **Off-White als Hauptfläche**  
   Damit die Seite hell, ruhig und vertrauensvoll bleibt.

3. **Navy als Autoritätsfarbe**  
   Für Text, Header/Footer und ausgewählte Premium-Sections.

4. **Gold/Brass nur als Detail**  
   Feine Linien, Eyebrows, Icons, kleine Akzente.

5. **Serif Headline + moderne Sans**  
   Editorial luxury + digitale Klarheit.

6. **Motion minimal halten**  
   Die Website soll wirken wie ein ruhiger Film, nicht wie ein lauter Funnel.

---

## 17. Kurzformel für Designer & Developer

**Design this brand like a calm luxury editorial space for feminine success — warm light, deep navy, quiet confidence, generous whitespace, elegant typography, and conversion without pressure.**
