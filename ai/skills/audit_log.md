# Audit Log Skill

## Purpose

Record and display admin activity.

---

## How It Works

* The log is the `log` collection. Each entry is `{id, t, u, a}`: id, timestamp in milliseconds, user id, action text.
* `lg(action)` in `admin/index.html` adds an entry to the start of `D.log`.
* The list is capped at the 200 newest entries.
* Entries are persisted by the next `save()`.
* The log screen is visible only to `super`.

---

## Workflow

1. Call `lg('<action>')` after the change to `D` and before `save()`.
2. Write the action text in Bangla, short, with the affected item's name.
3. Follow the existing wording, for example `'মুছেছে: ' + type + ' – ' + name`.

---

## What to Log

* Create, update and delete of content
* Application approval, rejection and status changes
* Roll generation, marks entry and result publishing
* User and role changes
* Data import, export, reset and default content load
* Login and logout

---

## What Not to Log

* Passwords, tokens or keys
* Applicant photos or birth certificates
* Full applicant records. Log the name or application number only.
* Read-only actions such as opening a screen

---

## Database Rules

* Any active admin may insert a log entry.
* Only `super` may read the log.
* Log rows cannot be deleted through the API (`docs_delete` excludes `coll='log'`).

Note: the 200-entry cap trims the list in the browser, but trimmed rows stay in the database because of that policy.

---

## Checklist

* Every new write action calls `lg()`
* Text is Bangla and identifies the item
* No sensitive data in the action text
* Entry appears on the log screen for `super`

---

## Output

Reuse `lg()`. Do not add a second logging mechanism.
