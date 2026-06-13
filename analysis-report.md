# Multi-Source Analysis Engine Report

## 1. GitHub Extraction Capability
- **Metadata Detection:** Extracts repo name, structure, and key file contents (README, package.json, etc.).
- **Tech Stack:** Robust detection for React, Next.js, Node.js, Spring Boot, Django, Flask, Laravel.
- **Database:** Detects MongoDB, MySQL, PostgreSQL, SQLite, Prisma/Sequelize.
- **Features/Modules:** Inferred from file paths (e.g., `/auth`, `/api`, `/dashboard`).
- **Architecture:** Inferred from folder structure (Client-Server, Microservices, Monolithic).

## 2. ZIP Extraction Capability
- **Tech Stack:** Extension-based and manifest-based (package.json, etc.).
- **Project Structure:** Filters out noise (node_modules, dist) to identify actual modules.
- **Feature Detection:** Searches entire archive paths for functional keywords.
- **Database:** Basic inference based on string matches in paths.

## 3. PDF Extraction Capability
- **Content Parsing:** Extracts raw text using `pdf-parse`.
- **Heuristic Detection:** Uses regex to find 'Title' and 'Objectives'.
- **Tech Stack:** Identified via keyword frequency (limited to common frameworks).

## 4. DOCX Extraction Capability
- **Content Parsing:** Extracts text using `mammoth`.
- **Heuristic Detection:** Targeted regex for 'Title' and 'Technologies' sections.

## 5. Security & Verification
- **MIME Validation:** Ensures files match expected extensions.
- **Size Limits:** Hard 10MB limit enforced.
