import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { generateProjectDocumentation, generateProjectEmbedding } from '@/lib/gemini';
import { createFingerprint, calculateSimilarity } from '@/lib/similarity';
import { analyzeGitHubRepo } from '@/lib/repository-analyzer';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const details = await request.json();
    const cookieStore = await cookies();
    let userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Rate limiting for generation
    const recentGens = db.prepare('SELECT COUNT(*) as count FROM projects WHERE user_id = ? AND generated_at > datetime("now", "-1 hour")').get(userId) as { count: number };
    if (recentGens.count >= 5) {
      return NextResponse.json({ error: 'Generation limit reached. Please try again in an hour.' }, { status: 429 });
    }

    // 1. Multi-Source Analysis
    let sourceAnalysis = details.profile || null;

    // profile is already prepared by the client using the ProjectProfiler or passed directly
    // This allows the "Smart Confirmation" step to happen on the client.

    // 2. Fingerprint and Cache Lookup
    const fingerprint = createFingerprint({
      title: details.title,
      category: details.projectType,
      techStack: details.techStack,
      features: details.features,
      academicLevel: details.academicLevel,
      githubUrl: details.githubUrl || '',
      university: details.university || 'Standard'
    });

    const cached = db.prepare('SELECT generated_content_json FROM report_cache WHERE fingerprint = ?').get(fingerprint) as { generated_content_json: string } | undefined;

    let content;
    if (cached) {
      console.log('Cache hit for fingerprint:', fingerprint);
      content = JSON.parse(cached.generated_content_json);
    } else {
      // 2. Similarity Check
      const similarReports = db.prepare('SELECT id, project_title, tech_stack, features_json, generated_content_json FROM report_cache ORDER BY created_at DESC LIMIT 50').all() as any[];

      let bestMatch = null;
      for (const report of similarReports) {
        // Parse features_json if it's a JSON string, otherwise use as is
        let reportFeatures = report.features_json;
        try {
          const parsed = JSON.parse(report.features_json);
          if (typeof parsed === 'string') reportFeatures = parsed;
          else if (Array.isArray(parsed)) reportFeatures = parsed.join(', ');
        } catch (e) {
          // Not JSON, use as is
        }

        const similarity = calculateSimilarity(
          { title: details.title, techStack: details.techStack, features: details.features },
          { title: report.project_title, techStack: report.tech_stack, features: reportFeatures }
        );

        if (similarity > 90) {
          console.log(`High similarity match (${similarity.toFixed(2)}%) found with report: ${report.id}`);
          bestMatch = JSON.parse(report.generated_content_json);
          break;
        }
      }

      if (bestMatch) {
        content = bestMatch;
      } else {
        // 3. Gemini Generation
        try {
          // Check for active university template
          const template = db.prepare('SELECT * FROM university_templates WHERE university_name = ? AND status = "ACTIVE" ORDER BY created_at DESC LIMIT 1').get(details.university) as any;

          content = await generateProjectDocumentation({
            title: details.title,
            category: details.projectType,
            techStack: details.techStack,
            features: details.features,
            problemStatement: details.problemStatement,
            academicLevel: details.academicLevel,
            university: details.university,
            repoAnalysis: sourceAnalysis || undefined,
            template: template || undefined
          });

          // 4. Cache the result
          const embedding = await generateProjectEmbedding(`${details.title} ${details.projectType} ${details.techStack} ${details.features}`);
          db.prepare(`
            INSERT INTO report_cache (id, fingerprint, embedding, project_title, category, tech_stack, features_json, academic_level, generated_content_json, github_url, university)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(uuidv4(), fingerprint, JSON.stringify(embedding), details.title, details.projectType, details.techStack, JSON.stringify(details.features), details.academicLevel, JSON.stringify(content), details.githubUrl || null, details.university || 'Standard');
        } catch (error) {
          console.error('Gemini error, falling back to templates:', error);
          // Fallback or re-throw
          throw error;
        }
      }
    }

    const projectId = uuidv4();
    db.prepare(`
      INSERT INTO projects (
        id, user_id, title, project_type, tech_stack,
        problem_statement, features, team_size,
        academic_level, content, github_url, university
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      details.githubUrl || null,
      details.university || 'Standard'
    );

    return NextResponse.json({ projectId, content });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
