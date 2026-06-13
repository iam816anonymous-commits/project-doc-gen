import axios from 'axios';

export interface RepoAnalysis {
  title: string;
  tech_stack: string[];
  modules: string[];
  database: string;
  features: string[];
  confidence_score: number;
  architecture: string;
}

export async function analyzeGitHubRepo(url: string): Promise<RepoAnalysis | null> {
  try {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return null;

    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, '');

    // 1. Fetch Key Files Content
    const keyFiles = ['README.md', 'package.json', 'requirements.txt', 'pom.xml', 'go.mod', 'manage.py', 'composer.json'];
    const fileContents: Record<string, string> = {};

    for (const fileName of keyFiles) {
      try {
        const fileRes = await axios.get(`https://api.github.com/repos/${owner}/${cleanRepo}/contents/${fileName}`);
        fileContents[fileName] = Buffer.from(fileRes.data.content, 'base64').toString('utf8');
      } catch {
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

    // 3. Tech Stack Detection
    const techStack: string[] = [];

    // Frontend
    if (fileContents['package.json']?.includes('"react"')) techStack.push('React');
    if (fileContents['package.json']?.includes('"@angular/core"')) techStack.push('Angular');
    if (fileContents['package.json']?.includes('"vue"')) techStack.push('Vue.js');
    if (fileContents['package.json']?.includes('"next"')) techStack.push('Next.js');

    // Backend
    if (fileContents['package.json']) techStack.push('Node.js');
    if (fileContents['pom.xml']) techStack.push('Java', 'Spring Boot');
    if (fileContents['requirements.txt'] || fileContents['manage.py']) techStack.push('Python', 'Django');
    if (fileContents['requirements.txt']?.includes('flask')) techStack.push('Flask');
    if (fileContents['composer.json']) techStack.push('PHP', 'Laravel');

    // 4. Database Detection
    let database = 'SQLite (Inferred)';
    const allContent = Object.values(fileContents).join(' ').toLowerCase();

    if (structure.some(p => p.includes('mongo')) || allContent.includes('mongoose') || allContent.includes('mongodb') || allContent.includes('pymongo')) database = 'MongoDB';
    else if (structure.some(p => p.includes('mysql')) || allContent.includes('mysql') || allContent.includes('mysql-connector')) database = 'MySQL';
    else if (structure.some(p => p.includes('postgres')) || allContent.includes('postgresql') || allContent.includes('psycopg2') || allContent.includes('pg-promise')) database = 'PostgreSQL';
    else if (allContent.includes('prisma') || allContent.includes('sequelize') || allContent.includes('typeorm') || allContent.includes('hibernate')) database = 'SQL Relational';
    else if (allContent.includes('firebase') || allContent.includes('firestore')) database = 'Firebase Firestore';

    // 5. Feature Detection
    const features: string[] = [];
    if (structure.some(p => p.includes('auth') || p.includes('login') || p.includes('signup')) || allContent.includes('passport') || allContent.includes('jwt')) features.push('Secure User Authentication');
    if (structure.some(p => p.includes('api') || p.includes('routes/')) || allContent.includes('express') || allContent.includes('fastapi')) features.push('RESTful API Architecture');
    if (structure.some(p => p.includes('dashboard') || p.includes('admin'))) features.push('Role-based Admin Dashboard');
    if (structure.some(p => p.includes('payment') || p.includes('stripe') || p.includes('razorpay') || allContent.includes('payment'))) features.push('Payment Gateway Integration');
    if (structure.some(p => p.includes('chat') || p.includes('socket')) || allContent.includes('socket.io')) features.push('Real-time Communications');
    if (structure.some(p => p.includes('upload') || p.includes('storage')) || allContent.includes('multer') || allContent.includes('aws-sdk')) features.push('Cloud Storage & File Handling');
    if (allContent.includes('chart') || allContent.includes('d3') || allContent.includes('recharts')) features.push('Data Visualization & Analytics');
    if (allContent.includes('search') || allContent.includes('elastic') || allContent.includes('algolia')) features.push('Full-text Search Capabilities');

    // 6. Architecture Inference
    let architecture = 'Monolithic';
    if (structure.some(p => p.includes('microservice'))) architecture = 'Microservices';
    else if (structure.some(p => p.includes('client/') && p.includes('server/'))) architecture = 'Client-Server (MERN/PERN)';
    else if (structure.some(p => p.includes('src/components'))) architecture = 'Component-Based';

    // 7. Confidence Score
    let score = 0;
    if (techStack.length > 0) score += 0.4;
    if (database !== 'Unknown') score += 0.2;
    if (features.length > 0) score += 0.2;
    if (fileContents['README.md']) score += 0.2;

    return {
      title: cleanRepo.replace(/-/g, ' ').replace(/_/g, ' '),
      tech_stack: techStack,
      modules: features,
      database,
      features,
      architecture,
      confidence_score: score
    };
  } catch (error) {
    console.error('GitHub analysis failed:', error);
    return null;
  }
}
