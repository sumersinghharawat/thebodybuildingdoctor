# The Bodybuilding Doctor — Laravel + Inertia + React

Backend and web app for the LMS, replacing the Next.js + Firebase stack.

## Stack

- **Laravel 12** — API, auth, MySQL
- **Inertia.js + React** — web UI (landing, dashboard, learn)
- **Laravel Sanctum** — mobile JWT tokens + SPA session cookies
- **MySQL** — production (Namecheap cPanel)

## Local development

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite   # or configure MySQL in .env
php artisan migrate
php artisan db:seed
php artisan storage:link

npm install
npm run dev          # Vite dev server
php artisan serve    # http://localhost:8000
```

### Seeded users

| Email | Password | Role |
|-------|----------|------|
| admin@thebodybuildingdoctor.test | password | administrator |
| member@thebodybuildingdoctor.test | password | media_channel |

Public registration is disabled — admins create users and enrollments.

## Mobile app

Point the Expo app at your local or production API:

```env
EXPO_PUBLIC_WEB_API_URL=http://localhost:8000
```

## Firebase production data

Export is at `database/seeders/data/firestore-export.json`. `php artisan db:seed` imports it automatically.

Refresh from Firebase:

```bash
cd ../web && npm run export:laravel
```

Imported users receive `IMPORTED_USER_PASSWORD` from `.env` (default: `ChangeMeAfterImport!`).

Manual import:

```bash
php artisan import:firestore-json database/seeders/data/firestore-export.json
```

## Deploy

See [NAMECHEAP_DEPLOY.md](./NAMECHEAP_DEPLOY.md).
