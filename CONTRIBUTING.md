# Contributing to OpenFunnels

Thanks for helping build an excellent self-hosted funnel platform. Focused fixes, tests, documentation, integrations, and template contributions are all welcome.

## Local setup

Use the installation steps in the README, or run `docker compose up --build` for the evaluation stack. For application development, use PHP 8.2+, Node 18+, Composer, and pnpm 10.13.1.

```bash
composer install
pnpm install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
composer run dev
```

## Architecture boundaries

- Keep editor data in the canonical funnel → sections → columns → blocks tree from `resources/js/types/editor.ts`.
- Use policies for user-owned backend resources and feature tests for authorization or persistence.
- Preserve existing funnel JSON and use additive migrations unless a breaking release explicitly documents otherwise.
- Keep custom-domain work at the Laravel/React application layer; do not add proxy or certificate provisioning.
- Keep AI providers behind `App\Contracts\FunnelGenerator` and never expose credentials to the browser.

## Pull requests

1. Open or reference an issue for substantial behavior changes.
2. Keep the change focused and include tests for its failure modes.
3. Update docs and `.env.example` when configuration or behavior changes.
4. Run the relevant checks before submitting.

```bash
composer test
vendor/bin/pint --test
pnpm run types
pnpm run test
pnpm run lint
pnpm run format:check
pnpm run build
```

Do not commit generated `public/build` output, local databases, credentials, or `.env` files.

## Templates

See `docs/template-format.md`. Export the finished funnel from the editor, use assets you have permission to redistribute, include a screenshot, and explain the audience and conversion goal in the pull request.
