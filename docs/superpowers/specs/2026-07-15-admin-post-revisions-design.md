# Admin Post Revisions Design

## Ziel

Jede gespeicherte Änderung eines bestehenden Blogposts bleibt nachvollziehbar und kann sicher wiederhergestellt werden, ohne die aktuelle Fassung unwiderruflich zu überschreiben.

## Datenmodell

Die neue Tabelle `post_revisions` enthält:

- eindeutige Revisions-ID,
- Post-ID mit Löschweitergabe,
- vollständigen Snapshot aller redaktionellen Postfelder,
- Erstellungszeitpunkt,
- auslösende Aktion `save`, `restore` oder `status-change`,
- Admin-ID und Admin-Name.

Der Snapshot wird als explizite Spaltenstruktur gespeichert, nicht als undurchsuchbarer Datenbankdump. Damit bleiben Status, Titel, Slug und Zeitpunkt in Listen effizient verfügbar. Die Implementierung unterstützt Postgres und LibSQL/Turso mit denselben Rückgabedaten.

## Erzeugung und Aufbewahrung

- Vor jedem erfolgreichen Update eines bestehenden Posts wird die bisherige Fassung als Revision gespeichert.
- Revision und Post-Update laufen in einer Datenbanktransaktion. Schlägt eines fehl, wird keines persistiert.
- Reine No-op-Saves ohne Feldänderung erzeugen keine Revision.
- Pro Beitrag bleiben die neuesten 50 Revisionen erhalten; ältere werden nach erfolgreichem Update entfernt.
- Das Löschen eines Posts entfernt seine Revisionen.
- Das Erstellen eines neuen Posts erzeugt noch keine Revision.

## Wiederherstellung

- `GET /api/posts/<id>/revisions` liefert die Revisionsliste nur für den angemeldeten Admin.
- `GET /api/posts/<id>/revisions/<revisionId>` liefert den vollständigen Snapshot.
- `POST /api/posts/<id>/revisions/<revisionId>/restore` stellt den Snapshot wieder her.
- Vor einer Wiederherstellung wird die aktuelle Fassung als Aktion `restore` gesichert.
- Die Wiederherstellung verwendet dieselben Validierungsregeln wie ein normaler Save.
- Bei Slug-Konflikten wird nichts verändert und die Oberfläche zeigt einen konkreten Fehler.

## Admin-Bedienung

- Der Blog-Editor erhält einen Bereich „Versionen“ mit Zeitpunkt, Status, Titel und Aktion.
- Eine Revision kann vor der Wiederherstellung in einer schreibgeschützten Vorschau betrachtet werden.
- Die UI zeigt eine kompakte Feldänderungsübersicht gegenüber der aktuellen Fassung.
- Wiederherstellen verlangt eine Bestätigung und lädt anschließend den restaurierten Draft.
- Ein Erfolgsstatus benennt den wiederhergestellten Zeitpunkt.

## Tests und Abnahme

- Store-Tests für Erstellung, No-op, Transaktionsrollback, 50er-Aufbewahrung und Löschweitergabe.
- API-Tests für Authentifizierung, fremde Revisions-ID, Slug-Konflikt und Restore.
- Browser-Abnahme: Post ändern, speichern, Revision öffnen, Unterschiede prüfen, wiederherstellen und nach Reload verifizieren.
- Postgres- und LibSQL-Abfragen müssen typgleich normalisiert werden.

## Nicht Bestandteil

- Gleichzeitiges kollaboratives Bearbeiten mehrerer Nutzer.
- Zeichenweises Undo über mehrere Browser oder Live-Diff-Merging.
