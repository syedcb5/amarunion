# Data API Skill

## Purpose

Add or change a `window.API` method, keeping the LOCAL driver and the CLOUD driver in parity.

---

## Input

* Method name and arguments
* Who may call it: public visitor or signed-in admin
* Return shape and error cases

---

## Workflow

### Public method

1. Write the SQL function in `supabase/schema.sql`: `security definer set search_path=public`, and `stable` when read-only.
2. Validate and trim every argument inside the function.
3. Return only the fields the page needs.
4. Add the function to the `grant execute ... to anon, authenticated` statement.
5. Add the cloud method to `K` as a one-line `rpc('<function>', {...})` call.
6. Add the local method to `L` with the same rules, return shape and error keywords.
7. Call it from the page through `API.<method>()`.

### Admin method

1. Use `rest()` with the user token from `tk()` in the cloud driver.
2. Rely on row level security for authorization. Add or adjust the policy path if needed.
3. Keep `SNAP` in step with any direct write so the next `save()` does not resend or delete the row.
4. Add the matching local method to `L`.

---

## Conventions

* Normalise text arguments with `norm()`.
* Name SQL parameters with a `p_` prefix.
* Throw short English keywords: `closed`, `duplicate`, `invalid`, `bad`.
* Return `null` when nothing is found. Return `{hidden:true}` when data exists but is not published.
* Prefix computed, non-persistent fields with `_`.

---

## Reference

| API method | Cloud implementation |
| --- | --- |
| `content()` | `public_content()` |
| `apply(kind, payload)` | `submit_application(kind, payload)` |
| `lookup(no, mobile)` | `get_application(p_no, p_mobile)` |
| `result(roll)` | `get_result(p_roll)` |
| `verify(roll, key)` | `verify_roll(p_roll, p_key)` |
| `load()` / `save(d)` | REST on `docs` and `profiles` |
| `getBc(x)` | REST on `docs` where `coll='bc'` |
| `createUser(...)` | Auth signup, then insert into `profiles` |

---

## Checklist

* Method exists in both `L` and `K`
* Same return shape in both modes
* Same error keywords in both modes
* No private field returned to a public caller
* Function granted to `anon` only when it is meant to be public
* `schema.sql` is still safe to re-run
* Bangla message added to `errMsg` for any new keyword

---

## Output

Change only `js/api.js`, `supabase/schema.sql` and the calling page.
State clearly whether cloud mode was tested.
