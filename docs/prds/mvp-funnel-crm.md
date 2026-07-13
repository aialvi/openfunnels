# Product Requirements Document: Funnel Builder + CRM-lite MVP

## 1. Overview

OpenFunnels is currently positioned as an open-source funnel builder for launching lead-capture funnels quickly. The MVP is not a full GoHighLevel replacement; it focuses on the first usable growth loop:

1. Build a funnel from scratch or a premade starter template.
2. Publish or preview the funnel.
3. Capture leads from form blocks.
4. Store leads as contacts.
5. Notify the funnel owner and optionally send a webhook.
6. Review contact details, submissions, notes, and lifecycle status.

## 2. Implemented MVP Scope

### Funnel Builder

- Authenticated users can create, edit, duplicate, delete, publish, and unpublish funnels.
- Funnels use the canonical editor tree: `funnel -> sections -> columns -> blocks`.
- The enhanced editor includes a starter flow:
    - Build from scratch.
    - Select a premade template.
- Template browser includes categories and visual thumbnails.
- Current template categories:
    - Lead capture
    - Sales
    - Events
    - Services
    - Industry

### Lead Capture

- Published funnel form blocks submit to `LeadCaptureController`.
- Form blocks support reorderable standard, custom, dropdown, checkbox, and hidden fields configured in the editor.
- Submissions create or update a contact for the funnel owner.
- Each submission creates a separate `contact_submissions` record.
- Funnel conversions increment on each successful submission.
- Contact metadata tracks aggregate submission count and last submitted fields.

### CRM-lite

- Contacts index shows captured leads, source funnel, status, submission count, and last activity.
- Contact detail page shows:
    - Profile fields.
    - Source funnel.
    - Status.
    - Submission timeline.
    - Submitted fields.
    - IP address and user agent.
    - Notes.
- Supported lifecycle statuses:
    - `new`
    - `contacted`
    - `qualified`
    - `won`
    - `lost`

### Notifications And Webhooks

- New lead submissions send a `NewLeadCaptured` email.
- Notification recipient is `LEAD_CAPTURE_NOTIFICATION_EMAIL` if configured, otherwise the funnel owner's email.
- New lead submissions optionally POST a webhook payload to `LEAD_CAPTURE_WEBHOOK_URL`.

### Custom Domains

- Custom domain mapping is implemented at the Laravel/React application layer.
- DNS verification uses `dns_get_record()`.
- Verified domains can render published funnels through the fallback route.

## 3. Non-goals For Current MVP

- No visual automation builder.
- No SMS provider integration.
- No campaign email sequences.
- No calendar scheduling.
- No Stripe checkout.
- No agency sub-accounts or white-label SaaS mode.
- No advanced analytics attribution or A/B testing.

These features belong in future roadmap tracks.

## 4. Configuration

Lead capture notifications:

```env
LEAD_CAPTURE_NOTIFICATION_EMAIL=
LEAD_CAPTURE_WEBHOOK_URL=
```

Custom domain mapping:

```env
DOMAIN_MAPPING_CNAME_TARGET=cname.openfunnels.com
DOMAIN_MAPPING_A_RECORD_IP=
```

## 5. Quality Requirements

- Lead capture must be covered by feature tests.
- Contact ownership must be enforced on contact detail, status updates, and notes.
- Form submissions from unpublished funnels must not be accepted from guests.
- New templates must use canonical `Section`, `Column`, and `Block` shapes.
- Templates that are intended to capture leads should include practical form blocks.
