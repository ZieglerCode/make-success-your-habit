# Admin Blog Cover Upload Design

## Ziel

Ein im Admin-Blog hochgeladenes Bild oder Video wird auf der Coolify-Produktivseite sofort sichtbar, automatisch als Cover des aktuellen Entwurfs übernommen und nach dem regulären Speichern dauerhaft am Beitrag hinterlegt.

## Ursache

Der Editor speichert einen erfolgreichen Upload derzeit nur im lokalen Zustand `lastUpload`. Das Feld `draft.coverImage` bleibt unverändert, weshalb weiterhin das Standardbild `/media/images/heike-ziegler.webp` erscheint. Ohne `BLOB_READ_WRITE_TOKEN` schreibt die Upload-API außerdem zur Laufzeit nach `public/uploads`. Der Next.js-Produktionsserver behandelt `public` primär als Build-Artefakt; neu entstandene Dateien müssen deshalb über eine explizite Route aus dem persistenten Coolify-Volume ausgeliefert werden.

## Gewählter Ansatz

Die bestehende Upload-API und die gespeicherten `/uploads/<dateiname>`-URLs bleiben kompatibel. Eine neue GET-Route liefert lokale Uploads direkt aus `/app/public/uploads` aus. Der Editor übernimmt die von der API zurückgegebene Datei nach erfolgreichem Upload automatisch als Cover und zeigt sie in der Upload- sowie Cover-Vorschau an.

Vercel Blob bleibt unverändert unterstützt: Absolute Blob-URLs werden weiterhin direkt verwendet und nicht über die lokale Route geleitet.

## Datenfluss

1. Die Administratorin wählt eine erlaubte Bild- oder Videodatei aus.
2. `POST /api/media` validiert Typ und Größe, speichert die Datei und legt den Medien-Datensatz an.
3. Die API gibt mindestens `url`, `mimeType` und `alt` zurück.
4. Der Editor setzt `lastUpload`, `draft.coverImage` und `draft.coverAlt` in einem konsistenten Zustandswechsel.
5. Die Meldung erklärt, dass der Upload als Cover gesetzt wurde und der Beitrag noch gespeichert werden muss.
6. `GET /uploads/<dateiname>` liest lokale Dateien aus dem Upload-Verzeichnis und liefert den passenden Content-Type. Absolute Blob-URLs umgehen diese Route.
7. Erst der bestehende Speichern-Button persistiert die Cover-URL am Blogpost.

## Sicherheits- und Fehlerverhalten

- Die Download-Route akzeptiert nur einen bereinigten einzelnen Dateinamen und verhindert Pfad-Traversal.
- Nicht vorhandene Dateien liefern `404`, nicht lesbare Dateien `500` ohne interne Pfade offenzulegen.
- Die Route setzt den gespeicherten beziehungsweise aus der Erweiterung abgeleiteten Content-Type und einen Cache-Header.
- Ein fehlgeschlagener Upload verändert das bestehende Cover nicht.
- Kann die neue Preview nicht geladen werden, erscheint ein verständlicher Hinweis statt einer stillen defekten Bilddarstellung.
- Unterstützte Formate und Größen bleiben unverändert: JPG, PNG und WebP bis 8 MB; MP4, MOV und WebM bis 80 MB.

## Bedienung

- Bild- und Video-Uploads werden automatisch als Cover gesetzt.
- Die Aktion „Einfügen“ bleibt separat, damit ein Cover nicht unbeabsichtigt zusätzlich in den Beitragstext eingefügt wird.
- Der Beitrag wird nicht automatisch gespeichert. Die Oberfläche markiert die Änderung als ungespeichert.
- Die Erfolgsmeldung lautet sinngemäß: „Upload abgeschlossen und als Cover gesetzt. Beitrag noch speichern.“
- Der vorhandene Button „Als Cover“ kann entfallen oder als bestätigter Status dargestellt werden, weil die Zuordnung bereits automatisch erfolgt.

## Tests und Abnahme

- Ein Test schlägt zunächst fehl, solange ein erfolgreicher Upload nicht als Cover in den Draft übernommen wird.
- Ein Route-Test prüft erfolgreiche Bildauslieferung, korrekten Content-Type, `404` und Schutz vor Pfad-Traversal.
- TypeScript-Prüfung und Produktions-Build müssen ohne neue Fehler durchlaufen.
- Browser-Abnahme: Admin-Editor öffnen, Bild hochladen, neue Upload-Preview sehen, identische Cover-Preview sehen, ungespeicherten Zustand sehen, Beitrag speichern und nach Reload dieselbe Cover-URL sowie dasselbe Bild sehen.
- Zusätzlich wird ein fehlerhafter Preview-Zustand überprüft.

## Nicht Bestandteil

- Automatisches Zuschneiden oder Komprimieren von Bildern.
- Mehrfach-Uploads und Drag-and-drop.
- Automatisches Speichern des Blogposts direkt nach einem Upload.
- Migration bestehender Uploads zu einem externen Object Storage.
