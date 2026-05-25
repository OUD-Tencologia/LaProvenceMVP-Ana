# Privacy By Design

## Principles

- Collect the least data required for the current user flow.
- Keep payment secrets out of frontend code.
- Avoid rendering user-provided HTML.
- Keep public pages readable without exposing private admin data.
- Use environment variables for public integration configuration.

## Engineering Checklist

- Validate user input before API calls.
- Avoid `dangerouslySetInnerHTML` and direct `innerHTML` for dynamic content.
- Avoid storing sensitive data in localStorage.
- Review all new third-party scripts.
- Keep reCAPTCHA and payment code paths explicit and isolated.

