import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export interface UniversityTemplateProfile {
  university_name: string;
  department?: string;
  regulation_year?: string;
  degree_type?: string;
  cover_page_structure: any;
  certificate_structure: any;
  declaration_structure: any;
  acknowledgement_structure: any;
  heading_styles: any;
  font_family: string;
  font_size: number;
  page_margins: any;
  line_spacing: number;
  toc_structure: any;
  reference_style: string;
  formatting_rules_json: any;
}

export class TemplateExtractor {
  static async extract(buffer: Buffer, fileType: 'PDF' | 'DOCX'): Promise<UniversityTemplateProfile> {
    let text = '';
    let metadata: any = {};

    if (fileType === 'PDF') {
      const data = await pdf(buffer);
      text = data.text;
      metadata = data.metadata || data.info;
    } else {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    }

    return await this.analyzeWithAI(text, metadata);
  }

  private static async analyzeWithAI(text: string, metadata: any): Promise<UniversityTemplateProfile> {
    // We send a sample of the text (first 10 pages or so) to Gemini to identify structure
    const sampleText = text.substring(0, 15000); // roughly first 10-15 pages

    const prompt = `
      Analyze the following extracted text from a university project report.
      Extract the university formatting template.

      Text Sample:
      ${sampleText}

      Metadata:
      ${JSON.stringify(metadata)}

      Identify:
      1. University Name
      2. Department (if mentioned)
      3. Degree Type (B.Tech, M.Tech, MCA, etc.)
      4. Structure of specific pages (Cover Page, Certificate, Declaration, Acknowledgement). Extract placeholders like [Student Name], [Project Title], [Guide Name].
      5. Heading styles (How are chapters and sections numbered/formatted?)
      6. Font Family and Base Font Size (infer from content if possible)
      7. Table of Contents structure.
      8. Reference style (APA, IEEE, etc.)

      Return a JSON object matching this structure:
      {
        "university_name": "...",
        "department": "...",
        "degree_type": "...",
        "cover_page_structure": { "elements": [...], "alignment": "..." },
        "certificate_structure": { "text": "...", "placeholders": [...] },
        "declaration_structure": { "text": "...", "placeholders": [...] },
        "acknowledgement_structure": { "text": "..." },
        "heading_styles": { "chapter": "...", "section": "..." },
        "font_family": "...",
        "font_size": 12,
        "page_margins": { "top": 1, "bottom": 1, "left": 1.5, "right": 1 },
        "line_spacing": 1.5,
        "toc_structure": { "format": "..." },
        "reference_style": "...",
        "formatting_rules_json": { "additional_notes": "..." }
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonStr = response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  }
}
