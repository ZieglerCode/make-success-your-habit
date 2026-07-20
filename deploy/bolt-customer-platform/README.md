# Bolt Customer Platform

This service provides the first multi-tenant boundary in front of Bolt:

- server-side users and sessions;
- projects identified by their dedicated builder host;
- explicit per-user project memberships;
- an administrator console below `/_auth/admin`;
- Traefik ForwardAuth headers for protected Bolt instances;
- automatic isolated Bolt containers below `<project>.build.mathishoffmann.com`;
- one private Git-backed snapshot service per customer project;
- daily rotating Git bundle backups;
- a persistent PostgreSQL database and audit log.

## Security model

The root host is available only to platform administrators. Customer users must have
an active membership for the project whose `primary_host` matches the requested host.
Authorization happens in the ForwardAuth service before a request reaches Bolt.

Bolt containers must add this middleware before compression:

```text
bolt-customer-auth@docker,bolt-diy-compress
```

The session cookie is HTTP-only, secure, SameSite=Lax, and scoped to
`.build.mathishoffmann.com` so one login can authorize assigned project subdomains.

## First deployment

1. Copy `.env.example` to `.env` and replace every secret.
2. Set `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` for the first start.
3. Run `docker compose --env-file .env up -d --build`.
4. Verify `https://build.mathishoffmann.com/_auth/health`.
5. Remove `BOOTSTRAP_ADMIN_PASSWORD` from `.env` and recreate the auth container.
6. Add `bolt-customer-auth@docker` to the Bolt HTTPS router.

Do not publish PostgreSQL or the auth service port directly. Only Traefik joins the
public route.

## Project provisioning

Build the pinned customer image and storage sidecar first:

```bash
chmod 0755 /data/bolt-customer-platform/provisioner/build-bolt-customer-image.sh
/data/bolt-customer-platform/provisioner/build-bolt-customer-image.sh
```

The build script refuses to apply the overlay unless Bolt is still at the reviewed
commit `5d3fb1d7def677bc8c9d89fed595f58aa454e0b9`. Rebase and review the overlay
before upgrading Bolt.

Then install the host-side provisioner:

```bash
chmod 0755 /data/bolt-customer-platform/provisioner/provision-projects.sh
install -m 0644 provisioner/bolt-project-provisioner.service /etc/systemd/system/
install -m 0644 provisioner/bolt-project-provisioner.timer /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now bolt-project-provisioner.timer
```

The timer polls only projects with `provisioning_status = 'pending'`. It validates
the UUID, slug and host again on the privileged host before creating a container.
The web-facing auth service never receives access to the Docker socket.

Every project receives:

- its own container and Compose project;
- its own storage sidecar without Docker socket access;
- a private Git repository below `/data/bolt-projects/<slug>/repository/repo`;
- an exact Traefik host router and individual TLS certificate;
- the shared ForwardAuth middleware;
- a browser origin isolated from all other customer projects.

Bolt restores the latest server snapshot into the WebContainer when the project
opens. File changes are coalesced for five seconds and then committed to the
project repository. Identical snapshots do not create redundant commits.
`node_modules` and nested `.git` directories are excluded.

## Backups and recovery

Install the daily backup timer:

```bash
chmod 0755 /data/bolt-customer-platform/provisioner/backup-project-repositories.sh
install -m 0644 provisioner/bolt-project-backup.service /etc/systemd/system/
install -m 0644 provisioner/bolt-project-backup.timer /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now bolt-project-backup.timer
```

Backups are stored as mode `0600` Git bundles below
`/data/bolt-project-backups/<slug>/` and retained for 30 days. A bundle can be
tested or restored without the running project:

```bash
git clone /data/bolt-project-backups/<slug>/<timestamp>.bundle /tmp/recovered-project
```

To restore a bundle into a project, stop its storage sidecar, clone the selected
bundle into the project's `repository/repo` directory, restore ownership to UID
and GID `10001`, and restart the sidecar. Keep an off-site copy of
`/data/bolt-project-backups`; local bundles protect against application mistakes,
but not against a complete VPS or disk loss.

## Encrypted off-site backup

The off-site job uses Restic so the project bundles and authentication database
are encrypted before upload. It supports S3-compatible storage, Backblaze B2,
Hetzner Storage Box over SFTP, and other Restic repositories.

Install Restic and the unit files:

```bash
apt-get update
apt-get install -y restic
install -m 0644 provisioner/bolt-offsite-backup.service /etc/systemd/system/
install -m 0644 provisioner/bolt-offsite-backup.timer /etc/systemd/system/
systemctl daemon-reload
```

Create `/data/bolt-customer-platform/.env.offsite` from
`.env.offsite.example`. Create a separate high-entropy repository password:

```bash
openssl rand -base64 48 > /data/bolt-customer-platform/restic-password
chmod 600 /data/bolt-customer-platform/.env.offsite
chmod 600 /data/bolt-customer-platform/restic-password
```

Keep `RESTIC_INIT_REPOSITORY=true` for the first successful run. Afterwards it
may be set to `false`, which prevents accidental initialization at an incorrect
destination.

Test the configured destination before enabling the timer:

```bash
systemctl start bolt-offsite-backup.service
systemctl status bolt-offsite-backup.service
systemctl enable --now bolt-offsite-backup.timer
```

The job creates a fresh custom-format PostgreSQL dump, refreshes the local project
bundles, uploads both plus this recovery documentation, and retains 14 daily,
8 weekly, and 12 monthly encrypted snapshots. It also runs `restic check` after
each backup. The timer is intentionally not enabled until real repository
credentials exist.

Restore the auth database into a disposable location first:

```bash
restic snapshots --tag bolt-customer-platform
restic restore latest --target /tmp/bolt-offsite-restore
pg_restore --list /tmp/bolt-offsite-restore/data/bolt-offsite-staging/bolt-auth.dump
```
