# Migration Backup Manifest

The validated mode-0600 backup set is stored outside Git on the VPS at:

`/data/backups/msyh-webstudio/20260719T130637Z`

It contains the CMS PostgreSQL custom-format dump, CMS uploads, Webstudio PostgreSQL custom-format dump, Webstudio assets and staged uploads, plus the active legacy and Webstudio deployment definitions. PostgreSQL restore-list validation and gzip archive-list validation passed before these checksums were recorded.

The backup archives and secret-bearing deployment files must remain on the VPS and must not be copied into this repository.
