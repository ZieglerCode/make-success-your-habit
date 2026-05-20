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
```

The existing custom admin remains at `/admin`; Payload is mounted separately at `/payload-admin`.
