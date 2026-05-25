# Pull Request Checklist

## Security

- [ ] No hardcoded secrets, tokens, passwords, or real credentials.
- [ ] No user-controlled HTML rendering was introduced.
- [ ] Personal data display has a clear purpose.
- [ ] Third-party scripts or external URLs were reviewed.
- [ ] Checkout and reCAPTCHA behavior was tested when changed.

## LGPD

- [ ] New personal data fields have a clear purpose.
- [ ] Data minimization was considered.
- [ ] Public pages do not expose private/admin-only data.

## Verification

- [ ] `npm run build`
- [ ] `npm run security:audit`

