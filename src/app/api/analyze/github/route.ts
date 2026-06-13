import { NextResponse } from 'next/server';
import { ProjectProfiler } from '@/lib/project-profiler';
import { cookies } from 'next/headers';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const userId = (await cookies()).get('user_id')?.value;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Rate limiting for GitHub Analysis
    const recentAnalyses = db.prepare('SELECT COUNT(*) as count FROM projects WHERE user_id = ? AND github_url IS NOT NULL AND generated_at > datetime("now", "-1 hour")').get(userId) as { count: number };
    if (recentAnalyses.count >= 10) {
      return NextResponse.json({ error: 'Analysis limit reached. Please try again in an hour.' }, { status: 429 });
    }

    const { url } = await request.json();
    if (!url || !url.startsWith('https://github.com/')) {
      return NextResponse.json({ error: 'Valid GitHub URL required' }, { status: 400 });
    }

    const profile = await ProjectProfiler.fromGitHub(url);
    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
