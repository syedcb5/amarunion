# Deployment Skill

## Purpose

Work on hosting, configuration and applying the database schema.

Read `docs/SETUP-BN.md` for the full step-by-step guide in Bangla.

---

## Targets

| Part | Where |
| --- | --- |
| Website and admin panel | GitHub Pages, deployed from the `main` branch |
| Database and admin login | Supabase project |
| Configuration | `config.js` |

---

## Configuration

`config.js` sets `window.AU_CONFIG`:

* `supabaseUrl` – the project URL
* `supabaseKey` – the `anon` public key
* `siteUrl` – optional public URL, used inside admit card QR codes

Both Supabase values empty means local test mode. Both set means cloud mode.

Only the `anon` key may be placed here. It is public by design and protected by row level security.

---

## Workflow

### Database

1. Run the whole of `supabase/schema.sql` in the Supabase SQL editor.
2. Create the first user in Authentication, then insert the `profiles` row with role `super` (see the bottom of the SQL file).
3. Turn off "Confirm email" in the Email provider settings so admins can be created from the panel.
4. Re-run the whole file after any schema change. It is written to be safe to re-run.

### Site

1. Set the Supabase values and `siteUrl` in `config.js`.
2. Push to `main`.
3. In the repository settings set Pages source to GitHub Actions.
4. Add the custom domain if used.

### After go-live

1. Log in to `/admin/` and load the default content from Data and backup.
2. Replace sample people, committee and sponsor data.
3. Confirm no demo account exists in cloud mode.

---

## Rules

* Never commit a `service_role` key, a database password or an access token.
* Never point a local test at the production Supabase project.
* Do not push, change repository settings or run SQL on a live project without the owner's approval.
* Keep hash routing. Pages has no server rewrites.
* Keep all asset paths relative so the site works under a repository sub-path and under a custom domain.

---

## Checklist

* `schema.sql` ran without error
* First super admin can log in
* Public site loads content in cloud mode
* Registration, lookup, result and verify work in cloud mode
* QR codes point to the public URL
* No secret in the repository

---

## Output

State exactly what was deployed and what still needs the owner's action in the Supabase or GitHub dashboard.
