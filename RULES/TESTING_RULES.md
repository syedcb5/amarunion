# Testing Rules

There is no automated test suite. Verify changes in the browser.

## Setup

- Server mode: `php -S localhost:8000` in the project root (needs `pdo_sqlite`). Local test mode: any static server (`npx serve -l 8000 .`) with `api` and the Supabase keys empty in `config.js`.
- Open `http://localhost:8000/` and `http://localhost:8000/admin/`.
- Leave the keys in `config.js` empty to test in local mode with demo data.
- To reset demo data, remove the `au_db` key from the browser's local storage.

## Required Checks

- Exercise the changed flow end to end in local mode.
- Check the browser console for errors on both pages.
- Check the changed screen at phone width.
- When the change touches data, confirm the admin panel and the public site show the same result.
- When the change touches printing, check the A4 print preview.

## Regression Flow

Run this after any change to the scholarship workflow or the data layer:

1. Register a student with a photo and a birth certificate.
2. Confirm a second identical registration is blocked.
3. Open the confirmation letter with application number and mobile.
4. In the admin panel: approve, generate roll, enter marks, publish results.
5. Open the admit card, the result lookup and the QR verify page.
6. Log in as `editor`, `exam` and `viewer` and confirm restricted actions are blocked.

## Cloud Mode

- A change to `supabase/schema.sql` or to the cloud driver must be tested against a real or test Supabase project.
- Never test against the production project.
- If cloud mode was not tested, say so clearly in the hand-off.

## Reporting

- State what was tested, in which mode, and what was not tested.
- Do not claim a flow works unless it was run.
