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

Snapshot users from `database/seeders/data/app-content.json` use `SEED_USER_PASSWORD` from `.env` (default: `password`).

Public registration is disabled — admins create users and enrollments.

## Mobile app

Point the Expo app at your local or production API:

```env
EXPO_PUBLIC_WEB_API_URL=http://localhost:8000
```

## Production content snapshot

Courses, lessons, mentorship, and users are seeded from `database/seeders/data/app-content.json` when you run `php artisan db:seed`.

## Deploy

See [NAMECHEAP_DEPLOY.md](./NAMECHEAP_DEPLOY.md).
