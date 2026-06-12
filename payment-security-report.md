# Payment Security Report

## Verification Checklist
- [x] **User cannot unlock content by editing cookies**: Content visibility and export logic is driven by the `is_paid` flag in the database, which is only updated via the admin verification API.
- [x] **User cannot access paid exports through direct URLs**: The export API routes (`/api/export/pdf`, `/api/export/docx`) check the `is_paid` status of the project before generating the file.
- [x] **User cannot modify project_id in requests to access another user's project**: All project-related API routes and pages verify that the requested `project_id` belongs to the `user_id` stored in the secure session cookie.
- [x] **User cannot manually change payment status**: There is no public API to update the `is_paid` flag. The only route that updates it is the admin-protected `/api/admin/verify-payment`.

## Observations
- Access control is enforced on every sensitive endpoint.
- Database transactions are used for status updates to ensure consistency.
