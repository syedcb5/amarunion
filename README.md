# Amar Union – Website + Super Admin Panel

Bangla website for **আমার ইউনিয়ন-দরগাপাশা** with the **Union Scholarship 2026** portal, and a role-based super admin panel. Pure static front-end (HTML/CSS/vanilla JS, no build step) + Supabase (Postgres + Auth) as the backend. Hosts on GitHub Pages.

```
index.html              Public website (forest green / white / yellow theme)
admin/index.html        Super admin panel (same data, role-based permissions)
js/api.js               Shared data layer: LOCAL mode (localStorage) and CLOUD mode (Supabase REST)
config.js               Supabase URL + anon key (empty = local test mode)
supabase/schema.sql     Tables, row level security, RPC functions, default roles/settings
.github/workflows/pages.yml   GitHub Pages deployment
docs/SETUP-BN.md        Step-by-step setup guide (Bangla)
```

## Two modes
| Mode | When | Data |
|---|---|---|
| **Local test** | `config.js` keys empty (default as delivered) | Browser `localStorage` (key `au_db`) seeded with demo data. Site and admin share it when served from the same origin. Demo logins are shown on the admin login page. **Not for production.** |
| **Cloud** | `supabaseUrl` + `supabaseKey` set | Supabase database. Real auth (email + password), server-enforced permissions (RLS). |

Run locally: `python3 -m http.server 8000` in this folder → http://localhost:8000/ and http://localhost:8000/admin/

Local demo admin logins: `superadmin / Amar@2026`, `editor / Edit@2026`, `exam / Exam@2026`, `viewer / View@2026`.
Demo applicant (approved, has admit card): application `US26-0001`, mobile `01710000000`. Demo result roll `1001`, QR key `demo0` (open `#/verify?roll=1001&k=demo0`).

## How the two apps are connected
Both pages use `js/api.js`, so everything the admin saves is what the website reads.

- Website → admin: registrations, volunteer and education-support applications are written through `API.apply()` and appear in the admin panel (use ↻ Refresh; the panel also polls every 45 s).
- Admin → website: site settings, projects, people, exam board/advisors, news, sponsors, scholarship settings (dates, prizes, open/closed), results publishing. Items with "show" turned off are not sent to the public site.
- Applicant lookups (confirmation letter, admit card) require **application no. + mobile**. Results need the roll number (and results must be published). QR codes on admit cards carry a per-student random key (`vt`), so a roll number alone cannot reveal a student's photo.

## Cloud data model
One generic table `docs(coll,id,data jsonb)` + `profiles`. Collections: `set, sch` (single doc `main`), `proj, ppl, cm, news, spn, apps, bc, vol, edu, roles, log`. The admin panel diff-syncs only changed rows. Birth certificate images are stored in `bc` rows and loaded on demand.

Row level security (see `schema.sql`): `perm(module)` reads the user's role from `profiles` and the role's matrix from `docs(coll='roles')`. Roles: `super` (everything), plus editable matrices (`none|view|edit`) per module. Public (anon) access is only through the RPC functions `public_content, submit_application, get_application, get_result, verify_roll`; tables are not readable by anon.

## Go-live checklist
1. Create Supabase project, run `supabase/schema.sql`, create first super admin (see bottom of the SQL file).
2. Put URL + anon key in `config.js` (the anon key is meant to be public).
3. Supabase → Authentication → Providers → Email: turn **off** "Confirm email" (needed for creating admins from inside the panel) – or create users in the Supabase dashboard and add their `profiles` row.
4. Push to GitHub, enable Pages (Source: GitHub Actions), add custom domain, set `siteUrl` in `config.js`.
5. Log in to `/admin/` → Data & backup → "ডিফল্ট কনটেন্ট লোড", then replace sample people/committee/sponsor data and upload real photos/logos.
6. Remove or never create demo accounts in cloud mode (they only exist in local mode).

## What was tested
- Browser (Chromium, automated), **local mode: 49/49 checks** – every public route, registration with photo + birth certificate, duplicate block, confirmation letter, admin approval → roll → marks → publish, admit card (2 copies on A4), result lookup, QR verify page, admin edits visible on the site, closing applications, role restrictions.
- Browser, **cloud mode against a mock Supabase server (REST/auth/RPC): 21/21 checks** – login, content sync, registration via RPC, lazy birth certificate, admin refresh, approvals, user creation, edit/delete sync.
- **NOT tested:** `schema.sql` against a real Postgres/Supabase (no database was available while building), real Supabase Auth behaviour (email confirmation settings), QR rendering (needs the cdnjs `qrcodejs` script – blocked in the sandbox), printing to real A4 paper. Please run the SQL on a fresh Supabase project and repeat the flows in the checklist before launch.

## Known limits / suggestions
- No CAPTCHA or rate limiting on public submissions: add Cloudflare Turnstile or Supabase edge-function rate limits before large traffic.
- Application photo (110×130 JPEG) is kept inside the application row; birth certificate (≤700 px JPEG) in `bc`. For very large volumes move files to Supabase Storage (private bucket).
- Two admins editing the same row at once: last write wins.
- Marks split per subject (20 each), golden-scholarship weights (70/15/15), grade counts (1/5/10/14) and admit-card instruction text are placeholders – confirm with the committee. Golden-weight scoring is displayed on the site but not computed by the admin panel (it ranks by written marks only).
- Hash routing (`#/…`) is used so GitHub Pages needs no server rewrites.
