# OpenFunnels

OpenFunnels is an open-source funnel builder and CRM-lite app for launching lead-capture funnels quickly. It combines a visual drag-and-drop editor, premade starter templates, custom domain mapping, lead capture forms, contact records, and operational lead notifications.

The current MVP focuses on the first useful growth loop: build a funnel, publish or preview it, capture leads, notify the owner, and review each contact's submissions, notes, metadata, and status.

## Screenshots

### Homepage

<img width="1511" height="855" alt="OpenFunnels homepage" src="https://github.com/user-attachments/assets/312f379f-c452-428a-b930-8aa41410e4cb" />

### Editor

<img width="1511" height="856" alt="OpenFunnels editor" src="https://github.com/user-attachments/assets/8306072d-9686-48ec-acc8-d4c7ea0326a2" />

## Features

- **Visual funnel editor**: Drag-and-drop section, column, and block editing with undo/redo support.
- **Starter templates**: Build from scratch or choose from 15 premade layouts with categories and visual thumbnails.
- **Responsive preview**: Desktop, tablet, and mobile preview modes for editor layouts.
- **Publishing**: Public funnel rendering, preview routes, publish/unpublish controls, and slug-based sharing.
- **Custom domains**: Application-layer custom domain mapping with DNS verification for published funnels.
- **Lead capture**: Configurable form fields collect contact details and custom answers, create or update contacts, and increment funnel conversions.
- **CRM-lite contacts**: Contact index and detail pages with source funnel, submissions, metadata, notes, and lifecycle status.
- **Lead notifications**: Email notification on new leads, plus optional webhook delivery.
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

- Add conditional and multi-step forms, automatic UTM population, and redirect or download success actions.
- Add contact-wide CRM search and filters, CSV import/export, and duplicate management.
- Add UI-managed lead notification settings.
- Improve autosave, save-state feedback, and manual recovery flows.
- Move starter template definitions into a scalable template library module.
- Add raw analytics events, UTM/source attribution, performance trends, and funnel drop-off reporting.
- Expand focused CRUD, content-validation, and exporter test coverage.

Longer-term tracks include automation workflows, SMS and email campaigns, calendar booking, agency sub-accounts, payments, A/B testing, and deeper analytics.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make focused changes.
4. Run the relevant tests and checks.
5. Update documentation when behavior, commands, or architecture changes.
6. Open a pull request.

Development guidelines:

- Follow Laravel conventions and PSR-12 style for PHP.
- Use TypeScript for frontend code.
- Reuse existing UI primitives and editor types before adding new abstractions.
- Add tests for behavior touching routing, authorization, validation, persistence, or public rendering.
- Keep generated build output out of commits unless production assets are explicitly requested.

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
