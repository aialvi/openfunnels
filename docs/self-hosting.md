# Self-hosting OpenFunnels

OpenFunnels can run as a standalone Laravel application on a VPS. The application owns funnel editing, publishing, lead capture, contacts, DNS verification, and custom-domain routing. Your hosting platform remains responsible for PHP, the database, HTTPS certificates, the reverse proxy, backups, and process supervision.

## Production services

- PHP 8.3 or newer with the extensions required by Laravel, PDO, and `dns_get_record()` support.
- A supported web server or application platform with the document root set to `public/`.
- PostgreSQL or MySQL for normal production installations. SQLite is suitable for small single-node installations when the database file is backed up carefully.
- A process supervisor for `php artisan queue:work`.
- Cron running `php artisan schedule:run` every minute.
- SMTP or another Laravel mail transport for lead notifications and account email.
- Node.js and pnpm during deployment to build frontend assets; Node.js is not required by the running PHP application after the build.

Laravel exposes `GET /up` for load-balancer and uptime checks.

## Installation

```bash
git clone https://github.com/aialvi/openfunnels.git
cd openfunnels
composer install --no-dev --classmap-authoritative
pnpm install --frozen-lockfile
pnpm run build
cp .env.example .env
php artisan key:generate
php artisan migrate --force
php artisan storage:link
php artisan optimize
```

Set `APP_ENV=production`, `APP_DEBUG=false`, and an HTTPS `APP_URL`. Configure a production database, session/cache/queue stores, mail delivery, and a unique `APP_KEY` before accepting traffic. Never share an `APP_KEY` between installations.

The web process must be able to write to `storage/` and `bootstrap/cache/`. Do not expose the repository root as the web root.

## Public funnel URLs

Without a custom domain, published funnels use:

```text
https://your-openfunnels-host/f/{slug}
```

The Share action always uses a backend-generated public URL. Draft funnels do not have a shareable URL.

## Custom domains

Configure the public DNS destination shown by the domain wizard:

```env
DOMAIN_MAPPING_CNAME_TARGET=funnels.example.com
DOMAIN_MAPPING_A_RECORD_IP=203.0.113.10
FUNNEL_CUSTOM_DOMAIN_SCHEME=https
```

Subdomains use a CNAME record and root domains use an A record. Laravel verifies DNS with `dns_get_record()` and serves only verified domains belonging to published funnels.

Your reverse proxy or hosting platform must accept those hostnames and provision their certificates. OpenFunnels intentionally does not invoke Certbot, edit proxy configuration, or provision certificates from PHP.

## Long-running processes

Run a supervised worker and restart it after each release:

```bash
php artisan queue:work --sleep=3 --tries=3 --max-time=3600
```

Add this cron entry:

```cron
* * * * * cd /path/to/openfunnels && php artisan schedule:run >/dev/null 2>&1
```

## Deployment sequence

For updates, enable maintenance mode when required, pull the desired release, install locked dependencies, build assets, migrate, rebuild Laravel caches, restart queue workers, and then disable maintenance mode.

Back up the database and persistent storage before migrations. Test restoration periodically; a backup that has never been restored is not a recovery plan.
