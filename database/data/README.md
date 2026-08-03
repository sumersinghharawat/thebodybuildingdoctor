# Live database snapshot

`live_snapshot.sql` is extracted from production dump `pinkujqu_doctor.sql`
(content tables only).

## What is included
- users, courses, lessons, blogs, enrollments, inquiries, site_settings, passkeys

## What is excluded
- sessions, cache, jobs, password reset tokens, personal access tokens, migrations

## Safety
Migration `2026_08_03_000003_import_live_snapshot_data` **skips** when
`users` or `courses` already have rows, so production data is not overwritten.

## Deploy notes
On production (data already present):

```bash
php artisan migrate
```

Only new schema migrations run (e.g. books). The snapshot import is a no-op.

On a fresh empty database:

```bash
php artisan migrate
```

Schema is created, then live content is imported from this snapshot.
