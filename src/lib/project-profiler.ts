import AdmZip from 'adm-zip';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { analyzeGitHubRepo } from "./repository-analyzer";

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

    // Enhanced ZIP detection
    const allNames = entries.map(e => e.entryName.toLowerCase()).join(' ');
    const features: string[] = [];
    if (allNames.includes('auth') || allNames.includes('login')) features.push('Authentication');
    if (allNames.includes('api') || allNames.includes('routes')) features.push('REST API');
    if (allNames.includes('db') || allNames.includes('models')) features.push('Database Management');
    if (allNames.includes('admin') || allNames.includes('dashboard')) features.push('Admin Dashboard');

    let database = 'SQL';
    if (allNames.includes('mongo')) database = 'MongoDB';
    if (allNames.includes('firebase')) database = 'Firebase';

    return {
      title: originalName.replace('.zip', '').replace(/-/g, ' ').replace(/_/g, ' '),
      techStack: Array.from(techStack),
      features: features.length > 0 ? features : ['User Authentication', 'Data Persistence', 'Responsive UI'],
      modules: Array.from(modules).filter(m => !['node_modules', 'dist', 'build', '.git', '__pycache__', 'env', 'venv'].includes(m)).slice(0, 5),
      database,
      architecture: allNames.includes('client') && allNames.includes('server') ? 'Client-Server (MERN/PERN)' :
                    allNames.includes('microservice') ? 'Microservices Architecture' : 'Modular Monolithic Architecture'
    };
  }

  static async fromPDF(buffer: Buffer): Promise<ProjectProfile> {
    const data = await pdf(buffer);
    const text = data.text;

    const titleMatch = text.match(/Title:\s*(.*)/i) || text.match(/Project Report On\s*(.*)/i) || text.match(/Name of the Project:\s*(.*)/i);
    const techMatch = text.match(/Technologies:\s*(.*)/i) || text.match(/Tech Stack:\s*(.*)/i) || text.match(/Software Requirements:\s*(.*)/i);
    const featuresMatch = text.match(/Features:\s*([\s\S]*?)(?=\n\n|\n[A-Z])/i);
    const architectureMatch = text.match(/Architecture:\s*(.*)/i);

    return {
      title: titleMatch ? titleMatch[1].trim() : 'Extracted Project',
      techStack: techMatch ? techMatch[1].split(',').map(t => t.trim()) : ['Detected from PDF content'],
      features: featuresMatch ? featuresMatch[1].split('\n').filter(l => l.trim()).slice(0, 5) : ['Content extraction', 'PDF parsing'],
      modules: ['Core System', 'Data Module'],
      architecture: architectureMatch ? architectureMatch[1].trim() : 'Standard Academic Architecture',
      problemStatement: 'Extracted from uploaded report'
    };
  }

  static async fromDocx(buffer: Buffer): Promise<ProjectProfile> {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;

    const titleMatch = text.match(/Title:\s*(.*)/i) || text.match(/Project Report On\s*(.*)/i);
    const techMatch = text.match(/Tech Stack:\s*(.*)/i) || text.match(/Technologies:\s*(.*)/i);

    return {
      title: titleMatch ? titleMatch[1].trim() : 'Extracted from DOCX',
      techStack: techMatch ? techMatch[1].split(',').map(t => t.trim()) : ['Detected from DOCX content'],
      features: ['Parsed from document content'],
      modules: ['Core Logic'],
      methodology: 'Analysis of provided documentation'
    };
  }
}
