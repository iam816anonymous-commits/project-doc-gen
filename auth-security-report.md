# Auth Security Report

## Cookie Audit
- **Cookie Name**: `user_id`
- **HttpOnly**: Enabled (Prevents client-side JS access, mitigating XSS)
- **Secure**: Enabled in production (Ensures cookie is only sent over HTTPS)
- **SameSite**: `lax` (Protects against CSRF while allowing navigation from external sites)
- **User Identity**: The system uses a UUID-based `user_id` stored in an HttpOnly cookie. All sensitive project data is keyed by this ID.

## Recommendations
- For future phases, move to a standard JWT-based session or a library like NextAuth.js for better session management.
