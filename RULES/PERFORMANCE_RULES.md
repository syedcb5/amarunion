# Performance Rules

## Page Weight

- Visitors are mostly on mobile data. Keep each page small.
- Do not add a library for something a few lines of code can do.
- Prefer inline SVG to image files for icons and simple charts.

## Images

- Resize and compress every uploaded image in the browser with `shrink()` before storing it.
- Applicant photo: 110 x 130 JPEG. Birth certificate: at most 700 px wide JPEG.
- Do not store an original camera image in a row.

## Public Site

- Load public content with one `API.content()` call and render from memory.
- Do not add a second request to the first page load.
- Clear timers when the route changes, as `route()` does with `tm`.

## Admin Panel

- `API.load()` reads rows in pages of 1000. Keep that paging.
- Never include birth certificate images in `load()`. Fetch them on demand with `getBc()`.
- `save()` is debounced and sends only changed rows. Do not replace it with a full upload.
- Do not start a refresh while a save is pending (`_dirty`) or a modal is open.
- Keep the background refresh at 45 seconds or slower.

## Database

- Batch upserts (the cloud driver sends 100 rows per request).
- Add an expression index for a new lookup on a `data->>'field'` value.
- Keep public functions to a single round trip.

## Storage

- A row holds JSON, including small base64 images. Keep rows small.
- Move files to a private Supabase Storage bucket before volumes grow large.
