# Upload Security Report

## Verification Checklist
- [x] **Only image files allowed**: API checks for `image/jpeg`, `image/png`, and `image/webp`.
- [x] **Maximum file size enforced**: 5MB limit implemented.
- [x] **Randomized filenames**: All uploads are renamed using UUID v4.
- [x] **No executable file uploads**: Mitigation through strict MIME type check and renaming (ignores original extension logic if malicious).
- [x] **No path traversal**: Mitigation through `path.join` with a fixed base directory and UUID-based filenames.

## Technical Details
- Upload directory: `public/uploads/payments`
- Validation logic resides in `src/app/api/payments/submit/route.ts`.
