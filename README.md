# Make Success Your Habit

Next.js Website mit Blog-System und geschütztem Adminbereich für Heike Ziegler. Die aktuelle
öffentliche Website, das Blog-CMS, die Medienverwaltung und das Admin-Dashboard liegen in
dieser Codebase. Im Zielsystem bleibt diese App als selbst gehostetes Redaktions-CMS bestehen;
Webstudio liefert nach gemeinsamer Abnahme die visuell bearbeitbare öffentliche Website aus.

## Lokale Entwicklung

1. Dependencies installieren:
   `npm install`
2. `.env.local` anhand von `.env.example` anlegen.
3. Dev-Server starten:
   `npm run dev`

Der Adminbereich liegt unter `/admin/login`. Nach dem Login sind diese Bereiche enthalten:

- `/admin` Dashboard
- `/admin/blog` Blogposts verwalten
- `/admin/blog/new` Blogpost erstellen
- `/admin/media` Medien hochladen
- `/admin/website` Website-Texte bearbeiten
- `/admin/settings` Account- und Deployment-Hinweise

## Admin Account

Es gibt genau einen Admin-Account. Es existiert keine Signup-UI und keine Registrierungs-API; `/api/auth/register` und `/api/auth/signup` liefern `403`.

Empfohlene Production-Konfiguration:

```bash
ADMIN_NAME="Heike Ziegler"
ADMIN_EMAIL="heike.ziegler.sales@gmail.com"
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

1. Postgres, wenn `DATABASE_URL`, `POSTGRES_URL` oder `POSTGRES_PRISMA_URL` gesetzt ist.
2. Turso, wenn `TURSO_DATABASE_URL` gesetzt ist.
3. Lokale SQLite-Datei als Development-Fallback.

### PostgreSQL

Setze in Coolify:

```bash
DATABASE_URL="postgres://..."
```

Alternativ werden Vercel-übliche `POSTGRES_URL` und `POSTGRES_PRISMA_URL` ebenfalls erkannt.

### Turso

Setze in Coolify:

```bash
TURSO_DATABASE_URL="libsql://..."
TURSO_AUTH_TOKEN="..."
```

Wenn eine PostgreSQL-URL gesetzt ist, hat PostgreSQL Vorrang vor Turso.

## Self-hosted deployment

Das Projekt baut mit `npm run build` und läuft als separate Coolify-Anwendung unter
`cms.heike-ziegler.com`. Die öffentliche Domain `www.heike-ziegler.com` bleibt bis zur
gemeinsamen Abnahme auf der bestehenden Website.

In Coolify müssen mindestens diese Environment Variables gesetzt werden:

- `AUTH_SECRET`
- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `DATABASE_URL` oder `TURSO_DATABASE_URL` plus `TURSO_AUTH_TOKEN`
- `GEMINI_API_KEY` und `GEMINI_TRANSLATION_MODEL=gemini-3.1-flash-lite`
- optional, aber für produktive Uploads empfohlen: `BLOB_READ_WRITE_TOKEN`

Die Tabellen werden beim ersten Request automatisch angelegt und mit Startinhalten gefüllt, falls sie leer sind.

Uploads schreiben lokal nach `public/uploads`; in Coolify ist `/app/public/uploads` als
persistentes Volume einzubinden. Wenn `BLOB_READ_WRITE_TOKEN` gesetzt ist, kann alternativ
Vercel Blob verwendet werden.
Der Blog-Editor und die Medienverwaltung akzeptieren Bilder (`JPG`, `PNG`, `WebP`) und Videos
(`MP4`, `MOV`, `WebM`).
# Operations

Production uses Coolify scheduled tasks for due blog posts and daily content backups. Configure persistent volumes at `/app/public/uploads` and `/app/backups`; see [COOLIFY.md](./COOLIFY.md) for the exact jobs and restore procedure.
