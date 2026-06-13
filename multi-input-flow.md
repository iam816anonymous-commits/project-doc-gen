# Multi-Input Project Flow Documentation

## 1. Source Selection (UX)
The user is presented with 4 distinct paths:
*   **GitHub**: OAuth or URL based analysis.
*   **ZIP Upload**: Direct parsing of folder structures.
*   **Existing Draft**: OCR/Text extraction from PDF/DOCX to infer project goals.
*   **Manual**: Field-by-field entry.

## 2. Extraction Pipeline
1.  **Ingestion**: File is received (via browser or URL).
2.  **Analysis**:
    *   *ZIP*: Scans for `package.json`, `requirements.txt`, `pom.xml` etc. to detect Tech Stack. Scans directory tree for Modules.
    *   *Draft*: Uses LLM to summarize Existing System, Problem Statement, and Proposed Solution from provided text.
3.  **Metadata Mapping**: All sources normalize into a standard `ProjectMetadata` object.

## 3. Unified Generation
The normalized metadata is fed into the Gemini 1.5 Flash engine with specialized prompts for each intake source to ensure high-fidelity documentation.

## 4. UI/UX States
*   **Step 1**: Source Picker.
*   **Step 2**: Adaptive Details Form (pre-filled from analysis).
*   **Step 3**: Preview & Pay.
