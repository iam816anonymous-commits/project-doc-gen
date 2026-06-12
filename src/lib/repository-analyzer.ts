import axios from 'axios';

export interface RepoAnalysis {
  title: string;
  tech_stack: string[];
  modules: string[];
  database: string;
  features: string[];
  confidence_score: number;
}

export async function analyzeGitHubRepo(url: string): Promise<RepoAnalysis | null> {
  try {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return null;

    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, '');

    // 1. Fetch Key Files Content
    const keyFiles = ['README.md', 'package.json', 'requirements.txt', 'pom.xml', 'go.mod'];
    const fileContents: Record<string, string> = {};

    for (const fileName of keyFiles) {
      try {
        const fileRes = await axios.get(`https://api.github.com/repos/${owner}/${cleanRepo}/contents/${fileName}`);
        fileContents[fileName] = Buffer.from(fileRes.data.content, 'base64').toString('utf8');
      } catch (e) {
        // Not found
      }
    }

    // 2. Project Structure
    let structure: string[] = [];
    try {
      const treeRes = await axios.get(`https://api.github.com/repos/${owner}/${cleanRepo}/git/trees/main?recursive=1`).catch(() =>
        axios.get(`https://api.github.com/repos/${owner}/${cleanRepo}/git/trees/master?recursive=1`)
      );
      structure = treeRes.data.tree.map((t: { path: string }) => t.path);
    } catch {
      // Ignore
    }

    // 3. Simple Extraction Logic (can be enhanced with LLM later)
    const techStack: string[] = [];
    if (fileContents['package.json']) techStack.push('Node.js');
    if (fileContents['package.json']?.includes('"react"')) techStack.push('React');
    if (fileContents['requirements.txt']) techStack.push('Python');
    if (fileContents['pom.xml']) techStack.push('Java', 'Maven');

    const features: string[] = [];
    if (structure.some(p => p.includes('auth') || p.includes('login'))) features.push('Authentication');
    if (structure.some(p => p.includes('api'))) features.push('REST API');
    if (structure.some(p => p.includes('dashboard'))) features.push('Dashboard');

    return {
      title: cleanRepo.replace(/-/g, ' '),
      tech_stack: techStack,
      modules: features,
      database: structure.some(p => p.includes('mongo')) ? 'MongoDB' : structure.some(p => p.includes('sql')) ? 'SQL' : 'Unknown',
      features: features,
      confidence_score: techStack.length > 0 ? 0.8 : 0.4
    };
  } catch (error) {
    console.error('GitHub analysis failed:', error);
    return null;
  }
}
