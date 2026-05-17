# Make Success Your Habit

Next.js Website mit Blog-System und geschütztem Adminbereich für Heike Ziegler.

## Lokale Entwicklung

1. Dependencies installieren:
   `npm install`
2. `.env.local` anhand von `.env.example` anlegen.
3. Dev-Server starten:
   `npm run dev`

Der Adminbereich liegt unter `/admin/login`.

## Admin Account

Es gibt genau einen Admin-Account. Es existiert keine Signup-UI und keine Registrierungs-API; `/api/auth/register` und `/api/auth/signup` liefern `403`.

Empfohlene Production-Konfiguration:

```bash
ADMIN_NAME="Heike Ziegler"
ADMIN_EMAIL="heike@make-success-your-habit.com"
ADMIN_PASSWORD_HASH="<bcrypt-hash>"
AUTH_SECRET="<lange-zufaellige-session-secret>"
```

Einen Passwort-Hash erzeugst du lokal so:

```bash
node scripts/hash-admin-password.mjs "ein-langes-sicheres-passwort"
```

In Development ist als Fallback `ADMIN_PASSWORD=change-me-heike` möglich. In Production muss `ADMIN_PASSWORD_HASH` oder `ADMIN_PASSWORD` gesetzt sein.

## Persistent Storage

Die App wählt den Content-Speicher automatisch:

1. Turso, wenn `TURSO_DATABASE_URL` gesetzt ist.
2. Postgres, wenn `DATABASE_URL`, `POSTGRES_URL` oder `POSTGRES_PRISMA_URL` gesetzt ist.
3. Lokale SQLite-Datei als Development-Fallback.

### Vercel Postgres / Neon / Supabase

Setze in Vercel:

```bash
DATABASE_URL="postgres://..."
```

Alternativ werden Vercel-übliche `POSTGRES_URL` und `POSTGRES_PRISMA_URL` ebenfalls erkannt.

### Turso

Setze in Vercel:

```bash
TURSO_DATABASE_URL="libsql://..."
TURSO_AUTH_TOKEN="..."
```

Wenn Turso gesetzt ist, hat Turso Vorrang vor Postgres.

## Vercel Deploy

Das Projekt enthält `vercel.json` und baut mit `npm run build`.

In Vercel müssen mindestens diese Environment Variables gesetzt werden:

- `AUTH_SECRET`
- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `DATABASE_URL` oder `TURSO_DATABASE_URL` plus `TURSO_AUTH_TOKEN`
- optional, aber für produktive Uploads empfohlen: `BLOB_READ_WRITE_TOKEN`

Die Tabellen werden beim ersten Request automatisch angelegt und mit Startinhalten gefüllt, falls sie leer sind.

Uploads schreiben lokal nach `public/uploads`. Wenn `BLOB_READ_WRITE_TOKEN` gesetzt ist, werden Uploads über Vercel Blob gespeichert und die öffentliche Blob-URL in der Datenbank abgelegt.
