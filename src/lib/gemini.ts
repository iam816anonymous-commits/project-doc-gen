import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

import { RepoAnalysis } from "./repository-analyzer";

import { ProjectProfile } from "./project-profiler";

export interface ProjectInputs {
  title: string;
  category: string;
  techStack: string;
  features: string;
  problemStatement: string;
  academicLevel: string;
  university?: string;
  repoAnalysis?: ProjectProfile;
}

export async function generateProjectDocumentation(inputs: ProjectInputs, retryCount = 0): Promise<Record<string, string>> {
  const repoContext = inputs.repoAnalysis ? `
    GitHub Repository Context:
    - Analyzed Tech Stack: ${inputs.repoAnalysis.techStack?.join(", ")}
    - Identified Modules: ${inputs.repoAnalysis.modules?.join(", ")}
    - Identified Database: ${inputs.repoAnalysis.database}
    - Repository Features: ${inputs.repoAnalysis.features?.join(", ")}
  ` : "";

  const prompt = `
    Generate complete academic project documentation in JSON format for the following project:
    Title: ${inputs.title}
    Category: ${inputs.category}
    Tech Stack: ${inputs.techStack}
    Features: ${inputs.features}
    Problem Statement: ${inputs.problemStatement}
    Academic Level: ${inputs.academicLevel}
    ${repoContext}

    The JSON must contain exactly these keys:
    "Title Page", "Abstract", "Introduction", "Problem Statement", "Objectives", "Existing System", "Proposed System", "System Requirements", "Methodology", "Modules", "Database Design", "Testing Strategy", "Future Scope", "Conclusion", "References", "Viva Questions", "PPT Outline", "Viva Preparation Kit", "PPT Presentation Kit"

    Requirements:
    - Formal academic tone, adhering to ${inputs.university || 'standard academic'} formatting guidelines.
    - No markdown formatting inside the values.
    - High quality, original content.
    - Minimum 300 words for Abstract and Introduction.
    - "Viva Preparation Kit" must include 50 questions with detailed expected answers.
    - "PPT Presentation Kit" must include a 10-15 slide deck outline with speaker notes for each slide.
    - Suitable for ${inputs.academicLevel} level.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Attempt to parse JSON (strip markdown code blocks if present)
    const jsonStr = text.replace(/```json|```/g, "").trim();
    const content = JSON.parse(jsonStr);

    // Validation
    const requiredSections = [
      "Title Page", "Abstract", "Introduction", "Problem Statement", "Objectives", "Existing System",
      "Proposed System", "System Requirements", "Methodology", "Modules", "Database Design", "Testing Strategy",
      "Future Scope", "Conclusion", "References", "Viva Questions", "PPT Outline"
    ];

    const missing = requiredSections.filter(s => !content[s] || content[s].length < 50);
    if (missing.length > 0 && retryCount < 1) {
      console.warn(`Validation failed for sections: ${missing.join(", ")}. Retrying...`);
      return generateProjectDocumentation(inputs, retryCount + 1);
    }

    return content;
  } catch (error) {
    console.error("Gemini generation failed:", error);
    if (retryCount < 1) {
      console.log("Retrying Gemini generation...");
      return generateProjectDocumentation(inputs, retryCount + 1);
    }
    throw error;
  }
}

export async function generateProjectEmbedding(text: string) {
  try {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("Embedding generation failed:", error);
    return null;
  }
}
