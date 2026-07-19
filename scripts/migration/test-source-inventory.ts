import assert from "node:assert/strict";
import {buildCurrentRouteSeeds, extractPageInventory, normalizeVisibleText} from "./source-inventory";

assert.equal(
  normalizeVisibleText("  Erfolg\n\t beginnt   jetzt.  "),
  "Erfolg beginnt jetzt.",
  "normalizes layout whitespace without changing punctuation",
);

const html = `<!doctype html>
<html lang="de">
  <head>
    <title>Make Success Your Habit</title>
    <meta name="description" content="Klarheit &amp; Erfolg.">
    <link rel="canonical" href="https://www.heike-ziegler.com/de">
    <link rel="alternate" hreflang="en" href="https://www.heike-ziegler.com/en">
    <meta property="og:title" content="Heike Ziegler">
  </head>
  <body>
    <header><a href="/de">Start</a></header>
    <main>
      <h1>Make <em>Success</em> Your Habit</h1>
      <p>Dein Weg zur <a href="/de/methode">Methode</a>.</p>
      <ul><li>Sehen.</li><li>Werden!</li></ul>
      <button type="button">Gespräch buchen</button>
      <img src="/media/hero.webp" alt="Heike Ziegler im Portrait" width="800" height="600">
      <video src="/media/hero.mp4" poster="/media/poster.webp"></video>
      <iframe src="https://cal.com/heike"></iframe>
    </main>
    <footer><a href="mailto:heike@heike-ziegler.com">Kontakt</a></footer>
  </body>
</html>`;

const inventory = extractPageInventory({
  finalUrl: "https://www.heike-ziegler.com/de",
  html,
  requestedUrl: "https://www.heike-ziegler.com/de",
  status: 200,
});

assert.equal(inventory.lang, "de");
assert.equal(inventory.title, "Make Success Your Habit");
assert.equal(inventory.description, "Klarheit & Erfolg.");
assert.equal(inventory.canonical, "https://www.heike-ziegler.com/de");
assert.deepEqual(inventory.hreflang, [
  {href: "https://www.heike-ziegler.com/en", lang: "en"},
]);
assert.deepEqual(inventory.headings, [
  {level: 1, text: "Make Success Your Habit"},
]);
assert.deepEqual(
  inventory.semanticText.map(({tag, text}) => ({tag, text})),
  [
    {tag: "h1", text: "Make Success Your Habit"},
    {tag: "p", text: "Dein Weg zur Methode."},
    {tag: "a", text: "Methode"},
    {tag: "li", text: "Sehen."},
    {tag: "li", text: "Werden!"},
    {tag: "button", text: "Gespräch buchen"},
  ],
);
assert.deepEqual(inventory.images, [
  {
    alt: "Heike Ziegler im Portrait",
    height: 600,
    src: "https://www.heike-ziegler.com/media/hero.webp",
    width: 800,
  },
]);
assert.deepEqual(inventory.videos, [
  {
    poster: "https://www.heike-ziegler.com/media/poster.webp",
    sources: ["https://www.heike-ziegler.com/media/hero.mp4"],
  },
]);
assert.deepEqual(inventory.iframes, ["https://cal.com/heike"]);
assert.deepEqual(inventory.openGraph, {title: "Heike Ziegler"});
assert.equal(inventory.links.length, 3);

assert.deepEqual(buildCurrentRouteSeeds(["My First Post", "bereits-kodiert"]), [
  "/",
  "/de",
  "/en",
  "/method",
  "/about-heike",
  "/community",
  "/instant-success-formula",
  "/isobl",
  "/isa-alliance",
  "/blog",
  "/blog/My%20First%20Post",
  "/blog/bereits-kodiert",
  "/legal/agb",
  "/legal/datenschutz",
  "/legal/eula",
  "/legal/impressum",
  "/legal/nutzungsbedingungen",
  "/legal/widerruf",
]);

console.log("source inventory parser: ok");
