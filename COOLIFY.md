# Coolify Deployment

Deploy this repository as the private editorial CMS for:

```text
https://cms.heike-ziegler.com
```

Payload Admin is available at:

```text
https://cms.heike-ziegler.com/payload-admin
```

Use Coolify's Dockerfile build pack and expose port `3000`.

Required environment variables:

```text
NODE_ENV=production
DATABASE_URL=<Coolify internal PostgreSQL URL>
PAYLOAD_SECRET=<long random secret>
NEXT_PUBLIC_SERVER_URL=https://cms.heike-ziegler.com
AUTH_SECRET=<long random secret>
MAINTENANCE_SECRET=<separate long random secret>
ADMIN_EMAIL=heike.ziegler.sales@gmail.com
ADMIN_PASSWORD_HASH=<existing custom admin hash if needed>
GEMINI_API_KEY=<Coolify secret; never commit>
GEMINI_TRANSLATION_MODEL=gemini-3.1-flash-lite
```

The existing custom admin remains at `/admin`; Payload is mounted separately at `/payload-admin`.
The public site continues to use `www.heike-ziegler.com` until the jointly approved customer-platform cutover.
Only the read-only endpoints below `/api/public/` are consumed by the customer platform. Do not expose
database, PostgREST, or maintenance ports publicly.

## Persistent Storage / Volumes

To prevent uploaded images, videos, and other media from disappearing when the Docker container is redeployed or restarted, you must configure a persistent volume mount in Coolify.

Under the **Storage / Volumes** configuration of your Coolify application, add the following mount path:

```text
uploads:/app/public/uploads
backups:/app/backups
```

This maps a persistent Docker volume named `uploads` to the container's uploads directory. Make sure you redeploy the app after configuring the volume.

## Scheduled Tasks

Create a Coolify Scheduled Task that runs every minute (`* * * * *`):

```sh
curl -fsS -X POST -H "Authorization: Bearer $MAINTENANCE_SECRET" https://cms.heike-ziegler.com/api/maintenance/publish-scheduled
```

Create a second task that runs daily, for example at 02:30 (`30 2 * * *`):

```sh
npm run backup
```

The backup job stores a database dump, the complete uploads archive, SHA-256 checksums, and a manifest below `/app/backups`. The newest 14 daily backups are retained. Check **Admin → Settings** after deployment; the scheduler is marked overdue after five minutes and backups after 36 hours.

## Restore runbook

Stop writes to the application, open a Coolify terminal, identify the desired backup directory, and run:

```sh
CONFIRM_RESTORE=restore-content npm run restore -- /app/backups/<backup-directory>
```

The restore command verifies the manifest and checksums before replacing database content and uploads. Restart the application and verify Admin → Settings plus a public blog post afterwards.
