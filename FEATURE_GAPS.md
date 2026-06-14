# Feature Gaps Audit

## Documentation Generation
Feature: ER/UML Diagrams
Status: MISSING
Reason: Codebase contains logic for text-based documentation and architecture inference, but no automated diagram generation (Mermaid, D2, or SVG) is implemented.

## Payments
Feature: Automated Razorpay/Stripe Integration
Status: MISSING
Reason: The current implementation relys entirely on manual UPI screenshot uploads and admin verification. No direct payment gateway API integration exists.

## Notifications
Feature: Real-time Email/Push Notifications
Status: MISSING
Reason: OTPs are logged to the console, and payment approvals require the user to refresh their project page. No external messaging provider is configured.

## Project Analysis
Feature: Deep Code Execution Analysis
Status: PARTIAL
Reason: Analysis is static (file names, package.json). It does not perform deep AST parsing or dependency graph execution to detect runtime behavior.

## Export System
Feature: PPT Slide Generation (File Export)
Status: PARTIAL
Reason: System generates a detailed **PPT Outline** as text within the documentation package, but does not yet export a `.pptx` file.

## User Management
Feature: Profile Editing
Status: MISSING
Reason: Users are identified by email only. There is no interface for users to update their university, name, or preferences permanently in a profile page.
