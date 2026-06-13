# ReportReady - AI Project Submission Kit Generator

ReportReady is a micro-SaaS designed to help BTech, MCA, and BCA students "Turn Any Project Into A Complete Submission Kit" in minutes.

## 🚀 Product Overview
Stop spending weeks on manual documentation. ReportReady uses Gemini AI to create professional, academic-grade reports from your GitHub repo, source code (ZIP), or existing drafts.

## ✨ Features
- **Multi-Source Intake**: Import from GitHub, ZIP Upload, PDF/DOCX drafts, or Manual Entry.
- **Instant Generation**: 17+ sections generated in under a minute.
- **Academic Standards**: Tailored for BTech, MCA, BCA, and Diploma levels.
- **Manual UPI Verification**: Simple ₹99 payment flow via UPI.
- **Secure Exports**: Download reports in professional PDF and DOCX formats.
- **Free Proof of Quality**: Preview your Abstract and Objectives for free before paying.

## 🛠 Architecture
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS.
- **Backend**: Next.js API Routes.
- **Database**: SQLite with `better-sqlite3`.
- **AI**: Google Gemini 1.5 Flash.
- **Persistence**: Fingerprint-based report reuse engine.

## 📦 Documentation Package Includes
1. Title Page
2. Abstract
3. Introduction
4. Problem Statement
5. Objectives
6. Existing System
7. Proposed System
8. System Requirements
9. Methodology
10. Modules
11. Database Design
12. Testing Strategy
13. Future Scope
14. Conclusion
15. References
16. Viva Questions (50+)
17. PPT Outline

## 🛠 Setup & Deployment
Refer to the [Deployment Guide](deployment-guide.md) for hosting and infrastructure details.

### Environment Variables
```bash
GEMINI_API_KEY=your_api_key_here
```

### Getting Started
```bash
npm install
npm run build
npm run start
```

## 💳 Payment Workflow
1. User generates project and views free preview.
2. User clicks "Unlock Full Package".
3. User pays ₹99 via UPI (QR provided).
4. User uploads a screenshot of the payment.
5. Admin approves the submission via `/admin`.
6. Full documentation and downloads are instantly enabled for the user.

---
© 2024 Jules AI
