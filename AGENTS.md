# OpenFunnels Agent Guide

This is the working guide for AI agents contributing to OpenFunnels. Read this before changing code, and read any linked feature instructions before implementing that feature.

## Project Snapshot

OpenFunnels is a Laravel 12 + Inertia.js SaaS application for building and publishing drag-and-drop funnel pages.

- Backend: Laravel 12, PHP 8.2+, Eloquent, policies, Pest.
- Frontend: React 19, TypeScript, Inertia.js 2, Vite, Tailwind CSS 4.
- UI primitives: local shadcn-style components under `resources/js/components/ui`, Radix UI, lucide-react.
- Editor state: Zustand + Immer in `resources/js/stores/funnelStore.ts`.
- Local database: SQLite, with tests configured for in-memory SQLite.

## Repository Map

- `app/Http/Controllers/FunnelController.php`: funnel CRUD, preview, publish/unpublish, duplication, and public funnel rendering.
- `app/Models/Funnel.php`: funnel model, JSON casts, publishing helpers, view/conversion counters.
- `app/Policies/FunnelPolicy.php`: funnel authorization rules.
- `routes/web.php`: public home, public `/f/{funnel:slug}` route, authenticated funnel/dashboard/editor routes.
- `routes/auth.php` and `routes/settings.php`: auth and settings routes from the Laravel React starter kit.
- `resources/js/pages`: Inertia page components.
- `resources/js/components/editor`: funnel editor components and drag/drop UI.
- `resources/js/types/editor.ts`: canonical editor/funnel TypeScript types. Import these instead of redefining duplicate editor types.
- `resources/js/lib/exporters`: funnel export implementations.
- `resources/css/app.css`: Tailwind 4 setup and app theme tokens.
- `database/migrations`: users, cache/jobs, and funnels schema.
- `tests/Feature` and `tests/Unit`: Pest test suites.
- `docs/prds` and `docs/ai-instructions`: feature-specific product and agent instructions.

## Required Feature Reading

Before implementing a feature with a PRD or agent instruction file, read the relevant files completely.

General companion docs:

- Design guidance: `DESIGN.md`
- Product roadmap: `Roadmap.md`

### Custom Domain Mapping

- PRD: `docs/prds/domain-mapping.md`
- Agent rules: `docs/ai-instructions/domain-mapping-agent-rules.md`

Key constraints for domain mapping:

- Implement only the Laravel/React application layer.
- Do not add Certbot, Nginx, Caddy, or other server provisioning scripts.
- Backend DNS verification must use `dns_get_record()` in production logic.
- Add the custom-domain fallback route at the very end of `routes/web.php`.
- Only serve mapped domains that are verified.

## Development Commands

Use the commands that exist in this repo:

```bash
# PHP dependencies
composer install

# JS dependencies
pnpm install

# One-command Laravel/Vite/queue/log development stack
composer run dev

# Separate frontend dev server
pnpm run dev

# Build frontend assets
pnpm run build

# SSR build
pnpm run build:ssr

# PHP tests
composer test
# or
php artisan test

# PHP formatting
./vendor/bin/pint

# Frontend formatting/checks
pnpm run format
pnpm run format:check
pnpm run lint
pnpm run types
```

Notes:

- `pnpm run lint` runs ESLint with `--fix`; expect it to edit files.
- The README mentions `pnpm run lint:fix`, but `package.json` does not define that script. Use `pnpm run lint`.
- `composer run dev` internally uses `npm run dev`; keep that in mind if you are standardizing package-manager usage.

## Backend Conventions

- Follow Laravel conventions for controllers, requests, policies, migrations, factories, and seeders.
- Use policies for user-owned resources. Existing funnel routes rely on `FunnelPolicy`.
- Keep public funnel behavior explicit: published funnels can be viewed publicly via `/f/{slug}`, unpublished funnels require authorization.
- Keep migrations database-agnostic where practical. The local app uses SQLite.
- For JSON content/settings, preserve array casts and validate request payloads before decoding.
- Prefer named routes and Inertia responses over hard-coded URLs in app code.
- Add or update Pest feature tests for behavior touching routes, authorization, validation, persistence, or public rendering.

## Frontend Conventions

- Use TypeScript strictly. Avoid `any`; prefer `unknown`, discriminated unions, or explicit interfaces.
- Import editor types from `resources/js/types/editor.ts`.
- Use the `@/` alias for `resources/js`.
- Use existing UI primitives from `resources/js/components/ui` before adding new primitives.
- Use lucide-react icons for icon buttons and controls when an icon exists.
- Keep styling Tailwind-first. Add custom CSS only for app-wide tokens or behavior that utilities cannot express cleanly.
- Preserve the current dark black/orange theme tokens in `resources/css/app.css` unless the task explicitly changes branding.
- For editor state changes, use the existing Zustand store patterns in `funnelStore.ts`, including history updates for undo/redo.
- Be careful with editor content shape: a funnel has `content.sections`, sections have columns, and columns have blocks.

## Testing And Verification

Before handing off meaningful code changes, run the narrowest useful checks and broaden based on risk:

- Backend-only changes: `composer test` or targeted `php artisan test --filter=...`.
- Frontend type or component changes: `pnpm run types` and, when useful, `pnpm run build`.
- Formatting-only frontend changes: `pnpm run format:check`.
- PHP style changes: `./vendor/bin/pint --test` if available, otherwise `./vendor/bin/pint` when formatting is intended.

If you cannot run a relevant check, say why in the final response.

## Working Rules For Agents

- Do not guess architecture when docs exist. Read the applicable PRD and agent rules first.
- Keep changes scoped to the user request.
- Do not revert user changes or unrelated dirty work.
- Avoid adding new dependencies unless the existing stack cannot reasonably solve the problem.
- Prefer small, focused tests over broad snapshots.
- Do not commit generated assets from `public/build` unless the user explicitly asks for production build output.
- Do not edit `.env` for committed behavior; use `.env.example` or config defaults where appropriate.
- Avoid committing `.DS_Store` or other local machine files.
