# Generation Audit Report

## 1. Generation Source

For all 17 generated sections (Abstract, Introduction, Objectives, SRS components, Viva Questions, PPT Outline, etc.):

- **Source**: Hardcoded templates with variable substitution.
- **Generating File**: `src/lib/prompts.ts`
- **Generating Function**: `getSectionTemplate(section: string, details: ProjectDetails)`

## 2. AI Verification

- **Method**: **Template-Based Generation**.
- **Evidence**: The application does not call any external LLM APIs (OpenAI, Gemini, Anthropic) or local models. Instead, it uses a switch-case statement in `src/lib/prompts.ts` to select a predefined string template and inject project-specific variables (`title`, `techStack`, `problemStatement`, etc.).

## 3. Runtime Flow

1. **User submits project**: Handled in `src/app/generate/page.tsx`.
2. **API Route**: `POST /api/generate` in `src/app/api/generate/route.ts`.
3. **Service/Generator**: Calls `getSectionTemplate` from `src/lib/prompts.ts` for each section.
4. **Database**: Project details and generated content (as JSON) are stored in the `projects` table via `src/lib/db.ts`.
5. **Preview Page**: Data is fetched and displayed in `src/app/project/[id]/page.tsx`.

## 4. AI Service Audit (`src/lib/ai.ts`)

- **Status**: **File does not exist**.
- **Conclusion**: There is no dedicated AI service file. All generation logic is template-based within `src/lib/prompts.ts`.

## 5. Mock Detection

- **Findings**: The word "placeholder" is explicitly used in the default case of the template function:
  - `src/lib/prompts.ts`: `"This is a detailed placeholder for the \"${section}\" section..."`
- **Result**: All content except basic variable injection is static placeholder text.

## 6. Prompt Audit

- **AI Usage**: **None**.
- **Logic**: No LLM prompts are constructed or sent to any provider.

## 7. Template Audit

- **Template File**: `src/lib/prompts.ts`
- **Template Function**: `getSectionTemplate`
- **Variable Substitutions**: `${title}`, `${projectType}`, `${techStack}`, `${problemStatement}`, `${features}`, `${academicLevel}`.
- **Logic**: A `base` string is created with project metadata, and section-specific strings are appended using template literals.

## 8. Proof Test Comparison

### Project A: Quantum Mango Prediction System
- **Abstract**: `Project: Quantum Mango Prediction System... This project... aims to address the following problem: Mangoes are unpredictable. Built using Python...`

### Project B: AI Powered Goat Attendance Tracker
- **Abstract**: `Project: AI Powered Goat Attendance Tracker... This project... aims to address the following problem: Goats skip class. Built using React...`

**Verdict**: The content structure is identical; only the substituted variables change. It is **Template-Based Generation**.

## 9. Final Verdict

**B. Template-Based Generation**

The system uses hardcoded string templates in `src/lib/prompts.ts` and injects user-provided metadata. There is no actual AI reasoning or dynamic content generation beyond simple string interpolation.

## 10. Confidence Score

**Generation Method Confidence: 100%**
(Verified by direct inspection of `src/app/api/generate/route.ts` and `src/lib/prompts.ts`)
