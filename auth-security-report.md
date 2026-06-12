# Auth Security Report

## 1. Audit of Previous Flow
- **Mechanism**: Email-only, no verification.
- **Risk**: High impersonation risk. Anyone could enter any email to "sign in" and access existing projects or generate new ones under someone else's identity.

## 2. Hardened Flow (Implemented)
- **Mechanism**: **Email OTP (One-Time Password)**.
- **Process**:
  1. User enters project details and email.
  2. System generates a random 6-digit OTP and stores it in `auth_tokens` table with a 10-minute expiry.
  3. User must enter the correct OTP to proceed.
  4. Upon verification, a secure HttpOnly session cookie is set.

## 3. Security Improvements
- **Identity Verification**: Ensures the user has access to the provided email address.
- **Token Lifecycle**: Tokens are single-use and expire after 10 minutes.
- **Cookie Security**:
  - `HttpOnly`: Prevents XSS-based cookie theft.
  - `Secure`: Cookie only sent over HTTPS (in production).
  - `SameSite=Lax`: Standard CSRF protection.

## 4. Recommendations
- Implement rate limiting on `/api/auth/request` to prevent OTP bombing/spam.
- Use a dedicated email service (Postmark, Resend) for reliable OTP delivery.
