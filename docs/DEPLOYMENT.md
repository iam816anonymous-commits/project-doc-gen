# Deployment Guide: ReportReady

## Domain
Production URL: https://reportready.cc.cd

## Environment Variables
Ensure these are set in your production environment (e.g., Railway):

- `GEMINI_API_KEY`: Google Gemini API Key.
- `ADMIN_SECRET`: Secure password for admin login (min 8 chars).
- `BASE_URL`: Base URL of the application (default: https://reportready.cc.cd).
- `SUPPORT_EMAIL`: Contact email for support.
- `WHATSAPP_SUPPORT_NUMBER`: WhatsApp number for support (international format).

## Railway Deployment
1. Connect your GitHub repository to Railway.
2. Add the environment variables listed above.
3. Railway will automatically detect the Next.js setup and deploy.

## Custom Domain & SSL
1. Add `reportready.cc.cd` to Railway's custom domain settings.
2. Update DNS records with your registrar.
3. Railway provides automatic SSL certificates via Let's Encrypt.

## Backup Strategy
- The application uses SQLite (`jules.db`).
- Ensure Railway volume is mounted to persist the database across redeployments.
- Periodically download a copy of `jules.db` for off-site backups.
