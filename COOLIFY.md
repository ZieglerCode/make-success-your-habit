# Coolify Deployment

Deploy this repository as the customer app for:

```text
https://kunde1.mathishoffmann.com
```

Payload Admin is available at:

```text
https://kunde1.mathishoffmann.com/payload-admin
```

Use Coolify's Dockerfile build pack and expose port `3000`.

Required environment variables:

```text
NODE_ENV=production
DATABASE_URL=<Coolify internal PostgreSQL URL>
PAYLOAD_SECRET=<long random secret>
NEXT_PUBLIC_SERVER_URL=https://kunde1.mathishoffmann.com
AUTH_SECRET=<long random secret>
ADMIN_EMAIL=<existing custom admin email if needed>
ADMIN_PASSWORD_HASH=<existing custom admin hash if needed>
UPLOAD_DIR=/app/data/uploads
PAYLOAD_MEDIA_DIR=/app/data/payload-media

# AI Assistant
GEMINI_API_KEY=<Google Gemini API Key>
GEMINI_MODEL=gemini-3.8-flash
```

Optional AI controls (default values are applied automatically when omitted):
- `AI_USAGE_DB_PATH`: defaults to `/app/data/ai-usage.sqlite` (saved on persistent volume)
- `AI_RATE_LIMIT_SECRET`: defaults to `AUTH_SECRET`
- `AI_MONTHLY_REQUEST_LIMIT`: defaults to `5000`
- `AI_DAILY_REQUEST_LIMIT`: defaults to `250`
- `AI_IP_MINUTE_REQUEST_LIMIT`: defaults to `10`
- `AI_IP_DAILY_REQUEST_LIMIT`: defaults to `50`
- `AI_VISITOR_DAILY_REQUEST_LIMIT`: defaults to `50`
- `AI_VISITOR_MINUTE_REQUEST_LIMIT`: defaults to `10`

The existing custom admin remains at `/admin`; Payload is mounted separately at `/payload-admin`.

## Persistent media storage

Add one persistent Docker volume to the Coolify application and redeploy:

```text
cms-data:/app/data
```

Custom blog uploads are stored below `/app/data/uploads`; Payload media is stored below
`/app/data/payload-media`. The container creates both directories with the required ownership.
Without this volume, uploaded files disappear whenever Coolify replaces the container.
