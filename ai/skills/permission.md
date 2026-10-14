# Permission Skill

## Purpose

Work on roles, the permission matrix, admin modules and users.

---

## Model

* A user has one role, stored in `profiles.role`.
* A role is a document in the `roles` collection: `{id, name, perm}`.
* `perm` is either `'all'` (super admin) or a matrix `{module: 'none' | 'view' | 'edit'}`.
* Matrix modules: `set, proj, ppl, cm, news, spn, sch, apps, res, vol, edu`.
* Super-only modules, never in a matrix: `users, roles, log, data`.
* Default roles: `super`, `editor`, `exam`, `viewer`.

---

## Enforcement

### Admin panel (`admin/index.html`)

* `lvl(module)` returns the level for the signed-in user.
* `can(module)` is true when the level is `edit`.
* `ck(module)` checks and shows a toast when denied. Call it at the start of every write action.
* `SUPERONLY` lists the super-only modules.
* Hide menus and buttons the user cannot use.

### Database (`supabase/schema.sql`)

* `my_role()` returns the active user's role.
* `perm(module)` returns the level from the role's matrix.
* `can_view(coll)` and `can_edit(coll)` map a collection to a level and back every policy.

The database is the real guard. The UI check exists for usability only.

---

## Special Cases

* `res` is a module without its own collection. It grants access to `apps` and `sch` for marks and publishing.
* `bc` is readable with `apps` access and is never writable by an admin.
* `roles` is readable by any active admin and writable only by `super`.
* `set`, `sch` and `spn` are readable by any active admin (they are public through `public_content()` and are printed on letters and admit cards). Writing still follows the matrix.
* `log` is readable in full only by `super`. Any active admin may insert rows and read their own rows (`data.u` = `my_uid()`), which the upsert in `save()` requires. It is never deletable.
* `profiles` rows are visible to their owner and to `super`. Only `super` writes them.

---

## Workflow

### Adding a module

1. Add it to `MODS` and to the view map `R`.
2. Add it to the module lists in `DR()` and to the default role rows in `schema.sql`.
3. Add `ck()` to every write action.
4. Add a `when` branch in `can_view` / `can_edit` if it does not map to a collection of the same name.

### Changing a default role

1. Change `DR()` in `js/api.js`.
2. Change the matching `insert` row in `schema.sql`.
3. Note that existing databases keep their stored roles (`on conflict do nothing`).

---

## Checklist

* UI check and SQL policy agree
* Role without access sees neither the menu nor the data
* `view` level can read but not write
* Super-only modules stay super-only
* A user cannot delete their own account
* Tested with every default role

---

## Output

Never weaken a policy to make a UI feature work.
If a feature needs wider access, state the change explicitly.
