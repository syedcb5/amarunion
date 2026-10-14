# Print Layout Skill

## Purpose

Work on A4 output: confirmation letters, admit cards and printed lists.

---

## Documents

| Document | Opened from | Layout |
| --- | --- | --- |
| Confirmation letter | Site `#/receipt/<no>`, admin application list | One A4 page |
| Admit card | Site `#/card/<no>`, admin application list | Two copies on one A4 page |

Both pages contain the letter and card templates (`letter`, `a4`, `half`). Keep the two copies visually identical.

---

## Building Blocks

* `a4w` – A4 page wrapper.
* `half` – one half-page admit card copy.
* `letter` – confirmation letter template.
* QR codes are drawn by the cdnjs `qrcodejs` script into an element per card.
* The QR text is `API.siteUrl() + '#/verify?roll=<roll>&k=<vt>'`.

---

## Workflow

1. Change the template function, not the printed output of a single record.
2. Apply the same change to the site and the admin panel.
3. Keep print-only rules inside `@media print`.
4. Hide navigation, buttons and anything interactive when printing.
5. Check the browser print preview at A4, portrait, default margins.

---

## Rules

* Do not change page or card dimensions without checking the print preview.
* Keep text dark on a light background so it prints in black and white.
* Do not rely on background colours or images printing.
* Guard QR drawing with a check for `window.QRCode` so the page still works when the script fails to load.
* Admit card instruction text is a placeholder pending the committee's wording.

---

## Checklist

* Fits one A4 page without overflow
* Two admit card copies align with the fold
* QR code opens the verify page for the right student
* Photo, roll, name and centre are readable
* Long names and school names do not break the layout
* Site and admin versions match

---

## Output

Report that the print preview was checked.
Printing to real paper cannot be verified in code. Say so when relevant.
