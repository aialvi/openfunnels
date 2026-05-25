# Product Requirements Document (PRD): Custom Domain Mapping Wizard

## 1. Overview
The Domain Mapping feature allows SaaS users to attach their own custom domains (e.g., `promo.brand.com` or `brand.com`) to their funnels built within OpenFunnels. This document outlines the backend architecture, the frontend UX/UI requirements (a multi-step wizard), and strict implementation details.

## 2. UI/UX: The Domain Mapping Wizard
The frontend must be built in React (via Inertia.js) and implement a sleek, user-friendly multi-step wizard. Users setting up domains often lack technical knowledge, so the UX must be extremely clear.

### Step 1: Input Domain
- **UI:** A simple input field asking for the domain they want to connect.
- **Validation:** Frontend and backend validation to ensure it's a valid domain format (regex check). Check if the domain is already registered in the system to prevent duplicates.
- **Action:** User clicks "Next". Backend creates a pending `domains` record.

### Step 2: DNS Configuration Instructions
- **Logic:** Determine if the user entered a root domain (`brand.com`) or a subdomain (`promo.brand.com`).
- **UI:** Display clear, copyable DNS instructions.
  - *If Subdomain:* Instruct the user to add a `CNAME` record pointing to `cname.openfunnels.com` (or your app's base domain).
  - *If Root Domain:* Instruct the user to add an `A` record pointing to the server's IP address (e.g., `192.168.x.x`).
- **Visuals:** Use code-blocks or copy-to-clipboard buttons for the Host/Name and Value/Target to prevent typos.

### Step 3: Verification
- **UI:** A "Verify Connection" button with a loading state (spinner).
- **Backend Logic:** When clicked, the Laravel backend uses PHP's `dns_get_record()` to check if the DNS records have propagated.
- **Feedback:** 
  - If verified: Update `is_verified` to true in DB. Show success state.
  - If not verified: Show a friendly error (e.g., "We couldn't verify this yet. DNS changes can take up to 24 hours. Please try again later.") and allow them to close the wizard. The domain stays in "Pending" status in their dashboard.

### Step 4: SSL Provisioning & Success
- **UI:** Success confetti or a green checkmark. Inform the user that the SSL certificate is being generated and the site will be fully secure within a few minutes (handled by Caddy or Forge in the background).

## 3. Database Schema
Table: `domains`
- `id` (PK)
- `funnel_id` (FK to funnels table, cascade on delete)
- `domain` (String, Unique)
- `is_verified` (Boolean, default false)
- `ssl_status` (Enum/String: 'pending', 'active', 'failed' - optional based on server setup)
- `timestamps`

## 4. Backend Routing & Middleware
- Keep the main SaaS application routes under a domain group (e.g., `Route::domain(env('APP_DOMAIN'))->group(...)`).
- Create a `Route::fallback(...)` at the very end of the `web.php` file.
- The fallback route must extract `$request->getHost()`, look it up in the `domains` table where `is_verified = true`.
- If found, render the associated funnel via Inertia.
- If not found, abort with a custom 404 page ("Funnel not found or domain not configured").

## 5. Server Infrastructure Constraints
- The application will ultimately rely on a reverse proxy with On-Demand TLS (like Caddy Server) or Laravel Forge's API to handle SSL generation. The codebase should not attempt to run manual Certbot scripts via PHP.
