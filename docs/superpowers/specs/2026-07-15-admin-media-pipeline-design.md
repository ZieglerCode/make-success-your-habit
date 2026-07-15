# Admin Media Pipeline Design

## Ziel

Der Adminbereich erhält eine sichere, responsive Medien-Pipeline mit echter Inhaltsprüfung, automatischer Bildoptimierung, Varianten, Fokuspunkt, Fortschrittsanzeige, Abbruch und Wiederholung. Bestehende Medien-URLs bleiben funktionsfähig.

## Upload-Vertrag

- Bilder: JPEG, PNG und WebP bis 8 MB.
- Videos: MP4, MOV und WebM bis 80 MB.
- Die API prüft Dateiendung, gemeldeten MIME-Type und Dateisignatur. Alle drei Signale müssen zu einem erlaubten Format passen.
- Bilder werden zusätzlich mit Sharp dekodiert. Maximal zulässig sind 40 Megapixel und 12.000 Pixel pro Kante.
- Dekodierungsfehler, widersprüchliche Signaturen und nicht erlaubte Formate liefern `400` mit verständlicher deutscher Fehlermeldung.
- Der Dateiname wird serverseitig neu erzeugt und enthält keine Benutzereingaben außer einem bereinigten lesbaren Präfix.

## Bildverarbeitung und Speicherung

Jedes neue Bild erhält eine Asset-ID und eine logische Asset-Gruppe. Gespeichert werden:

- das validierte Original mit unverändertem Bildformat,
- WebP-Varianten mit maximal 640, 1280 und 1920 Pixel Breite,
- eine Social-Cover-Variante mit 1200 × 630 Pixeln,
- Breite, Höhe, Dateigröße und MIME-Type jeder Variante.

Sharp entfernt EXIF- und sonstige Metadaten aus allen erzeugten Varianten. Das Original bleibt für spätere Neuberechnung erhalten und wird nur über den geschützten Adminbereich angeboten; öffentliche Seiten verwenden optimierte Varianten.

Lokale Dateien liegen unter `public/uploads/<asset-id>/`. Bei Vercel Blob werden dieselben logischen Pfade im Blob-Namespace verwendet. Das bestehende Feld `media_assets.url` bleibt die Standard-URL und zeigt bei Bildern auf die 1920er-, ersatzweise auf die größte verfügbare Variante. Videos behalten ihre Original-URL.

Die Tabelle `media_assets` erhält additive Felder für Original-URL, Varianten-JSON, Breite, Höhe sowie Fokuspunkt X/Y. Bestehende Datensätze ohne diese Felder bleiben gültig und werden wie bisher dargestellt.

## Fokuspunkt und Zuschnitt

- Der Fokuspunkt wird als normalisierte Koordinate von `0` bis `1` gespeichert; Standard ist `(0.5, 0.5)`.
- Die Medienverwaltung zeigt für Bilder eine interaktive Fokuspunktfläche.
- Eine Änderung erzeugt die Social-Cover-Variante aus dem vorhandenen Original neu.
- Der Blog-Editor übernimmt Varianten und Fokuspunkt aus der Medienbibliothek.
- Öffentliche Blogkarten und Cover nutzen `object-position` entsprechend dem Fokuspunkt.

## Responsive Darstellung

- Ein gemeinsames Medienmodell erzeugt `src`, `srcSet`, Breite, Höhe und Fokusposition.
- Blogübersicht, Blogdetail, Homepage-Blogkarten und Admin-Previews verwenden die optimierten Varianten.
- Bestehende einzelne URLs und externe Blob-URLs funktionieren weiterhin als Fallback.
- Videos bleiben native `<video>`-Elemente und erhalten keine automatische Transkodierung.

## Upload-Bedienung

- Blog-Editor und Medienverwaltung verwenden einen gemeinsamen XHR-basierten Upload-Client.
- Sichtbar sind Dateiname, lokale Vorschau, Upload-Fortschritt in Prozent, Abbrechen und Wiederholen.
- Drag-and-drop und der normale Dateidialog führen durch denselben Codepfad.
- Clientseitige Prüfung dient nur schneller Rückmeldung; die Servervalidierung bleibt maßgeblich.
- Ein abgebrochener oder fehlgeschlagener Upload verändert weder Cover noch Medienbibliothek.
- Ein erfolgreicher Upload im Blog-Editor wird weiterhin automatisch als Cover gesetzt, aber nicht automatisch als Beitrag gespeichert oder in den Inhalt eingefügt.

## Löschen und Kompatibilität

- Das Löschen eines Assets entfernt Original und alle bekannten Varianten lokal beziehungsweise aus Vercel Blob.
- Fehlen einzelne Dateien bereits, wird der Datenbankdatensatz trotzdem konsistent bereinigt.
- Bestehende flache `/uploads/<datei>`-URLs werden weiterhin durch die vorhandene Upload-Route ausgeliefert.

## Tests und Abnahme

- Signaturtests für erlaubte und manipulierte JPEG-, PNG-, WebP-, MP4-, MOV- und WebM-Dateien.
- Sharp-Tests für Dimensionslimit, Metadatenentfernung, Variantenabmessungen und Fokus-Zuschnitt.
- Storage-Tests für lokale Dateien und abstrahierte Blob-Pfade.
- Clienttests für Fortschritt, Abbruch, Wiederholung und unveränderten Draft bei Fehlern.
- Browser-Abnahme in Medienverwaltung und Blog-Editor auf Desktop und Mobile.
- Produktions-Build sowie ein Laufzeit-Test mit erst nach Serverstart erzeugten Varianten.

## Nicht Bestandteil

- Video-Transkodierung, Video-Thumbnails oder Virenscanner eines externen Anbieters.
- Massenmigration aller bestehenden Bilder. Bestehende Assets können später einzeln neu verarbeitet werden.
