# Security Policy

## Reporting a vulnerability

Please do not open a public issue for suspected vulnerabilities. Use GitHub's **Report a vulnerability** flow under the repository Security tab to send maintainers a private advisory.

Include the affected route or component, reproduction steps, expected impact, and any suggested mitigation. Avoid accessing data that is not yours and stop testing once the issue is demonstrated.

## Supported versions

Security fixes are applied to the latest commit on `main`. Self-hosters should keep dependencies current, configure HTTPS at their deployment layer, use a private application key, run queue workers, and back up application data before upgrades.
