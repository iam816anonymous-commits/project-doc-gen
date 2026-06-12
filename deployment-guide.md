# Deployment Guide

## 1. Overview
This project is built using Next.js (App Router), SQLite, and local file storage. For production deployment, special consideration must be given to the persistent storage of the database and uploaded screenshots.

## 2. Recommended Hosting Providers

### Option A: Railway (Recommended)
- **Why**: Excellent support for persistent volumes and automatic deployments.
- **Setup**:
  1. Link your GitHub repo.
  2. Add a **Persistent Volume** and mount it to `/app/data`.
  3. Update `src/lib/db.ts` or set an environment variable to store the database in `/app/data/jules.db`.
  4. Symlink or configure `public/uploads` to point to a folder in the persistent volume.

### Option B: VPS (DigitalOcean, Hetzner, Linode)
- **Why**: Full control over the filesystem.
- **Setup**:
  1. Standard Linux setup with Node.js and PM2.
  2. Use a reverse proxy like Nginx.
  3. Files remain persistent on the SSD.

### Option C: Oracle Free Tier (AMD/ARM)
- **Why**: Free forever. Same setup as VPS.

## 3. Infrastructure Limitations

### SQLite Limitations
- **Concurrency**: SQLite is single-writer. While perfect for an MVP, high concurrent write traffic may cause "database is locked" errors.
- **Scalability**: Not suitable for multi-node/horizontal scaling.
- **Solution**: Migrate to PostgreSQL (e.g., Neon, Supabase) if traffic exceeds 10k users.

### Upload Storage Limitations
- **Ephemeral Filesystems**: Platforms like **Vercel** or **Heroku** will delete your screenshots and database on every redeploy or restart.
- **Solution**: Use S3-compatible storage (AWS S3, R2, Tigris) for uploads and a hosted DB for data.

## 4. Environment Variables
- `GEMINI_API_KEY`: Required for document generation.
- `NODE_ENV`: Set to `production`.

## 5. Build & Migration
- **Commands**: `npm run build` followed by `npm run start`.
- **Database**: The schema is automatically initialized on startup via `src/lib/db.ts`.

## 6. Backup Strategy
- Use a cron job to copy `jules.db` to a secure off-site location (e.g., S3) daily.
- Backup the `public/uploads` directory similarly.
