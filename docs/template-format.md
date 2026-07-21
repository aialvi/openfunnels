# OpenFunnels Template Format

OpenFunnels templates are portable JSON files ending in `.openfunnels.json`. They contain editor content and presentation settings, but never funnel IDs, contacts, submissions, analytics, domains, or account data.

## Create and import templates

Use **Export → Download template JSON** in the editor to create a template. Use **Select a template → Import template** when creating a funnel to install one. Imported section, column, and block identifiers are regenerated to prevent collisions.

## Manifest

Every template uses `kind: "openfunnels-template"` and `schemaVersion: 1`. Metadata includes a name, category, tags, and optional description or author. The `funnel` object contains the canonical `content.sections` tree and funnel-level settings.

Template files are limited to 2 MB and 200 sections. Unknown schema versions and malformed editor trees are rejected before they reach the editor.

## Contributing a template

Export the finished funnel, remove private or licensed media URLs, and verify that forms contain useful labels and a required email field. Include a screenshot and the intended audience when opening a pull request. Templates should use the canonical editor types in `resources/js/types/editor.ts`.
