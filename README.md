# OpenFunnels

[![Tests](https://github.com/aialvi/openfunnels/actions/workflows/tests.yml/badge.svg)](https://github.com/aialvi/openfunnels/actions/workflows/tests.yml)
[![Quality](https://github.com/aialvi/openfunnels/actions/workflows/lint.yml/badge.svg)](https://github.com/aialvi/openfunnels/actions/workflows/lint.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-orange.svg)](LICENSE)
[![PHP 8.3+](https://img.shields.io/badge/PHP-8.3%2B-777BB4.svg)](composer.json)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg)](package.json)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED.svg)](docs/docker-evaluation.md)

OpenFunnels is a self-hosted, open-source funnel builder for creating, publishing, and improving conversion journeys while keeping customer data under your control.

It combines a visual page editor with lead-capture forms, a lightweight CRM, attribution analytics, A/B experiments, custom domains, portable templates, and optional AI-assisted drafts. The application is built on Laravel, Inertia, React, and TypeScript.

## Screenshots

| Homepage                                                                                                                             | Funnel editor                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| <img width="760" alt="OpenFunnels homepage" src="https://github.com/user-attachments/assets/312f379f-c452-428a-b930-8aa41410e4cb" /> | <img width="760" alt="OpenFunnels editor" src="https://github.com/user-attachments/assets/8306072d-9686-48ec-acc8-d4c7ea0326a2" /> |

## Quick Start With Docker

The evaluation stack is the fastest way to try OpenFunnels. It requires Docker with Compose v2.

```bash
git clone https://github.com/aialvi/openfunnels.git
cd openfunnels
docker compose up --build
```

Open [http://localhost:8000](http://localhost:8000) and select **Launch Demo**. You can also register a persistent local account.

The stack includes the web application, queue worker, scheduler, compiled frontend, and a persistent SQLite volume. It is intended for local evaluation—not production—and does not configure TLS, a reverse proxy, or custom-domain infrastructure.

```bash
# Follow service logs
docker compose logs -f

# Stop without deleting local data
docker compose down

# Remove the stack and its local data
docker compose down --volumes
```

See the [Docker evaluation guide](docs/docker-evaluation.md) for more details.

## What You Can Build

- **Funnels:** Create pages with a drag-and-drop section, column, and block editor; undo and redo changes; autosave; and preview responsive layouts.
- **Templates:** Start from 15 categorized layouts or import and export versioned `.openfunnels.json` template packs.
- **Forms and contacts:** Capture configurable and conditional fields, preserve every submission, collect UTM and referrer attribution, and manage lead statuses and notes.
- **Publishing:** Publish to slug-based URLs or verified custom domains, preview drafts, and unpublish without deleting content.
- **Analytics and experiments:** Track privacy-conscious events, conversion trends, traffic sources, drop-off, and stable A/B variant assignments.
- **Operations:** Send new-lead email notifications or webhooks, recover offline editor changes, and export to several web and commerce targets.
- **AI-assisted drafts:** Optionally generate funnel drafts through a provider-neutral, Responses-compatible backend driver.
- **Guest evaluation:** Run isolated, expiring demo accounts with outbound and administrative actions restricted.

## Local Development

### Requirements

- PHP 8.3 or later, with the extensions required by Laravel
- Composer 2
- Node.js 22 (the version used in CI and the Docker build)
- pnpm 10.13.1
- SQLite

### Setup

```bash
git clone https://github.com/aialvi/openfunnels.git
cd openfunnels

composer install
corepack enable
pnpm install

cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
```

For local URL generation, set `APP_NAME=OpenFunnels` and `APP_URL=http://localhost:8000` in `.env`.

Start Laravel, the queue listener, log tailing, and Vite together:

```bash
composer run dev
```

Then visit [http://localhost:8000](http://localhost:8000). The seeded development account is:

```text
Email: test@example.com
Password: password
```

The seed account is for local development only. You can skip `--seed` and register your own account instead; with the default log mailer, email verification links are written to `storage/logs/laravel.log`.

To run the application and frontend separately:

```bash
php artisan serve
pnpm run dev
```

## Configuration

The default `.env.example` uses SQLite, database-backed queues, sessions and cache, and the log mailer. These optional variables enable additional features:

| Variable                          | Default                 | Purpose                                          |
| --------------------------------- | ----------------------- | ------------------------------------------------ |
| `DOMAIN_MAPPING_CNAME_TARGET`     | `cname.openfunnels.com` | Expected CNAME target during domain verification |
| `DOMAIN_MAPPING_A_RECORD_IP`      | empty                   | Optional accepted A-record address               |
| `FUNNEL_CUSTOM_DOMAIN_SCHEME`     | `https`                 | Scheme used for verified custom-domain URLs      |
| `LEAD_CAPTURE_NOTIFICATION_EMAIL` | empty                   | Overrides the funnel owner's new-lead recipient  |
| `LEAD_CAPTURE_WEBHOOK_URL`        | empty                   | Receives new-lead webhook payloads               |
| `FUNNEL_AI_DRIVER`                | `disabled`              | Enables a configured funnel-generation driver    |
| `FUNNEL_AI_ENDPOINT`              | OpenAI Responses API    | Responses-compatible generation endpoint         |
| `FUNNEL_AI_API_KEY`               | empty                   | Server-side generation credential                |
| `FUNNEL_AI_MODEL`                 | `gpt-5.6-luna`          | Model sent to the configured endpoint            |
| `FUNNEL_AI_TIMEOUT`               | `45`                    | Generation request timeout in seconds            |
| `DEMO_MODE`                       | `false`                 | Enables the isolated guest sandbox               |
| `DEMO_LIFETIME_HOURS`             | `24`                    | Lifetime of guest sandbox accounts               |

Do not commit `.env` or expose AI, mail, database, or webhook credentials to the browser.

## Development Commands

| Command                          | Purpose                                           |
| -------------------------------- | ------------------------------------------------- |
| `composer run dev`               | Start Laravel, the queue listener, Pail, and Vite |
| `composer test`                  | Clear cached config and run the PHP test suite    |
| `php artisan test --filter=Name` | Run a focused PHP test                            |
| `vendor/bin/pint --test`         | Check PHP formatting without changing files       |
| `vendor/bin/pint`                | Format PHP files                                  |
| `pnpm run dev`                   | Start only the Vite development server            |
| `pnpm run build`                 | Build production frontend assets                  |
| `pnpm run build:ssr`             | Build browser and SSR assets                      |
| `pnpm run test`                  | Run frontend unit tests with Vitest               |
| `pnpm run types`                 | Type-check TypeScript                             |
| `pnpm run lint`                  | Check frontend lint rules                         |
| `pnpm run lint:fix`              | Fix frontend lint violations where possible       |
| `pnpm run format:check`          | Check frontend formatting                         |
| `pnpm run format`                | Format files under `resources/`                   |

Generated Vite assets in `public/build` should not be committed.

## Architecture At A Glance

```text
React editor ──> canonical sections/columns/blocks JSON ──> draft preview
                                                    └─────> published funnel

Public form ───> contact ──> submission timeline ──> notification/webhook
Public events ─> attribution and conversion data ──> dashboard/experiments
```

Key locations:

```text
app/Http/Controllers/              HTTP behavior for funnels, contacts, leads, and analytics
app/Models/                        Eloquent models and funnel publishing helpers
app/Policies/FunnelPolicy.php      Authorization for user-owned funnels
resources/js/pages/                Inertia pages, including the primary editor
resources/js/components/editor/    Drag-and-drop editor UI
resources/js/stores/funnelStore.ts Zustand + Immer editor state and history
resources/js/types/editor.ts       Canonical funnel editor types
resources/js/lib/exporters/        Funnel export implementations
routes/web.php                     Public, authenticated, and custom-domain routes
tests/                             Pest feature/unit tests and Vitest frontend tests
```

## Documentation

- [Contributing](CONTRIBUTING.md): setup, architecture boundaries, pull-request expectations, and verification.
- [Self-hosting](docs/self-hosting.md): production services, deployment, workers, health checks, backups, and custom domains.
- [Template format](docs/template-format.md): portable community template schema and contribution workflow.
- [Product roadmap](Roadmap.md): completed foundation, current priorities, and longer-term tracks.
- [Design direction](DESIGN.md): UI principles and visual language.
- [MVP funnel and CRM PRD](docs/prds/mvp-funnel-crm.md): core funnel, form, and contact behavior.
- [Domain mapping PRD](docs/prds/domain-mapping.md): custom-domain requirements and boundaries.
- [Agent guide](AGENTS.md): repository conventions for AI-assisted contributions.

## Contributing And Support

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) and keep changes focused, tested, and documented.

- Report bugs through [GitHub Issues](https://github.com/aialvi/openfunnels/issues).
- Ask questions and discuss ideas in [GitHub Discussions](https://github.com/aialvi/openfunnels/discussions).
- Report security vulnerabilities privately through [GitHub Security Advisories](https://github.com/aialvi/openfunnels/security/advisories/new) and review [SECURITY.md](SECURITY.md).

OpenFunnels is released under the [MIT License](LICENSE).

If OpenFunnels is useful to you, you can [support its continued development](https://www.buymeacoffee.com/aialvi).
