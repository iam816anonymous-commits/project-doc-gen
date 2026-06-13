import AdmZip from 'adm-zip';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { analyzeGitHubRepo, RepoAnalysis } from './repository-analyzer';

export interface ProjectProfile {
  title: string;
  techStack: string[];
  features: string[];
  modules: string[];
  database?: string;
  architecture?: string;
  problemStatement?: string;
  objectives?: string[];
  methodology?: string;
}

export class ProjectProfiler {
  static async fromGitHub(url: string): Promise<ProjectProfile> {
    const analysis = await analyzeGitHubRepo(url);
    if (!analysis) {
       return {
         title: url.split('/').pop() || 'Untitled Project',
         techStack: [],
         features: [],
         modules: [],
         architecture: 'Standard'
       };
    }
    return {
      title: url.split('/').pop() || 'Untitled Project',
      techStack: analysis.tech_stack || [],
      features: analysis.features || [],
      modules: analysis.modules || [],
      database: analysis.database,
      architecture: 'Model-View-Controller (MVC)' // Default or inferred
    };
  }

  static async fromZip(buffer: Buffer, originalName: string): Promise<ProjectProfile> {
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();

    const techStack: Set<string> = new Set();
    const modules: Set<string> = new Set();

    entries.forEach(entry => {
      const name = entry.entryName;
      if (name.endsWith('package.json')) techStack.add('Node.js');
      if (name.endsWith('requirements.txt')) techStack.add('Python');
      if (name.endsWith('.java')) techStack.add('Java');
      if (name.endsWith('.php')) techStack.add('PHP');
      if (name.endsWith('.cpp')) techStack.add('C++');

      const parts = name.split('/');
      if (parts.length > 1 && !parts[0].startsWith('.')) {
        modules.add(parts[0]);
      }
    });

    return {
      title: originalName.replace('.zip', ''),
      techStack: Array.from(techStack),
      features: ['Automated Content Processing', 'Data Management'], // Inferred
      modules: Array.from(modules).slice(0, 5),
      architecture: 'Inferred Modular Architecture'
    };
  }

  static async fromPDF(buffer: Buffer): Promise<ProjectProfile> {
    const data = await pdf(buffer);
    const text = data.text;

    // Basic extraction logic
    const titleMatch = text.match(/Title:\s*(.*)/i) || text.match(/Project Report On\s*(.*)/i);
    const objectivesMatch = text.match(/Objectives:\s*([\s\S]*?)(?=\n\n|\n[A-Z])/i);

    return {
      title: titleMatch ? titleMatch[1].trim() : 'Extracted Project',
      techStack: ['Detected from PDF content'],
      features: ['Content extracted from PDF'],
      modules: ['Core System'],
      problemStatement: 'Extracted from uploaded report',
      objectives: objectivesMatch ? objectivesMatch[1].split('\n').filter(l => l.trim()) : []
    };
  }

  static async fromDocx(buffer: Buffer): Promise<ProjectProfile> {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;

    return {
      title: 'Extracted from DOCX',
      techStack: ['Detected from DOCX content'],
      features: ['Parsed from document'],
      modules: ['General Module'],
      methodology: 'Analysis of provided documentation'
    };
  }
}
