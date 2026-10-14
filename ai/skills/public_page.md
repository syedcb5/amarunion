# Public Page Skill

## Purpose

Add or change a page, route, navigation item or form on the public website (`index.html`).

---

## Input

* Route path
* Content source: static text or data from `API.content()`
* Form fields, if any

---

## Routing

* The site uses hash routing so GitHub Pages needs no rewrites: `#/<view>/<arg>/...`.
* `route()` splits the hash, picks the view from the map `V` by the first segment, and passes the remaining segments as an array.
* An unknown route falls back to the home view `V['']`.
* Query values follow a `?` inside the hash, for example `#/verify?roll=1001&k=abc`.

Existing routes: `projects`, `project/<i>`, `people/<type>`, `person/<id>`, `committee`, `apply/vol`, `apply/edu`, `scholarship`, `scholarship/register`, `scholarship/admit`, `scholarship/result`, `receipt/<no>`, `card/<no>`, `verify`.

---

## Workflow

### New page

1. Add a view function to `V` that returns an HTML string.
2. Add an entry to `NAV` only if it belongs in the main navigation.
3. Read content from the variables filled by `applyContent()`. Do not fetch inside the view.
4. Escape every dynamic value with `esc()` and show numbers with `bn()`.

### New form

1. Build fields with `fld(name, label, type, extraAttributes)`.
2. Give the form a `data-k` key and submit it through `sub()`.
3. Send data with `API.apply()` or the related `API` method.
4. Show the outcome with `msg()` and translate error keywords with `errMsg`.
5. Disable the submit button while the request runs.

### Admin-editable text

Add the field to site settings (`set`) or scholarship settings (`sch`) instead of hardcoding it, and give it a default in `SEED()` and in `schema.sql`.

---

## Checklist

* Route works on direct load and on navigation
* Unknown arguments do not break the page
* Page works at phone width
* All text is Bangla
* No unescaped dynamic value
* Timers started by the view are cleared on route change
* Loading and empty states handled

---

## Output

Change only `index.html`, plus the data layer when new data is needed.
Keep the existing visual style.
