# Content Collection Skill

## Purpose

Add or change an admin-managed content type that the public site displays, following the generic `docs` store.

Existing examples: `proj`, `ppl`, `cm`, `news`, `spn`.

---

## Input

* Collection key (short, lowercase, for example `gal`)
* Fields and their types
* Whether the public site shows it

---

## Workflow

### Data layer (`js/api.js`)

1. Add the key to `ARR` so the cloud driver loads and syncs it.
2. Add an empty array or sample rows to `SEED()`.
3. Add the key to the module lists in `DR()` so default roles get a permission level.
4. If public, add it to the object returned by `L.content()`, filtered by `show`.

### Database (`supabase/schema.sql`)

1. If public, add it to `public_content()` with the same `show` filter.
2. Add the key to the default role rows at the bottom of the file.
3. Add a `when` branch to `can_view` / `can_edit` only if it needs special access rules.
4. Update the collection list in the header comment.

### Admin panel (`admin/index.html`)

1. Add an entry to `E`: title `t`, list columns `c`, column labels `L`, form fields `f`.
2. Add the module to `MODS`.
3. Add a view to `R` that returns `crud('<key>')`.
4. Guard against missing data in `ensure()` for datasets saved before this change.

### Public site (`index.html`)

1. Map the new array in `applyContent()`.
2. Render it in the related view.

---

## Field Types

Fields in `E[key].f` are `[name, label, type, options]`.

Supported types: `text`, `tel`, `email`, `area`, `sel`, `chk`, `img`.

* Name the visibility field `show`. `crud()` then adds the visibility column automatically.
* `img` fields are resized to 240 x 240 by `sf()`.

---

## Required Features

* List, create, edit, delete through `crud()`, `ef()`, `sf()`, `del()`
* Permission check through `ck()`
* Audit entry through `lg()`
* `show` toggle when the content is public

---

## Checklist

* Key added to `ARR`, `SEED()` and `DR()`
* Local `content()` and SQL `public_content()` return the same shape
* Default role rows updated in `schema.sql`
* `E`, `MODS` and `R` updated
* Old datasets without the key still load
* Hidden items do not reach the public site
* Tested with `editor` and `viewer` logins

---

## Output

Change only the files listed above.
Reuse the existing `crud()` screen. Do not write a custom list or form unless the content type cannot fit it.
