# App content snapshot

`app-content.json` is a static snapshot of production courses, lessons, mentorship posts, enrollments, and users. It is committed to the repo and loaded by `AppContentSeeder` — no Firebase export step is required.

## Seed the database

```bash
php artisan migrate:fresh --seed
```

Or seed content only:

```bash
php artisan db:seed --class=AppContentSeeder
```

## Seeded passwords

| Account | Email | Password |
|---------|-------|----------|
| Dev admin | `admin@thebodybuildingdoctor.test` | `password` |
| Dev member | `member@thebodybuildingdoctor.test` | `password` |
| Snapshot users | their real email from the JSON | `SEED_USER_PASSWORD` from `.env` (default: `password`) |

Set `SEED_USER_PASSWORD` in `.env` before seeding if you want a different password for snapshot users.

## Media files

Images are stored in `database/seeders/media/` and copied to `storage/app/public/` during seeding. The database stores storage-relative paths (e.g. `courses/abc.jpg`).

To (re)download images from the URLs in `app-content.json`:

```bash
php artisan app-content:fetch-media
```

Then seed:

```bash
php artisan migrate:fresh --seed
```

Ensure `php artisan storage:link` has been run so `/storage/...` URLs are served.

## Snapshot contents

- **Exported at:** 2026-07-01
- **Users:** 114
- **Courses:** 15 (+ 1 placeholder for orphaned lessons)
- **Lessons:** 140
- **Enrollments:** 5
- **Mentorship:** 41
- **Inquiries:** 1

**Note:** This file contains real user emails. Do not commit to public repositories.
