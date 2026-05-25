# AI Agent Coding Guidelines: Custom Domain Mapping

You are an AI programming assistant tasked with implementing the Custom Domain Mapping feature for OpenFunnels (a Laravel + Inertia.js SaaS application).

## STRICT INSTRUCTIONS
When working on the Domain Mapping feature, you MUST strictly adhere to the following rules and architecture. Do not deviate from these constraints without explicit permission from the user.

### Reference Material
Before generating any code for this feature, you MUST read the PRD located at:
`docs/prds/domain-mapping.md`

### 1. Database Schema Execution
- When creating the migration for `domains`, ensure you use Laravel 11/12 standard migration syntax.
- The `domain` column must be `unique()`.
- Add a boolean `is_verified` column defaulting to `false`.
- Ensure proper foreign key constraints `foreignId('funnel_id')->constrained()->cascadeOnDelete()`.

### 2. UI/UX: The Wizard
- The frontend must be implemented in React using Inertia.js.
- You must build the UI as a **Multi-Step Wizard** as defined in the PRD.
- **Step 1:** Domain input with validation.
- **Step 2:** DNS Instructions. Use conditional logic:
  - If the input contains 2 parts (e.g., `brand.com`), it is a root domain. Tell the user to set an `A` record.
  - If the input contains 3+ parts (e.g., `promo.brand.com`), it is a subdomain. Tell the user to set a `CNAME` record.
- **Step 3:** A "Verify" button that triggers a backend check. Include a loading spinner while waiting for the response.

### 3. Backend Logic (Verification)
- In the DomainController, the `verify` method MUST use PHP's `dns_get_record()` function to check the actual DNS records live.
- Do NOT fake the verification step unless explicitly running in a local testing environment where DNS lookups might fail (use a mock or config flag if necessary for local testing, but write the production logic using `dns_get_record`).

### 4. Routing Implementation
- The SaaS app runs on a primary domain. Ensure main app routes are protected or grouped.
- For domain mapping, you MUST implement a **Fallback Route** at the very end of `routes/web.php`.
- The fallback route must use `$request->getHost()` to look up the domain in the `domains` table.
- Only load the funnel if `is_verified` is true.

### 5. Scope Containment
- Do NOT write server configuration scripts (like Nginx config or Certbot bash scripts). The SSL/TLS generation will be handled by Caddy Server or Laravel Forge externally. Your job is ONLY the Laravel/React application layer.
