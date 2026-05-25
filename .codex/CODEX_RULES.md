# Codex Rules

All frontend changes must follow LGPD, OWASP Top 10, and privacy by design.

## Never Generate

- Hardcoded credentials or backend secrets.
- Payment tokens or card data in code, logs, or screenshots.
- User-controlled HTML injection.

## Always Prefer

- Environment variables for public integration configuration.
- React rendering over direct DOM HTML writes.
- Build and dependency audit before delivery.
- Minimal collection and display of personal data.

