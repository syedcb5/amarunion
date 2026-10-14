# Scholarship Skill

## Purpose

Work on the Union Scholarship flow: registration, approval, roll numbers, marks, ranking, results, letters, admit cards and QR verification.

---

## Lifecycle

1. **Register** – public form calls `API.apply('scholar', payload)`. A record is created with `st: 'pending'` and an application number `US26-0001`.
2. **Confirm** – the applicant opens the confirmation letter with application number and mobile.
3. **Approve** – an admin sets `st` to `approved`.
4. **Roll** – the admin generates `roll` (from 1001) and the random verify key `vt`.
5. **Admit card** – available once approved and rolled. Its QR code opens `#/verify?roll=<roll>&k=<vt>`.
6. **Marks** – the admin enters `marks`.
7. **Publish** – the admin sets `sch.pub` to true. Results become visible by roll number.

---

## Data

Application record (`apps`):

`id, no, st, at, name, father, mother, dob, cls, school, village, mobile, hm, hmp, photo, hasbc, roll, vt, marks`

Scholarship settings (`sch`, single doc `main`):

`open, start, end, exam, center, elig, cls, total, pub, pz{gold,g1,g2,g3}, ct{gold,g1,g2,g3}, med`

* `pz` holds prize amounts. `ct` holds how many students receive each grade.
* The birth certificate image is stored separately in `bc` under the application `id`.

---

## Rules

* Registration is closed when `sch.open` is false or the `end` date has passed (end of day, Bangladesh time).
* A duplicate is the same `name`, `dob` and `mobile`.
* Mobile numbers match `^01[0-9]{9}$`.
* Ranking sorts by `marks` descending. Equal marks share a rank.
* Grade is assigned by rank against the cumulative `ct` counts: `gold`, `g1`, `g2`, `g3`.
* `roll` and `vt` are exposed to the applicant only when `st` is `approved`.

---

## Where the Logic Lives

| Concern | Local | Cloud |
| --- | --- | --- |
| Closed / duplicate / validation | `L.apply` | `submit_application` |
| Applicant lookup | `L.lookup`, `pubApp` | `get_application` |
| Ranking and grade | `ranking`, `gradeOf` | `get_result` |
| QR verification | `L.verify` | `verify_roll` |

Change both columns together. The admin panel also has its own `ranking` and `gradeOf` for display.

---

## Placeholders to Confirm

These values are placeholders pending the committee's decision. Do not treat them as final:

* Per-subject marks split
* Golden scholarship weights (70 / 15 / 15), shown on the site but not computed
* Grade counts and prize amounts
* Admit card instruction text

---

## Checklist

* Rule changed in both the LOCAL driver and the SQL function
* Admin panel and public result agree on rank and grade
* Photo is not reachable with a roll number alone
* Unpublished results stay hidden
* Letters and admit cards still fit A4
* Regression flow from `RULES/TESTING_RULES.md` completed

---

## Output

Keep changes inside the scholarship flow.
Do not change application numbers, roll numbers or verify keys of existing records.
