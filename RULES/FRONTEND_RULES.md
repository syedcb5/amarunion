# Frontend Rules

## Stack

* Use plain HTML, CSS and vanilla JavaScript.
* Do not add a framework, a bundler, a CSS library or an npm dependency.
* The only external resources are Google Fonts and the cdnjs `qrcodejs` script. Do not add another without approval.
* Code must run as written in current browsers. No transpiled syntax, no TypeScript, no JSX.

---

## File Structure

* The public site lives in `index.html`. The admin panel lives in `admin/index.html`.
* Each page keeps its CSS and JS inline.
* Only data access is shared, through `js/api.js`.
* Do not create new JS or CSS files unless explicitly requested.

---

## Code Style

* Match the compact style of the surrounding code: short names, arrow functions, template strings.
* Do not reformat, re-indent or prettify existing lines.
* Do not add a comment where the surrounding code has none.

---

## Rendering

* Views are functions that return an HTML string.
* The site router is `route()` with the view map `V`. The admin router is `go()` with the view map `R`.
* Escape every dynamic value with `esc()`.
* Handlers called from inline `onclick` / `onsubmit` attributes must be global functions.

---

## Language and Numbers

* All user-facing text is Bangla.
* Show numbers to users in Bangla digits with `bn()`.
* Store numbers, dates and mobile numbers in ASCII digits.
* Store dates as `YYYY-MM-DD` and timestamps as epoch milliseconds.

---

## Styling

* Use the existing CSS variables: `--g`, `--gd`, `--gl`, `--o`, `--bg`, `--card`, `--tx`, `--mut`, `--bd`, `--tint`, `--lk`.
* Do not hardcode a colour that a variable already covers.
* Reuse existing classes: `btn`, `fg`, `msg`, `tabs` and `grid` on both pages, plus `card`, `badge` and `modal` in the admin panel.
* Keep the forest green / white / yellow theme.

---

## Forms

* Build site form fields with `fld()` and admin form fields with `fi()`.
* Show form feedback with `msg()` on the site and `toast()` in the admin panel.
* Translate error keywords to Bangla through `errMsg`.
* Disable the submit button while a request is running.

---

## Admin Screens

* Drive list and edit screens from the `E` config and the `crud()` helper.
* Register a new module in `MODS`.
* Call `save()` after changing `D`, and `lg()` for an action worth auditing.
* Ask for confirmation before a destructive action.

---

## Responsive and Accessibility

* Every page must work at phone width without horizontal scrolling.
* Give every image an `alt` and every form control a visible label.
* Keep text readable against its background in both normal and print output.

---

## Printing

* Letters and admit cards print on A4.
* Keep print rules inside `@media print` and hide navigation and buttons there.
* Do not change card or letter dimensions without checking the print preview.
