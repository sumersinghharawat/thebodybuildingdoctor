# Firebase export data

`firestore-export.json` is generated from production Firebase/MongoDB data.

## Refresh export (before deploy)

From the `web/` folder (requires `serviceAccountKey.json` and `.env.local`):

```bash
npm run export:laravel
```

This overwrites `backend/database/seeders/data/firestore-export.json`.

## Seed Laravel database

```bash
cd backend
php artisan migrate --seed
```

Or import only Firebase data:

```bash
php artisan db:seed --class=FirestoreDataSeeder
```

## Imported user passwords

Firebase password hashes cannot be migrated. All imported users receive the password from `IMPORTED_USER_PASSWORD` in `.env` (default: `ChangeMeAfterImport!`). Send password reset emails after go-live.

## Last export

- **Exported at:** 2026-07-01
- **Users:** 114 (Firebase Auth + roles)
- **Courses:** 15 (+ 1 placeholder for orphaned lessons)
- **Lessons:** 140
- **Enrollments:** 5
- **Mentorship:** 41
- **Inquiries:** 1

**Note:** This file contains real user emails. Do not commit to public repositories.
