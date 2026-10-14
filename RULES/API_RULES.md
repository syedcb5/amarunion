# API Rules

These rules cover the shared data layer in `js/api.js`.

## Single Entry Point

- Pages access data only through `window.API`.
- Do not add `fetch` calls, Supabase calls or `localStorage` access for app data inside `index.html` or `admin/index.html`.
- Do not add the Supabase JS client. The cloud driver uses plain REST through `rest()` and `rpc()`.

## Driver Parity

- Every method must exist in all three drivers: `L` (local), `S` (server, `api.php`) and `K` (cloud).
- A rule enforced in `api.php` must match the same rule in `schema.sql` and in the LOCAL driver.
- All drivers must return the same shape for the same call.
- All drivers must throw the same error keywords.

## Public Methods

- `content`, `apply`, `lookup`, `result` and `verify` are callable without login.
- In cloud mode each one maps to exactly one RPC function in `supabase/schema.sql`.
- Return only the fields the public site needs. Use `pubApp()` as the model for trimming a record.

## Admin Methods

- `login`, `session`, `logout`, `load`, `save`, `getBc` and `createUser` require a signed-in admin.
- `load()` returns the whole dataset as one object. `save(d)` persists it.
- In cloud mode `save` diff-syncs against `SNAP`. Keep `SNAP` in step with every write path.
- Keys starting with `_` are transient and are stripped by `ser()` before saving. Use that prefix for computed values.

## Errors

- Throw `Error` with a short English keyword: `closed`, `duplicate`, `invalid`, `bad`.
- The pages translate keywords to Bangla (see `errMsg`). Do not put Bangla text in thrown errors.
- Raise the same keyword from the matching SQL function.

## Compatibility

- Do not rename or remove an existing `API` method, collection key or record field.
- New record fields must be optional so older rows keep working.
