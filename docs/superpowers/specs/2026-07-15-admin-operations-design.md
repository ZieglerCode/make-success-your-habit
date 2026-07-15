# Admin Operations and Backups Design

## Ziel

Fällige Blogposts werden garantiert zeitnah veröffentlicht, operative Läufe sind im Admin sichtbar, und Coolify erstellt täglich wiederherstellbare Datenbank- und Upload-Backups mit 14 Tagen Aufbewahrung.

## Maintenance-Sicherheit

- Die neue Umgebungsvariable `MAINTENANCE_SECRET` ist in Produktion verpflichtend für Maintenance-Endpunkte.
- Requests authentifizieren sich mit `Authorization: Bearer <MAINTENANCE_SECRET>`.
- Fehlendes oder falsches Secret liefert immer `401`, ohne Konfigurationsdetails preiszugeben.
- Admin-Sessions dürfen Status lesen, aber keine Cron-Authentifizierung ersetzen.

## Geplante Veröffentlichung

- Die bisher interne Veröffentlichung fälliger Posts wird als idempotente Store-Funktion exportiert und gibt die Anzahl veröffentlichter Beiträge zurück.
- `POST /api/maintenance/publish-scheduled` führt sie aus und protokolliert Start, Ende, Ergebnis, Laufzeit und Anzahl.
- Gleichzeitige Läufe werden über einen Datenbank-Lock beziehungsweise eine atomare Laufmarkierung verhindert.
- Coolify ruft den Endpoint jede Minute auf.
- Die bestehende Veröffentlichung bei normalen Lesezugriffen bleibt als Fallback bestehen.
- Ein Fehler eines einzelnen Laufs ändert keine noch nicht fälligen Beiträge und wird im nächsten Lauf erneut versucht.

## Laufprotokolle und Health

Die additive Tabelle `maintenance_runs` speichert Typ, Status, Start, Ende, Dauer, Ergebniszahlen und eine bereinigte Fehlermeldung. Aufbewahrt werden 90 Tage.

- `GET /api/maintenance/status` ist nur für Admin-Sessions verfügbar.
- Die Settings-Seite zeigt letzten Scheduler-Lauf, letzte Veröffentlichung, letztes Backup, Fehlerstatus, Datenbankanbieter und Upload-Speicherart.
- Veraltete Läufe werden deutlich markiert: Scheduler älter als fünf Minuten, Backup älter als 36 Stunden.

## Backup-Inhalt

Der Produktionscontainer erhält `postgresql-client` und die notwendigen Archivwerkzeuge. Das Script `scripts/backup-content.mjs` erstellt unter `/app/backups/<UTC-Zeitstempel>/`:

- einen vollständigen PostgreSQL-Custom-Format-Dump über `pg_dump`, einschließlich Custom-Content- und Payload-Schema,
- ein komprimiertes Archiv von `/app/public/uploads`,
- eine Manifestdatei mit Zeitpunkt, Dateigrößen, SHA-256-Prüfsummen, Anwendungsversion und Ergebnis.

Bei lokaler LibSQL-Datei wird statt `pg_dump` eine konsistente Kopie der SQLite-Datei gesichert. Turso benötigt einen separat dokumentierten Provider-Backupweg und ist nicht Ziel der Coolify-Production-Konfiguration.

Ein Backup gilt nur als erfolgreich, wenn Datenbankdump, Upload-Archiv, Prüfsummen und Manifest vollständig geschrieben wurden. Temporäre Verzeichnisse werden erst danach atomar umbenannt.

## Aufbewahrung und Restore

- Erfolgreiche Backups bleiben 14 Tage erhalten.
- Mindestens das neueste erfolgreiche Backup wird niemals automatisch gelöscht.
- Fehlgeschlagene temporäre Backups werden nach 24 Stunden entfernt.
- `scripts/restore-content.mjs <backup-verzeichnis>` prüft Manifest und SHA-256 vor jeder Änderung.
- Restore verlangt zusätzlich `CONFIRM_RESTORE=restore-content` und läuft nie über einen öffentlichen HTTP-Endpunkt.
- PostgreSQL-Restore nutzt `pg_restore`; Uploads werden erst in ein temporäres Verzeichnis entpackt und anschließend ausgetauscht.
- Vor einem Restore wird ein Sicherheitsbackup empfohlen und im Runbook verpflichtend beschrieben.

## Coolify-Konfiguration

- Persistentes Upload-Volume: `uploads:/app/public/uploads`.
- Separates Backup-Volume: `backups:/app/backups`.
- Scheduled Task jede Minute für Publishing.
- Scheduled Task täglich für Backups.
- Benötigte Variablen: `MAINTENANCE_SECRET`, `DATABASE_URL`, bestehende Admin- und Auth-Variablen.
- Die Dokumentation enthält exakte Befehle, Health-Prüfung, Restore-Probe und Fehlerbehebung.

## Tests und Abnahme

- Authentifizierungs- und Idempotenztests des Publishing-Endpoints.
- Store-Tests für fällige/nicht fällige Beiträge, parallele Läufe und Run-Aufbewahrung.
- Backup-Tests mit temporären Verzeichnissen, Prüfsummen, atomarem Abschluss und 14-Tage-Bereinigung.
- Restore-Dry-Run gegen Testdatenbank und Test-Uploadverzeichnis.
- Browser-Abnahme der Settings-Statuskarten auf Desktop und Mobile.
- Docker-Build muss `pg_dump`, `pg_restore`, `tar` und die App enthalten.

## Betriebsgrenze

Das separate Backup-Volume schützt vor Container-Redeployments und versehentlichem Löschen im Upload-Volume. Es ist kein Offsite-Backup gegen vollständigen Hostverlust. Ein späteres verschlüsseltes Offsite-Ziel kann an das fertige Manifest angeschlossen werden, ist aber nicht Bestandteil dieser Umsetzung.
