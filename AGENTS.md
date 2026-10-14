# AGENTS.md

## Project Overview

This is the Bangla website for **আমার ইউনিয়ন-দরগাপাশা** with the **Union Scholarship 2026** portal and a role-based super admin panel.

It is a static front-end (HTML, CSS, vanilla JS, no build step) with two interchangeable backends: `api.php` + SQLite on PHP hosting (active), or Supabase (Postgres + Auth) with the site on GitHub Pages.

| Path | Purpose |
| --- | --- |
| `index.html` | Public website (inline CSS + JS, hash routing) |
| `admin/index.html` | Super admin panel (inline CSS + JS) |
| `js/api.js` | Shared data layer: LOCAL driver (localStorage) and CLOUD driver (Supabase REST) |
| `api.php` | PHP + SQLite backend for the SERVER driver (database in `data/`) |
| `config.js` | `api` (server) or Supabase URL + anon key (cloud); all empty = local test mode |
| `supabase/schema.sql` | Tables, row level security, RPC functions, default data |
| `docs/SETUP-BN.md` | Step-by-step go-live guide (Bangla) |

Read `README.md` for the data model, the two modes and the known limits.

---

## Mandatory Reading Order

Before making changes, read:

1. SKILLS.md
2. RULES/API_RULES.md
3. RULES/DB_RULES.md
4. RULES/SECURITY_RULES.md
5. RULES/FRONTEND_RULES.md
6. RULES/PERFORMANCE_RULES.md
7. RULES/TESTING_RULES.md

If the task matches a skill, also read the related file from:

`ai/skills/`

---

## Skill Loading

* Read only skills directly related to the current task.
* Do not load unrelated skills.
* Load the minimum number of skills required.
* Stop reading additional skills once sufficient context is available.

---

## Core Principles

* Keep the project dependency-free: no framework, no bundler, no npm packages, no build step.
* Keep backward compatibility with data already stored in Supabase and in `localStorage`.
* Do not remove existing functionality without approval.
* Prefer simple, maintainable solutions.
* Reuse existing helpers before creating new ones.
* Match the existing compact code style of the file being edited.
* Make the smallest safe change possible.
* All user-facing text is Bangla. Code, comments and commit messages are English.

---

## Repository Navigation Rules

`index.html` and `admin/index.html` are large files with very long lines.

* Search them with a pattern and read only the matching region.
* Do not read either file in full unless the task requires it.
* Identify the minimum required files before editing.
* Stop exploring once enough context is available.

Never:

* Reformat, re-indent or prettify existing code.
* Split the inline scripts or styles into new files unless explicitly requested.
* Refactor code unrelated to the task.

---

## Architecture Rules

### One data layer

* Both pages talk to data only through `window.API` from `js/api.js`.
* Do not call `fetch`, Supabase or `localStorage` for app data from the pages.
* Every `API` method exists in all three drivers: `L` (local), `S` (server, `api.php`) and `K` (cloud). Keep them in parity.

### Local and cloud parity

* A behaviour implemented in the LOCAL driver must match the RPC or RLS rule in `supabase/schema.sql`, and the other way round.
* Seed and default data live in `SEED()` / `DR()` in `js/api.js` and in the `insert` block at the bottom of `schema.sql`. Change both together.

### Server-enforced permissions

* The admin UI hides what a role cannot do, but row level security is the real guard.
* A new module or collection needs both the UI permission check and the SQL policy path.

### Reuse Before Creating

* Site helpers: `$`, `bn`, `esc`, `fld`, `msg`, `shrink`, `zoom`, `errMsg`.
* Admin helpers: `$`, `toast`, `modal`, `fi`, `crud`, `ef`, `sf`, `del`, `ck`, `can`, `lvl`, `lg`, `save`.
* Admin CRUD screens are driven by the `E` config object. Extend it instead of writing a new screen.

---

## Running Locally

Serve the project root over HTTP (opening the files directly breaks shared storage and relative paths):

```
php -S localhost:8000
```

Then open `http://localhost:8000/` and `http://localhost:8000/admin/`.

`php -S` runs the site, the admin panel and `api.php` together (server mode, needs `pdo_sqlite`). Static servers (`npx serve`, `python -m http.server`) only work in local test mode: set `api` and the Supabase keys in `config.js` to empty. Demo logins (local mode) are listed in `README.md`.

---

## Priority Order

When instructions conflict, follow:

1. RULES/*
2. SKILLS.md
3. AGENTS.md

Always follow the highest priority instruction.

---

## Goal

Make focused, minimal, safe changes while preserving the existing architecture, the local/cloud parity and the security model.
