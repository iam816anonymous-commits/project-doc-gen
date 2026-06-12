import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { generateProjectDocumentation, generateProjectEmbedding } from '@/lib/gemini';
import { createFingerprint } from '@/lib/similarity';
import { analyzeGitHubRepo } from '@/lib/repository-analyzer';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const details = await request.json();
    const cookieStore = await cookies();
    let userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      userId = uuidv4();
      db.prepare('INSERT INTO users (id, email) VALUES (?, ?)').run(userId, `guest_${userId}@example.com`);
      cookieStore.set('user_id', userId, { httpOnly: true });
    }

    // 1. GitHub Analysis (if URL provided)
    let repoAnalysis = null;
    if (details.githubUrl) {
      repoAnalysis = await analyzeGitHubRepo(details.githubUrl);
    }

    // 2. Fingerprint and Cache Lookup
    const fingerprint = createFingerprint({
      title: details.title,
      category: details.projectType,
      techStack: details.techStack,
      features: details.features,
      academicLevel: details.academicLevel,
      githubUrl: details.githubUrl || ''
    });

    const cached = db.prepare('SELECT generated_content_json FROM report_cache WHERE fingerprint = ?').get(fingerprint) as { generated_content_json: string } | undefined;

    let content;
    if (cached) {
      console.log('Cache hit for fingerprint:', fingerprint);
      content = JSON.parse(cached.generated_content_json);
    } else {
      // 2. Similarity Check (Optional suggestion logic can go here)

      // 3. Gemini Generation
      try {
        content = await generateProjectDocumentation({
          title: details.title,
          category: details.projectType,
          techStack: details.techStack,
          features: details.features,
          problemStatement: details.problemStatement,
          academicLevel: details.academicLevel,
          repoAnalysis: repoAnalysis || undefined
        });

        // 4. Cache the result
        const embedding = await generateProjectEmbedding(`${details.title} ${details.projectType} ${details.techStack} ${details.features}`);
        db.prepare(`
          INSERT INTO report_cache (id, fingerprint, embedding, project_title, category, tech_stack, features_json, academic_level, generated_content_json, github_url)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(uuidv4(), fingerprint, JSON.stringify(embedding), details.title, details.projectType, details.techStack, JSON.stringify(details.features), details.academicLevel, JSON.stringify(content), details.githubUrl || null);
      } catch (error) {
        console.error('Gemini error, falling back to templates:', error);
        // Fallback or re-throw
        throw error;
      }
    }

    const projectId = uuidv4();
    db.prepare(`
      INSERT INTO projects (
        id, user_id, title, project_type, tech_stack,
        problem_statement, features, team_size,
        academic_level, content, github_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      projectId,
      userId,
      details.title,
      details.projectType,
      details.techStack,
      details.problemStatement,
      details.features,
      details.teamSize,
      details.academicLevel,
      JSON.stringify(content),
      details.githubUrl || null
    );

    return NextResponse.json({ projectId, content });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
