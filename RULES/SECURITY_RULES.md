# Security Rules

## Trust Boundary

- Everything in this repository is public: it is a static site in a public GitHub repository.
- The browser is never trusted. Row level security and RPC functions are the only real protection.

## Secrets

- `config.js` may contain only the Supabase URL and the `anon` public key.
- Never commit the Supabase `service_role` key, a database password or a personal access token.
- Never add real admin credentials to the code. Demo logins exist only in the LOCAL driver seed.

## Authorization

- Check permission on every admin action with `ck(module)` or `can(module)`.
- Never rely only on hidden menus or buttons.
- Every admin write must also be allowed or denied by an RLS policy.
- Never grant table access to `anon`.

## Applicant Data

- Applicants are children. Expose the minimum data needed.
- Application lookup requires application number and mobile number together.
- Results require the roll number and `sch.pub` to be true.
- The verify page requires the roll number and the per-student key `vt`. A roll number alone must never return a photo.
- Birth certificate images stay in the `bc` collection, are never returned by a public function, and are loaded on demand in the admin panel.
- Do not log applicant data to the browser console.

## Output Escaping

- Pages render with template strings and `innerHTML`.
- Pass every stored or user-supplied value through `esc()` before inserting it into HTML.
- Use `encodeURIComponent` for values placed in URLs and query strings.

## Input Validation

- Validate in the form for user feedback and again in the SQL function for safety.
- Keep the payload size limit and per-field length limits in `submit_application`.

## Abuse Protection

- Public submissions currently have no CAPTCHA or rate limit. Do not remove existing checks such as the duplicate rule.
- Do not add a new anonymous write path without validation and a size limit.
