# Image Upload Skill

## Purpose

Work on applicant photos, birth certificates, profile images and sponsor logos.

---

## How Images Are Stored

* There is no file storage. Images are stored as base64 JPEG data URLs inside JSON rows.
* Every image is resized and compressed in the browser by `shrink(file, width, height)` before it is stored.
* `shrink` resolves to an empty string when the file cannot be read as an image.

| Image | Size | Stored in |
| --- | --- | --- |
| Applicant photo | 110 x 130 | `photo` field of the `apps` row |
| Birth certificate | 700 wide, height by ratio | `bc` collection, `img` field, same `id` as the application |
| Profile / sponsor image | 240 x 240 | `img` field of the row |

Pass `0` as height to keep the aspect ratio.

---

## Workflow

1. Add a file input to the form (`img` field type in the admin `E` config).
2. Resize with `shrink()` before saving or submitting.
3. Reject the form when a required image resolves to an empty string.
4. Keep the existing value when an edit form is saved without a new file.
5. Render with an `alt` text, and fall back to a placeholder when the value is empty.

---

## Rules

* Never store an original, uncompressed image.
* Never return a birth certificate from a public function.
* Load birth certificates in the admin panel on demand with `API.getBc()`.
* Keep the payload size limit in `submit_application`. Raise it only together with a matching image size change.
* Use `zoom()` to show an image at full size.

---

## Large Volumes

For large volumes, move files to a private Supabase Storage bucket and store only the path in the row. This is a planned change, not the current design. Do not introduce it without approval.

---

## Checklist

* Image resized before storage
* Row size stays small
* Missing or unreadable file handled
* Edit without a new file keeps the old image
* Private images not exposed publicly
* Works from a phone camera upload

---

## Output

Reuse `shrink()` and the existing sizes.
Do not add an image library.
