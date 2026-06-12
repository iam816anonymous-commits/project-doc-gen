export interface ProjectDetails {
  title: string;
  projectType: string;
  techStack: string;
  problemStatement: string;
  features: string;
  teamSize: number;
  academicLevel: string;
}

export const SECTIONS = [
  "Title Page",
  "Abstract",
  "Introduction",
  "Problem Statement",
  "Objectives",
  "Existing System",
  "Proposed System",
  "System Requirements",
  "Methodology",
  "Modules",
  "Database Design",
  "Testing Strategy",
  "Future Scope",
  "Conclusion",
  "References",
  "Viva Questions",
  "PPT Outline",
  "Viva Preparation Kit",
  "PPT Presentation Kit"
];

export function getSectionTemplate(section: string, details: ProjectDetails): string {
  const { title, projectType, techStack, problemStatement, features, academicLevel } = details;

  const base = `Project: ${title}\nCategory: ${projectType}\nStack: ${techStack}\nLevel: ${academicLevel}\n\n`;

  switch (section) {
    case "Abstract":
      return `${base}This project, "${title}", aims to address the following problem: ${problemStatement}. Built using ${techStack}, the system provides key features such as ${features}. This documentation package is tailored for ${academicLevel} level standards.`;
    case "Introduction":
      return `${base}The development of "${title}" is a response to the growing need in the ${projectType} domain. By leveraging ${techStack}, this project provides a robust solution for ${problemStatement.toLowerCase()}.`;
    case "System Requirements":
      return `${base}Hardware:\n- Processor: i5 or above\n- RAM: 8GB or above\n\nSoftware:\n- Operating System: Windows/Linux/MacOS\n- Tech Stack: ${techStack}`;
    case "Viva Questions":
      return `1. What is the main objective of ${title}?\n2. Why did you choose ${techStack}?\n3. How does this system solve ${problemStatement}?\n4. Explain the ${features.split(',')[0] || 'core'} module.\n5. What are the future enhancements possible?`;
    case "PPT Outline":
      return `Slide 1: Title & Team\nSlide 2: Problem Statement\nSlide 3: Proposed Solution\nSlide 4: Tech Stack\nSlide 5: Architecture\nSlide 6: Key Features\nSlide 7: Conclusion`;
    default:
      return `${base}This is a detailed placeholder for the "${section}" section of the ${title} project documentation. In a production environment, this content would be further enriched with specific domain knowledge for ${projectType} and ${techStack}.`;
  }
}
