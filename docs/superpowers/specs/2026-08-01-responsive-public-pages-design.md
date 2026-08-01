# Responsive-Überarbeitung der öffentlichen Seiten

## Ziel

Alle öffentlich sichtbaren deutschen und englischen Seiten sollen auf kleinen Handys,
Tablets und großen Bildschirmen ohne seitliches Verrutschen, abgeschnittene Inhalte oder
unnötig schwer bedienbare Navigation funktionieren. Das bestehende ruhige, hochwertige
Markenbild bleibt erhalten. Der geschützte Adminbereich gehört nicht zu diesem Auftrag.

## Umfang

Geprüft und bei Bedarf angepasst werden:

- Startseiten unter `/de` und `/en`
- gemeinsame Angebotsseiten für ISOBL, Instant Success Formula, ISA Alliance, Methode,
  Über Heike und Community
- Blogübersicht und Blogbeiträge
- öffentliche Rechtstexte
- gemeinsam genutzte Navigation, Sprachumschaltung, Fußbereich und AI-Chatfenster

Die Inhalte, Aussagen und Links werden nicht redaktionell verändert. Sprachfehler oder
inhaltlich falsche Verlinkungen sind nicht Teil dieser Responsive-Überarbeitung.

## Festgestellter Ausgangszustand

- Die deutsche ISOBL-Seite erzeugt bei 320 Pixeln Breite einen horizontalen Überlauf.
- Bei 768 Pixeln wird die ISOBL-Einleitung breiter als der sichtbare Bereich.
- Die gemeinsame Kopfzeile der Angebotsseiten wird auf Handy und Tablet durch umbrechende
  Navigation sehr hoch und verdrängt den Seiteninhalt.
- Die übrigen geprüften Seitentypen erzeugen bei 320 und 768 Pixeln keinen generellen
  horizontalen Überlauf, müssen aber visuell und funktional vollständig geprüft werden.

## Gestaltungsentscheidung

Die Anpassung erfolgt gemeinsam und gezielt:

1. Gemeinsame Bausteine werden einmal responsiv verbessert, damit alle davon abhängigen
   Unterseiten konsistent profitieren.
2. Die ISOBL-Seite erhält zusätzliche Regeln für lange deutsche Überschriften, Texte und
   Karteninhalte.
3. Einzelne Seitentypen wie Blog und Rechtstexte werden nur dort angepasst, wo ihre eigene
   Struktur es erfordert.

Eine vollständige mobile Neugestaltung ist nicht vorgesehen. Farben, Schriften, Rundungen,
Bildsprache und die visuelle Hierarchie bleiben im bestehenden Markensystem.

## Aufbau und Komponenten

### Kopfbereich und Navigation

- Auf kleinen und mittleren Bildschirmen wird die Hauptnavigation kompakt dargestellt.
- Logo, Zurück-Navigation, Sprachwahl und wichtigste Handlung bleiben gut erreichbar.
- Navigationspunkte dürfen weder über den Rand laufen noch mehrere unruhige Zeilen bilden.
- Alle anklickbaren Bedienelemente erhalten ausreichend große Berührungsflächen.

### Einleitungen und Überschriften

- Zweispaltige Einleitungen beginnen erst bei einer Breite, bei der beide Spalten sicher
  lesbar bleiben.
- Schriftgrößen wachsen stufenweise statt abrupt.
- Lange deutsche Wörter und Handlungsaufforderungen dürfen keine Spalte verbreitern.

### Karten, Listen und Handlungsaufforderungen

- Raster verwenden flexible Mindestbreiten und erlauben ihren Kindern, kleiner zu werden.
- Innenabstände werden auf sehr kleinen Bildschirmen reduziert.
- Schaltflächen nutzen auf kleinen Bildschirmen die verfügbare Breite und brechen Text
  kontrolliert um.
- Lange Texte, Listen und Interviewkarten bleiben vollständig lesbar.

### Weitere öffentliche Seitentypen

- Blogbilder, eingebettete Medien und Beitragsüberschriften passen sich der Breite an.
- Rechtstexte behalten eine gut lesbare Zeilenlänge und sichere Seitenabstände.
- AI-Chatfenster und Fußbereich dürfen keine Inhalte verdecken oder verbreitern.

## Verhalten und Abhängigkeiten

Die Überarbeitung verändert keine Datenflüsse, Formulare oder externen Dienste. Gemeinsame
Seitenbausteine bleiben die zentrale Quelle für Navigation und Angebotslayouts. Änderungen
werden bevorzugt dort vorgenommen, damit deutsche und englische Varianten dasselbe Verhalten
erhalten. Seitenspezifische Regeln werden nur ergänzt, wenn gemeinsame Regeln nicht ausreichen.

## Fehlervermeidung

- Kein pauschales Abschneiden mit `overflow-x: hidden` als Ersatz für die Ursachenbehebung.
- Keine festen Breiten, die unterhalb ihrer Mindestgröße über den Bildschirm ragen.
- Keine Änderung vorhandener Texte, Preise, Gesundheitsversprechen oder Zieladressen.
- Bestehende lokale Änderungen in Datenbank, Umgebungsdateien und Projektanweisungen bleiben
  unangetastet.

## Prüfung und Erfolgskriterien

Die öffentlichen Seitentypen werden mindestens bei 320, 375, 768, 1024 und 1440 Pixeln
Breite geprüft. Die Prüfung umfasst Deutsch und Englisch sowie:

- kein horizontaler Überlauf
- keine abgeschnittenen Überschriften, Karten, Bilder oder Schaltflächen
- kompakte und bedienbare Navigation
- lesbare Schriftgrößen und Abstände
- sinnvoll gestapelte Spalten und Raster
- funktionierende Sprachwahl, interne Navigation und wichtige Handlungsaufforderungen
- sichtbarer und bedienbarer AI-Chat ohne Überlagerung wichtiger Inhalte
- erfolgreiche technische Projektprüfung und lokaler Produktionsaufbau

Die fertige Version wird ausschließlich lokal bereitgestellt und im Browser auf großem und
kleinem Bildschirm kontrolliert. Eine Veröffentlichung erfolgt nur nach einer späteren,
eindeutigen Freigabe.
