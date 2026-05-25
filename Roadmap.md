# OpenFunnels Roadmap

This roadmap is a planning aid for agents and contributors. It should guide prioritization, but the user's current request always takes precedence.

## Current Foundation

- Laravel 12 + Inertia.js application shell.
- Authentication and settings from the Laravel React starter kit.
- Funnel model, policy, migrations, and CRUD controller.
- Funnel dashboard/listing with aggregate stats.
- Enhanced React funnel editor surface.
- Zustand + Immer editor store with undo/redo history.
- Public funnel preview route at `/f/{slug}`.
- Exporter modules for multiple output targets.

## Near-Term Priorities

- Harden funnel CRUD behavior with focused feature tests.
- Improve autosave/manual save flows in the editor.
- Expand editor block coverage and block-level property editing.
- Improve preview fidelity across desktop, tablet, and mobile.
- Add stronger validation around funnel content JSON.
- Make publish/unpublish states clearer in the dashboard and editor.

## Feature Tracks

### Funnel Builder

- Section and column layout controls.
- Block library expansion.
- Nested container behavior.
- Selection, duplication, deletion, and reordering polish.
- Undo/redo reliability.
- Reusable templates and saved sections.

### Publishing

- Published funnel public rendering.
- Preview mode that does not increment analytics.
- Slug management and collision handling.
- Custom domain mapping; read `docs/prds/domain-mapping.md` and `docs/ai-instructions/domain-mapping-agent-rules.md` first.

### Analytics

- Separate raw events from aggregate counters.
- Track views and conversions without polluting previews.
- Add dashboard trends and per-funnel performance views.
- Keep conversion-rate calculations consistent and test-covered.

### Exporting

- Keep exporter interfaces consistent across HTML, Laravel, React, Vue, WordPress, Shopify, and WooCommerce targets.
- Add tests or sample fixtures for generated output where practical.
- Avoid coupling editor-only state to export formats.

## Quality Targets

- Add Pest tests for backend behavior that touches persistence, policies, routing, validation, or public access.
- Run `pnpm run types` for TypeScript changes.
- Run `pnpm run build` when changing Vite entrypoints, Tailwind tokens, or app-wide frontend behavior.
- Keep documentation updated when feature architecture or commands change.

