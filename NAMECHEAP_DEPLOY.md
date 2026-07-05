# Namecheap Shared Hosting Deployment

Deploy the Laravel + Inertia + React app in [`backend/`](../backend/) to Namecheap cPanel.

## Requirements

- PHP **8.2+** with extensions: `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `curl`, `fileinfo`
- MySQL database created in cPanel
- Document root pointed at `backend/public`

## 1. Create MySQL database (cPanel)

1. cPanel → **MySQL Databases**
2. Create database + user, grant **ALL PRIVILEGES**
3. Note: host is usually `localhost`

## 2. Upload files

Upload the entire `backend/` folder to your account (e.g. `~/tbbd/`).

Set the domain document root to:

```
/home/username/tbbd/public
```

## 3. Configure `.env`

Copy `.env.example` to `.env` on the server and set:

```env
APP_NAME="The Bodybuilding Doctor"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://app.thrillpharma.de

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_cpanel_db_name
DB_USERNAME=your_cpanel_db_user
DB_PASSWORD=your_db_password

MAIL_MAILER=smtp
MAIL_HOST=mail.your-domain.com
MAIL_PORT=587
MAIL_USERNAME=your@email.com
MAIL_PASSWORD=...
MAIL_FROM_ADDRESS=noreply@your-domain.com

SANCTUM_STATEFUL_DOMAINS=app.thrillpharma.de
SESSION_DOMAIN=.thrillpharma.de
```

## 4. Run setup (SSH or cPanel Terminal)

```bash
cd ~/tbbd
php artisan key:generate
php artisan migrate --force
php artisan db:seed --force
php artisan storage:link
```

## 5. Build frontend assets

On your computer (or CI):

```bash
cd backend
npm ci
npm run build
```

Upload the `public/build/` folder to the server.

## 6. Permissions

```bash
chmod -R 775 storage bootstrap/cache
```

## 7. SSL

Enable **AutoSSL** in cPanel for your domain.

## 8. Seed production content

Set `SEED_USER_PASSWORD` in `.env`, then:

```bash
php artisan migrate --seed
```

This loads courses, lessons, mentorship, and users from `database/seeders/data/app-content.json`. Reset user passwords after go-live.

## 9. Mobile app

Set in Expo `.env`:

```env
EXPO_PUBLIC_WEB_API_URL=https://app.thrillpharma.de
```

## Default seeded users (local only)

| Email | Password | Role |
|-------|----------|------|
| admin@thebodybuildingdoctor.test | password | administrator |
| member@thebodybuildingdoctor.test | password | media_channel |

Change these before production deploy.
