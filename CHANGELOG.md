# Changelog

OpenFunnels follows a rolling development model. Notable user-facing changes are recorded here before tagged releases.

## Unreleased

### Added

- Resilient autosave, local recovery, and revision conflicts.
- Portable community templates with validated JSON import/export.
- Multi-step conditional forms, attribution, and success actions.
- Privacy-conscious event analytics and dashboard trends.
- Native snapshot experiments with stable traffic assignment.
- Optional provider-neutral AI funnel generation.
- Isolated guest sandbox with automatic expiry.
- Docker evaluation stack and contributor community files.
- Contact search, funnel/status/date filters, pagination, and filtered CSV export.
- Funnel-linked opportunity pipelines with Kanban stage management, value forecasting, activity history, contact integration, and opt-in lead automation.
- Automation Studio with durable event enrollment, immutable workflow versions, waits, conditional branches, CRM actions, consent-aware email, signed webhooks, run history, retries, and starter recipes.
- Product demo video on the landing page, launch-style README images, and a reproducible capture and Remotion pipeline.
- Keyboard dragging on the opportunities board, Escape to close editor dialogs, and plain-language dry-run results.

### Changed

- Upgraded the backend runtime to Laravel 13, PHP 8.3+, Tinker 3, and Pest 4.
- CI now runs non-mutating PHP and frontend quality checks.
- The enhanced editor is the single canonical editor surface.
- New-lead email and webhook notifications now run through the queue instead of delaying public funnel submissions.
- Cards, borders, and inputs have more contrast; the dashboard chart has a legend and dates; the editor toolbar stays on one row.

### Fixed

- Visitors assigned to an experiment's control were re-rolled on every page load until they landed in a variant, which skewed results.
- Average conversion rate is weighted by views instead of averaging unlaunched funnels as zero.
- The landing page's demo, GitHub, and footer links, which were inactive or broken.
- Dragged opportunity cards were clipped by their column.
