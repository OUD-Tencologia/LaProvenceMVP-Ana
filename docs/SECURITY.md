# Security Policy

## Scope

This frontend follows LGPD, OWASP Top 10, Privacy by Design, Security by Design, and least privilege.

The frontend must never embed real credentials, private tokens, payment secrets, or backend secrets. Public integration keys, such as reCAPTCHA site keys, must still be configured through environment variables.

## Sensitive Data

Avoid storing or rendering unnecessary personal data. CPF, phone, email, and gift purchase details must only be displayed in authenticated screens with a valid business purpose.

## Browser Storage

Current authentication uses browser storage. Before production hardening, prefer an HttpOnly, Secure, SameSite cookie-based session flow coordinated with the API.

## Third-Party Scripts

PagBank and reCAPTCHA scripts are allowed only for checkout and fraud prevention. New third-party scripts must be reviewed for purpose, data sharing, and CSP impact.

## Required Checks

Every pull request should include:

- Build verification.
- Dependency audit.
- Secret scan.
- Review for XSS risks, especially dynamic HTML or user-controlled URLs.

