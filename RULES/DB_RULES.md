# DB Rules

These rules cover `supabase/schema.sql`.

## Data Model

- All content lives in one generic table: `docs(coll, id, data jsonb)`.
- Admin accounts live in `profiles`, linked to `auth.users`.
- Collections: `set`, `sch` (single doc with id `main`), `proj`, `ppl`, `cm`, `news`, `spn`, `apps`, `bc`, `vol`, `edu`, `roles`, `log`.
- Add a new content type as a new `coll` value. Do not add a table unless the generic store cannot serve it.

## Schema File

- `schema.sql` is the single source of truth. There is no migration tool.
- The whole file must stay safe to re-run on an existing database.
- Use `create table if not exists`, `create index if not exists`, `create or replace function`, `drop policy if exists` before `create policy`, and `on conflict do nothing` for default rows.
- Never add a statement that drops or rewrites existing data.

## Functions

- Declare every function with `security definer set search_path=public`.
- Mark read-only functions `stable`.
- Grant `execute` explicitly. Only the public RPC functions are granted to `anon`.

## Row Level Security

- Keep RLS enabled on `docs` and `profiles`.
- Keep `revoke all ... from anon` on both tables. Anonymous users reach data only through RPC functions.
- Route every policy through `can_view(coll)` and `can_edit(coll)`.
- A collection with special access rules needs its own `when` branch in both helpers.

## JSON Data

- Validate and trim every field of a public payload inside the function (`left(...)`, regex checks, size limit).
- Build the stored document field by field with `jsonb_build_object`. Never store a public payload as received.
- Add an expression index when a new lookup filters on a `data->>'field'` value.

## Parity

- Default rows at the bottom of `schema.sql` must match `SEED()` and `DR()` in `js/api.js`.
- Business rules written in SQL must match the LOCAL driver.
