# OpenFunnels Roadmap

This roadmap is a planning aid for agents and contributors. It should guide prioritization, but the user's current request always takes precedence.

## Current Foundation

- Laravel 12 + Inertia.js application shell.
- Authentication and settings from the Laravel React starter kit.
- Funnel model, policy, migrations, and CRUD controller.
- Funnel dashboard/listing with aggregate stats.
- Enhanced React funnel editor surface.
- New-funnel starter layout chooser with common premade layouts.
- Zustand + Immer editor store with undo/redo history.
- Public funnel preview route at `/f/{slug}`.
- Custom domain mapping at the Laravel/React application layer.
- CRM-lite contacts table and contacts page.
- Funnel form submissions that capture leads and increment conversion counters.
- Exporter modules for multiple output targets.

## Near-Term Priorities

- Harden funnel CRUD behavior with focused feature tests.
- Improve lead capture form configuration in the editor.
- Move starter layout definitions out of the editor page once the template library grows.
- Add thumbnails/previews for starter layouts.
- Add contact search, filters, detail pages, notes, and lifecycle statuses.
- Improve autosave/manual save flows in the editor.
- Expand editor block coverage and block-level property editing.
- Improve preview fidelity across desktop, tablet, and mobile.
- Add stronger validation around funnel content JSON.
- Make publish/unpublish states clearer in the dashboard and editor.

## Feature Tracks

### Funnel Builder

- Section and column layout controls.
- Block library expansion.
- Form block field builder for name, email, phone, custom fields, hidden UTM fields, and success actions.
- Nested container behavior.
- Selection, duplication, deletion, and reordering polish.
- Undo/redo reliability.
- Reusable templates and saved sections.
- Template library with categories, thumbnails, preview mode, and one-click install.

### Publishing

- Published funnel public rendering.
- Preview mode that does not increment analytics.
- Slug management and collision handling.
- Custom domain mapping; read `docs/prds/domain-mapping.md` and `docs/ai-instructions/domain-mapping-agent-rules.md` first.

### CRM And Lead Capture

- Contact detail pages with activity timeline, notes, tags, and lifecycle status.
- Contact search, filtering, CSV import/export, and duplicate management.
- Custom fields attached to contacts.
- Form submission event records separate from contact records.
- Lead source and UTM capture from published funnels.
- Team assignment and task follow-up.

### Automation

- Webhook-first actions for new lead events.
- Basic email notification action for funnel submissions.
- Visual workflow builder with triggers, wait steps, if/else branches, and actions.
- Automation templates bundled with funnel templates.
- Audit logs and retry handling for workflow runs.

### Messaging And Appointments

- Email campaign infrastructure with unsubscribe handling.
- SMS provider integration, opt-in/opt-out compliance, and phone number management.
- Calendar availability, booking pages, reminders, reschedules, and no-show follow-up.
- Conversation inbox for email/SMS replies.

### Agency And SaaS

- Workspaces/sub-accounts for agency-client separation.
- Team roles and permissions.
- White-label branding and custom app domains.
- Client billing/rebilling and usage limits.
- Snapshot installer: funnel + forms + contacts fields + automations + messages.

### Payments And Checkout

- Stripe checkout blocks.
- One-time payments, subscriptions, order bumps, and coupons.
- Abandoned checkout capture and follow-up triggers.
- Revenue attribution per funnel.

### Analytics

- Separate raw events from aggregate counters.
- Track views and conversions without polluting previews.
- Add dashboard trends and per-funnel performance views.
- Keep conversion-rate calculations consistent and test-covered.
- Add source attribution, UTM reporting, and funnel-step drop-off.
- Add A/B testing for pages, forms, and CTAs.

### Exporting

- Keep exporter interfaces consistent across HTML, Laravel, React, Vue, WordPress, Shopify, and WooCommerce targets.
- Add tests or sample fixtures for generated output where practical.
- Avoid coupling editor-only state to export formats.

## Quality Targets

- Add Pest tests for backend behavior that touches persistence, policies, routing, validation, or public access.
- Run `pnpm run types` for TypeScript changes.
- Run `pnpm run build` when changing Vite entrypoints, Tailwind tokens, or app-wide frontend behavior.
- Keep documentation updated when feature architecture or commands change.
