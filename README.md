# OpenFunnels

[![Tests](https://github.com/aialvi/openfunnels/actions/workflows/tests.yml/badge.svg)](https://github.com/aialvi/openfunnels/actions/workflows/tests.yml)
[![Quality](https://github.com/aialvi/openfunnels/actions/workflows/lint.yml/badge.svg)](https://github.com/aialvi/openfunnels/actions/workflows/lint.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-orange.svg)](LICENSE)
[![PHP 8.2+](https://img.shields.io/badge/PHP-8.2%2B-777BB4.svg)](composer.json)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg)](package.json)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED.svg)](docs/docker-evaluation.md)

OpenFunnels is a self-hosted, open-source Funnel OS for building, publishing, measuring, and improving conversion journeys without handing customer data to a closed platform.

It combines a visual React editor, conversion forms, lightweight CRM, attribution analytics, native experiments, portable templates, optional AI-assisted generation, custom domains, and production-friendly Laravel foundations.

## Try It in One Command

```bash
docker compose up --build
```

Open `http://localhost:8000` and choose **Launch Demo** for an isolated editor sandbox with seeded funnel, contact, and analytics data. See the [Docker evaluation guide](docs/docker-evaluation.md) for logs, reset, and persistence commands.

## Screenshots

### Homepage

<img width="1511" height="855" alt="OpenFunnels homepage" src="https://github.com/user-attachments/assets/312f379f-c452-428a-b930-8aa41410e4cb" />

### Editor

<img width="1511" height="856" alt="OpenFunnels editor" src="https://github.com/user-attachments/assets/8306072d-9686-48ec-acc8-d4c7ea0326a2" />

## Features

- **Visual funnel editor**: Drag-and-drop section, column, and block editing with undo/redo support.
- **Starter templates**: Build from scratch or choose from 15 premade layouts with categories and visual thumbnails.
- **Portable template packs**: Import and export validated, versioned `.openfunnels.json` community templates.
- **Responsive preview**: Desktop, tablet, and mobile preview modes for editor layouts.
- **Publishing**: Public funnel rendering, preview routes, publish/unpublish controls, and slug-based sharing.
- **Custom domains**: Application-layer custom domain mapping with DNS verification for published funnels.
- **Lead capture**: Configurable form fields collect contact details and custom answers, create or update contacts, and increment funnel conversions.
- **Conversion forms**: Multi-step flows, conditional fields, automatic UTM/referrer attribution, and safe message, redirect, or download actions.
- **CRM-lite contacts**: Contact index and detail pages with source funnel, submissions, metadata, notes, and lifecycle status.
- **Lead notifications**: Email notification on new leads, plus optional webhook delivery.
- **Analytics and experiments**: Privacy-conscious event trends, source attribution, drop-off events, stable variant assignment, and per-variant results.
- **Resilient editing**: Debounced autosave, optimistic concurrency, offline recovery, and downloadable conflict copies.
- **Optional AI drafts**: Provider-neutral generation contract with a Responses-compatible driver and canonical content validation.
- **Guest sandbox**: Expiring, isolated demo accounts with outbound and administrative actions disabled.
- **Export modules**: Exporter structure for HTML, Laravel, React, Vue, WordPress, Shopify, and WooCommerce targets.

## Tech Stack

### Backend

- Laravel 12
- PHP 8.2+
- Inertia.js 2
- Eloquent ORM
- SQLite for local development
- Pest for tests

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Radix UI and local shadcn-style primitives
- lucide-react icons
- Zustand + Immer editor state

## Prerequisites

- PHP 8.2 or higher
- Composer
- Node.js 18 or higher
- pnpm

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/aialvi/openfunnels.git
    cd openfunnels
    ```

2. Install dependencies:

    ```bash
    composer install
    pnpm install
    ```

3. Configure the app:

    ```bash
    cp .env.example .env
    php artisan key:generate
    ```

4. Create and migrate the local database:

    ```bash
    touch database/database.sqlite
    php artisan migrate
    php artisan db:seed
    ```

5. Optional environment settings:

    ```env
    # Custom domain DNS checks
    DOMAIN_MAPPING_CNAME_TARGET=cname.openfunnels.com
    DOMAIN_MAPPING_A_RECORD_IP=
    FUNNEL_CUSTOM_DOMAIN_SCHEME=https

    # Lead capture operations
    LEAD_CAPTURE_NOTIFICATION_EMAIL=
    LEAD_CAPTURE_WEBHOOK_URL=

    # Optional sandbox
    DEMO_MODE=false

    # Optional AI generation
    FUNNEL_AI_DRIVER=disabled
    FUNNEL_AI_API_KEY=
    FUNNEL_AI_MODEL=gpt-5.6-luna
    ```

## Development

Start the full local stack:

```bash
composer run dev
```

That command starts Laravel, the queue listener, log tailing, and Vite. The app is available at `http://localhost:8000`.

You can also run Laravel and Vite separately:

```bash
php artisan serve
pnpm run dev
```

Build frontend assets:

```bash
pnpm run build
```

## Self-hosting

For a production VPS installation, including required services, deployment steps, workers, health checks, backups, and custom-domain responsibilities, see [Self-hosting OpenFunnels](docs/self-hosting.md).

## Testing And Quality

```bash
# PHP tests
composer test
# or
php artisan test

# PHP formatting
./vendor/bin/pint

# Frontend formatting and checks
pnpm run format
pnpm run format:check
pnpm run lint
pnpm run types
```

Note: `pnpm run lint` runs ESLint with `--fix`, so it may edit files.

## Project Structure

```text
app/
├── Http/Controllers/
│   ├── ContactController.php        # Contacts, detail, status, and notes
│   ├── FunnelController.php         # Funnel CRUD, preview, publish, public rendering
│   └── LeadCaptureController.php    # Public funnel form submissions
├── Mail/
│   └── NewLeadCaptured.php          # New lead email notification
├── Models/
│   ├── Contact.php
│   ├── ContactSubmission.php
│   └── Funnel.php
└── Policies/

resources/
├── js/
│   ├── components/                  # Reusable UI and editor components
│   ├── pages/                       # Inertia pages
│   ├── stores/funnelStore.ts        # Editor state, history, actions
│   └── types/editor.ts              # Canonical editor types
└── css/app.css                      # Tailwind 4 and theme tokens

database/
├── migrations/
└── seeders/

docs/
├── ai-instructions/
└── prds/
```

## Documentation

- `AGENTS.md`: contributor and AI-agent working guide.
- `DESIGN.md`: product UI and design direction.
- `Roadmap.md`: current foundation, near-term priorities, and longer feature tracks.
- `docs/prds/mvp-funnel-crm.md`: MVP funnel builder and CRM-lite requirements.
- `docs/prds/domain-mapping.md`: custom domain mapping requirements.
- `docs/ai-instructions/domain-mapping-agent-rules.md`: implementation rules for domain mapping.
- `docs/template-format.md`: portable community template format and contribution guide.
- `docs/docker-evaluation.md`: one-command local evaluation stack.

## Current Roadmap

Completed foundation:

- Laravel + Inertia application shell with authentication and settings.
- Funnel CRUD, aggregate dashboard stats, drag-and-drop editing, undo/redo, and responsive device previews.
- Fifteen categorized starter templates with visual thumbnails and practical lead-capture forms.
- Draft previews, published public rendering, publish/unpublish controls, and cross-browser sharing.
- Canonical public URL resolution for app URLs and verified custom domains.
- Globally unique self-hosted funnel slugs with automatic collision repair.
- Custom domain mapping with DNS verification and verified-domain-only public rendering.
- Lead capture forms that create or update contacts, preserve every submission, and track conversions.
- Configurable form blocks with reorderable text, email, phone, number, URL, textarea, dropdown, checkbox, and hidden fields.
- CRM-lite contact profiles with submission timelines, metadata, notes, and lifecycle statuses.
- Funnel-specific response dashboards with totals, unique-lead counts, pagination, and submitted field details.
- Response filtering by lead name, email, phone, lifecycle status, form, and date range.
- New-lead email notifications and optional webhook delivery.
- Exporter modules for HTML, Laravel, React, Vue, WordPress, Shopify, and WooCommerce.
- MIT licensing and production VPS self-hosting documentation covering workers, backups, health checks, and domains.

Near-term priorities:

- Expand conditional form operators and reusable form-step presets.
- Add contact-wide CRM search and filters, CSV import/export, and duplicate management.
- Add UI-managed lead notification settings.
- Move starter template definitions into a scalable template library module.
- Add cohort retention, revenue attribution, and statistical guidance for experiments.
- Expand focused exporter, accessibility, and browser test coverage.

Longer-term tracks include automation workflows, SMS and email campaigns, calendar booking, agency sub-accounts, payments, and deeper analytics.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for setup, architecture boundaries, pull-request expectations, and test commands. Bug reports, feature proposals, documentation improvements, and community templates are welcome.

## Support

- Issues: [GitHub Issues](https://github.com/aialvi/openfunnels/issues)
- Discussions: [GitHub Discussions](https://github.com/aialvi/openfunnels/discussions)

## License

This project is open source and available under the [MIT License](LICENSE).

<p align="center">
  <a href="https://www.buymeacoffee.com/aialvi" target="_blank">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me a Coffee" height="60">
  </a>
</p>
