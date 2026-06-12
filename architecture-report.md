# Architecture Report

## 1. Presentation Layer
- **React Components**:
  - Landing Page (`src/app/page.tsx`)
  - Form Page (`src/app/generate/page.tsx`)
  - Project Viewer (`src/app/project/[id]/page.tsx`)
  - Payment Page (`src/app/project/[id]/pay/page.tsx`)
  - Admin Dashboard (`src/app/admin/page.tsx`)

## 2. Business Logic Layer
- **Prompt/Generation Logic**: `src/lib/prompts.ts` contains section templates and generation logic.
- **API Routes**:
  - `/api/generate`: Handles project creation and documentation generation.
  - `/api/payments/submit`: Handles screenshot uploads and verification requests.
  - `/api/admin/verify-payment`: Centralized logic for payment approval and project unlocking.
  - `/api/auth`: Handles mock authentication and session cookie management.

## 3. Data Access Layer
- **Database Model**: `src/lib/db.ts` defines the SQLite schema using `better-sqlite3`.
- **Tables**: `users`, `projects`, `payments`, `payment_submissions`.

## Separation of Concerns
- **Separated**: AI generation logic is abstracted into `src/lib/prompts.ts`. Database initialization is abstracted into `src/lib/db.ts`.
- **Violations**: Some database queries are present within Server Components (e.g., `src/app/project/[id]/page.tsx`, `src/app/admin/page.tsx`) as per Next.js App Router patterns for data fetching. Payment processing logic is primarily in API routes.

## Classification
**Hybrid (Layered + Next.js App Router)**
The project follows the standard Next.js App Router architecture, leveraging Server Components for data fetching and API Routes for state mutations, with a separate library layer for database and business logic.

## Recommendations
- **Service Layer**: Move database queries from Server Components into a dedicated service layer (`src/services/`) for better testability.
- **Validation**: Use Zod for stricter input validation across all API routes.
- **Auth**: Replace mock cookie auth with a robust solution like NextAuth.js or Clerk.
